import { percentOfCents } from "./money";
import type { ChangeReview, ChangeReviewStatus } from "./types";

export interface ChangeAmountInput {
  readonly baselineAmountCents: number | null;
  readonly additionsCents: number | null;
  readonly creditsCents: number | null;
  readonly feePercent: number | null;
  readonly fixedFeeCents: number | null;
}

export interface ChangeAmountResult {
  readonly directDeltaCents: number | null;
  readonly feeCents: number | null;
  readonly documentedDeltaCents: number | null;
  readonly unknownExposure: string;
}

export function calculateChangeAmounts(input: ChangeAmountInput): ChangeAmountResult {
  const directDelta =
    input.additionsCents === null && input.creditsCents === null
      ? null
      : (input.additionsCents ?? 0) - (input.creditsCents ?? 0);
  const percentageFee =
    input.feePercent === null
      ? null
      : percentOfCents(
          Math.max((input.additionsCents ?? 0) - (input.creditsCents ?? 0), 0),
          Math.round(input.feePercent * 100),
        );
  const knownFee =
    percentageFee === null && input.fixedFeeCents === null
      ? null
      : (percentageFee ?? 0) + (input.fixedFeeCents ?? 0);
  const documentedDelta =
    directDelta === null && knownFee === null ? null : (directDelta ?? 0) + (knownFee ?? 0);

  const unknowns: string[] = [];
  if (input.additionsCents === null && input.creditsCents === null) {
    unknowns.push("No priced change amount is stated.");
  }
  if (input.feePercent === null && input.fixedFeeCents === null) {
    unknowns.push("The contractor's change-order fee terms are not established.");
  }
  if (input.feePercent !== null && directDelta !== null && directDelta < 0) {
    unknowns.push(
      "The calculation applies the percentage fee to positive changed work only; confirm how the contract treats credits.",
    );
  }
  unknowns.push("Schedule, financing, permit, tax and indirect impacts are not priced here.");

  return {
    directDeltaCents: directDelta,
    feeCents: knownFee,
    documentedDeltaCents: documentedDelta,
    unknownExposure: unknowns.join(" "),
  };
}

export interface CreateChangeReviewInput extends ChangeAmountInput {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly reason: ChangeReview["reason"];
  readonly status: ChangeReviewStatus;
  readonly scheduleImpact: string;
  readonly createdAt: string;
}

export function createChangeReview(input: CreateChangeReviewInput): ChangeReview {
  const amounts = calculateChangeAmounts(input);
  return {
    id: input.id,
    title: input.title.trim(),
    description: input.description.trim(),
    reason: input.reason,
    status: input.status,
    baselineAmountCents: input.baselineAmountCents,
    additionsCents: input.additionsCents,
    creditsCents: input.creditsCents,
    feePercent: input.feePercent,
    fixedFeeCents: input.fixedFeeCents,
    documentedDeltaCents: amounts.documentedDeltaCents,
    unknownExposure: amounts.unknownExposure,
    scheduleImpact: input.scheduleImpact.trim(),
    createdAt: input.createdAt,
  };
}
