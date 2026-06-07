/**
 * Auth /auth/me response contract.
 * Shared by web and native clients.
 *
 * v2.0 (RFC-0003 Decision A): migrated from hand-rolled parsers to Zod v4
 * schemas. The schema is the single source of truth; types are inferred
 * via `z.infer`.
 *
 * Behavior preservation: this migration intentionally preserves the
 * hand-rolled parser's soft-tolerance defaults (non-string preference
 * fields collapse to undefined; non-string `activeWorkspaceId` and `role`
 * collapse to null) via per-field preprocess transforms. This matches
 * the v1.x test contract exactly — no behavior changes ship with this
 * migration. A future PR may tighten these to strict-reject; see the
 * latent-bug-fix audit in PR 1's description.
 *
 * Backward-compat tunnel preserved: payloads using the legacy `accounts`
 * key (instead of `workspaces`) or `activeAccountId` (instead of
 * `activeWorkspaceId`) are still accepted via the top-level preprocess.
 * Both legacy keys are mapped to their canonical names at the schema
 * boundary. See Phase 4b regression-pin in `meResponse.test.ts`.
 *
 * Worked example for RFC-0003 Decision D — this file is the canonical
 * pattern that the 4 remaining `parseX.ts` files under
 * `packages/platform/contracts/src/` (per the migration handoff doc) will follow
 * in subsequent migration PRs. Pattern shape:
 *   1. Sub-schemas declared first, smallest-leaf-first.
 *   2. Top-level schema uses preprocess for any dual-key tunneling.
 *   3. Per-field preprocess for soft-tolerance fallbacks (preserving v1.x).
 *   4. Type exports via z.infer (single source of truth).
 *   5. Existing parseX(unknown): X export preserved as thin wrapper.
 */
import { z } from "zod";

/** Collapse non-string + null + missing to undefined; preserve real strings. */
const optionalStringWithNullPreserved = z
  .unknown()
  .transform((v): string | null | undefined => {
    if (v === null) return null;
    if (typeof v === "string") return v;
    return undefined;
  });

/** Collapse non-string to null; preserve real strings and explicit null. */
const stringOrNullSoft = z.unknown().transform((v): string | null => {
  if (typeof v === "string") return v;
  return null;
});

/** Soft-tolerant boolean — non-boolean collapses to undefined. */
const optionalBooleanSoft = z.unknown().transform((v): boolean | undefined => {
  if (typeof v === "boolean") return v;
  return undefined;
});

export const AuthMeResponseUserSchema = z
  .object({
    id: z.string().min(1, "user.id required"),
    email: z.string().min(1, "user.email required"),
    preferredLocale: z
      .unknown()
      .transform((v): string => (typeof v === "string" ? v : "en"))
      .default("en"),
    preferredTheme: optionalStringWithNullPreserved.optional(),
    preferredFontScale: optionalStringWithNullPreserved.optional(),
    preferredDensity: optionalStringWithNullPreserved.optional(),
    isPlatformAdmin: optionalBooleanSoft.optional(),
  })
  .transform((u) => ({
    id: u.id,
    email: u.email,
    preferredLocale: u.preferredLocale,
    preferredTheme: u.preferredTheme,
    preferredFontScale: u.preferredFontScale,
    preferredDensity: u.preferredDensity,
    isPlatformAdmin: u.isPlatformAdmin,
  }));

export const AuthMeResponseWorkspaceSchema = z.object({
  id: z.string().min(1, "workspace.id required"),
  name: z.string().min(1, "workspace.name required"),
  role: z.string(),
  brandKey: optionalStringWithNullPreserved.optional(),
});

export const AuthMeResponseSchema = z.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      return raw;
    }
    const r = raw as Record<string, unknown>;
    const workspacesRaw = Array.isArray(r["workspaces"])
      ? r["workspaces"]
      : Array.isArray(r["accounts"])
        ? r["accounts"]
        : r["workspaces"];
    const activeWorkspaceIdRaw =
      "activeWorkspaceId" in r ? r["activeWorkspaceId"] : r["activeAccountId"];
    return {
      ok: r["ok"],
      user: r["user"],
      workspaces: workspacesRaw,
      activeWorkspaceId: activeWorkspaceIdRaw,
      role: r["role"],
    };
  },
  z.object({
    ok: z.literal(true, "ok must be true"),
    user: AuthMeResponseUserSchema,
    workspaces: z.array(AuthMeResponseWorkspaceSchema, "workspaces must be array"),
    activeWorkspaceId: stringOrNullSoft,
    role: stringOrNullSoft,
  }),
);

export type AuthMeResponseUser = z.infer<typeof AuthMeResponseUserSchema>;
export type AuthMeResponseWorkspace = z.infer<typeof AuthMeResponseWorkspaceSchema>;
export type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;

/**
 * Parse and validate /auth/me response. Throws ZodError on invalid payload.
 * Thin wrapper around `AuthMeResponseSchema.parse` for call-site stability —
 * existing consumers in `apps/web` and `apps/native` continue to call
 * `parseAuthMeResponse(json)` unchanged.
 */
export function parseAuthMeResponse(payload: unknown): AuthMeResponse {
  return AuthMeResponseSchema.parse(payload);
}
