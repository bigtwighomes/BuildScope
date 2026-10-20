import {
  type Allowance,
  type AppliedCorrection,
  type ChangeOrderInfo,
  type Exclusion,
  type ExclusionAssignment,
  type ExtractedDocument,
  type ExtractedField,
  type ExtractionWarning,
  type FreightInfo,
  type ParsedLineItem,
  type PaymentInfo,
  type PricingBasis,
  type ProjectType,
  type ResponsibilityEntry,
  type ResponsibilityRole,
  type ResponsibleParty,
  type ScopeCategory,
  type SourceEvidence,
  type SpecificationValue,
  type TaxInfo,
  PRICING_BASES,
} from "./types";
import {
  extendCents,
  parseMoneyToCents,
  parsePercentBasisPoints,
  parseQuantityMilli,
  isValidIsoDate,
} from "./money";

export interface PageText {
  readonly page: number;
  readonly text: string;
}

export interface ParseDocumentMeta {
  readonly documentId: string;
  readonly fileName: string;
  readonly fallbackProjectType?: ProjectType;
}

interface Line {
  readonly text: string;
  readonly page: number;
  readonly lineNumber: number;
  readonly section: string;
}

const SECTION_ALIASES: Record<string, string> = {
  "DOCUMENT NOTES": "DOCUMENT NOTES",
  "PROJECT SUMMARY": "PROJECT SUMMARY",
  "SCOPE OF WORK": "SCOPE OF WORK",
  "LINE ITEMS": "LINE ITEMS",
  "LINE ITEMS CONTINUED": "LINE ITEMS",
  ALLOWANCES: "ALLOWANCES",
  EXCLUSIONS: "SCOPE EXCLUSIONS",
  "SCOPE EXCLUSIONS": "SCOPE EXCLUSIONS",
  RESPONSIBILITIES: "RESPONSIBILITY MATRIX",
  "RESPONSIBILITY MATRIX": "RESPONSIBILITY MATRIX",
  "MATERIAL SPECIFICATIONS": "MATERIAL SPECIFICATIONS",
  "TAX AND ALLOWANCES NOTES": "TAX AND ALLOWANCES NOTES",
  "COMMERCIAL NOTES": "COMMERCIAL NOTES",
  "FREIGHT AND DELIVERY": "FREIGHT AND DELIVERY",
  "PAYMENT TERMS": "PAYMENT TERMS",
  "CHANGE ORDER TERMS": "CHANGE ORDERS",
  "CHANGE ORDERS": "CHANGE ORDERS",
  "PRICING NOTE": "PRICING NOTE",
  QUALIFICATIONS: "QUALIFICATIONS",
  SIGNATURES: "SIGNATURES",
};

const PROJECT_TYPE_ALIASES: Record<string, ProjectType> = {
  "new home": "new_home",
  new_home: "new_home",
  newhome: "new_home",
  renovation: "renovation",
  remodel: "renovation",
  "bathroom renovation": "renovation",
};

const PRICING_BASIS_ALIASES: Record<string, PricingBasis> = {
  fixed_price: "fixed_price",
  "fixed price": "fixed_price",
  "fixed-price": "fixed_price",
  lump_sum: "fixed_price",
  "lump sum": "fixed_price",
  materials_package: "materials_package",
  "materials package": "materials_package",
  "materials only": "materials_package",
  "supply only": "materials_package",
  cost_plus: "cost_plus",
  "cost plus": "cost_plus",
  "cost-plus": "cost_plus",
  labor_only: "labor_only",
  "labor only": "labor_only",
};

