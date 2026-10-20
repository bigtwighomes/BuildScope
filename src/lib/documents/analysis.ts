import {
  type Analysis,
  type AnalysisFinding,
  type ArithmeticCheck,
  type ComparisonCell,
  type ComparisonRow,
  type DocumentCorrections,
  type DocumentRejection,
  type ExtractedDocument,
  type ProjectType,
  type ResponsibilityRow,
  type ScopeCategory,
  type ScopeStatus,
  type SourceEvidence,
  type SpecificationValue,
  PRICING_BASIS_LABELS,
  RESPONSIBILITY_ROLES,
  SCOPE_CATEGORY_LABELS,
  RESPONSIBLE_PARTY_LABELS,
} from "./types";
import { applyDocumentCorrection, countEvidence } from "./parse";
import { extendCents, formatMoneyCents, parseQuantityMilli, percentOfCents } from "./money";

export interface BuildAnalysisOptions {
  readonly projectType: ProjectType;
  readonly corrections?: DocumentCorrections;
  readonly rejections?: readonly DocumentRejection[];
  readonly analysisId?: string;
  readonly generatedAt?: string;
}

const COMPARISON_ORDER: ScopeCategory[] = [
  "sitework",
  "foundation",
  "structure",
  "roofing",
  "windows",
  "plumbing",
  "electrical",
  "hvac",
  "insulation",
  "finishes",
  "freight",
  "waste",
  "permits",
  "utilities",
  "landscaping",
  "appliances",
  "installation_labor",
];

const SPEC_CATEGORY: Record<SpecificationValue["key"], ScopeCategory> = {
  insulation: "insulation",
  roofing_material: "roofing",
  log_species: "structure",
  window_specification: "windows",
  foundation: "foundation",
};

const SPEC_LABELS: Record<SpecificationValue["key"], string> = {
  insulation: "insulation",
  roofing_material: "roofing material",
  log_species: "log species",
  window_specification: "window",
  foundation: "foundation",
};

