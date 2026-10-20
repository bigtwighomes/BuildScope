import { describe, expect, it } from "vitest";
import {
  cellsMissingEvidence,
  countScopeStatuses,
  filterScopeRows,
  formatDelta,
  formatUsd,
  getUnknownExposure,
  summarizeCosts,
} from "@/lib/demo/analysis";
import { DEMO_DOCUMENT_IDS, demoProject } from "@/lib/demo/project";

const { northline, cascade, sagebrush } = DEMO_DOCUMENT_IDS;

describe("demo cost summaries (REQ-105, REQ-210)", () => {
  it("keeps quoted totals separate from allowances and discrepancies", () => {
    const summaries = summarizeCosts(demoProject);
    const byId = new Map(summaries.map((summary) => [summary.proposalId, summary]));

    expect(byId.get(northline)?.quotedTotal).toBe(486000);
    expect(byId.get(northline)?.allowancesTotal).toBe(24400);
    expect(byId.get(northline)?.discrepanciesTotal).toBe(0);

    expect(byId.get(cascade)?.quotedTotal).toBe(231500);
    expect(byId.get(cascade)?.allowancesTotal).toBe(0);

    expect(byId.get(sagebrush)?.quotedTotal).toBe(418900);
    expect(byId.get(sagebrush)?.discrepanciesTotal).toBe(11500);
  });

  it("does not add allowances or discrepancies into known quoted totals", () => {
    const summaries = summarizeCosts(demoProject);
    const totalQuoted = summaries.reduce((total, summary) => total + summary.quotedTotal, 0);
    const totalAllowances = summaries.reduce(
      (total, summary) => total + summary.allowancesTotal,
      0,
    );

    expect(totalQuoted).toBe(1136400);
    expect(totalAllowances).toBe(36900);
    expect(totalQuoted + totalAllowances).not.toBe(totalQuoted);
  });
});

describe("scope classification (REQ-102)", () => {
  it("uses distinct statuses and never invents evidence for silent scope", () => {
    const counts = countScopeStatuses(demoProject.scopeRows);
    const statuses = counts.map((entry) => entry.status);

    expect(statuses).toContain("NOT_SPECIFIED");
    expect(statuses).toContain("CONFLICTING");
    expect(statuses).toContain("SEPARATELY_CONTRACTED");
    expect(new Set(statuses).size).toBe(statuses.length);

    const notSpecified = demoProject.scopeRows
      .flatMap((row) => Object.values(row.cells))
      .filter((cell) => cell.status === "NOT_SPECIFIED");

    expect(notSpecified.length).toBeGreaterThanOrEqual(5);
    expect(notSpecified.every((cell) => cell.evidence === undefined)).toBe(true);
  });

  it("requires evidence for material factual extractions (REQ-103)", () => {
    expect(cellsMissingEvidence(demoProject.scopeRows)).toEqual([]);
  });

  it("filters by status and query without dropping unknowns silently", () => {
    const conflicting = filterScopeRows(demoProject.scopeRows, { status: "CONFLICTING" });
    expect(conflicting.map((row) => row.id).sort()).toEqual(
      ["deck-railings", "hvac", "log-package", "roofing"].sort(),
    );

    const freight = filterScopeRows(demoProject.scopeRows, { query: "freight" });
    expect(freight.map((row) => row.id)).toEqual(["freight-unloading"]);

    const all = filterScopeRows(demoProject.scopeRows, {});
    expect(all).toHaveLength(demoProject.scopeRows.length);
  });
});

describe("unknowns and changes (REQ-210, REQ-212)", () => {
  it("counts unpriced conditions and unassigned responsibilities as exposure", () => {
    const exposure = getUnknownExposure(demoProject);

    expect(exposure.unknownConditionCount).toBe(9);
    expect(exposure.unassignedResponsibilityCount).toBe(7);
    expect(exposure.totalUnknownItems).toBe(16);
    expect(exposure.changesWithUnknownFees).toBe(4);
  });

  it("never stores a dollar amount on an unknown condition", () => {
    expect(demoProject.unknownConditions.every((condition) => !("amount" in condition))).toBe(true);
  });

  it("preserves the baseline when a change is requested or approved", () => {
    const requested = demoProject.changes.find((change) => change.status === "REQUESTED");
    const approved = demoProject.changes.find((change) => change.status === "APPROVED");

    expect(requested?.baseline).toBeTruthy();
    expect(requested?.documentedDelta).toBe(6200);
    expect(approved?.baseline).toContain("pine");
    expect(approved?.documentedDelta).toBe(14800);
    expect(approved?.unknownExposure.length).toBeGreaterThan(0);
  });

  it("keeps a rejected change out of committed totals", () => {
    const rejected = demoProject.changes.filter((change) => change.status === "REJECTED");
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.documentedDelta).toBeGreaterThan(0);
  });

  it("supports a lower-cost change that still carries unknown exposure", () => {
    const credit = demoProject.changes.find((change) => (change.documentedDelta ?? 0) < 0);

    expect(credit?.documentedDelta).toBe(-4100);
    expect(credit?.unknownExposure.length).toBeGreaterThan(0);
  });
});

describe("formatting", () => {
  it("formats whole-dollar amounts and signed deltas", () => {
    expect(formatUsd(486000)).toBe("$486,000");
    expect(formatDelta(14800)).toBe("+$14,800");
    expect(formatDelta(-4100)).toBe("−$4,100");
    expect(formatDelta(0)).toBe("$0");
  });
});