const CATEGORY_PATTERNS: Array<[ScopeCategory, RegExp]> = [
  ["sitework", /sitework|excavation|grading|site prep|erosion/],
  ["foundation", /foundation|footing|basement|slab|crawl space/],
  [
    "structure",
    /log structure|log wall package|log package|erection|framing|structural|beam|timber frame/,
  ],
  ["roofing", /roofing|shingle|standing seam|metal roof|roof/],
  ["windows", /window|exterior door|glazing/],
  ["plumbing", /plumbing|water heater|fixture rough|drain/],
  ["electrical", /electrical|electric service|wiring|panel/],
  ["hvac", /heating|hvac|ventilation|mini split|furnace/],
  ["insulation", /insulation|drywall|gypsum/],
  ["finishes", /interior finish|interior trim|paint|flooring|door and trim|cabinetry/],
  ["freight", /freight|delivery|shipping|crane|unloading|haul/],
  ["waste", /waste removal|dumpster|debris|final clean/],
  ["permits", /permit|engineering|plan review|inspection fee/],
  ["utilities", /septic|well|utility|utilities|power connection/],
  ["landscaping", /landscap|grading seed|sod|irrigation/],
  ["appliances", /appliance|refrigerator|\brange\b|dishwasher/],
];

const RESPONSIBILITY_ALIASES: Record<string, ResponsibilityRole> = {
  supplies: "supplies",
  purchases: "purchases",
  pays: "pays",
  payment: "pays",
  installs: "installs",
  installation: "installs",
  coordinates: "coordinates",
  coordination: "coordinates",
  delivers: "delivers",
  delivery: "delivers",
  unloads: "unloads",
  unloading: "unloads",
  warrants: "warrants",
  warranty: "warrants",
};

const SPECIFICATION_KEYS: Record<string, SpecificationValue["key"]> = {
  insulation: "insulation",
  "roofing material": "roofing_material",
  "log species": "log_species",
  "log profile and species": "log_species",
  "window specification": "window_specification",
  "foundation details": "foundation",
  foundation: "foundation",
};

const UNCATEGORIZED_CATEGORY: ScopeCategory = "uncategorized";

function normalizeLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function splitPages(pages: readonly PageText[]): Line[] {
  const lines: Line[] = [];
  let section = "Document header";
  for (const page of pages) {
    const rawLines = page.text.split(/\r?\n/);
    rawLines.forEach((raw, index) => {
      const text = normalizeLine(raw);
      if (!text) return;
      const alias = SECTION_ALIASES[text];
      if (alias) {
        section = alias;
        return;
      }
      lines.push({ text, page: page.page, lineNumber: index + 1, section });
    });
  }
  return lines;
}

function evidenceFor(
  documentId: string,
  line: Line,
  classification: SourceEvidence["classification"] = "extracted",
  quality: SourceEvidence["quality"] = "high",
): SourceEvidence {
  return {
    documentId,
    page: line.page,
    section: line.section,
    span: line.text.slice(0, 400),
    lineNumber: line.lineNumber,
    quality,
    classification,
  };
}

function splitField(line: Line): { key: string; value: string } | null {
  const index = line.text.indexOf(":");
  if (index <= 0 || index === line.text.length - 1) return null;
  return {
    key: normalizeKey(line.text.slice(0, index)),
    value: normalizeLine(line.text.slice(index + 1)),
  };
}

function findField(
  lines: readonly Line[],
  keys: readonly string[],
): { line: Line; value: string } | null {
  const wanted = new Set(keys.map(normalizeKey));
  for (const line of lines) {
    const field = splitField(line);
    if (field && wanted.has(field.key)) return { line, value: field.value };
  }
  return null;
}

function findPrefixedField(
  lines: readonly Line[],
  prefixes: readonly string[],
): { line: Line; value: string } | null {
  const wanted = prefixes.map(normalizeKey);
  for (const line of lines) {
    const field = splitField(line);
    if (!field) continue;
    if (wanted.some((prefix) => field.key === prefix || field.key.startsWith(`${prefix} `))) {
      return { line, value: field.value };
    }
  }
  return null;
}

function fieldFrom<T>(
  documentId: string,
  found: { line: Line; value: string } | null,
  parse: (value: string) => T | null,
  warnings: ExtractionWarning[],
  label: string,
): ExtractedField<T> {
  if (!found) return { value: null, provenance: "missing" };
  const parsed = parse(found.value);
  const evidence = evidenceFor(documentId, found.line);
  if (parsed === null) {
    warnings.push({
      code: "UNRECOGNIZED_FIELD",
      message: `The ${label} value could not be interpreted.`,
      evidence,
    });
    return { value: null, evidence, provenance: "stated" };
  }
  return { value: parsed, evidence, provenance: "stated" };
}

