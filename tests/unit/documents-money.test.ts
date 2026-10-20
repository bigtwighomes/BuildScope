import { describe, expect, it } from "vitest";
import {
  extendCents,
  formatIsoDate,
  formatMoneyCents,
  formatPercent,
  isValidIsoDate,
  parseMoneyToCents,
  parsePercentBasisPoints,
  parseQuantityMilli,
  percentOfCents,
} from "@/lib/documents/money";

describe("document money parsing", () => {
  it("parses formatted dollars into integer cents", () => {
    expect(parseMoneyToCents("$486,540.00")).toBe(48_654_000);
    expect(parseMoneyToCents(" 52,000 ")).toBe(5_200_000);
    expect(parseMoneyToCents("$0.05")).toBe(5);
    expect(parseMoneyToCents("\u2212$1,000.50")).toBe(-100_050);
  });

  it("rejects malformed or unsafe amounts instead of rounding silently", () => {
    expect(parseMoneyToCents("")).toBeNull();
    expect(parseMoneyToCents("12.345")).toBeNull();
    expect(parseMoneyToCents("12 dollars")).toBeNull();
    expect(parseMoneyToCents("999,999,999,999.99")).toBeNull();
  });

  it("formats cents without floating point drift", () => {
    expect(formatMoneyCents(48_654_000)).toBe("$486,540.00");
    expect(formatMoneyCents(-250_000)).toBe("\u2212$2,500.00");
    expect(formatMoneyCents(1)).toBe("$0.01");
  });
});

describe("quantity and percentage arithmetic", () => {
  it("extends quantities with three decimal places", () => {
    expect(parseQuantityMilli("1")).toBe(1_000);
    expect(parseQuantityMilli("1.5")).toBe(1_500);
    expect(parseQuantityMilli("0.125")).toBe(125);
    expect(parseQuantityMilli("1.2345")).toBeNull();
    expect(extendCents(1_500, 5_200_000)).toBe(7_800_000);
  });

  it("calculates tax in basis points", () => {
    expect(parsePercentBasisPoints("6.0%")).toBe(600);
    expect(parsePercentBasisPoints("7.25 percent")).toBeNull();
    expect(parsePercentBasisPoints("0%")).toBeNull();
    expect(formatPercent(600)).toBe("6%");
    expect(formatPercent(725)).toBe("7.25%");
    expect(percentOfCents(45_900_000, 600)).toBe(2_754_000);
  });
});

describe("document dates", () => {
  it("accepts only real ISO calendar dates", () => {
    expect(isValidIsoDate("2026-09-12")).toBe(true);
    expect(isValidIsoDate("2026-02-30")).toBe(false);
    expect(isValidIsoDate("09/12/2026")).toBe(false);
    expect(formatIsoDate("2026-09-12")).toBe("Sep 12, 2026");
    expect(formatIsoDate("not-a-date")).toBe("not-a-date");
  });
});
