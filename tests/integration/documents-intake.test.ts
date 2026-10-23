import { readFile } from "node:fs/promises";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  ANALYSIS_LIMITS,
  IntakeError,
  analyzeUploads,
  readSyntheticSampleFiles,
  sanitizeFileName,
  type UploadedFile,
} from "@/lib/documents/intake";
import type { Analysis } from "@/lib/documents/types";

const fixtureDirectory = path.join(process.cwd(), "tests", "fixtures", "synthetic");

async function fixture(name: string): Promise<UploadedFile> {
  return {
    fileName: name,
    bytes: new Uint8Array(await readFile(path.join(fixtureDirectory, name))),
  };
}

describe("bathroom renovation intake", () => {
  it("extracts bathroom scopes and keeps missing waterproofing and ventilation explicit", async () => {
    const [willow, harbor] = await Promise.all([
      fixture("willow-bath-renovation.pdf"),
      fixture("harbor-bath-renovation.pdf"),
    ]);
    const { analysis } = await analyzeUploads([willow, harbor], {
      projectType: "bathroom_renovation",
    });

    expect(analysis.projectType).toBe("bathroom_renovation");
    expect(analysis.documents).toHaveLength(2);
    expect(analysis.documents.map((document) => document.statedTotalCents.value)).toEqual([
      4_095_750, 2_770_000,
    ]);
    expect(analysis.comparisonRows.map((row) => row.category)).toContain("waterproofing");
    expect(analysis.comparisonRows.map((row) => row.category)).toContain("ventilation");
    const waterproofing = analysis.comparisonRows.find((row) => row.category === "waterproofing");
    const ventilation = analysis.comparisonRows.find((row) => row.category === "ventilation");
    expect(waterproofing?.cells["doc-1"]?.status).toBe("INCLUDED");
    expect(waterproofing?.cells["doc-2"]?.status).toBe("EXCLUDED");
    expect(ventilation?.cells["doc-1"]?.status).toBe("INCLUDED");
    expect(ventilation?.cells["doc-2"]?.status).toBe("EXCLUDED");
    expect(analysis.documents[0]?.specifications.map((spec) => spec.key)).toEqual(
      expect.arrayContaining(["tile", "waterproofing", "vanity", "ventilation", "fixtures"]),
    );

    for (const category of ["tile", "vanity", "appliances"]) {
      const comparison = analysis.comparisonRows.find((row) => row.category === category);
      expect(comparison?.cells["doc-1"]?.status).toBe("CONFLICTING");
      expect(comparison?.cells["doc-2"]?.status).toBe("CONFLICTING");
    }
    expect(analysis.findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining(["spec-tile", "spec-vanity", "spec-fixtures"]),
    );
  });
});