function inferCategory(description: string): ScopeCategory {
  const lower = description.toLowerCase();
  for (const [category, pattern] of CATEGORY_PATTERNS) {
    if (pattern.test(lower)) return category;
  }
  if (/installation|labor/i.test(lower)) return "installation_labor";
  return UNCATEGORIZED_CATEGORY;
}

function inferExclusionCategories(subject: string, note: string): Array<ScopeCategory | "tax"> {
  const text = `${subject} ${note}`.toLowerCase();
  if (/tax|taxes/.test(text)) return ["tax"];
  if (/installation|labor/.test(text)) return ["installation_labor"];
  const categories = CATEGORY_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(
    ([category]) => category,
  );
  return categories.length > 0 ? [...new Set(categories)] : [];
}

function classifyExclusionAssignment(note: string): ExclusionAssignment {
  const lower = note.toLowerCase();
  if (/owner|homeowner/.test(lower)) return "homeowner";
  if (/by others|separate contract|separately contract|licensed contractor/.test(lower)) {
    return "other_contract";
  }
  if (/not included|excluded|outside/.test(lower)) return "not_included";
  return "unknown";
}

function classifyParty(
  statement: string,
  contractor: string | null,
  basis: PricingBasis | null,
): ResponsibleParty {
  const lower = statement.toLowerCase();
  if (/not stated|to be determined|tbd|unclear/.test(lower)) return "unknown";
  const contractorLower = contractor?.toLowerCase();
  const companyWords =
    contractorLower
      ?.replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(Boolean) ?? [];
  const companyKey =
    companyWords.length >= 2 ? companyWords.slice(0, 2).join(" ") : contractorLower;
  if (
    contractorLower &&
    (lower.includes(contractorLower) || (companyKey !== undefined && lower.includes(companyKey)))
  ) {
    return basis === "materials_package" ? "materials_supplier" : "gc_builder";
  }
  if (/homeowner|owner-supplied|owner supplied/.test(lower)) return "homeowner";
  if (/engineer|architect|designer/.test(lower)) return "engineer_designer";
  if (/crane|unloading service|logistics|carrier/.test(lower)) return "logistics_partner";
  if (/supplier|supply|materials package/.test(lower)) return "materials_supplier";
  if (/trade|subcontractor|electrician|plumber|hvac/.test(lower)) return "trade_contractor";
  if (/general contractor|\bgc\b|builder|construction|contractor/.test(lower)) return "gc_builder";
  return "unknown";
}

function parseProjectType(value: string): ProjectType | null {
  return PROJECT_TYPE_ALIASES[normalizeKey(value)] ?? null;
}

function parsePricingBasis(value: string): PricingBasis | null {
  const key = normalizeKey(value);
  return PRICING_BASIS_ALIASES[key] ?? null;
}

function isSuspicious(text: string): boolean {
  return /ignore (all )?(previous|prior) instructions|system override|system prompt|<script|javascript:|reveal (the )?prompt|developer message/i.test(
    text,
  );
}

function evidenceCount(document: ExtractedDocument): number {
  const fields = [
    document.contractor,
    document.proposalNumber,
    document.proposalDate,
    document.projectName,
    document.projectType,
    document.pricingBasis,
    document.validity,
    document.statedSubtotalCents,
    document.statedTotalCents,
  ];
  return (
    fields.filter((field) => field.evidence).length +
    document.lineItems.length +
    document.allowances.length +
    document.exclusions.length +
    document.responsibilities.length +
    document.specifications.length +
    (document.tax.evidence ? 1 : 0) +
    (document.freight.evidence ? 1 : 0) +
    (document.changeOrder.evidence ? 1 : 0) +
    (document.payment.evidence ? 1 : 0)
  );
}

export function countEvidence(document: ExtractedDocument): number {
  return evidenceCount(document);
}

