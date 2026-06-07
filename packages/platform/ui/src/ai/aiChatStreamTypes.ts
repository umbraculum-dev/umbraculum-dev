/** AI chat stream wire types — shared by useAiChatStream and SSE parsers. */

export type AiToolCallView = {
  name: string;
  argsJson: string;
  resultJson: string | null;
  durationMs: number | null;
  errored: boolean;
};

export type AiProposalView = {
  proposalId: string;
  moduleCode: string;
  proposalType: string;
  summary: string;
  status: "pending" | "applied" | "rejected";
};

export type AiChatTurn = {
  id: string;
  status: "streaming" | "complete" | "error";
  text: string;
  toolCalls: AiToolCallView[];
  proposals: AiProposalView[];
  usage: unknown;
  error: { code: string; message: string } | null;
};

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  turn?: AiChatTurn;
};

export type IncomingEvent =
  | { type: "assistant_chunk"; text: string }
  | { type: "tool_call"; name: string; argsJson: string }
  | {
      type: "tool_result";
      name: string;
      resultJson: string;
      durationMs: number;
      errored: boolean;
    }
  | {
      type: "proposal";
      proposalId: string;
      moduleCode: string;
      proposalType: string;
      summary: string;
    }
  | { type: "complete"; usage: unknown }
  | { type: "error"; code: string; message: string };

export type UseAiChatStreamInput = {
  chatFetch: (
    message: string,
    opts: { signal: AbortSignal; routeId: string | null },
  ) => Promise<Response>;
  routeId?: string | null;
  proposalApply?: (proposalId: string) => Promise<void>;
  proposalReject?: (proposalId: string) => Promise<void>;
};
