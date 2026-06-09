/**
 * Deploy-time module profile — F-mod optional reference vertical.
 * @see docs/design/platform-module-profile.md
 */

export type ModuleProfile = "platform" | "reference";

/** First-party module codes registered by the monorepo stock build. */
export const BUILTIN_MODULE_CODES = [
  "automation",
  "brewery",
  "crp",
  "mrp",
  "pim",
] as const;

export type BuiltinModuleCode = (typeof BUILTIN_MODULE_CODES)[number];

const PLATFORM_PROFILE_MODULES: readonly BuiltinModuleCode[] = [
  "automation",
  "pim",
  "mrp",
  "crp",
];

const REFERENCE_PROFILE_MODULES: readonly BuiltinModuleCode[] = BUILTIN_MODULE_CODES;

export class InvalidModuleProfileError extends Error {
  constructor(value: string) {
    super(
      `Invalid UMBRACULUM_MODULE_PROFILE: "${value}". Expected "platform" or "reference".`,
    );
    this.name = "InvalidModuleProfileError";
  }
}

export function resolveModuleProfile(env: NodeJS.ProcessEnv = process.env): ModuleProfile {
  const raw = env["UMBRACULUM_MODULE_PROFILE"]?.trim();
  if (!raw) return "reference";
  if (raw === "platform" || raw === "reference") return raw;
  throw new InvalidModuleProfileError(raw);
}

export function resolveEnabledModuleCodes(
  env: NodeJS.ProcessEnv = process.env,
): ReadonlySet<string> {
  const profile = resolveModuleProfile(env);
  const codes =
    profile === "reference" ? REFERENCE_PROFILE_MODULES : PLATFORM_PROFILE_MODULES;
  return new Set(codes);
}

export function isModuleEnabled(
  code: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return resolveEnabledModuleCodes(env).has(code);
}
