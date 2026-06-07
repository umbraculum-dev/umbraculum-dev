import { describe, expect, it } from "vitest";

import {
  InvalidModuleProfileError,
  isModuleEnabled,
  resolveEnabledModuleCodes,
  resolveModuleProfile,
} from "./enabledModules.js";

describe("enabledModules", () => {
  it("defaults to reference profile when env unset", () => {
    expect(resolveModuleProfile({})).toBe("reference");
    expect(resolveEnabledModuleCodes({}).has("brewery")).toBe(true);
  });

  it("platform profile excludes brewery", () => {
    const env = { UMBRACULUM_MODULE_PROFILE: "platform" };
    expect(resolveModuleProfile(env)).toBe("platform");
    expect(isModuleEnabled("brewery", env)).toBe(false);
    expect(isModuleEnabled("pim", env)).toBe(true);
    expect(isModuleEnabled("automation", env)).toBe(true);
  });

  it("reference profile includes all built-in modules", () => {
    const env = { UMBRACULUM_MODULE_PROFILE: "reference" };
    expect(resolveEnabledModuleCodes(env)).toEqual(
      new Set(["automation", "brewery", "crp", "mrp", "pim"]),
    );
  });

  it("throws on unknown profile values", () => {
    expect(() => resolveModuleProfile({ UMBRACULUM_MODULE_PROFILE: "demo" })).toThrow(
      InvalidModuleProfileError,
    );
  });
});
