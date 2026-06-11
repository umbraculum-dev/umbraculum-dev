import { describe, expect, it } from "vitest";

import {
  InvalidModuleProfileError,
  isModuleEnabled,
  isVerticalInstalled,
  loadInstallationProfileManifest,
  resolveEnabledModuleCodes,
  resolveModuleProfile,
  resolveNativeAppCodes,
} from "./enabledModules.js";

describe("enabledModules", () => {
  it("defaults to platform (core) profile when env unset", () => {
    expect(resolveModuleProfile({})).toBe("platform");
    expect(resolveEnabledModuleCodes({}).has("brewery")).toBe(false);
    expect(resolveEnabledModuleCodes({}).has("pim")).toBe(true);
  });

  it("platform profile excludes brewery", () => {
    const env = { UMBRACULUM_MODULE_PROFILE: "platform" };
    expect(resolveModuleProfile(env)).toBe("platform");
    expect(isModuleEnabled("brewery", env)).toBe(false);
    expect(isModuleEnabled("pim", env)).toBe(true);
    expect(isModuleEnabled("automation", env)).toBe(true);
    expect(isVerticalInstalled("brewery", env)).toBe(false);
    expect(resolveNativeAppCodes(env)).toEqual(["starter"]);
  });

  it("reference profile includes brewery vertical", () => {
    const env = { UMBRACULUM_MODULE_PROFILE: "reference" };
    expect(resolveEnabledModuleCodes(env)).toEqual(
      new Set(["automation", "brewery", "crp", "mrp", "pim"]),
    );
    expect(isVerticalInstalled("brewery", env)).toBe(true);
    expect(resolveNativeAppCodes(env)).toEqual(["brewery"]);
  });

  it("loads install.json manifest when present", () => {
    const env = {
      UMBRACULUM_REPO_ROOT: process.cwd(),
    };
    const manifest = loadInstallationProfileManifest(env);
    expect(manifest.id).toBe("core");
    expect(manifest.verticals).toEqual([]);
    expect(manifest.nativeApps).toEqual(["starter"]);
  });

  it("throws on unknown profile values", () => {
    expect(() => resolveModuleProfile({ UMBRACULUM_MODULE_PROFILE: "demo" })).toThrow(
      InvalidModuleProfileError,
    );
  });
});