export function applyDocumentCorrection(
  document: ExtractedDocument,
  correction: {
    readonly contractor?: string;
    readonly proposalDate?: string;
    readonly pricingBasis?: PricingBasis;
    readonly statedTotalCents?: number;
    readonly lineCategories?: Readonly<Record<string, ScopeCategory>>;
  },
): ExtractedDocument {
  const corrections: AppliedCorrection[] = [...document.corrections];
  const corrected = (field: string, original: string, next: string) => {
    if (original !== next)
      corrections.push({ field, originalValue: original, correctedValue: next });
  };

  let contractor = document.contractor;
  if (typeof correction.contractor === "string" && correction.contractor.trim() !== "") {
    const next = correction.contractor.trim();
    corrected("Contractor", document.contractor.value ?? "", next);
    contractor = {
      value: next,
      provenance: "stated",
      evidence: document.contractor.evidence,
    };
  }

  let proposalDate = document.proposalDate;
  if (correction.proposalDate && isValidIsoDate(correction.proposalDate)) {
    corrected("Proposal date", document.proposalDate.value ?? "", correction.proposalDate);
    proposalDate = {
      value: correction.proposalDate,
      provenance: "stated",
      evidence: document.proposalDate.evidence,
    };
  }

  let pricingBasis = document.pricingBasis;
  if (correction.pricingBasis && PRICING_BASES.includes(correction.pricingBasis)) {
    corrected("Pricing basis", document.pricingBasis.value ?? "", correction.pricingBasis);
    pricingBasis = {
      value: correction.pricingBasis,
      provenance: "stated",
      evidence: document.pricingBasis.evidence,
    };
  }

  let statedTotalCents = document.statedTotalCents;
  if (
    typeof correction.statedTotalCents === "number" &&
    Number.isSafeInteger(correction.statedTotalCents) &&
    correction.statedTotalCents >= 0
  ) {
    corrected(
      "Stated total",
      document.statedTotalCents.value === null ? "" : String(document.statedTotalCents.value),
      String(correction.statedTotalCents),
    );
    statedTotalCents = {
      value: correction.statedTotalCents,
      provenance: "stated",
      evidence: document.statedTotalCents.evidence,
    };
  }

  const lineItems = document.lineItems.map((item) => {
    const category = correction.lineCategories?.[item.id];
    if (!category || category === item.category) return item;
    corrected(`${item.id} category`, item.category, category);
    return { ...item, category, categoryProvenance: "reviewer" as const };
  });

  return {
    ...document,
    contractor,
    proposalDate,
    pricingBasis,
    statedTotalCents,
    lineItems,
    corrections,
  };
}

