/**
 * Edge-runtime-safe module enablement for Next.js middleware.
 * Does not read the filesystem or call `process.cwd()`.
 *
 * Default profile when `UMBRACULUM_MODULE_PROFILE` is missing/blank is
 * **`platform`** (core) — same as compose `docker-compose.yml` and Node
 * `resolveModuleProfileFromEnv`. Explicit `"minimal"` yields an empty set
 * (no builtin modules) for tests / opt-out tooling.
 */

export const BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP = [
  { code: "automation", segments: ["vessels"] as const },
  {
    code: "brewery",
    segments: [
      "recipes",
      "inventory",
      "equipment",
      "water-profiles",
      "brewday-steps-settings",
      "ferm-data-integration",
    ] as const,
  },
  { code: "crp", segments: ["capacity", "schedule", "resources"] as const },
  {
    code: "mrp",
    segments: ["production-orders", "work-orders", "material-requirements"] as const,
  },
  {
    code: "pim",
    segments: ["products", "categories", "attribute-sets", "channels"] as const,
  },
] as const;

const PLATFORM_ENABLED = new Set([
  "automation",
  "pim",
  "mrp",
  "crp",
]);

const REFERENCE_ENABLED = new Set([
  "brewery",
  "automation",
  "pim",
  "mrp",
  "crp",
]);

let segmentOwnerCache: ReadonlyMap<string, string> | undefined;

function segmentOwnerMap(): ReadonlyMap<string, string> {
  if (segmentOwnerCache) return segmentOwnerCache;
  const map = new Map<string, string>();
  for (const entry of BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP) {
    for (const segment of entry.segments) {
      map.set(segment, entry.code);
    }
  }
  segmentOwnerCache = map;
  return map;
}

/**
 * Resolve the builtin web-module code that owns a top-level URL segment
 * (e.g. `recipes` → `brewery`). Returns `undefined` for platform/unknown
 * segments (login, about, …).
 */
export function getBuiltinSegmentOwnerEdge(
  segment: string,
): string | undefined {
  return segmentOwnerMap().get(segment);
}

/**
 * Edge-safe enabled module codes from env.
 * Unset / blank profile → `platform` (core; no brewery).
 */
export function resolveEnabledModuleCodesEdge(
  env: Record<string, string | undefined> = process.env,
): ReadonlySet<string> {
  const raw = env["UMBRACULUM_MODULE_PROFILE"]?.trim();
  // Unset / blank → platform (compose + Node default). Explicit "minimal" → empty.
  const profile = raw && raw.length > 0 ? raw : "platform";
  if (profile === "reference") {
    return new Set(REFERENCE_ENABLED);
  }
  if (profile === "platform") {
    return new Set(PLATFORM_ENABLED);
  }
  if (profile === "minimal") {
    return new Set();
  }
  // Unrecognized explicit values → empty (same fail-closed as pre-alignment).
  return new Set();
}

export type ModuleOwnedPathGateInput = {
  /** Full request pathname (e.g. `/en/recipes/uuid/edit`). */
  pathname: string;
  /** Active locales (e.g. `["en","it"]`). */
  locales: readonly string[];
  /** Env for Edge enablement (defaults to `process.env`). */
  env?: Record<string, string | undefined>;
};

/**
 * Returns true when the path's first post-locale segment is owned by a
 * builtin module that is **not** enabled in the installation profile.
 * Platform / unknown segments (login, about, …) are never denied.
 *
 * Lives in the edge package so Next middleware and CI (`npm test -w
 * @umbraculum/module-sdk`) share one implementation + test surface.
 */
export function isModuleOwnedPathDenied(
  input: ModuleOwnedPathGateInput,
): boolean {
  const { pathname, locales, env = process.env } = input;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return false;

  let segmentIndex = 0;
  if (locales.includes(parts[0]!)) {
    segmentIndex = 1;
  }
  const segment = parts[segmentIndex];
  if (!segment) return false;

  const owner = getBuiltinSegmentOwnerEdge(segment);
  if (!owner) return false;

  const enabled = resolveEnabledModuleCodesEdge(env);
  return !enabled.has(owner);
}
