/**
 * Local apps/native type guards.
 *
 * Prefer `parseXxx()` from `@umbraculum/contracts` (Zod v4 per
 * [RFC-0003](../../../../docs/rfcs/0003-validation-library-adoption.md)) for HTTP
 * and other boundary payloads. Use helpers here only for narrow structural
 * checks that are not yet modeled as contract parsers.
 *
 * See [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../../../../docs/CONTRACTS-VALIDATION-STRATEGY.md)
 * and [`docs/design/canonical-native-platform-surface.md`](../../../../docs/design/canonical-native-platform-surface.md) §6.
 */

/**
 * Narrow `v` to a plain object with string keys, or return `null`.
 * Treats arrays and `null` / `undefined` as non-records.
 */
export function asRecord(v: unknown): Record<string, unknown> | null {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}
