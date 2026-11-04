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
type ModuleOwnedPathGateInput = {
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
declare function isModuleOwnedPathDenied(input: ModuleOwnedPathGateInput): boolean;

export { BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP, type ModuleOwnedPathGateInput, getBuiltinSegmentOwnerEdge, isModuleOwnedPathDenied, resolveEnabledModuleCodesEdge };
