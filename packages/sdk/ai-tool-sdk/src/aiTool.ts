/**
 * AI tool contract — the interface that every callable tool the AI consultant
 * may invoke must satisfy. Matches docs/PLATFORM-ARCHITECTURE.md §6.2.
 *
 * Provenance:
 * - This file is the canonical home for the AI-tool SDK surface as of
 *   2026-05-21. It was extracted from `@umbraculum/contracts` (which had
 *   carried it since Sprint #1) into the dedicated `@umbraculum/ai-tool-sdk`
 *   package because it is a public-facing SDK contract that third-party
 *   module authors will pin — it is not a wire-shape DTO, and its home in
 *   `@umbraculum/contracts` was a v0 expedient. The extraction realizes the
 *   commitment recorded in docs/PLATFORM-ARCHITECTURE.md §4.4 as a peer of
 *   `@umbraculum/module-sdk` on the published-MIT-SDK surface (LICENSING.md
 *   §6.2).
 *
 * Stability:
 * - Tool implementations live in `services/api/src/services/ai/tools/<module>/`
 *   and are responsible for ACL inheritance via the same service injection
 *   the rest of the API uses (no parallel access-control layer).
 * - This surface is intentionally minimal. Breaking changes go through the
 *   semver-discipline-at-SDK-boundary process committed in
 *   docs/PLATFORM-ARCHITECTURE.md §10 (RFC + deprecation window + major
 *   version bump).
 */

/**
 * Capability scope hint surfaced to admins when configuring role limits.
 * Tools tagged `write` may submit jobs (e.g. rendering); `propose` creates
 * human-confirmed drafts only; `read` is lookup-only.
 */
export type AiToolScope = "read" | "write" | "propose";

/**
 * Per-invocation context passed to every tool's `handler`.
 *
 * - `workspaceId` and `userId` come from the authenticated session.
 * - `requestId` is a per-AI-turn correlation id; tools should pass it through
 *   to downstream services for end-to-end traceability.
 * - `signal` is forwarded from the orchestrator so tools can honor request
 *   cancellation (e.g. client disconnect on the SSE stream).
 */
export interface AiToolContext {
  workspaceId: string;
  userId: string;
  requestId: string;
  signal?: AbortSignal;
}

/**
 * Generic tool definition. `Input` is the JSON-serializable input shape the
 * model produces when calling the tool; `Output` is the JSON-serializable
 * result returned back to the model.
 */
export interface AiTool<Input = unknown, Output = unknown> {
  /** Unique, stable identifier (e.g. `brewery.recipeLookup`). */
  name: string;
  /** Short human-readable description; the model uses this to choose tools. */
  description: string;
  /** Capability scope; admins may restrict roles to read-only tools. */
  scope: AiToolScope;
  /**
   * JSON Schema for the tool's input. Kept as `unknown` here because the
   * actual schema shape depends on the provider (Anthropic uses JSON Schema
   * draft-7 + minor extensions). The orchestrator is responsible for
   * provider-specific marshalling.
   */
  inputSchema: unknown;
  /** Implementation. Throws should be converted to error payloads upstream. */
  handler: (input: Input, ctx: AiToolContext) => Promise<Output>;
}

/**
 * Lightweight registry surface. v0 instantiates one registry at API boot;
 * domain modules contribute tools through the module SDK's
 * `registerModule({ registerAiTools })` hook.
 */
export interface AiToolRegistry {
  /** Register a tool. Throws on duplicate `name`. */
  register(tool: AiTool): void;
  /** Resolve a tool by name. Returns `undefined` if not registered. */
  resolve(name: string): AiTool | undefined;
  /** List all registered tools, optionally filtered by scope. */
  list(filter?: { scope?: AiToolScope }): AiTool[];
}

/**
 * Serializable tool descriptor — what the API may expose to clients (e.g. the
 * workspace admin "which tools are available?" listing) without leaking the
 * `handler` function reference.
 */
export interface AiToolDefinition {
  name: string;
  description: string;
  scope: AiToolScope;
  inputSchema: unknown;
}