export function parseDocument(
  pages: readonly PageText[],
  meta: ParseDocumentMeta,
): ExtractedDocument {
  const lines = splitPages(pages);
  const warnings: ExtractionWarning[] = [];
  const documentId = meta.documentId;
  const textLength = pages.reduce((sum, page) => sum + page.text.length, 0);
  const unreadablePages = pages
    .filter((page) => normalizeLine(page.text).length === 0)
    .map((page) => page.page);
  const suspiciousLines = lines.filter((line) => isSuspicious(line.text));
  const suspicionCount = suspiciousLines.length;

  for (const line of suspiciousLines) {
    warnings.push({
      code: "SUSPICIOUS_INSTRUCTION",
      message:
        "Instruction-like text was treated as untrusted document content and was not executed.",
      evidence: evidenceFor(documentId, line, "extracted", "high"),
    });
  }

  const contractor = fieldFrom(
    documentId,
    findField(lines, ["Contractor", "Proposal by"]),
    (value) => (value.length > 0 ? value : null),
    warnings,
    "contractor",
  );
  const contractorName = contractor.value;
  const proposalNumber = fieldFrom(
    documentId,
    findField(lines, ["Proposal number", "Estimate number"]),
    (value) => (value.length > 0 ? value : null),
    warnings,
    "proposal number",
  );
  const proposalDate = fieldFrom(
    documentId,
    findField(lines, ["Proposal date", "Estimate date"]),
    (value) => (isValidIsoDate(value) ? value : null),
    warnings,
    "proposal date",
  );
  const projectName = fieldFrom(
    documentId,
    findField(lines, ["Project", "Project name"]),
    (value) => (value.length > 0 ? value : null),
    warnings,
    "project",
  );
  const projectType = fieldFrom(
    documentId,
    findField(lines, ["Project type"]),
    parseProjectType,
    warnings,
    "project type",
  );
  const pricingBasisField = fieldFrom(
    documentId,
    findField(lines, ["Pricing basis"]),
    parsePricingBasis,
    warnings,
    "pricing basis",
  );
  const validity = fieldFrom(
    documentId,
    findField(lines, ["Validity"]),
    (value) => (value.length > 0 ? value : null),
    warnings,
    "validity",
  );
  const statedSubtotalCents = fieldFrom(
    documentId,
    findField(lines, ["Subtotal"]),
    parseMoneyToCents,
    warnings,
    "subtotal",
  );
  const statedTotalCents = fieldFrom(
    documentId,
    findField(lines, ["Proposal total", "Total"]),
    parseMoneyToCents,
    warnings,
    "total",
  );

  let pricingBasis = pricingBasisField;
  if (!pricingBasis.value || pricingBasis.value === "unknown") {
    const inferredLine = lines.find((line) => {
      const lower = line.text.toLowerCase();
      if (lower.includes("materials package") || lower.includes("materials only")) return true;
      if (lower.includes("cost-plus") || lower.includes("cost plus")) return true;
      if (
        lower.includes("fixed-price") ||
        lower.includes("fixed price") ||
        lower.includes("lump sum")
      ) {
        return true;
      }
      return false;
    });
    if (inferredLine) {
      const lower = inferredLine.text.toLowerCase();
      const inferred: PricingBasis = /cost[- ]plus/.test(lower)
        ? "cost_plus"
        : /materials/.test(lower)
          ? "materials_package"
          : /labor only/.test(lower)
            ? "labor_only"
            : /fixed[- ]price|lump sum/.test(lower)
              ? "fixed_price"
              : "unknown";
      if (inferred !== "unknown") {
        pricingBasis = {
          value: inferred,
          provenance: "inferred",
          evidence: evidenceFor(documentId, inferredLine, "inferred", "medium"),
        };
      }
    }
  }

  if (pricingBasis.value && pricingBasis.value !== "unknown") {
    for (const line of lines) {
      const lower = line.text.toLowerCase();
      if (pricingBasis.value === "cost_plus" && /fixed[- ]price contract/.test(lower)) {
        warnings.push({
          code: "PRICING_BASIS_CONFLICT",
          message: "The document labels itself cost plus but also mentions a fixed-price contract.",
          evidence: evidenceFor(documentId, line),
        });
      }
      if (
        pricingBasis.value === "fixed_price" &&
        /cost[- ]plus/.test(lower) &&
        !/not cost/.test(lower)
      ) {
        warnings.push({
          code: "PRICING_BASIS_CONFLICT",
          message: "The document labels itself fixed price but also mentions cost plus.",
          evidence: evidenceFor(documentId, line),
        });
      }
    }
  }

  if (!pricingBasis.value) {
    warnings.push({
      code: "MISSING_PRICING_BASIS",
      message: "No pricing basis was stated or inferable.",
    });
  }

  const lineItems: ParsedLineItem[] = [];
  for (const line of lines.filter((candidate) => candidate.section === "LINE ITEMS")) {
    if (!/^LI[-_]\d+/i.test(line.text)) continue;
    const match = line.text.match(
      /^(LI[-_]\d+)\s*\|\s*(.+?)\s*\|\s*([\d,]+(?:\.\d{1,3})?)\s*\|\s*([A-Za-z]{1,4})\s*\|\s*\$?([\d,]+(?:\.\d{1,2})?)\s*\|\s*\$?([\d,]+(?:\.\d{1,2})?)$/i,
    );
    if (!match) {
      warnings.push({
        code: "UNPARSED_LINE_ITEM",
        message: "A line item could not be parsed and was not included.",
        evidence: evidenceFor(documentId, line),
      });
      continue;
    }
    const quantity = match[3] as string;
    const unit = (match[4] as string).toUpperCase();
    const unitPriceCents = parseMoneyToCents(match[5] as string);
    const extendedCents = parseMoneyToCents(match[6] as string);
    const quantityMilli = parseQuantityMilli(quantity);
    if (quantityMilli === null || unitPriceCents === null || extendedCents === null) {
      warnings.push({
        code: "UNPARSED_LINE_ITEM",
        message: "A line item had an invalid quantity or amount and was not included.",
        evidence: evidenceFor(documentId, line),
      });
      continue;
    }
    const expected = extendCents(quantityMilli, unitPriceCents);
    if (expected !== extendedCents) {
      warnings.push({
        code: "LINE_EXTENSION_MISMATCH",
        message: `Line ${match[1]} extends to ${
          expected / 100
        } by arithmetic but states ${extendedCents / 100}.`,
        evidence: evidenceFor(documentId, line),
      });
    }
    const description = match[2] as string;
    lineItems.push({
      id: match[1] as string,
      description,
      quantity,
      unit,
      unitPriceCents,
      extendedCents,
      category: inferCategory(description),
      categoryProvenance: "inferred",
      evidence: evidenceFor(documentId, line, "inferred", "high"),
    });
  }

  const duplicateMap = new Map<string, ParsedLineItem[]>();
  for (const item of lineItems) {
    const key = `${item.description.toLowerCase()}|${item.extendedCents}`;
    const existing = duplicateMap.get(key) ?? [];
    existing.push(item);
    duplicateMap.set(key, existing);
  }
  const duplicateLineItemIds = [...duplicateMap.values()]
    .filter((items) => items.length > 1)
    .flatMap((items) => items.map((item) => item.id));
  if (duplicateLineItemIds.length > 0) {
    const firstDuplicate = lineItems.find((item) => item.id === duplicateLineItemIds[0]);
    warnings.push({
      code: "DUPLICATE_LINE_ITEM",
      message: `Possible duplicate line items: ${duplicateLineItemIds.join(", ")}.`,
      evidence: firstDuplicate?.evidence,
    });
  }

  const allowances: Allowance[] = [];
  for (const line of lines.filter((candidate) => candidate.section === "ALLOWANCES")) {
    if (!/^AL[-_]\d+/i.test(line.text)) continue;
    const match = line.text.match(
      /^(AL[-_]\d+)\s*\|\s*(.+?)\s*\|\s*\$?([\d,]+(?:\.\d{1,2})?)\s*\|\s*(.+)$/i,
    );
    if (!match) {
      warnings.push({
        code: "UNPARSED_ALLOWANCE",
        message: "An allowance could not be parsed.",
        evidence: evidenceFor(documentId, line),
      });
      continue;
    }
    const amountCents = parseMoneyToCents(match[3] as string);
    if (amountCents === null) {
      warnings.push({
        code: "UNPARSED_ALLOWANCE",
        message: "An allowance amount could not be parsed.",
        evidence: evidenceFor(documentId, line),
      });
      continue;
    }
    const note = match[4] as string;
    const includedInLineItems = /included|within the line items/i.test(note)
      ? true
      : /separate|additional|not included/i.test(note)
        ? false
        : null;
    allowances.push({
      id: match[1] as string,
      label: match[2] as string,
      amountCents,
      includedInLineItems,
      note,
      evidence: evidenceFor(documentId, line),
    });
  }

  const exclusions: Exclusion[] = [];
  for (const line of lines.filter((candidate) => candidate.section === "SCOPE EXCLUSIONS")) {
    if (!/^EX[-_]\d+/i.test(line.text)) continue;
    const match = line.text.match(/^(EX[-_]\d+)\s*\|\s*(.+?)\s*\|\s*(.+)$/i);
    if (!match) {
      warnings.push({
        code: "UNPARSED_EXCLUSION",
        message: "An exclusion could not be parsed.",
        evidence: evidenceFor(documentId, line),
      });
      continue;
    }
    const subject = match[2] as string;
    const note = match[3] as string;
    const categories = inferExclusionCategories(subject, note);
    const assignedTo = classifyExclusionAssignment(note);
    const evidence = evidenceFor(documentId, line);
    if (categories.length === 0) {
      exclusions.push({
        id: match[1] as string,
        subject,
        note,
        category: "tax",
        assignedTo,
        evidence,
      });
      warnings.push({
        code: "UNMAPPED_EXCLUSION",
        message: `Exclusion ${match[1]} was retained but could not be mapped to a scope category.`,
        evidence,
      });
      continue;
    }
    categories.forEach((category, index) => {
      exclusions.push({
        id: index === 0 ? (match[1] as string) : `${match[1]}${String.fromCharCode(97 + index)}`,
        subject,
        note,
        category,
        assignedTo,
        evidence,
      });
    });
  }

  const responsibilities: ResponsibilityEntry[] = [];
  for (const line of lines.filter((candidate) => candidate.section === "RESPONSIBILITY MATRIX")) {
    const field = splitField(line);
    if (!field) continue;
    const role = RESPONSIBILITY_ALIASES[field.key];
    if (!role) continue;
    responsibilities.push({
      role,
      party: classifyParty(field.value, contractorName, pricingBasis.value),
      statement: field.value,
      evidence: evidenceFor(documentId, line),
    });
    if (
      /\bor\b/.test(field.value.toLowerCase()) &&
      /contractor|homeowner|owner/.test(field.value.toLowerCase())
    ) {
      warnings.push({
        code: "AMBIGUOUS_RESPONSIBILITY",
        message: `The ${role} responsibility names more than one possible party.`,
        evidence: evidenceFor(documentId, line),
      });
    }
  }

  const specifications: SpecificationValue[] = [];
  for (const line of lines.filter((candidate) => candidate.section === "MATERIAL SPECIFICATIONS")) {
    const field = splitField(line);
    if (!field) continue;
    const key = SPECIFICATION_KEYS[field.key];
    if (!key) continue;
    specifications.push({ key, value: field.value, evidence: evidenceFor(documentId, line) });
  }

  const taxField = findPrefixedField(lines, ["Sales tax", "Tax"]);
  const taxExclusion = lines.find(
    (line) =>
      line.section === "SCOPE EXCLUSIONS" &&
      /tax/i.test(line.text) &&
      !/sales tax/i.test(line.text),
  );
  let tax: TaxInfo = { ratePercent: null, amountCents: null, includedInTotal: null, statement: "" };
  if (taxField) {
    const lower = taxField.value.toLowerCase();
    const amountMatch = taxField.value.match(/\$([\d,]+(?:\.\d{1,2})?)/);
    const amountCents = amountMatch ? parseMoneyToCents(amountMatch[1] as string) : null;
    const basisPoints = parsePercentBasisPoints(taxField.value);
    tax = {
      ratePercent: basisPoints === null ? null : basisPoints / 100,
      amountCents,
      includedInTotal: /not included|excluded|paid separately|buyer|owner/.test(lower)
        ? false
        : /included/.test(lower)
          ? true
          : null,
      statement: taxField.value,
      evidence: evidenceFor(documentId, taxField.line),
    };
  } else if (taxExclusion) {
    tax = {
      ratePercent: null,
      amountCents: null,
      includedInTotal: false,
      statement: taxExclusion.text,
      evidence: evidenceFor(documentId, taxExclusion),
    };
  }

  const freightField = findField(lines, ["Delivery terms", "Freight"]);
  let freight: FreightInfo = { statement: "", includedInTotal: null };
  if (freightField) {
    const lower = freightField.value.toLowerCase();
    freight = {
      statement: freightField.value,
      includedInTotal: /not included|excluded|buyer|homeowner responsibility/.test(lower)
        ? false
        : /included|via ll-03/.test(lower)
          ? true
          : null,
      evidence: evidenceFor(documentId, freightField.line),
    };
  }

  const changeOrderField = findField(lines, ["Change order fee"]);
  let changeOrder: ChangeOrderInfo = { feePercent: null, fixedFeeCents: null, statement: "" };
  if (changeOrderField) {
    const basisPoints = parsePercentBasisPoints(changeOrderField.value);
    const feeMatch = changeOrderField.value.match(/plus\s+\$([\d,]+(?:\.\d{1,2})?)/i);
    changeOrder = {
      feePercent: basisPoints === null ? null : basisPoints / 100,
      fixedFeeCents: feeMatch ? parseMoneyToCents(feeMatch[1] as string) : null,
      statement: changeOrderField.value,
      evidence: evidenceFor(documentId, changeOrderField.line),
    };
  }

  const depositField = findField(lines, ["Deposit"]);
  const paymentField = findField(lines, ["Payment schedule"]);
  const paymentTotalField = findField(lines, ["Payment schedule total"]);
  const payment: PaymentInfo = {
    depositStatement: depositField?.value ?? "",
    depositPercent:
      depositField && parsePercentBasisPoints(depositField.value) !== null
        ? (parsePercentBasisPoints(depositField.value) as number) / 100
        : null,
    scheduleStatement: paymentField?.value ?? "",
    scheduleTotalCents: paymentTotalField ? parseMoneyToCents(paymentTotalField.value) : null,
    evidence: paymentTotalField
      ? evidenceFor(documentId, paymentTotalField.line)
      : paymentField
        ? evidenceFor(documentId, paymentField.line)
        : depositField
          ? evidenceFor(documentId, depositField.line)
          : undefined,
    depositEvidence: depositField ? evidenceFor(documentId, depositField.line) : undefined,
    scheduleEvidence: paymentField ? evidenceFor(documentId, paymentField.line) : undefined,
  };

  if (lineItems.length === 0) {
    warnings.push({
      code: "NO_LINE_ITEMS",
      message: "No parsed line items were found in this document.",
    });
  }
  if (!statedTotalCents.value) {
    warnings.push({
      code: "MISSING_TOTAL",
      message: "The document does not state a total that could be parsed.",
    });
  }
  if (!contractor.value) {
    warnings.push({
      code: "MISSING_CONTRACTOR",
      message: "The contractor or supplier name was not extracted.",
    });
  }
  if (responsibilities.length === 0) {
    warnings.push({
      code: "MISSING_RESPONSIBILITIES",
      message: "No responsibility assignments were extracted from this document.",
    });
  }
  if (unreadablePages.length > 0) {
    warnings.push({
      code: "UNREADABLE_PAGES",
      message: `Pages without extractable text: ${unreadablePages.join(", ")}.`,
    });
  }
  if (
    allowances.length > 0 &&
    !allowances.every((allowance) => allowance.includedInLineItems === true)
  ) {
    warnings.push({
      code: "ALLOWANCE_TREATMENT_UNCLEAR",
      message:
        "Allowance treatment is not fully clear; confirm whether allowances are additional to the total.",
    });
  }

  const fallbackType = meta.fallbackProjectType ?? "new_home";
  const finalProjectType: ExtractedField<ProjectType> =
    projectType.value !== null
      ? projectType
      : { value: fallbackType, provenance: "inferred", evidence: undefined };

  return {
    id: documentId,
    fileName: meta.fileName,
    pageCount: pages.length,
    textLength,
    extractionStatus: unreadablePages.length > 0 ? "partial" : "complete",
    contractor,
    proposalNumber,
    proposalDate,
    projectName,
    projectType: finalProjectType,
    pricingBasis,
    validity,
    statedSubtotalCents,
    statedTotalCents,
    lineItems,
    allowances,
    exclusions,
    responsibilities,
    specifications,
    tax,
    freight,
    changeOrder,
    payment,
    warnings,
    unreadablePages,
    duplicateLineItemIds,
    suspicionCount,
    corrections: [],
  };
}

export function correctionFields(document: ExtractedDocument): string[] {
  return document.corrections.map((entry) => entry.field);
}
