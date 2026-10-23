import { beforeAll, describe, expect, it } from "vitest";
import { buildAnalysis } from "@/lib/documents/analysis";
import { analyzeUploads, readSyntheticSampleFiles } from "@/lib/documents/intake";
import type { Analysis, ComparisonRow, ScopeStatus, SourceEvidence } from "@/lib/documents/types";

let sample: Analysis;

function row(analysis: Analysis, category: string): ComparisonRow {
  const match = analysis.comparisonRows.find((candidate) => candidate.category === category);
  if (!match) throw new Error(`Missing comparison row ${category}`);
  return match;
}

function statuses(analysis: Analysis, category: string): ScopeStatus[] {
  return analysis.documents.map(
    (document) => row(analysis, category).cells[document.id]?.status ?? "NOT_SPECIFIED",
  );
}

function allEvidence(analysis: Analysis): SourceEvidence[] {
  return [
    ...analysis.comparisonRows.flatMap((entry) =>
      Object.values(entry.cells).flatMap((cell) => [...cell.evidence]),
    ),
    ...analysis.responsibilities.flatMap((entry) =>
      Object.values(entry.cells).flatMap((cell) => (cell.evidence ? [cell.evidence] : [])),
    ),
    ...analysis.findings.flatMap((finding) => [...finding.evidence]),
  ];
}

beforeAll(async () => {
  const files = await readSyntheticSampleFiles();
  const result = await analyzeUploads(files, { projectType: "new_home" });
  sample = result.analysis;
});

describe("synthetic ground-truth arithmetic", () => {
  it("reconciles Northline and Cascade and flags Sagebrush", () => {
    expect(sample.arithmetic.map((check) => check.status)).toEqual([
      "matches",
      "matches",
      "discrepancy",
    ]);
    expect(sample.arithmetic[0]?.lineItemSubtotalCents).toBe(45_900_000);
    expect(sample.arithmetic[0]?.taxExpectedCents).toBe(2_754_000);
    expect(sample.arithmetic[0]?.expectedTotalCents).toBe(48_654_000);
    expect(sample.arithmetic[1]?.expectedTotalCents).toBe(20_920_000);
    expect(sample.arithmetic[2]?.expectedTotalCents).toBe(50_566_240);
    expect(sample.arithmetic[2]?.statedTotalCents).toBe(50_816_240);
    expect(sample.arithmetic[2]?.totalDeltaCents).toBe(250_000);
    expect(sample.arithmetic.every((check) => check.lineExtensionIssues.length === 0)).toBe(true);

    const northlineDocument = sample.documents[0];
    if (!northlineDocument) throw new Error("Missing Northline fixture");
    const ambiguousTax = buildAnalysis(
      [
        {
          ...northlineDocument,
          tax: { ...northlineDocument.tax, includedInTotal: null },
        },
      ],
      { projectType: "new_home" },
    );

    expect(ambiguousTax.arithmetic[0]?.status).toBe("insufficient_data");
    expect(ambiguousTax.arithmetic[0]?.expectedTotalCents).toBeNull();
  });

  it("reports metrics without hiding rejected or unreadable inputs", () => {
    expect(sample.metrics).toMatchObject({
      documentsAccepted: 3,
      documentsRejected: 0,
      lineItemsExtracted: 32,
      arithmeticChecks: 3,
      arithmeticMatches: 2,
      unreadablePages: 0,
      suspiciousSpans: 2,
      findings: 21,
      findingsWithEvidence: 20,
    });
    expect(sample.metrics.evidenceReferences).toBeGreaterThan(100);
    expect(sample.findings.find((finding) => finding.id === "missing-scopes")?.evidence).toEqual(
      [],
    );
  });
});

