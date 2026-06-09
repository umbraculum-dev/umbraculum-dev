/**
 * Reserved canonical module codes per RFC-0001 Decision B.
 * Tier-6 vertical configurations (e.g. `brewery`) use the same
 * `registerModule({ code })` shape but are not in this set.
 */
export const RESERVED_CANONICAL_MODULE_CODES = [
  "mrp",
  "wms",
  "crm",
  "crp",
  "automation",
  "pim",
] as const;

export type CanonicalModuleCode = (typeof RESERVED_CANONICAL_MODULE_CODES)[number];

export function isCanonicalModuleCode(code: string): code is CanonicalModuleCode {
  return (RESERVED_CANONICAL_MODULE_CODES as readonly string[]).includes(code);
}
