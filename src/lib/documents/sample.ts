import { createChangeReview } from "./changes";
import type { ChangeReview } from "./types";

export const SAMPLE_LOCATION = "Cedar Ridge, fictional sample";

export const SAMPLE_CHANGES: readonly ChangeReview[] = [
  createChangeReview({
    id: "sample-change-windows",
    title: "Window package upgrade",
    description:
      "Illustrative owner request to upgrade the window package. This is synthetic sample data, not a real change order.",
    reason: "owner_requested",
    status: "QUOTED",
    baselineAmountCents: 50_816_240,
    additionsCents: 1_840_000,
    creditsCents: 0,
    feePercent: 12,
    fixedFeeCents: 35_000,
    scheduleImpact: "Two weeks added to the illustrative schedule.",
    createdAt: "2026-10-20T00:00:00.000Z",
  }),
  createChangeReview({
    id: "sample-change-concealed",
    title: "Concealed framing repair",
    description:
      "Illustrative concealed-condition request with no price or schedule commitment. This is synthetic sample data.",
    reason: "site_condition",
    status: "REQUESTED",
    baselineAmountCents: 50_816_240,
    additionsCents: null,
    creditsCents: null,
    feePercent: 12,
    fixedFeeCents: 35_000,
    scheduleImpact: "Not stated.",
    createdAt: "2026-10-20T00:00:00.000Z",
  }),
];
