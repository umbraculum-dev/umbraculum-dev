/**
 * Local apps/native type guards.
 *
 * Mirrors `apps/web/app/_lib/typeGuards.ts` and the project-local hand-rolled
 * validation strategy described in `docs/CONTRACTS-VALIDATION-STRATEGY.md`:
 * when a payload is `unknown`, narrow it with a plain function rather than
 * `as any` / `as SomeShape` casts.
 *
 * Keep this small and dependency-free — boundaries that need full validation
 * (HTTP, MCP, storage) should still use a `parseXxx()` from `@brewery/contracts`.
 */

/**
 * Narrow `v` to a plain object with string keys, or return `null`.
 * Treats arrays and `null` / `undefined` as non-records.
 */
export function asRecord(v: unknown): Record<string, unknown> | null {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}
