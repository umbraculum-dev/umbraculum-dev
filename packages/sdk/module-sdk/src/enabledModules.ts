/**
 * Deploy-time installation profile — F-mod optional reference vertical.
 * @see docs/design/installation-profile.md
 */

export {
  InvalidModuleProfileError,
  type ModuleProfile,
  loadInstallationProfileManifest,
  resolveModuleProfileFromEnv,
  resolveEnabledModuleCodesFromManifest,
  isVerticalInstalled,
  resolveNativeAppCodes,
  resolvePrimaryNativeAppCode,
  resolveInstallManifestPath,
  resolveRepoRoot,
  type InstallationProfileManifest,
  type InstallationProfileId,
} from "./installProfile.js";

import {
  resolveModuleProfileFromEnv,
  resolveEnabledModuleCodesFromManifest,
  InvalidModuleProfileError,
  type ModuleProfile,
} from "./installProfile.js";

/** First-party module codes registered by the monorepo stock build. */
export const BUILTIN_MODULE_CODES = [
  "automation",
  "brewery",
  "crp",
  "mrp",
  "pim",
] as const;

export type BuiltinModuleCode = (typeof BUILTIN_MODULE_CODES)[number];

export function resolveModuleProfile(env: NodeJS.ProcessEnv = process.env): ModuleProfile {
  try {
    return resolveModuleProfileFromEnv(env);
  } catch (err) {
    if (err instanceof InvalidModuleProfileError) throw err;
    const raw = env["UMBRACULUM_MODULE_PROFILE"]?.trim() ?? "";
    throw new InvalidModuleProfileError(raw);
  }
}

export function resolveEnabledModuleCodes(
  env: NodeJS.ProcessEnv = process.env,
): ReadonlySet<string> {
  return resolveEnabledModuleCodesFromManifest(env);
}

export function isModuleEnabled(
  code: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return resolveEnabledModuleCodes(env).has(code);
}
