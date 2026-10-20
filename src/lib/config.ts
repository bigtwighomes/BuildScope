export const COST_DATA_MODES = ["OFF", "DEMO", "LICENSED"] as const;
export type CostDataMode = (typeof COST_DATA_MODES)[number];

export const PAYMENT_MODES = ["disabled", "test", "live"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export interface AppConfig {
  readonly appUrl: string;
  readonly costDataMode: CostDataMode;
  readonly paymentMode: PaymentMode;
}

type Environment = Record<string, string | undefined>;

function readEnum<T extends string>(
  name: string,
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  const normalized = value?.trim();

  if (!normalized) {
    return fallback;
  }

  if (!allowed.includes(normalized as T)) {
    throw new Error(`${name} must be one of: ${allowed.join(", ")}`);
  }

  return normalized as T;
}

export function getAppConfig(env: Environment = process.env): AppConfig {
  const costDataMode = readEnum(
    "BUILDSCOPE_COST_DATA_MODE",
    env.BUILDSCOPE_COST_DATA_MODE,
    COST_DATA_MODES,
    "OFF",
  );
  const paymentMode = readEnum(
    "BUILDSCOPE_PAYMENT_MODE",
    env.BUILDSCOPE_PAYMENT_MODE,
    PAYMENT_MODES,
    "disabled",
  );

  if (costDataMode === "DEMO" && env.NODE_ENV === "production") {
    throw new Error("Cost data DEMO mode is not permitted in production.");
  }

  if (costDataMode === "LICENSED" && env.BUILDSCOPE_COST_DATA_LICENSE_APPROVED !== "true") {
    throw new Error(
      "Cost data LICENSED mode requires owner approval and BUILDSCOPE_COST_DATA_LICENSE_APPROVED=true.",
    );
  }

  if (paymentMode === "live" && env.BUILDSCOPE_LIVE_PAYMENTS_APPROVED !== "true") {
    throw new Error(
      "Live payments require owner approval and BUILDSCOPE_LIVE_PAYMENTS_APPROVED=true.",
    );
  }

  return Object.freeze({
    appUrl: env.BUILDSCOPE_APP_URL?.trim() || "http://localhost:3000",
    costDataMode,
    paymentMode,
  });
}
