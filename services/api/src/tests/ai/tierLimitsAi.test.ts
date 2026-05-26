import { describe, expect, it } from "vitest";

import { getTierLimits } from "../../services/tierLimitsService.js";

describe("tierLimits.aiEnabled", () => {
  it("free is the only tier where aiEnabled is false", () => {
    expect(getTierLimits("free").aiEnabled).toBe(false);
    expect(getTierLimits("premium").aiEnabled).toBe(true);
    expect(getTierLimits("pro").aiEnabled).toBe(true);
    expect(getTierLimits("pro_plus").aiEnabled).toBe(true);
  });

  it("falls back to free for unknown tiers (defense in depth)", () => {
    // Cast around the union to simulate a runtime-only unexpected value.
    const limits = getTierLimits("unexpected_tier" as unknown as "free");
    expect(limits.aiEnabled).toBe(false);
  });

  it("does not break the existing recipe/version caps", () => {
    const free = getTierLimits("free");
    const premium = getTierLimits("premium");
    expect(free.maxRecipesPerWorkspace).toBe(5);
    expect(premium.maxRecipesPerWorkspace).toBe(25);
  });
});