describe("synthetic PDF intake", () => {
  let northline: UploadedFile;
  let cascade: UploadedFile;
  let sagebrush: UploadedFile;
  let sample: Analysis;

  beforeAll(async () => {
    [northline, cascade, sagebrush] = await Promise.all([
      fixture("northline-builders-proposal.pdf"),
      fixture("cascade-timber-materials-package.pdf"),
      fixture("sagebrush-construction-cost-plus.pdf"),
    ]);
    const result = await analyzeUploads([northline, cascade, sagebrush], {
      projectType: "new_home",
      location: "Cedar Ridge, fictional sample",
    });
    sample = result.analysis;
  });

  it("extracts the three sample documents with deterministic IDs", async () => {
    expect(sample.documents.map((document) => document.fileName)).toEqual([
      "northline-builders-proposal.pdf",
      "cascade-timber-materials-package.pdf",
      "sagebrush-construction-cost-plus.pdf",
    ]);
    expect(sample.documents.map((document) => document.pageCount)).toEqual([3, 3, 3]);
    expect(sample.analysisId).toMatch(/^DOC-[A-F0-9]{10}$/);
    expect(sample.location).toBe("Cedar Ridge, fictional sample");
    expect(sample.risks[0]?.observation).toContain("Cedar Ridge, fictional sample");

    const second = await readSyntheticSampleFiles();
    const repeated = await analyzeUploads(second, { projectType: "new_home" });
    expect(repeated.analysis.analysisId).toBe(sample.analysisId);
    expect(repeated.analysis.documents.map((document) => document.id)).toEqual([
      "doc-1",
      "doc-2",
      "doc-3",
    ]);
  });

  it("extracts line items and stated totals without changing them", () => {
    expect(sample.documents.map((document) => document.lineItems.length)).toEqual([12, 8, 12]);
    expect(sample.documents.map((document) => document.statedTotalCents.value)).toEqual([
      48_654_000, 20_920_000, 50_816_240,
    ]);
    expect(sample.documents[0]?.contractor.value).toBe("Northline Builders LLC");
    expect(sample.documents[1]?.pricingBasis.value).toBe("materials_package");
    expect(sample.documents[2]?.pricingBasis.value).toBe("cost_plus");
  });

  it("rejects image-only and encrypted PDFs with named reasons", async () => {
    const result = await analyzeUploads(
      [await fixture("no-text-proposal.pdf"), await fixture("encrypted-proposal.pdf")],
      { projectType: "new_home" },
    );

    expect(result.analysis.documents).toHaveLength(0);
    expect(result.analysis.analysisId).toBe("DOC-EMPTY");
    expect(result.analysis.findings).toHaveLength(0);
    expect(result.rejections.map((rejection) => rejection.code)).toEqual(["NO_TEXT", "ENCRYPTED"]);
    expect(result.rejections.map((rejection) => rejection.fileName)).toEqual([
      "no-text-proposal.pdf",
      "encrypted-proposal.pdf",
    ]);
  });

  it("keeps a partially readable PDF and labels unreadable pages", async () => {
    const { analysis, rejections } = await analyzeUploads([await fixture("partial-proposal.pdf")], {
      projectType: "new_home",
    });
    const document = analysis.documents[0];

    expect(rejections).toHaveLength(0);
    expect(document?.extractionStatus).toBe("partial");
    expect(document?.unreadablePages).toEqual([2, 3]);
    expect(document?.lineItems).toHaveLength(1);
    expect(
      analysis.comparisonRows.find((row) => row.category === "roofing")?.cells[document?.id ?? ""]
        ?.status,
    ).toBe("UNREADABLE");
  });

  it("rejects duplicate, empty, non-PDF and oversized files", async () => {
    const oversized = new Uint8Array(ANALYSIS_LIMITS.maxFileBytes + 1);
    oversized.set([0x25, 0x50, 0x44, 0x46, 0x2d], 0);
    const result = await analyzeUploads(
      [
        northline,
        northline,
        { fileName: "empty.pdf", bytes: new Uint8Array() },
        { fileName: "notes.txt", bytes: new TextEncoder().encode("not a pdf") },
        { fileName: "oversized.pdf", bytes: oversized },
      ],
      { projectType: "new_home", limits: { ...ANALYSIS_LIMITS, maxDocuments: 10 } },
    );

    expect(result.analysis.documents).toHaveLength(1);
    expect(result.rejections.map((rejection) => rejection.code)).toEqual([
      "DUPLICATE",
      "EMPTY_FILE",
      "NOT_PDF",
      "FILE_TOO_LARGE",
    ]);
  });

  it("enforces document, page and text limits", async () => {
    await expect(
      analyzeUploads([northline, cascade, sagebrush, northline], { projectType: "new_home" }),
    ).rejects.toBeInstanceOf(IntakeError);

    const pageLimited = await analyzeUploads([northline], {
      projectType: "new_home",
      limits: { ...ANALYSIS_LIMITS, maxPages: 1 },
    });
    expect(pageLimited.rejections[0]?.code).toBe("TOO_MANY_PAGES");

    const textLimited = await analyzeUploads([northline], {
      projectType: "new_home",
      limits: { ...ANALYSIS_LIMITS, maxTextCharacters: 10 },
    });
    expect(textLimited.rejections[0]?.code).toBe("TEXT_TOO_LARGE");
  });
});

describe("upload hygiene", () => {
  it("strips path segments and unsafe characters from file names", () => {
    expect(sanitizeFileName("C:\\Users\\owner\\bid.pdf")).toBe("bid.pdf");
    expect(sanitizeFileName("../bid final?.pdf")).toBe("bid final_.pdf");
    expect(sanitizeFileName("   ")).toBe("document.pdf");
    expect(sanitizeFileName("a".repeat(200) + ".pdf").length).toBeLessThanOrEqual(120);
  });
});
