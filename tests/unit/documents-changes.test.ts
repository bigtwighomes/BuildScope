import { describe, expect, it } from "vitest";
import { calculateChangeAmounts, createChangeReview } from "@/lib/documents/changes";
import { buildRiskObservations } from "@/lib/documents/risk";
import { PROJECT_SCOPE_CATEGORIES } from "@/lib/documents/scope";

describe("change review arithmetic", () => {
  it("separates additions, credits, fees and unknown exposure (REQ-506)", () => {
    const result = calculateChangeAmounts({
      baselineAmountCents: 10_000_000,
      additionsCents: 1_840_000,
      creditsCents: 100_000,
      feePercent: 12,
      fixedFeeCents: 35_000,
    });

    expect(result.directDeltaCents).toBe(1_740_000);
    expect(result.feeCents).toBe(243_800);
    expect(result.documentedDeltaCents).toBe(1_983_800);
    expect(result.unknownExposure).toMatch(/Schedule, financing, permit, tax/);

    const creditOnly = calculateChangeAmounts({
      baselineAmountCents: 10_000_000,
      additionsCents: 100_000,
      creditsCents: 200_000,
      feePercent: 10,
      fixedFeeCents: null,
    });

    expect(creditOnly.directDeltaCents).toBe(-100_000);
    expect(creditOnly.feeCents).toBe(0);
    expect(creditOnly.documentedDeltaCents).toBe(-100_000);
    expect(creditOnly.unknownExposure).toMatch(/positive changed work only/);
  });

  it("does not turn a missing price into zero", () => {
    const result = calculateChangeAmounts({
      baselineAmountCents: 10_000_000,
      additionsCents: null,
      creditsCents: null,
      feePercent: null,
      fixedFeeCents: null,
    });

    expect(result.documentedDeltaCents).toBeNull();
    expect(result.unknownExposure).toMatch(/No priced change amount/);
  });

  it("preserves a status and baseline in the customer-reported register", () => {
    const review = createChangeReview({
      id: "change-1",
      title: "Window upgrade",
      description: "Synthetic test change",
      reason: "owner_requested",
      status: "QUOTED",
      baselineAmountCents: 10_000_000,
      additionsCents: 500_000,
      creditsCents: 0,
      feePercent: 10,
      fixedFeeCents: null,
      scheduleImpact: "One week",
      createdAt: "2026-10-20T00:00:00.000Z",
    });

    expect(review.status).toBe("QUOTED");
    expect(review.baselineAmountCents).toBe(10_000_000);
    expect(review.documentedDeltaCents).toBe(550_000);
  });
});

describe("project scope libraries", () => {
  it("uses bathroom-specific scope instead of whole-home categories (REQ-404)", () => {
    expect(PROJECT_SCOPE_CATEGORIES.bathroom_renovation).toContain("waterproofing");
    expect(PROJECT_SCOPE_CATEGORIES.bathroom_renovation).toContain("ventilation");
    expect(PROJECT_SCOPE_CATEGORIES.bathroom_renovation).not.toContain("sitework");
    expect(PROJECT_SCOPE_CATEGORIES.new_home).toContain("structure");
  });
});

describe("site and project screening checklist", () => {
  it("labels every observation as not evaluated with a source and limitation (REQ-702)", () => {
    const observations = buildRiskObservations("bathroom_renovation", "Synthetic test location");

    expect(observations.length).toBeGreaterThanOrEqual(3);
    for (const observation of observations) {
      expect(observation.status).toBe("not_evaluated");
      expect(observation.sourceName.length).toBeGreaterThan(0);
      expect(observation.limitations.length).toBeGreaterThan(0);
      expect(observation.retrievedAt).toBeNull();
    }
    expect(observations.map((item) => item.topic)).toContain(
      "Concealed moisture and existing conditions",
    );
  });
});