const SEVERITY_ORDER: Record<AnalysisFinding["severity"], number> = {
  security: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function documentLabel(document: ExtractedDocument): string {
  return document.contractor.value ?? document.fileName;
}

function dedupeEvidence(evidence: readonly SourceEvidence[]): SourceEvidence[] {
  const seen = new Set<string>();
  const result: SourceEvidence[] = [];
  for (const item of evidence) {
    const key = `${item.documentId}|${item.page}|${item.lineNumber}|${item.span}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function evidenceFromCells(cells: Readonly<Record<string, ComparisonCell>>): SourceEvidence[] {
  return dedupeEvidence(Object.values(cells).flatMap((cell) => [...cell.evidence]));
}

function hasStatus(row: ComparisonRow | undefined, statuses: readonly ScopeStatus[]): boolean {
  if (!row) return false;
  return Object.values(row.cells).some((cell) => statuses.includes(cell.status));
}

function taxRateBasisPoints(document: ExtractedDocument): number | null {
  if (document.tax.ratePercent === null) return null;
  return Math.round(document.tax.ratePercent * 100);
}

function computeArithmetic(document: ExtractedDocument): ArithmeticCheck {
  const subtotal = document.lineItems.reduce((sum, item) => sum + item.extendedCents, 0);
  const extensionIssues = document.lineItems
    .map((item) => {
      const quantity = parseQuantityMilli(item.quantity);
      if (quantity === null) return null;
      const expected = extendCents(quantity, item.unitPriceCents);
      return expected === item.extendedCents
        ? null
        : { lineId: item.id, expectedCents: expected, actualCents: item.extendedCents };
    })
    .filter((issue): issue is NonNullable<typeof issue> => issue !== null);

  const rate = taxRateBasisPoints(document);
  const taxExpected =
    rate !== null && document.lineItems.length > 0 ? percentOfCents(subtotal, rate) : null;
  const taxIncluded = document.tax.includedInTotal === true;
  const expectedTotal =
    document.lineItems.length === 0
      ? null
      : subtotal + (taxIncluded ? (taxExpected ?? document.tax.amountCents ?? 0) : 0);
  const statedTotal = document.statedTotalCents.value;
  const totalDelta =
    expectedTotal !== null && statedTotal !== null ? statedTotal - expectedTotal : null;
  const paymentDelta =
    document.payment.scheduleTotalCents !== null && statedTotal !== null
      ? document.payment.scheduleTotalCents - statedTotal
      : null;

  const taxMismatch =
    taxExpected !== null &&
    document.tax.amountCents !== null &&
    Math.abs(taxExpected - document.tax.amountCents) > 1;

  const status: ArithmeticCheck["status"] =
    expectedTotal === null || statedTotal === null
      ? "insufficient_data"
      : totalDelta === 0 && extensionIssues.length === 0 && !taxMismatch
        ? "matches"
        : "discrepancy";

  return {
    documentId: document.id,
    lineItemCount: document.lineItems.length,
    lineItemSubtotalCents: subtotal,
    taxExpectedCents: taxExpected,
    expectedTotalCents: expectedTotal,
    statedTotalCents: statedTotal,
    totalDeltaCents: totalDelta,
    paymentScheduleDeltaCents: paymentDelta,
    lineExtensionIssues: extensionIssues,
    status,
  };
}

function normalizedSpecification(key: SpecificationValue["key"], value: string): string {
  const lower = value.toLowerCase();
  if (key === "insulation") {
    const values = [...lower.matchAll(/r-?\s*(\d+)/g)].map((match) => Number(match[1]));
    return values.length > 0 ? [...new Set(values)].sort((a, b) => a - b).join("/") : lower;
  }
  if (key === "roofing_material") {
    if (/metal|standing seam/.test(lower)) return "metal";
    if (/asphalt|architectural|shingle/.test(lower)) return "asphalt_shingle";
    if (/tile/.test(lower)) return "tile";
    return lower;
  }
  if (key === "log_species") {
    const species = ["pine", "cedar", "fir", "spruce", "oak"].find((item) => lower.includes(item));
    return species ?? lower;
  }
  if (key === "window_specification") {
    const glazing = lower.includes("triple")
      ? "triple"
      : lower.includes("double")
        ? "double"
        : "unspecified";
    const frame =
      ["vinyl", "wood", "aluminum", "fiberglass"].find((item) => lower.includes(item)) ?? "unknown";
    const supplier =
      lower.includes("owner-supplied") || lower.includes("owner supplied")
        ? "owner_supplied"
        : "supplied";
    return `${supplier}_${glazing}_${frame}`;
  }
  const inches = lower.match(/(\d+)\s*(?:-?\s*inch|in\b)/);
  const foundation =
    ["basement", "slab", "crawl"].find((item) => lower.includes(item)) ?? "unknown";
  return `${inches?.[1] ?? "unknown"}in_${foundation}`;
}

function buildComparison(documents: readonly ExtractedDocument[]): {
  rows: ComparisonRow[];
  specificationConflicts: Map<SpecificationValue["key"], ExtractedDocument[]>;
} {
  const specificationConflicts = new Map<SpecificationValue["key"], ExtractedDocument[]>();
  const keys: SpecificationValue["key"][] = [
    "insulation",
    "roofing_material",
    "log_species",
    "window_specification",
    "foundation",
  ];

  for (const key of keys) {
    const entries = documents
      .map((document) => ({
        document,
        value: document.specifications.find((spec) => spec.key === key)?.value,
      }))
      .filter((entry): entry is { document: ExtractedDocument; value: string } =>
        Boolean(entry.value && !/not included|excluded/i.test(entry.value)),
      );
    const distinct = new Set(entries.map((entry) => normalizedSpecification(key, entry.value)));
    if (distinct.size > 1) {
      specificationConflicts.set(
        key,
        entries.map((entry) => entry.document),
      );
    }
  }

  const rows: ComparisonRow[] = [];

  for (const category of COMPARISON_ORDER) {
    if (category === "installation_labor") continue;
    const cells: Record<string, ComparisonCell> = {};
    const specKey = keys.find(
      (key) => SPEC_CATEGORY[key] === category && specificationConflicts.has(key),
    );
    for (const document of documents) {
      const items = document.lineItems.filter((item) => item.category === category);
      const exclusions = document.exclusions.filter((exclusion) => exclusion.category === category);
      const spec = document.specifications.find(
        (candidate) => SPEC_CATEGORY[candidate.key] === category,
      );
      const evidence = dedupeEvidence([
        ...items.map((item) => item.evidence),
        ...exclusions.map((exclusion) => exclusion.evidence),
        ...(spec ? [spec.evidence] : []),
      ]);
      const total = items.reduce((sum, item) => sum + item.extendedCents, 0);
      const duplicate = items.some((item) => document.duplicateLineItemIds.includes(item.id));

      if (items.length > 0 && exclusions.length > 0) {
        cells[document.id] = {
          status: "CONFLICTING",
          note: `Priced at ${formatMoneyCents(total)} and also listed as excluded.`,
          evidence,
          categoryTotalCents: total,
        };
      } else if (items.length > 0) {
        const conflict = specKey !== undefined;
        const duplicateNote = duplicate ? " Possible duplicate line items." : "";
        cells[document.id] = {
          status: conflict ? "CONFLICTING" : "INCLUDED",
          note: conflict
            ? `Priced at ${formatMoneyCents(total)}, but the specification differs across documents.${
                spec ? ` This document states: ${spec.value}.` : ""
              }${duplicateNote}`
            : `${items.length} extracted line item${items.length === 1 ? "" : "s"}, ${formatMoneyCents(
                total,
              )}.${duplicateNote}`,
          evidence,
          categoryTotalCents: total,
        };
      } else if (exclusions.length > 0) {
        const separate = exclusions.some(
          (exclusion) =>
            exclusion.assignedTo === "homeowner" || exclusion.assignedTo === "other_contract",
        );
        cells[document.id] = {
          status: separate ? "SEPARATELY_CONTRACTED" : "EXCLUDED",
          note: `${separate ? "Separately contracted" : "Excluded"}: ${exclusions
            .map((exclusion) => exclusion.subject)
            .join("; ")}.`,
          evidence,
        };
      } else if (document.unreadablePages.length > 0) {
        cells[document.id] = {
          status: "UNREADABLE",
          note: "Unreadable or image-only pages prevent a determination.",
          evidence: [],
        };
      } else {
        cells[document.id] = {
          status: "NOT_SPECIFIED",
          note: "Not found in the extracted text.",
          evidence: [],
        };
      }
    }

    const statuses = Object.values(cells).map((cell) => cell.status);
    const question = statuses.some((status) => status === "CONFLICTING")
      ? `Confirm which ${SCOPE_CATEGORY_LABELS[category].toLowerCase()} specification governs and how the difference is priced.`
      : statuses.some((status) =>
            ["NOT_SPECIFIED", "EXCLUDED", "SEPARATELY_CONTRACTED", "UNREADABLE"].includes(status),
          )
        ? `Confirm who provides ${SCOPE_CATEGORY_LABELS[
            category
          ].toLowerCase()}, whether it is included in each total, and the separate price if applicable.`
        : undefined;

    rows.push({
      category,
      label: SCOPE_CATEGORY_LABELS[category],
      cells,
      question,
    });
  }

  const laborCells: Record<string, ComparisonCell> = {};
  for (const document of documents) {
    const laborItems = document.lineItems.filter((item) => item.category === "installation_labor");
    const laborExclusions = document.exclusions.filter(
      (exclusion) => exclusion.category === "installation_labor",
    );
    const basis = document.pricingBasis;
    const evidence = dedupeEvidence([
      ...laborItems.map((item) => item.evidence),
      ...laborExclusions.map((exclusion) => exclusion.evidence),
      ...(basis.evidence ? [basis.evidence] : []),
    ]);
    if (laborItems.length > 0) {
      const total = laborItems.reduce((sum, item) => sum + item.extendedCents, 0);
      laborCells[document.id] = {
        status: "INCLUDED",
        note: `Separate installation line items, ${formatMoneyCents(total)}.`,
        evidence,
        categoryTotalCents: total,
      };
    } else if (basis.value === "materials_package") {
      laborCells[document.id] = {
        status: "NOT_APPLICABLE",
        note: "Materials package. Installation is not included in this document.",
        evidence,
      };
    } else if (
      basis.value === "fixed_price" ||
      basis.value === "cost_plus" ||
      basis.value === "labor_only"
    ) {
      laborCells[document.id] = {
        status: "INCLUDED",
        note: "Installed pricing basis. Labor is embedded in the line-item prices rather than shown separately.",
        evidence,
      };
    } else {
      laborCells[document.id] = {
        status: "NOT_SPECIFIED",
        note: "Pricing basis does not establish whether labor is included.",
        evidence,
      };
    }
  }
  rows.push({
    category: "installation_labor",
    label: SCOPE_CATEGORY_LABELS.installation_labor,
    cells: laborCells,
    question: Object.values(laborCells).some((cell) => cell.status === "NOT_APPLICABLE")
      ? "Confirm who installs the package, whether installation is priced anywhere, and who carries installation warranty."
      : undefined,
  });

  const hasUncategorized = documents.some((document) =>
    document.lineItems.some((item) => item.category === "uncategorized"),
  );
  if (hasUncategorized) {
    const cells: Record<string, ComparisonCell> = {};
    for (const document of documents) {
      const items = document.lineItems.filter((item) => item.category === "uncategorized");
      const total = items.reduce((sum, item) => sum + item.extendedCents, 0);
      cells[document.id] =
        items.length > 0
          ? {
              status: "INCLUDED",
              note: `${items.length} line item${
                items.length === 1 ? "" : "s"
              } could not be mapped to a scope category (${formatMoneyCents(total)}).`,
              evidence: dedupeEvidence(items.map((item) => item.evidence)),
              categoryTotalCents: total,
            }
          : {
              status: "NOT_APPLICABLE",
              note: "No uncategorized line items.",
              evidence: [],
            };
    }
    rows.push({
      category: "uncategorized",
      label: SCOPE_CATEGORY_LABELS.uncategorized,
      cells,
      question: "Review uncategorized line items and assign each to a scope category.",
    });
  }

  return { rows, specificationConflicts };
}

function buildResponsibilities(documents: readonly ExtractedDocument[]): ResponsibilityRow[] {
  return RESPONSIBILITY_ROLES.map((role) => {
    const cells: Record<string, ResponsibilityRow["cells"][string]> = {};
    for (const document of documents) {
      const entry = document.responsibilities.find((candidate) => candidate.role === role);
      cells[document.id] = {
        party: entry?.party ?? "unknown",
        evidence: entry?.evidence,
      };
    }
    return { role, cells };
  });
}

function makeFinding(
  id: string,
  priority: number,
  severity: AnalysisFinding["severity"],
  title: string,
  detail: string,
  audience: string,
  question: string,
  evidence: readonly SourceEvidence[],
  status?: AnalysisFinding["status"],
): AnalysisFinding {
  const uniqueEvidence = dedupeEvidence(evidence);
  return {
    id,
    priority,
    severity,
    title,
    detail,
    audience,
    question,
    status: status ?? (uniqueEvidence.length > 0 ? "extracted" : "checklist_question"),
    evidence: uniqueEvidence,
  };
}

function pushUnique(findings: AnalysisFinding[], finding: AnalysisFinding): void {
  if (!findings.some((existing) => existing.id === finding.id)) findings.push(finding);
}

export function buildAnalysis(
  rawDocuments: readonly ExtractedDocument[],
  options: BuildAnalysisOptions,
): Analysis {
  const corrections = options.corrections ?? {};
  const documents = rawDocuments.map((document) => {
    const correction = corrections[document.id];
    return correction ? applyDocumentCorrection(document, correction) : document;
  });
  const arithmetic = documents.map(computeArithmetic);
  const { rows, specificationConflicts } = buildComparison(documents);
  const responsibilities = buildResponsibilities(documents);
  const findings: AnalysisFinding[] = [];

  for (const document of documents) {
    for (const warning of document.warnings) {
      if (warning.code === "SUSPICIOUS_INSTRUCTION" && warning.evidence) {
        pushUnique(
          findings,
          makeFinding(
            `security-${document.id}-${warning.evidence.page}-${warning.evidence.lineNumber}`,
            1,
            "security",
            "Instruction-like document text was ignored",
            "The uploaded document contained text that tried to act like an instruction to an AI system. It was treated only as untrusted document content and had no effect on the analysis.",
            "Reviewer",
            "Confirm this text is not a legitimate commercial term.",
            [warning.evidence],
            "security",
          ),
        );
      }
    }
    if (document.unreadablePages.length > 0) {
      const warning = document.warnings.find((candidate) => candidate.code === "UNREADABLE_PAGES");
      pushUnique(
        findings,
        makeFinding(
          `unreadable-${document.id}`,
          1,
          "high",
          "Extraction is incomplete for one document",
          `${documentLabel(document)} has ${
            document.unreadablePages.length
          } page(s) without extractable text. Missing scope cannot be treated as zero or as excluded.`,
          documentLabel(document),
          "Request a text-based copy or the missing pages before relying on this comparison.",
          warning?.evidence ? [warning.evidence] : [],
        ),
      );
    }
  }

  const bases = documents
    .map((document) => document.pricingBasis.value)
    .filter((basis): basis is NonNullable<typeof basis> => Boolean(basis && basis !== "unknown"));
  const uniqueBases = [...new Set(bases)];
  if (uniqueBases.length > 1) {
    pushUnique(
      findings,
      makeFinding(
        "pricing-basis-difference",
        1,
        "high",
        "Totals are not comparable because pricing bases differ",
        documents
          .map(
            (document) =>
              `${documentLabel(document)}: ${
                document.pricingBasis.value
                  ? PRICING_BASIS_LABELS[document.pricingBasis.value]
                  : "unknown"
              }`,
          )
          .join(". ") + ".",
        "All bidders",
        "Normalize the scope and pricing basis before comparing totals. A materials package cannot be compared directly with an installed fixed price.",
        documents
          .map((document) => document.pricingBasis.evidence)
          .filter(Boolean) as SourceEvidence[],
      ),
    );
  }

  const conflictingBasisWarnings = documents.flatMap((document) =>
    document.warnings
      .filter((warning) => warning.code === "PRICING_BASIS_CONFLICT")
      .map((warning) => ({ document, warning })),
  );
  for (const { document, warning } of conflictingBasisWarnings) {
    pushUnique(
      findings,
      makeFinding(
        `pricing-language-${document.id}`,
        1,
        "high",
        "Pricing language is internally contradictory",
        `${documentLabel(document)} labels its basis as ${
          document.pricingBasis.value
            ? PRICING_BASIS_LABELS[document.pricingBasis.value]
            : "unknown"
        } but also mentions another pricing structure.`,
        documentLabel(document),
        "Ask the bidder to confirm the pricing basis in writing before signing.",
        warning.evidence ? [warning.evidence] : [],
      ),
    );
  }

  for (const check of arithmetic) {
    const document = documents.find((candidate) => candidate.id === check.documentId);
    if (!document) continue;
    if (check.status === "discrepancy") {
      const delta = check.totalDeltaCents;
      const mismatchDetail =
        delta !== null && delta !== 0
          ? `Line-item arithmetic plus tax gives ${formatMoneyCents(
              check.expectedTotalCents ?? 0,
            )}, while the document states ${formatMoneyCents(check.statedTotalCents ?? 0)}. The difference is ${formatMoneyCents(
              delta,
            )}.`
          : "The stated total does not reconcile with the parsed line-item arithmetic.";
      pushUnique(
        findings,
        makeFinding(
          `arithmetic-${document.id}`,
          1,
          "high",
          "Stated total does not reconcile",
          `${documentLabel(document)}: ${mismatchDetail}`,
          documentLabel(document),
          "Ask the bidder to explain or correct the total in writing.",
          document.statedTotalCents.evidence ? [document.statedTotalCents.evidence] : [],
        ),
      );
    } else if (check.status === "insufficient_data") {
      pushUnique(
        findings,
        makeFinding(
          `arithmetic-insufficient-${document.id}`,
          3,
          "medium",
          "Total could not be independently checked",
          `${documentLabel(document)} does not contain enough parsed line items and a stated total to reconcile the arithmetic.`,
          documentLabel(document),
          "Request an itemized, text-based quotation with a stated total.",
          document.statedTotalCents.evidence ? [document.statedTotalCents.evidence] : [],
        ),
      );
    }
    if (check.lineExtensionIssues.length > 0) {
      const issue = check.lineExtensionIssues[0];
      const item = document.lineItems.find((candidate) => candidate.id === issue?.lineId);
      pushUnique(
        findings,
        makeFinding(
          `line-extension-${document.id}`,
          1,
          "high",
          "A line-item extension does not match quantity times unit price",
          `${documentLabel(document)}: ${issue.lineId} states ${formatMoneyCents(
            issue.actualCents,
          )} but ${formatMoneyCents(issue.expectedCents)} by arithmetic.`,
          documentLabel(document),
          "Ask for a corrected line item.",
          item ? [item.evidence] : [],
        ),
      );
    }
    if (check.paymentScheduleDeltaCents !== null && check.paymentScheduleDeltaCents !== 0) {
      pushUnique(
        findings,
        makeFinding(
          `payment-schedule-${document.id}`,
          2,
          "medium",
          "Payment schedule does not total the stated price",
          `${documentLabel(document)}: the payment schedule differs from the stated total by ${formatMoneyCents(
            check.paymentScheduleDeltaCents,
          )}.`,
          documentLabel(document),
          "Confirm the payment schedule and retainage terms before signing.",
          document.payment.evidence ? [document.payment.evidence] : [],
        ),
      );
    }
    if (document.duplicateLineItemIds.length > 0) {
      pushUnique(
        findings,
        makeFinding(
          `duplicate-lines-${document.id}`,
          2,
          "medium",
          "Possible duplicate line items",
          `${documentLabel(document)} contains line items with the same description and amount: ${document.duplicateLineItemIds.join(
            ", ",
          )}.`,
          documentLabel(document),
          "Confirm the duplicate is intentional and reflected in the total.",
          document.lineItems
            .filter((item) => document.duplicateLineItemIds.includes(item.id))
            .map((item) => item.evidence),
        ),
      );
    }
  }

  const foundationRow = rows.find((row) => row.category === "foundation");
  if (foundationRow) {
    const included = documents.filter(
      (document) => foundationRow.cells[document.id]?.categoryTotalCents !== undefined,
    );
    const missing = documents.filter(
      (document) => foundationRow.cells[document.id]?.categoryTotalCents === undefined,
    );
    if (included.length > 0 && missing.length > 0) {
      pushUnique(
        findings,
        makeFinding(
          "foundation-scope",
          1,
          "high",
          "Foundation scope is not consistent across the documents",
          documents
            .map(
              (document) =>
                `${documentLabel(document)}: ${foundationRow.cells[document.id]?.note ?? "not specified"}`,
            )
            .join(" "),
          "All bidders",
          "Confirm who builds the foundation, whether it is in the compared total, and the separate price if it is not.",
          evidenceFromCells(foundationRow.cells),
        ),
      );
    } else if (included.length === 0) {
      pushUnique(
        findings,
        makeFinding(
          "foundation-missing",
          2,
          "high",
          "No document specifies the foundation scope",
          "Foundation work was not found in the extracted line items of any document. It cannot be assumed to be included or free.",
          "All bidders",
          "Ask every bidder to state foundation scope and price explicitly.",
          evidenceFromCells(foundationRow.cells),
        ),
      );
    }
  }

  const utilitiesRow = rows.find((row) => row.category === "utilities");
  if (hasStatus(utilitiesRow, ["SEPARATELY_CONTRACTED", "EXCLUDED", "CONFLICTING"])) {
    pushUnique(
      findings,
      makeFinding(
        "utilities-scope",
        1,
        "high",
        "Septic and well utilities are outside the compared totals",
        "Site utilities are excluded or separately contracted in the extracted documents. The comparison therefore does not represent a complete turnkey price.",
        "All bidders",
        "Obtain separate utility quotes and confirm coordination, permits and responsibility for connecting to the home.",
        utilitiesRow ? evidenceFromCells(utilitiesRow.cells) : [],
      ),
    );
  }

  const permitsRow = rows.find((row) => row.category === "permits");
  if (hasStatus(permitsRow, ["SEPARATELY_CONTRACTED", "EXCLUDED", "CONFLICTING"])) {
    pushUnique(
      findings,
      makeFinding(
        "permits-scope",
        2,
        "medium",
        "Permits and engineering are not consistently included",
        "At least one document excludes or separately contracts permits or engineering. Fees and review time can sit outside the quoted total.",
        "All bidders",
        "Confirm which party pulls permits, pays fees and owns engineering.",
        permitsRow ? evidenceFromCells(permitsRow.cells) : [],
      ),
    );
  }

  const laborRow = rows.find((row) => row.category === "installation_labor");
  const materials = documents.filter(
    (document) => document.pricingBasis.value === "materials_package",
  );
  const installed = documents.filter((document) =>
    ["fixed_price", "cost_plus", "labor_only"].includes(document.pricingBasis.value ?? ""),
  );
  if (materials.length > 0 && installed.length > 0) {
    pushUnique(
      findings,
      makeFinding(
        "installation-labor",
        1,
        "high",
        "Materials package does not include installation labor",
        `${materials
          .map((document) => documentLabel(document))
          .join(", ")} priced materials only, while ${installed
          .map((document) => documentLabel(document))
          .join(
            ", ",
          )} priced installed work. Installation labor, equipment, supervision and warranty are not equivalent across these totals.`,
        "All bidders",
        "Ask the materials supplier for an installed price or obtain a separate installation quote before comparing totals.",
        materials
          .map((document) => document.pricingBasis.evidence)
          .filter(Boolean) as SourceEvidence[],
      ),
    );
  } else if (materials.length === 0 && hasStatus(laborRow, ["NOT_SPECIFIED", "CONFLICTING"])) {
    pushUnique(
      findings,
      makeFinding(
        "installation-labor-unclear",
        2,
        "medium",
        "Installation labor is not clearly established",
        "The documents do not consistently state whether installation labor is included.",
        "All bidders",
        "Confirm that labor, equipment and supervision are inside the compared total.",
        laborRow ? evidenceFromCells(laborRow.cells) : [],
      ),
    );
  }

  for (const [key, affected] of specificationConflicts) {
    const entries = affected
      .map((document) => {
        const spec = document.specifications.find((candidate) => candidate.key === key);
        return spec ? `${documentLabel(document)}: ${spec.value}` : null;
      })
      .filter((value): value is string => Boolean(value));
    const evidence = affected
      .map(
        (document) => document.specifications.find((candidate) => candidate.key === key)?.evidence,
      )
      .filter((value): value is SourceEvidence => Boolean(value));
    pushUnique(
      findings,
      makeFinding(
        `spec-${key}`,
        2,
        "high",
        `Conflicting ${SPEC_LABELS[key]} specifications`,
        entries.join(". ") + ".",
        "All bidders",
        `Confirm which ${SPEC_LABELS[key]} governs and how the specification difference is priced.`,
        evidence,
      ),
    );
  }

  const unloads = responsibilities.find((row) => row.role === "unloads");
  const unloadParties = new Set(
    unloads
      ? Object.values(unloads.cells)
          .map((cell) => cell.party)
          .filter((party) => party !== "unknown")
      : [],
  );
  const freightRow = rows.find((row) => row.category === "freight");
  if (
    unloadParties.size > 1 ||
    hasStatus(freightRow, ["CONFLICTING", "SEPARATELY_CONTRACTED", "NOT_SPECIFIED"])
  ) {
    pushUnique(
      findings,
      makeFinding(
        "unloading-responsibility",
        2,
        "high",
        "Freight and unloading responsibility differs",
        `Unloading responsibility is not assigned to the same party in every document${
          unloads
            ? `: ${Object.entries(unloads.cells)
                .map(([documentId, cell]) => {
                  const document = documents.find((candidate) => candidate.id === documentId);
                  return `${document ? documentLabel(document) : documentId} - ${
                    RESPONSIBLE_PARTY_LABELS[cell.party]
                  }`;
                })
                .join("; ")}`
            : ""
        }. Freight or crane scope is also excluded or combined with other scope in at least one document.`,
        "All bidders",
        "Confirm who pays for delivery, crane and unloading, and whether those costs are already inside each total.",
        [
          ...(unloads
            ? Object.values(unloads.cells)
                .map((cell) => cell.evidence)
                .filter((value): value is SourceEvidence => Boolean(value))
            : []),
          ...(freightRow ? evidenceFromCells(freightRow.cells) : []),
        ],
      ),
    );
  }

  const allowanceEntries = documents.flatMap((document) =>
    document.allowances.map((allowance) => ({ document, allowance })),
  );
  if (allowanceEntries.length > 0) {
    const byDocument = documents
      .map((document) => {
        const amount = document.allowances.reduce(
          (sum, allowance) => sum + allowance.amountCents,
          0,
        );
        if (document.allowances.length === 0) return null;
        return `${documentLabel(document)}: ${formatMoneyCents(amount)}`;
      })
      .filter((value): value is string => Boolean(value));
    const uncertain = allowanceEntries.some(
      ({ allowance }) => allowance.includedInLineItems !== true,
    );
    pushUnique(
      findings,
      makeFinding(
        "allowances",
        uncertain ? 2 : 3,
        "medium",
        "Allowances may change the final price",
        `Allowance amounts are embedded in the documents (${byDocument.join(
          "; ",
        )}). Final selections above the allowance may increase the contract price.`,
        "All bidders",
        "Confirm each allowance amount, the selection list it covers, and how overages are priced.",
        allowanceEntries.map(({ allowance }) => allowance.evidence),
      ),
    );
  }

  const taxEvidence = documents
    .map((document) => document.tax.evidence)
    .filter((value): value is SourceEvidence => Boolean(value));
  const taxTreatments = new Set(
    documents
      .map((document) => document.tax.includedInTotal)
      .filter((value): value is boolean => value !== null),
  );
  if (taxTreatments.size > 1) {
    pushUnique(
      findings,
      makeFinding(
        "tax-treatment",
        3,
        "medium",
        "Sales tax treatment differs between documents",
        "At least one document includes sales tax in the total while another excludes or leaves tax to the owner. Totals are not on the same tax basis.",
        "All bidders",
        "Confirm the applicable tax rate and whether each total includes it.",
        taxEvidence,
      ),
    );
  }
  for (const document of documents) {
    const rate = taxRateBasisPoints(document);
    if (rate !== null && document.tax.amountCents !== null && document.lineItems.length > 0) {
      const subtotal = document.lineItems.reduce((sum, item) => sum + item.extendedCents, 0);
      const expected = percentOfCents(subtotal, rate);
      if (Math.abs(expected - document.tax.amountCents) > 1) {
        pushUnique(
          findings,
          makeFinding(
            `tax-amount-${document.id}`,
            2,
            "medium",
            "Stated tax does not match the stated rate",
            `${documentLabel(document)}: tax at the stated rate is ${formatMoneyCents(
              expected,
            )}, but the document states ${formatMoneyCents(document.tax.amountCents)}.`,
            documentLabel(document),
            "Ask the bidder to correct or explain the tax amount.",
            document.tax.evidence ? [document.tax.evidence] : [],
          ),
        );
      }
    }
  }

  const deposits = documents
    .map((document) => document.payment.depositPercent)
    .filter((value): value is number => value !== null);
  if (new Set(deposits).size > 1) {
    pushUnique(
      findings,
      makeFinding(
        "deposit-terms",
        3,
        "medium",
        "Deposit terms differ between documents",
        documents
          .filter((document) => document.payment.depositPercent !== null)
          .map(
            (document) => `${documentLabel(document)}: ${document.payment.depositPercent}% deposit`,
          )
          .join(". ") + ".",
        "All bidders",
        "Compare deposit, progress payments and retainage before choosing a bidder.",
        documents
          .map((document) => document.payment.depositEvidence)
          .filter((value): value is SourceEvidence => Boolean(value)),
      ),
    );
  }

  for (const document of documents) {
    const statement = document.changeOrder.statement;
    const explicitNotApplicable = /not applicable/i.test(statement);
    if (!explicitNotApplicable && document.changeOrder.feePercent === null) {
      pushUnique(
        findings,
        makeFinding(
          `change-order-${document.id}`,
          3,
          "medium",
          "Change-order terms are missing or incomplete",
          `${documentLabel(document)} does not state a change-order fee or fixed administration charge that could be parsed.`,
          documentLabel(document),
          "Confirm change-order approval, markup and administration fees in writing.",
          document.changeOrder.evidence ? [document.changeOrder.evidence] : [],
        ),
      );
    }
    if (document.responsibilities.length === 0) {
      pushUnique(
        findings,
        makeFinding(
          `responsibility-missing-${document.id}`,
          2,
          "medium",
          "Responsibility assignments are missing",
          `${documentLabel(document)} does not state who supplies, installs, unloads or warrants the work.`,
          documentLabel(document),
          "Request a responsibility matrix before comparing the documents.",
          [],
        ),
      );
    }
    for (const warning of document.warnings) {
      if (warning.code === "AMBIGUOUS_RESPONSIBILITY" && warning.evidence) {
        pushUnique(
          findings,
          makeFinding(
            `responsibility-ambiguous-${document.id}-${warning.evidence.lineNumber}`,
            2,
            "medium",
            "Responsibility language names more than one party",
            `${documentLabel(document)} names alternative parties for one responsibility. That ambiguity can leave scope unowned after signing.`,
            documentLabel(document),
            "Ask the bidder to nominate one responsible party in writing.",
            [warning.evidence],
          ),
        );
      }
    }
  }

  const missingScopeRows = rows.filter(
    (row) =>
      ![
        "foundation",
        "utilities",
        "permits",
        "installation_labor",
        "freight",
        "uncategorized",
      ].includes(row.category) &&
      Object.values(row.cells).some((cell) => cell.status === "NOT_SPECIFIED"),
  );
  if (missingScopeRows.length > 0) {
    pushUnique(
      findings,
      makeFinding(
        "missing-scopes",
        3,
        "low",
        "Some scope areas are not specified by every document",
        `The extracted text does not consistently address: ${missingScopeRows
          .map((row) => row.label)
          .join(", ")}. A missing statement is not proof that the work is excluded or free.`,
        "All bidders",
        "Use the comparison questions to confirm each open scope area before relying on a total.",
        [],
      ),
    );
  }

  const severityRanked =
    documents.length === 0
      ? []
      : findings.sort(
          (a, b) =>
            a.priority - b.priority || SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
        );

  const metrics = {
    documentsAccepted: documents.length,
    documentsRejected: options.rejections?.length ?? 0,
    lineItemsExtracted: documents.reduce((sum, document) => sum + document.lineItems.length, 0),
    evidenceReferences: documents.reduce((sum, document) => sum + countEvidence(document), 0),
    arithmeticChecks: arithmetic.length,
    arithmeticMatches: arithmetic.filter((check) => check.status === "matches").length,
    unreadablePages: documents.reduce((sum, document) => sum + document.unreadablePages.length, 0),
    warnings: documents.reduce((sum, document) => sum + document.warnings.length, 0),
    suspiciousSpans: documents.reduce((sum, document) => sum + document.suspicionCount, 0),
    findings: severityRanked.length,
    findingsWithEvidence: severityRanked.filter((finding) => finding.evidence.length > 0).length,
  };

  return {
    analysisId: options.analysisId ?? "SYN-LOCAL",
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    projectType: options.projectType,
    documents,
    rejections: options.rejections ?? [],
    comparisonRows: rows,
    responsibilities,
    arithmetic,
    findings: severityRanked,
    metrics,
    limitations: [
      "Synthetic test documents only. This is not a real bid, contract review or professional cost opinion.",
      "Extraction is deterministic and limited to text-based PDFs. Scanned pages are not read with OCR.",
      "Unknown or unpriced scope is never treated as zero. A missing statement is not proof of exclusion.",
      "Amounts are compared as stated. No market pricing, cost database or paid cost data is used.",
      "Confirm scope, licensing, insurance, permits and contract terms with qualified reviewers.",
    ],
    synthetic: true,
  };
}
