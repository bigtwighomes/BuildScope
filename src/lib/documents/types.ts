export const PROJECT_TYPES = ["new_home", "renovation"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PRICING_BASES = [
  "fixed_price",
  "materials_package",
  "cost_plus",
  "labor_only",
  "unknown",
] as const;
export type PricingBasis = (typeof PRICING_BASES)[number];

export const SCOPE_STATUSES = [
  "INCLUDED",
  "EXCLUDED",
  "NOT_SPECIFIED",
  "SEPARATELY_CONTRACTED",
  "CONFLICTING",
  "UNREADABLE",
  "NOT_APPLICABLE",
] as const;
export type ScopeStatus = (typeof SCOPE_STATUSES)[number];

export const SCOPE_CATEGORIES = [
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
  "uncategorized",
] as const;
export type ScopeCategory = (typeof SCOPE_CATEGORIES)[number];

export const SCOPE_CATEGORY_LABELS: Record<ScopeCategory, string> = {
  sitework: "Sitework and excavation",
  foundation: "Foundation system",
  structure: "Log structure and erection",
  roofing: "Roofing",
  windows: "Windows and exterior doors",
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "Heating and ventilation",
  insulation: "Insulation and drywall",
  finishes: "Interior finishes",
  freight: "Freight, crane and unloading",
  waste: "Waste removal and final clean",
  permits: "Permits and engineering",
  utilities: "Septic and well site utilities",
  landscaping: "Landscaping",
  appliances: "Appliances",
  installation_labor: "Installation labor",
  uncategorized: "Uncategorized line items",
};

export const RESPONSIBILITY_ROLES = [
  "supplies",
  "purchases",
  "pays",
  "installs",
  "coordinates",
  "delivers",
  "unloads",
  "warrants",
] as const;
export type ResponsibilityRole = (typeof RESPONSIBILITY_ROLES)[number];

export const RESPONSIBILITY_ROLE_LABELS: Record<ResponsibilityRole, string> = {
  supplies: "Supplies",
  purchases: "Purchases",
  pays: "Pays",
  installs: "Installs",
  coordinates: "Coordinates",
  delivers: "Delivers",
  unloads: "Unloads",
  warrants: "Warrants",
};

export const RESPONSIBLE_PARTIES = [
  "homeowner",
  "materials_supplier",
  "gc_builder",
  "trade_contractor",
  "engineer_designer",
  "logistics_partner",
  "unknown",
] as const;
export type ResponsibleParty = (typeof RESPONSIBLE_PARTIES)[number];

export const RESPONSIBLE_PARTY_LABELS: Record<ResponsibleParty, string> = {
  homeowner: "Homeowner",
  materials_supplier: "Materials supplier",
  gc_builder: "GC / builder",
  trade_contractor: "Trade contractor",
  engineer_designer: "Engineer / designer",
  logistics_partner: "Logistics partner",
  unknown: "Not stated",
};

export const PRICING_BASIS_LABELS: Record<PricingBasis, string> = {
  fixed_price: "Fixed price",
  materials_package: "Materials package",
  cost_plus: "Cost plus",
  labor_only: "Labor only",
  unknown: "Unknown",
};

export type EvidenceQuality = "high" | "medium" | "low";
export type EvidenceClassification = "extracted" | "inferred";

export interface SourceEvidence {
  readonly documentId: string;
  readonly page: number;
  readonly section: string;
  readonly span: string;
  readonly lineNumber: number;
  readonly quality: EvidenceQuality;
  readonly classification: EvidenceClassification;
}

export interface ExtractedField<T> {
  readonly value: T | null;
  readonly evidence?: SourceEvidence;
  readonly provenance: "stated" | "inferred" | "missing";
}

export interface ParsedLineItem {
  readonly id: string;
  readonly description: string;
  readonly quantity: string;
  readonly unit: string;
  readonly unitPriceCents: number;
  readonly extendedCents: number;
  readonly category: ScopeCategory;
  readonly categoryProvenance: "inferred" | "reviewer";
  readonly evidence: SourceEvidence;
}

export interface Allowance {
  readonly id: string;
  readonly label: string;
  readonly amountCents: number;
  readonly includedInLineItems: boolean | null;
  readonly note: string;
  readonly evidence: SourceEvidence;
}

export type ExclusionAssignment = "homeowner" | "other_contract" | "not_included" | "unknown";

export interface Exclusion {
  readonly id: string;
  readonly subject: string;
  readonly note: string;
  readonly category: ScopeCategory | "tax";
  readonly assignedTo: ExclusionAssignment;
  readonly evidence: SourceEvidence;
}

export interface ResponsibilityEntry {
  readonly role: ResponsibilityRole;
  readonly party: ResponsibleParty;
  readonly statement: string;
  readonly evidence: SourceEvidence;
}

export interface TaxInfo {
  readonly ratePercent: number | null;
  readonly amountCents: number | null;
  readonly includedInTotal: boolean | null;
  readonly statement: string;
  readonly evidence?: SourceEvidence;
}

export interface FreightInfo {
  readonly statement: string;
  readonly includedInTotal: boolean | null;
  readonly evidence?: SourceEvidence;
}

export interface ChangeOrderInfo {
  readonly feePercent: number | null;
  readonly fixedFeeCents: number | null;
  readonly statement: string;
  readonly evidence?: SourceEvidence;
}

export interface PaymentInfo {
  readonly depositStatement: string;
  readonly depositPercent: number | null;
  readonly scheduleStatement: string;
  readonly scheduleTotalCents: number | null;
  readonly evidence?: SourceEvidence;
  readonly depositEvidence?: SourceEvidence;
  readonly scheduleEvidence?: SourceEvidence;
}

export interface SpecificationValue {
  readonly key:
    "insulation" | "roofing_material" | "log_species" | "window_specification" | "foundation";
  readonly value: string;
  readonly evidence: SourceEvidence;
}

export interface ExtractionWarning {
  readonly code: string;
  readonly message: string;
  readonly evidence?: SourceEvidence;
}

export interface AppliedCorrection {
  readonly field: string;
  readonly originalValue: string;
  readonly correctedValue: string;
}

export interface ExtractedDocument {
  readonly id: string;
  readonly fileName: string;
  readonly pageCount: number;
  readonly textLength: number;
  readonly extractionStatus: "complete" | "partial";
  readonly contractor: ExtractedField<string>;
  readonly proposalNumber: ExtractedField<string>;
  readonly proposalDate: ExtractedField<string>;
  readonly projectName: ExtractedField<string>;
  readonly projectType: ExtractedField<ProjectType>;
  readonly pricingBasis: ExtractedField<PricingBasis>;
  readonly validity: ExtractedField<string>;
  readonly statedSubtotalCents: ExtractedField<number>;
  readonly statedTotalCents: ExtractedField<number>;
  readonly lineItems: readonly ParsedLineItem[];
  readonly allowances: readonly Allowance[];
  readonly exclusions: readonly Exclusion[];
  readonly responsibilities: readonly ResponsibilityEntry[];
  readonly specifications: readonly SpecificationValue[];
  readonly tax: TaxInfo;
  readonly freight: FreightInfo;
  readonly changeOrder: ChangeOrderInfo;
  readonly payment: PaymentInfo;
  readonly warnings: readonly ExtractionWarning[];
  readonly unreadablePages: readonly number[];
  readonly duplicateLineItemIds: readonly string[];
  readonly suspicionCount: number;
  readonly corrections: readonly AppliedCorrection[];
}

export type RejectionCode =
  | "EMPTY_FILE"
  | "NOT_PDF"
  | "FILE_TOO_LARGE"
  | "TOO_MANY_DOCUMENTS"
  | "REQUEST_TOO_LARGE"
  | "DUPLICATE"
  | "ENCRYPTED"
  | "INVALID_PDF"
  | "TOO_MANY_PAGES"
  | "NO_TEXT"
  | "TEXT_TOO_LARGE"
  | "EXTRACTION_TIMEOUT"
  | "EXTRACTION_FAILED";

export interface DocumentRejection {
  readonly fileName: string;
  readonly code: RejectionCode;
  readonly message: string;
  readonly sizeBytes?: number;
}

export interface ComparisonCell {
  readonly status: ScopeStatus;
  readonly note: string;
  readonly evidence: readonly SourceEvidence[];
  readonly categoryTotalCents?: number;
}

export interface ComparisonRow {
  readonly category: ScopeCategory;
  readonly label: string;
  readonly cells: Readonly<Record<string, ComparisonCell>>;
  readonly question?: string;
}

export interface ResponsibilityRow {
  readonly role: ResponsibilityRole;
  readonly cells: Readonly<
    Record<string, { readonly party: ResponsibleParty; readonly evidence?: SourceEvidence }>
  >;
}

export interface LineExtensionIssue {
  readonly lineId: string;
  readonly expectedCents: number;
  readonly actualCents: number;
}

export interface ArithmeticCheck {
  readonly documentId: string;
  readonly lineItemCount: number;
  readonly lineItemSubtotalCents: number;
  readonly taxExpectedCents: number | null;
  readonly expectedTotalCents: number | null;
  readonly statedTotalCents: number | null;
  readonly totalDeltaCents: number | null;
  readonly paymentScheduleDeltaCents: number | null;
  readonly lineExtensionIssues: readonly LineExtensionIssue[];
  readonly status: "matches" | "discrepancy" | "insufficient_data";
}

export interface AnalysisFinding {
  readonly id: string;
  readonly priority: number;
  readonly severity: "high" | "medium" | "low" | "security";
  readonly title: string;
  readonly detail: string;
  readonly audience: string;
  readonly question: string;
  readonly status: "extracted" | "checklist_question" | "security";
  readonly evidence: readonly SourceEvidence[];
}

export interface AnalysisMetrics {
  readonly documentsAccepted: number;
  readonly documentsRejected: number;
  readonly lineItemsExtracted: number;
  readonly evidenceReferences: number;
  readonly arithmeticChecks: number;
  readonly arithmeticMatches: number;
  readonly unreadablePages: number;
  readonly warnings: number;
  readonly suspiciousSpans: number;
  readonly findings: number;
  readonly findingsWithEvidence: number;
}

export interface DocumentCorrection {
  readonly contractor?: string;
  readonly proposalDate?: string;
  readonly pricingBasis?: PricingBasis;
  readonly statedTotalCents?: number;
  readonly lineCategories?: Readonly<Record<string, ScopeCategory>>;
}

export type DocumentCorrections = Readonly<Record<string, DocumentCorrection>>;

export interface Analysis {
  readonly analysisId: string;
  readonly generatedAt: string;
  readonly projectType: ProjectType;
  readonly documents: readonly ExtractedDocument[];
  readonly rejections: readonly DocumentRejection[];
  readonly comparisonRows: readonly ComparisonRow[];
  readonly responsibilities: readonly ResponsibilityRow[];
  readonly arithmetic: readonly ArithmeticCheck[];
  readonly findings: readonly AnalysisFinding[];
  readonly metrics: AnalysisMetrics;
  readonly limitations: readonly string[];
  readonly synthetic: true;
}

export interface AnalysisLimits {
  readonly maxDocuments: number;
  readonly maxFileBytes: number;
  readonly maxRequestBytes: number;
  readonly maxPages: number;
  readonly maxTextCharacters: number;
  readonly extractionTimeoutMs: number;
}