describe("scope comparison ground truth", () => {
  it("keeps foundation, utility and labor differences explicit", () => {
    expect(statuses(sample, "foundation")).toEqual(["CONFLICTING", "EXCLUDED", "CONFLICTING"]);
    expect(statuses(sample, "utilities")).toEqual([
      "SEPARATELY_CONTRACTED",
      "SEPARATELY_CONTRACTED",
      "SEPARATELY_CONTRACTED",
    ]);
    expect(statuses(sample, "permits")).toEqual([
      "SEPARATELY_CONTRACTED",
      "SEPARATELY_CONTRACTED",
      "SEPARATELY_CONTRACTED",
    ]);
    expect(statuses(sample, "installation_labor")).toEqual([
      "INCLUDED",
      "NOT_APPLICABLE",
      "INCLUDED",
    ]);
    expect(statuses(sample, "appliances")).toEqual(["EXCLUDED", "NOT_SPECIFIED", "NOT_SPECIFIED"]);
  });

  it("marks specification conflicts and freight responsibility differences", () => {
    expect(statuses(sample, "roofing")).toEqual(["CONFLICTING", "CONFLICTING", "CONFLICTING"]);
    expect(statuses(sample, "windows")).toEqual(["CONFLICTING", "CONFLICTING", "CONFLICTING"]);
    expect(statuses(sample, "freight")).toEqual(["INCLUDED", "CONFLICTING", "CONFLICTING"]);

    const conflict = sample.findings.find((finding) => finding.id === "spec-roofing_material");
    expect(conflict?.status).toBe("extracted");
    expect(conflict?.evidence.length).toBeGreaterThanOrEqual(3);
  });

  it("never attaches evidence to a silent scope cell", () => {
    for (const entry of sample.comparisonRows) {
      for (const cell of Object.values(entry.cells)) {
        if (cell.status === "NOT_SPECIFIED") expect(cell.evidence).toEqual([]);
        if (cell.status === "UNREADABLE") expect(cell.evidence).toEqual([]);
      }
    }
  });

  it("keeps every cited document, page, line and span valid", () => {
    const byId = new Map(sample.documents.map((document) => [document.id, document]));
    for (const evidence of allEvidence(sample)) {
      const document = byId.get(evidence.documentId);
      expect(document, evidence.documentId).toBeDefined();
      expect(evidence.page).toBeGreaterThanOrEqual(1);
      expect(evidence.page).toBeLessThanOrEqual(document?.pageCount ?? 0);
      expect(evidence.lineNumber).toBeGreaterThanOrEqual(1);
      expect(evidence.span.trim().length).toBeGreaterThan(0);
      expect(evidence.section.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("findings and prompt-injection defense", () => {
  it("sorts findings by priority and separates questions from evidence", () => {
    expect(sample.findings.map((finding) => finding.priority)).toEqual(
      [...sample.findings.map((finding) => finding.priority)].sort((a, b) => a - b),
    );
    for (const finding of sample.findings) {
      if (finding.status === "extracted" || finding.status === "security") {
        expect(finding.evidence.length, finding.id).toBeGreaterThan(0);
      }
      if (finding.status === "checklist_question") expect(finding.evidence).toEqual([]);
    }
    expect(sample.metrics.findingsWithEvidence).toBe(
      sample.findings.filter((finding) => finding.evidence.length > 0).length,
    );
  });

  it("treats instruction-like PDF text as untrusted evidence, not instructions", () => {
    const security = sample.findings.filter((finding) => finding.status === "security");
    expect(security).toHaveLength(2);
    expect(security.every((finding) => finding.severity === "security")).toBe(true);
    expect(security.every((finding) => /ignored|untrusted/i.test(finding.detail))).toBe(true);
    expect(
      security.flatMap((finding) => finding.evidence.map((item) => item.span)).join(" "),
    ).toMatch(/ignore (all )?previous instructions/i);
    expect(sample.findings.some((finding) => finding.question.includes("system prompt"))).toBe(
      false,
    );
  });
});

describe("human corrections", () => {
  it("recalculates arithmetic while preserving the original documents", () => {
    const corrected = buildAnalysis(sample.documents, {
      projectType: "new_home",
      corrections: { "doc-3": { statedTotalCents: 50_566_240 } },
      analysisId: sample.analysisId,
      generatedAt: sample.generatedAt,
    });
    const document = corrected.documents.find((entry) => entry.id === "doc-3");

    expect(document?.statedTotalCents.value).toBe(50_566_240);
    expect(document?.corrections).toEqual([
      {
        field: "Stated total",
        originalValue: "50816240",
        correctedValue: "50566240",
      },
    ]);
    expect(corrected.arithmetic.find((check) => check.documentId === "doc-3")?.status).toBe(
      "matches",
    );
    expect(corrected.findings.some((finding) => finding.id === "arithmetic-doc-3")).toBe(false);
    expect(sample.documents.find((entry) => entry.id === "doc-3")?.statedTotalCents.value).toBe(
      50_816_240,
    );
  });

  it("applies line-category corrections to comparison cells", () => {
    const corrected = buildAnalysis(sample.documents, {
      projectType: "new_home",
      corrections: { "doc-2": { lineCategories: { "LI-06": "sitework" } } },
      analysisId: sample.analysisId,
      generatedAt: sample.generatedAt,
    });
    const cascade = corrected.documents.find((entry) => entry.id === "doc-2");
    const line = cascade?.lineItems.find((item) => item.id === "LI-06");

    expect(line?.category).toBe("sitework");
    expect(line?.categoryProvenance).toBe("reviewer");
    expect(statuses(corrected, "sitework")).toEqual(["INCLUDED", "CONFLICTING", "INCLUDED"]);
    expect(cascade?.corrections[0]?.field).toBe("LI-06 category");
    expect(sample.documents[1]?.lineItems.find((item) => item.id === "LI-06")?.category).toBe(
      "freight",
    );
  });

  it("does not create evidence when a field is corrected", () => {
    const corrected = buildAnalysis(sample.documents, {
      projectType: "new_home",
      corrections: { "doc-1": { contractor: "Reviewed Builder LLC" } },
      analysisId: sample.analysisId,
      generatedAt: sample.generatedAt,
    });
    const document = corrected.documents.find((entry) => entry.id === "doc-1");
    expect(document?.contractor.value).toBe("Reviewed Builder LLC");
    expect(document?.contractor.evidence?.span).toContain("Northline Builders LLC");
    expect(document?.corrections[0]?.originalValue).toBe("Northline Builders LLC");
  });
});
