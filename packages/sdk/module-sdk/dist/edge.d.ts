/**
 * Edge-runtime-safe module enablement for Next.js middleware.
 * Does not read the filesystem or call `process.cwd()`.
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
declare function resolveEnabledModuleCodesEdge(env?: Record<string, string | undefined>): ReadonlySet<string>;

export { BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP, resolveEnabledModuleCodesEdge };
