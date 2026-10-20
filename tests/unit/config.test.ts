import { describe, expect, it } from "vitest";
import { getAppConfig } from "@/lib/config";

describe("getAppConfig safety gates", () => {
  it("defaults to cost data OFF and payments disabled (REQ-302, REQ-600)", () => {
    const config = getAppConfig({ NODE_ENV: "test" });

    expect(config.costDataMode).toBe("OFF");
    expect(config.paymentMode).toBe("disabled");
    expect(config.appUrl).toBe("http://localhost:3000");
  });

  it("rejects an unknown cost data mode", () => {
    expect(() =>
      getAppConfig({ NODE_ENV: "test", BUILDSCOPE_COST_DATA_MODE: "PRODUCTION" }),
    ).toThrow(/BUILDSCOPE_COST_DATA_MODE/);
  });

  it("rejects an unknown payment mode", () => {
    expect(() => getAppConfig({ NODE_ENV: "test", BUILDSCOPE_PAYMENT_MODE: "enabled" })).toThrow(
      /BUILDSCOPE_PAYMENT_MODE/,
    );
  });

  it("blocks DEMO cost data in production (REQ-302)", () => {
    expect(() =>
      getAppConfig({ NODE_ENV: "production", BUILDSCOPE_COST_DATA_MODE: "DEMO" }),
    ).toThrow(/DEMO mode is not permitted in production/);
  });

  it("allows DEMO cost data outside production", () => {
    const config = getAppConfig({ NODE_ENV: "development", BUILDSCOPE_COST_DATA_MODE: "DEMO" });

    expect(config.costDataMode).toBe("DEMO");
  });

  it("requires explicit approval for LICENSED cost data (REQ-300, REQ-302)", () => {
    expect(() =>
      getAppConfig({ NODE_ENV: "production", BUILDSCOPE_COST_DATA_MODE: "LICENSED" }),
    ).toThrow(/BUILDSCOPE_COST_DATA_LICENSE_APPROVED=true/);

    const config = getAppConfig({
      NODE_ENV: "production",
      BUILDSCOPE_COST_DATA_MODE: "LICENSED",
      BUILDSCOPE_COST_DATA_LICENSE_APPROVED: "true",
    });

    expect(config.costDataMode).toBe("LICENSED");
  });

  it("requires explicit approval for live payments (REQ-600)", () => {
    expect(() => getAppConfig({ NODE_ENV: "production", BUILDSCOPE_PAYMENT_MODE: "live" })).toThrow(
      /BUILDSCOPE_LIVE_PAYMENTS_APPROVED=true/,
    );

    const config = getAppConfig({
      NODE_ENV: "production",
      BUILDSCOPE_PAYMENT_MODE: "live",
      BUILDSCOPE_LIVE_PAYMENTS_APPROVED: "true",
    });

    expect(config.paymentMode).toBe("live");
  });

  it("does not surface unrelated environment values", () => {
    const config = getAppConfig({
      NODE_ENV: "test",
      STRIPE_SECRET_KEY: "placeholder",
      AI_PROVIDER_API_KEY: "placeholder",
    });

    expect(Object.keys(config).sort()).toEqual(["appUrl", "costDataMode", "paymentMode"]);
  });
});
