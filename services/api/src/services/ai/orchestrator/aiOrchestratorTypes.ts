import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";

/**
 * One SSE event emitted by the orchestrator. The route layer wraps these in
 * the `event: <type>\ndata: <json>\n\n` SSE framing.
 */
export type AiSseEvent =
  | { type: "assistant_chunk"; text: string }
  | { type: "tool_call"; name: string; argsJson: string }
  | { type: "tool_result"; name: string; resultJson: string; durationMs: number; errored: boolean }
  | {
      type: "proposal";
      proposalId: string;
      moduleCode: string;
      proposalType: string;
      summary: string;
    }
  | { type: "complete"; usage: { tokensIn: number; tokensOut: number; durationMs: number; model: string } }
  | { type: "error"; code: string; message: string };

export interface RunChatTurnInput {
  workspaceId: string;
  userId: string;
  message: string;
  sessionId?: string | null;
  /** Optional RouteId hint from the client (unknown values are ignored). */
  routeId?: string | null;
}

/**
 * Anthropic-style tool definition shape, narrowed down to the v0 surface.
 * Keeping this as a local type avoids hard-coding the SDK's full union into
 * the orchestrator signature.
 */
export interface AnthropicToolDef {
  name: string;
  description: string;
  input_schema: unknown;
}

/**
 * Build a tool registry-derived list of Anthropic tool defs (no handlers).
 */
export function buildAnthropicTools(registry: AiToolRegistry): AnthropicToolDef[] {
  return registry.list().map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema,
  }));
}

export type PreflightResult = {
  workspaceId: string;
  userId: string;
  role: string;
  perUserDailyCap: number;
  roleLimits: import("@umbraculum/contracts").AiRoleLimits;
};
