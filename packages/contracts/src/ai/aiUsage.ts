/**
 * AI usage ledger entry — the audit/analytics record written by the
 * orchestrator after every chat turn. Matches the schema in
 * docs/PLATFORM-ARCHITECTURE.md §4.3 / §6.4.
 *
 * In v0 the ledger is informational-only: it drives the workspace usage
 * dashboard (Sprint #2) and the per-user / per-role rate-limit checks; it
 * does NOT drive any Stripe charge. The paid-AI subscription is flat-rate
 * regardless of usage volume — see internal/AI-MONETIZATION-STRATEGY.md.
 */

/**
 * One recorded entry per AI chat turn (success or partial failure). Costs
 * are stored in micro-USD (1 USD = 1_000_000 micro-USD) to avoid floating
 * point precision loss on small per-call amounts.
 */
export interface AiUsageLedgerEntry {
  id: string;
  workspaceId: string;
  userId: string;
  /** Logical session/conversation identifier; nullable for one-shot calls. */
  sessionId: string | null;
  /** Provider-specific model identifier (e.g. `claude-sonnet-4-5`). */
  model: string;
  tokensIn: number;
  tokensOut: number;
  /** Provider-reported cost in micro-USD (1e-6 USD). 0 if not derivable. */
  costMicroUsd: number;
  /** Wall-clock duration of the chat turn in milliseconds. */
  durationMs: number;
  /** Provider request id for cross-system tracing (Anthropic `request_id`). */
  providerRequestId: string | null;
  /** Ordered list of tool calls the model made during this turn. */
  toolCalls: AiToolCallRecord[];
  /** ISO-8601 timestamp. */
  createdAt: string;
}

/**
 * One tool invocation inside a single chat turn. `argsJson` and `resultJson`
 * are stored verbatim for debugging; orchestrators are encouraged to elide
 * large blobs (e.g. truncate `resultJson` to 8 KB) before persistence.
 */
export interface AiToolCallRecord {
  name: string;
  /** Stringified JSON input the model produced (or truncated thereof). */
  argsJson: string;
  /** Stringified JSON result returned to the model (or truncated thereof). */
  resultJson: string;
  /** Wall-clock duration of this tool call in milliseconds. */
  durationMs: number;
  /** `true` if the handler threw; the message is captured in `resultJson`. */
  errored: boolean;
}
