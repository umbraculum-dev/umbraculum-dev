/**
 * Edge-runtime-safe module enablement for Next.js middleware.
 * Does not read the filesystem or call `process.cwd()`.
 *
 * Default profile when `UMBRACULUM_MODULE_PROFILE` is missing/blank is
 * **`platform`** (core) — same as compose `docker-compose.yml` and Node
 * `resolveModuleProfileFromEnv`. Explicit `"minimal"` yields an empty set
 * (no builtin modules) for tests / opt-out tooling.
 */
declare const BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP: readonly [{
    readonly code: "automation";
    readonly segments: readonly ["vessels"];
}, {
    readonly code: "brewery";
    readonly segments: readonly ["recipes", "inventory", "equipment", "water-profiles", "brewday-steps-settings", "ferm-data-integration"];
}, {
    readonly code: "crp";
    readonly segments: readonly ["capacity", "schedule", "resources"];
}, {
    readonly code: "mrp";
    readonly segments: readonly ["production-orders", "work-orders", "material-requirements"];
}, {
    readonly code: "pim";
    readonly segments: readonly ["products", "categories", "attribute-sets", "channels"];
}];
/**
 * Resolve the builtin web-module code that owns a top-level URL segment
 * (e.g. `recipes` → `brewery`). Returns `undefined` for platform/unknown
 * segments (login, about, …).
 */
declare function getBuiltinSegmentOwnerEdge(segment: string): string | undefined;
/**
 * Edge-safe enabled module codes from env.
 * Unset / blank profile → `platform` (core; no brewery).
 */
declare function resolveEnabledModuleCodesEdge(env?: Record<string, string | undefined>): ReadonlySet<string>;

export { BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP, getBuiltinSegmentOwnerEdge, resolveEnabledModuleCodesEdge };
