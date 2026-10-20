import type {
  DemoProject,
  Proposal,
  ResponsibilityRole,
  ResponsibleParty,
  RiskStatus,
  ScopeRow,
  ScopeStatus,
  ChangeStatus,
} from "./types";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUsd(value: number): string {
  return usd.format(value);
}

export function formatDelta(value: number): string {
  const prefix = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${prefix}${usd.format(Math.abs(value))}`;
}

export const SCOPE_STATUS_LABELS: Record<ScopeStatus, string> = {
  INCLUDED: "Included",
  EXCLUDED: "Excluded",
  NOT_SPECIFIED: "Not specified",
  SEPARATELY_CONTRACTED: "Separately contracted",
  CONFLICTING: "Conflicting",
  UNREADABLE: "Unreadable",
  NOT_APPLICABLE: "Not applicable",
};

export const SCOPE_STATUS_DESCRIPTIONS: Record<ScopeStatus, string> = {
  INCLUDED: "The document prices or explicitly provides this scope.",
  EXCLUDED: "The document states the scope is not included.",
  NOT_SPECIFIED: "The document is silent. This is not proof the work is included or free.",
  SEPARATELY_CONTRACTED: "The scope is assigned to another party or contract.",
  CONFLICTING: "Two or more documents describe different scope or specifications.",
  UNREADABLE: "The source text could not be read reliably.",
  NOT_APPLICABLE: "The scope does not apply to this document's contract type.",
};

export const CHANGE_STATUS_LABELS: Record<ChangeStatus, string> = {
  DRAFT: "Draft",
  REQUESTED: "Requested — not approved",
  QUOTED: "Quoted — not approved",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  UNKNOWN: "Unknown",
};

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  screening_indicator: "Screening indicator",
  not_evaluated: "Not evaluated",
  service_unavailable: "Service unavailable",
  not_found: "Not found",
  customer_report: "Customer reported",
};

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

export const RESPONSIBLE_PARTY_LABELS: Record<ResponsibleParty, string> = {
  homeowner: "Homeowner",
  materials_supplier: "Materials supplier",
  gc_builder: "GC / builder",
  trade_contractor: "Trade contractor",
  engineer_designer: "Engineer / designer",
  logistics_partner: "Logistics partner",
  unknown: "Not stated",
};

export const PRICING_BASIS_LABELS: Record<Proposal["pricingBasis"], string> = {
  fixed_price: "Fixed price",
  materials_package: "Materials package",
  cost_plus: "Cost plus",
};

export interface ProposalCostSummary {
  readonly proposalId: string;
  readonly quotedTotal: number;
  readonly allowancesTotal: number;
  readonly discrepanciesTotal: number;
  readonly knownCostCount: number;
}

export function summarizeCosts(project: DemoProject): readonly ProposalCostSummary[] {
  return project.documents.map((document) => {
    const rows = project.knownCosts.filter((cost) => cost.proposalId === document.id);
    const quoted = rows.filter((cost) => cost.kind === "quoted" && cost.includedInHeadline);
    const allowances = rows.filter((cost) => cost.kind === "allowance");
    const discrepancies = rows.filter((cost) => cost.kind === "arithmetic_discrepancy");

    return {
      proposalId: document.id,
      quotedTotal: quoted.reduce((total, cost) => total + cost.amount, 0),
      allowancesTotal: allowances.reduce((total, cost) => total + cost.amount, 0),
      discrepanciesTotal: discrepancies.reduce((total, cost) => total + cost.amount, 0),
      knownCostCount: rows.length,
    };
  });
}

export interface ScopeStatusCount {
  readonly status: ScopeStatus;
  readonly count: number;
}

export function countScopeStatuses(rows: readonly ScopeRow[]): readonly ScopeStatusCount[] {
  const counts = new Map<ScopeStatus, number>();
  for (const row of rows) {
    for (const cell of Object.values(row.cells)) {
      counts.set(cell.status, (counts.get(cell.status) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export function filterScopeRows(
  rows: readonly ScopeRow[],
  options: { readonly query?: string; readonly status?: ScopeStatus | "ALL" },
): readonly ScopeRow[] {
  const query = options.query?.trim().toLowerCase() ?? "";
  const status = options.status ?? "ALL";

  return rows.filter((row) => {
    const matchesQuery =
      query.length === 0 ||
      row.area.toLowerCase().includes(query) ||
      row.category.toLowerCase().includes(query) ||
      Object.values(row.cells).some((cell) => cell.note.toLowerCase().includes(query));
    const matchesStatus =
      status === "ALL" || Object.values(row.cells).some((cell) => cell.status === status);
    return matchesQuery && matchesStatus;
  });
}

export function countStatusForProposal(rows: readonly ScopeRow[], proposalId: string): number {
  return rows.filter((row) => row.cells[proposalId] !== undefined).length;
}

export function findProposal(project: DemoProject, proposalId: string): Proposal | undefined {
  return project.documents.find((document) => document.id === proposalId);
}

const EVIDENCE_REQUIRED_STATUSES: readonly ScopeStatus[] = [
  "INCLUDED",
  "EXCLUDED",
  "SEPARATELY_CONTRACTED",
  "CONFLICTING",
];

export function cellsMissingEvidence(rows: readonly ScopeRow[]): readonly {
  readonly rowId: string;
  readonly proposalId: string;
  readonly status: ScopeStatus;
}[] {
  const missing: { rowId: string; proposalId: string; status: ScopeStatus }[] = [];
  for (const row of rows) {
    for (const [proposalId, cell] of Object.entries(row.cells)) {
      if (EVIDENCE_REQUIRED_STATUSES.includes(cell.status) && !cell.evidence) {
        missing.push({ rowId: row.id, proposalId, status: cell.status });
      }
    }
  }
  return missing;
}

export function getUnknownExposure(project: DemoProject): {
  readonly unknownConditionCount: number;
  readonly unassignedResponsibilityCount: number;
  readonly changesWithUnknownFees: number;
  readonly totalUnknownItems: number;
} {
  const unassignedResponsibilityCount = project.responsibilities.filter((entry) =>
    Object.values(entry.parties).some((party) => party === "unknown"),
  ).length;
  const changesWithUnknownFees = project.changes.filter(
    (change) => change.status !== "REJECTED" && change.unknownExposure.length > 0,
  ).length;

  return {
    unknownConditionCount: project.unknownConditions.length,
    unassignedResponsibilityCount,
    changesWithUnknownFees,
    totalUnknownItems: project.unknownConditions.length + unassignedResponsibilityCount,
  };
}

export function getHeadlineFindings(project: DemoProject, limit = 3) {
  return [...project.findings].sort((a, b) => a.priority - b.priority).slice(0, limit);
}
