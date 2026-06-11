import { describe, expect, it } from "vitest";

import {
  loadInstallationProfileManifest,
  resolveEnabledModuleCodesFromManifest,
  resolveInstallManifestPath,
  resolvePrimaryNativeAppCode,
} from "./installProfile.js";

describe("installProfile", () => {
  it("defaults to core profile when env unset and install.json is active", () => {
    const env = { UMBRACULUM_REPO_ROOT: process.cwd() };
    const manifest = loadInstallationProfileManifest(env);
    expect(manifest.id).toBe("core");
    expect(manifest.verticals).toEqual([]);
    expect(manifest.nativeApps).toEqual(["starter"]);
    expect(resolveEnabledModuleCodesFromManifest(env).has("brewery")).toBe(false);
    expect(resolveEnabledModuleCodesFromManifest(env).has("pim")).toBe(true);
  });

  it("maps reference profile to brewery vertical and native app", () => {
    const env = {
      UMBRACULUM_REPO_ROOT: process.cwd(),
      UMBRACULUM_MODULE_PROFILE: "reference",
    };
    const manifest = loadInstallationProfileManifest(env);
    expect(manifest.verticals).toContain("brewery");
    expect(manifest.nativeApps).toEqual(["brewery"]);
    expect(resolvePrimaryNativeAppCode(env)).toBe("brewery");
  });

  it("maps platform profile to core manifest file", () => {
    const env = {
      UMBRACULUM_REPO_ROOT: process.cwd(),
      UMBRACULUM_MODULE_PROFILE: "platform",
    };
    expect(resolveInstallManifestPath(env)).toMatch(/install\.core\.json$/);
  });
});
