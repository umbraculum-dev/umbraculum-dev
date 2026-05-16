/**
 * Foundational type guards for narrowing `unknown` values at trust boundaries
 * (Prisma `Json` columns, request bodies, third-party JSON, etc.).
 *
 * These are intentionally low-level primitives — not validators. They never
 * throw, never produce error messages, never know about specific domain
 * shapes. Routes that need rich validation (with `BadRequestError` / structured
 * error codes) compose these into route-local helpers; the question of whether
 * to lift such validators into a shared `lib/validation/` module is tracked as
 * Phase 3d in `docs/LINTING.md` and is intentionally deferred until the type-
 * tightening pass surfaces the real repeated patterns.
 *
 * @see docs/LINTING.md (HIGH-staged Phase 3 / 3d)
 * @see docs/CONTRACTS-VALIDATION-STRATEGY.md (separate but related)
 */

export function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function isString(v: unknown): v is string {
  return typeof v === "string";
}

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}
