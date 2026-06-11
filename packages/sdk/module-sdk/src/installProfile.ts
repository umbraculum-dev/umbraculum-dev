/**
 * Installation profile manifest — which modules and native apps are enabled for this deployment.
 * @see docs/design/installation-profile.md
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export type ModuleProfile = "platform" | "reference";

export class InvalidModuleProfileError extends Error {
  constructor(value: string) {
    super(
      `Invalid UMBRACULUM_MODULE_PROFILE: "${value}". Expected "platform" or "reference".`,
    );
    this.name = "InvalidModuleProfileError";
  }
}

export type InstallationProfileId = "core" | "reference";

export type InstallationProfileManifest = {
  id: InstallationProfileId;
  description?: string;
  verticals: readonly string[];
  canonical: readonly string[];
  nativeApps: readonly string[];
};

const DEFAULT_REPO_ROOT_CANDIDATES = [
  process.env["UMBRACULUM_REPO_ROOT"],
  process.cwd(),
  resolve(process.cwd(), "../.."),
  resolve(process.cwd(), "../../.."),
].filter(Boolean) as string[];

export function resolveRepoRoot(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env["UMBRACULUM_REPO_ROOT"]?.trim();
  if (explicit) return explicit;

  for (const candidate of DEFAULT_REPO_ROOT_CANDIDATES) {
    if (existsSync(resolve(candidate, ".umbraculum/install.core.json"))) {
      return candidate;
    }
  }

  return process.cwd();
}

export function resolveInstallManifestPath(env: NodeJS.ProcessEnv = process.env): string {
  const override = env["UMBRACULUM_INSTALL_MANIFEST"]?.trim();
  if (override) {
    return resolve(override);
  }

  const repoRoot = resolveRepoRoot(env);
  const profileRaw = env["UMBRACULUM_MODULE_PROFILE"]?.trim();

  if (profileRaw) {
    const profile = profileRaw === "reference" ? "reference" : profileRaw === "platform" ? "platform" : null;
    if (profile === "reference") {
      return resolve(repoRoot, ".umbraculum/install.reference.json");
    }
    if (profile === "platform") {
      return resolve(repoRoot, ".umbraculum/install.core.json");
    }
    throw new InvalidModuleProfileError(profileRaw);
  }

  const active = resolve(repoRoot, ".umbraculum/install.json");
  if (existsSync(active)) {
    return active;
  }

  return resolve(repoRoot, ".umbraculum/install.core.json");
}

export function resolveModuleProfileFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): ModuleProfile {
  const raw = env["UMBRACULUM_MODULE_PROFILE"]?.trim();
  if (!raw) return "platform";
  if (raw === "platform" || raw === "reference") return raw;
  throw new InvalidModuleProfileError(raw);
}

export function loadInstallationProfileManifest(
  env: NodeJS.ProcessEnv = process.env,
): InstallationProfileManifest {
  const path = resolveInstallManifestPath(env);
  if (!existsSync(path)) {
    return fallbackManifestFromProfile(resolveModuleProfileFromEnv(env));
  }

  const raw = JSON.parse(readFileSync(path, "utf8")) as InstallationProfileManifest;
  return normalizeManifest(raw, resolveModuleProfileFromEnv(env));
}

function fallbackManifestFromProfile(profile: ModuleProfile): InstallationProfileManifest {
  if (profile === "reference") {
    return {
      id: "reference",
      verticals: ["brewery"],
      canonical: ["automation", "pim", "mrp", "crp"],
      nativeApps: ["brewery"],
    };
  }
  return {
    id: "core",
    verticals: [],
    canonical: ["automation", "pim", "mrp", "crp"],
    nativeApps: ["starter"],
  };
}

function normalizeManifest(
  raw: InstallationProfileManifest,
  profile: ModuleProfile,
): InstallationProfileManifest {
  const id = raw.id ?? (profile === "reference" ? "reference" : "core");
  const canonical = raw.canonical?.length
    ? raw.canonical
    : ["automation", "pim", "mrp", "crp"];
  const verticals = raw.verticals ?? (id === "reference" ? ["brewery"] : []);
  const nativeApps =
    raw.nativeApps?.length ? raw.nativeApps : id === "reference" ? ["brewery"] : ["starter"];

  return {
    id: id as InstallationProfileId,
    ...(raw.description !== undefined ? { description: raw.description } : {}),
    verticals,
    canonical,
    nativeApps,
  };
}

/** Module codes enabled for boot (canonical + verticals from manifest). */
export function resolveEnabledModuleCodesFromManifest(
  env: NodeJS.ProcessEnv = process.env,
): ReadonlySet<string> {
  const manifest = loadInstallationProfileManifest(env);
  return new Set([...manifest.canonical, ...manifest.verticals]);
}

export function isVerticalInstalled(
  code: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return loadInstallationProfileManifest(env).verticals.includes(code);
}

export function resolveNativeAppCodes(
  env: NodeJS.ProcessEnv = process.env,
): readonly string[] {
  return loadInstallationProfileManifest(env).nativeApps;
}

export function resolvePrimaryNativeAppCode(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const apps = resolveNativeAppCodes(env);
  if (apps.length === 0) return "starter";
  return apps[0] ?? "starter";
}
