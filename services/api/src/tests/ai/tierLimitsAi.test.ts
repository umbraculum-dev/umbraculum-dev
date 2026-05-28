import { beforeEach, describe, expect, it } from "vitest";
import { clearModuleRegistryForTests } from "@umbraculum/module-sdk";

import { buildApp } from "../../app.js";
import { getTierLimits } from "../../services/tierLimitsService.js";

describe("tierLimits.aiEnabled", () => {
  beforeEach(() => {
    clearModuleRegistryForTests();
  });

  it("free is the only tier where aiEnabled is false", async () => {
    const app = buildApp();
    await app.ready();

    expect(getTierLimits("free").aiEnabled).toBe(false);
    expect(getTierLimits("premium").aiEnabled).toBe(true);
    expect(getTierLimits("pro").aiEnabled).toBe(true);
    expect(getTierLimits("pro_plus").aiEnabled).toBe(true);
  });

  it("falls back to free for unknown tiers (defense in depth)", async () => {
    const app = buildApp();
    await app.ready();

    const limits = getTierLimits("unexpected_tier" as unknown as "free");
    expect(limits.aiEnabled).toBe(false);
  });

  it("includes brewery recipe/version caps after module boot", async () => {
    const app = buildApp();
    await app.ready();

    const free = getTierLimits("free");
    const premium = getTierLimits("premium");
    expect(free.maxRecipesPerWorkspace).toBe(5);
    expect(premium.maxRecipesPerWorkspace).toBe(25);
  });
});
