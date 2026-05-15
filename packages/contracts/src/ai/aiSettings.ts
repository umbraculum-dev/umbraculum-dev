/**
 * Workspace AI settings — wire shape for `GET/PUT /workspaces/:id/ai/settings`.
 *
 * Security invariant: the encrypted provider key MUST never be returned
 * to clients. The DTO exposes only `hasKey: boolean` so the admin UI can
 * render "Key configured: yes/no". `PUT` accepts a write-only `apiKey`
 * field; the server encrypts and stores it without ever echoing it back.
 */

/**
 * AI provider identifier. v0 ships Anthropic only; the union is reserved
 * for future provider adapters (OpenAI / Google / local).
 */
export type AiProvider = "anthropic";

/**
 * Per-role monthly token cap (sum of `tokensIn + tokensOut` over the trailing
 * 30 days). The map is keyed by `WorkspaceRole`. A missing role key or a
 * value of `0` means "no role-level cap".
 *
 * Example: `{ "brewery_admin": 0, "member": 500000, "viewer": 100000 }`.
 */
export type AiRoleLimits = Record<string, number>;

export interface WorkspaceAiSettings {
  workspaceId: string;
  provider: AiProvider;
  /** `true` when a workspace key is stored (encrypted at rest). */
  hasKey: boolean;
  /** Master AI feature toggle; the orchestrator gates on this. */
  enabled: boolean;
  /** Per-role monthly token caps. */
  roleLimits: AiRoleLimits;
  /** Per-user daily token cap (sum of `tokensIn + tokensOut` for today). */
  perUserDailyCap: number;
  /** Whether the workspace admin acknowledged the data-egress notice. */
  dataEgressAccepted: boolean;
  /** ISO-8601 timestamp of acceptance; `null` if never accepted. */
  dataEgressAcceptedAt: string | null;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** ISO-8601 timestamp. */
  updatedAt: string;
}

/**
 * `PUT /workspaces/:id/ai/settings` body. All fields are optional — the
 * server applies a partial update. `apiKey` is write-only and never echoed
 * back; pass an empty string to clear the stored key.
 */
export interface UpdateWorkspaceAiSettingsRequest {
  provider?: AiProvider;
  apiKey?: string;
  enabled?: boolean;
  roleLimits?: AiRoleLimits;
  perUserDailyCap?: number;
  dataEgressAccepted?: boolean;
}

export interface WorkspaceAiSettingsResponse {
  ok: true;
  settings: WorkspaceAiSettings;
}

/**
 * Aggregated usage view used by the workspace admin dashboard (Sprint #2)
 * and surfaced from `GET /workspaces/:id/ai/usage`.
 */
export interface WorkspaceAiUsageResponse {
  ok: true;
  monthly: {
    tokensIn: number;
    tokensOut: number;
    costMicroUsd: number;
    callCount: number;
  };
  byUser: Array<{
    userId: string;
    tokensInToday: number;
    tokensOutToday: number;
    tokensInMonth: number;
    tokensOutMonth: number;
    costMicroUsdMonth: number;
    callCountMonth: number;
  }>;
}
