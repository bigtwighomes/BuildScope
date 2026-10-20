const MAX_SAFE_CENTS = 1_000_000_000_000;

export function parseMoneyToCents(input: string): number | null {
  const cleaned = input
    .trim()
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\u2212/g, "-")
    .replace(/\s+/g, "");
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(cleaned)) return null;
  const negative = cleaned.startsWith("-");
  const unsigned = negative ? cleaned.slice(1) : cleaned;
  const [whole, fraction = ""] = unsigned.split(".");
  const cents = BigInt(whole) * 100n + BigInt((fraction + "00").slice(0, 2));
  if (cents > BigInt(MAX_SAFE_CENTS)) return null;
  const value = Number(cents);
  return negative ? -value : value;
}

export function formatMoneyCents(cents: number): string {
  const rounded = Math.trunc(cents);
  const absolute = Math.abs(rounded);
  const dollars = Math.floor(absolute / 100).toLocaleString("en-US");
  const remainder = String(absolute % 100).padStart(2, "0");
  return `${rounded < 0 ? "\u2212" : ""}$${dollars}.${remainder}`;
}

export function parseQuantityMilli(input: string): number | null {
  const cleaned = input.trim().replace(/,/g, "");
  if (!/^\d+(?:\.\d{1,3})?$/.test(cleaned)) return null;
  const [whole, fraction = ""] = cleaned.split(".");
  const milli = BigInt(whole) * 1000n + BigInt((fraction + "000").slice(0, 3));
  if (milli > 1_000_000_000n) return null;
  return Number(milli);
}

export function extendCents(quantityMilli: number, unitPriceCents: number): number {
  return Math.round((quantityMilli * unitPriceCents) / 1000);
}

export function parsePercentBasisPoints(input: string): number | null {
  const match = input.match(/(\d+(?:\.\d{1,2})?)\s*%/);
  if (!match) return null;
  const percent = match[1] as string;
  const [whole, fraction = ""] = percent.split(".");
  const basisPoints = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  if (!Number.isSafeInteger(basisPoints) || basisPoints <= 0 || basisPoints > 10_000) return null;
  return basisPoints;
}

export function percentFromBasisPoints(basisPoints: number): number {
  return basisPoints / 100;
}

export function formatPercent(basisPoints: number): string {
  const whole = Math.trunc(basisPoints / 100);
  const fraction = basisPoints % 100;
  if (fraction === 0) return `${whole}%`;
  return `${whole}.${String(fraction).padStart(2, "0").replace(/0$/, "")}%`;
}

export function percentOfCents(cents: number, basisPoints: number): number {
  return Math.round((cents * basisPoints) / 10_000);
}

export function formatIsoDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
