import { describe, expect, it } from "vitest";

import { buildApp } from "../app.js";
import { getTierLimits } from "../services/tierLimitsService.js";

describe("tierLimits composition after module boot", () => {
  it("merges platform aiEnabled with brewery and automation module slices at premium", async () => {
    const app = buildApp();
    await app.ready();

    const limits = getTierLimits("premium");

    expect(limits.aiEnabled).toBe(true);
    expect(limits.maxRecipesPerWorkspace).toBe(25);
    expect(limits.maxVersionsPerRecipe).toBe(3);
    expect(limits.maxVessels).toBe(8);
    expect(limits.maxAdaptersConnected).toBe(1);
    expect(limits.automationAiToolsEnabled).toBe(true);
  });

  it("includes brewery recipe caps at free with automation limits disabled", async () => {
    const app = buildApp();
    await app.ready();

    const limits = getTierLimits("free");

    expect(limits.aiEnabled).toBe(false);
    expect(limits.maxRecipesPerWorkspace).toBe(5);
    expect(limits.maxVersionsPerRecipe).toBe(2);
    expect(limits.maxVessels).toBe(2);
    expect(limits.maxAdaptersConnected).toBe(0);
    expect(limits.automationAiToolsEnabled).toBe(false);
  });
});
