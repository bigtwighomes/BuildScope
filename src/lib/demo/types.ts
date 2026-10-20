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

export const CHANGE_STATUSES = [
  "DRAFT",
  "REQUESTED",
  "QUOTED",
  "APPROVED",
  "REJECTED",
  "UNKNOWN",
] as const;

export type ChangeStatus = (typeof CHANGE_STATUSES)[number];

export const RISK_STATUSES = [
  "screening_indicator",
  "not_evaluated",
  "service_unavailable",
  "not_found",
  "customer_report",
] as const;

export type RiskStatus = (typeof RISK_STATUSES)[number];

export type EvidenceQuality = "high" | "medium" | "low";

export type EvidenceClassification =
  "extracted" | "customer_reported" | "model_inference" | "unknown";

export interface EvidenceRef {
  readonly documentId: string;
  readonly page: number;
  readonly section: string;
  readonly span: string;
  readonly quality: EvidenceQuality;
  readonly classification: EvidenceClassification;
}

export interface Proposal {
  readonly id: string;
  readonly bidder: string;
  readonly documentTitle: string;
  readonly documentDate: string;
  readonly pageCount: number;
  readonly pricingBasis: "fixed_price" | "materials_package" | "cost_plus";
  readonly headlineAmount: number;
  readonly headlineLabel: string;
  readonly comparabilityNote: string;
  readonly expiration: string;
}

export interface ScopeCell {
  readonly status: ScopeStatus;
  readonly note: string;
  readonly evidence?: EvidenceRef;
}

export interface ScopeRow {
  readonly id: string;
  readonly area: string;
  readonly category: string;
  readonly cells: Readonly<Record<string, ScopeCell>>;
  readonly question?: string;
}

export interface ResponsibilityEntry {
  readonly id: string;
  readonly scopeId: string;
  readonly role: ResponsibilityRole;
  readonly parties: Readonly<Record<string, ResponsibleParty>>;
  readonly note: string;
  readonly evidence?: EvidenceRef;
}

export interface KnownCost {
  readonly id: string;
  readonly proposalId: string;
  readonly label: string;
  readonly amount: number;
  readonly kind: "quoted" | "allowance" | "arithmetic_discrepancy";
  readonly includedInHeadline: boolean;
  readonly evidence: EvidenceRef;
}

export interface PlanningEstimate {
  readonly id: string;
  readonly label: string;
  readonly low: number;
  readonly high: number;
  readonly unit: string;
  readonly basis: string;
  readonly dataVintage: string;
  readonly sourceLabel: string;
  readonly synthetic: true;
  readonly assumptions: readonly string[];
}

export interface UnknownCondition {
  readonly id: string;
  readonly label: string;
  readonly whyUnknown: string;
  readonly question: string;
  readonly relatedScopeId?: string;
}

export interface ChangeOrder {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: ChangeStatus;
  readonly baseline: string;
  readonly revision: string;
  readonly documentedDelta?: number;
  readonly deltaLow?: number;
  readonly deltaHigh?: number;
  readonly unknownExposure: string;
  readonly scheduleImpact: string;
  readonly feeBasis: string;
  readonly evidence: readonly EvidenceRef[];
}

export interface RiskObservation {
  readonly id: string;
  readonly topic: string;
  readonly observation: string;
  readonly status: RiskStatus;
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly resolution: string;
  readonly retrievedAt: string;
  readonly limitations: string;
  readonly customerAction: string;
  readonly demoPlaceholder: boolean;
}

export interface Finding {
  readonly id: string;
  readonly priority: number;
  readonly title: string;
  readonly detail: string;
  readonly audience: string;
  readonly question: string;
  readonly status: "extracted" | "checklist_question";
  readonly evidence: readonly EvidenceRef[];
}

export interface ArithmeticNote {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly evidence: readonly EvidenceRef[];
}

export interface DemoProject {
  readonly id: string;
  readonly name: string;
  readonly projectType: string;
  readonly syntheticNotice: string;
  readonly location: {
    readonly label: string;
    readonly zip: string;
    readonly county: string;
    readonly state: string;
    readonly resolution: string;
    readonly status: "demo_placeholder";
  };
  readonly specs: readonly { readonly label: string; readonly value: string }[];
  readonly documents: readonly Proposal[];
  readonly scopeRows: readonly ScopeRow[];
  readonly responsibilities: readonly ResponsibilityEntry[];
  readonly knownCosts: readonly KnownCost[];
  readonly planningEstimates: readonly PlanningEstimate[];
  readonly unknownConditions: readonly UnknownCondition[];
  readonly changes: readonly ChangeOrder[];
  readonly risks: readonly RiskObservation[];
  readonly findings: readonly Finding[];
  readonly arithmeticNotes: readonly ArithmeticNote[];
}
