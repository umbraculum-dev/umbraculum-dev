/**
 * Edge-runtime-safe module enablement for Next.js middleware.
 * Does not read the filesystem or call `process.cwd()`.
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

export function resolveEnabledModuleCodesEdge(
  env: Record<string, string | undefined> = process.env,
): ReadonlySet<string> {
  const profile = env["UMBRACULUM_MODULE_PROFILE"]?.trim() ?? "minimal";
  if (profile === "reference") {
    return new Set(["brewery", "automation", "pim", "mrp", "crp"]);
  }
  if (profile === "platform") {
    return new Set(["automation", "pim", "mrp", "crp"]);
  }
  return new Set();
}
