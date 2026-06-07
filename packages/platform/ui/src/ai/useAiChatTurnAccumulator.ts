import type { Dispatch, SetStateAction } from "react";

import type { AiChatMessage, IncomingEvent } from "./aiChatStreamTypes";

export function newAiChatTurnId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function applyAiChatTurnEvent(
  setMessages: Dispatch<SetStateAction<AiChatMessage[]>>,
  turnId: string,
  event: IncomingEvent,
): void {
  setMessages((prev) =>
    prev.map((m) => {
      if (m.id !== turnId || !m.turn) return m;
      const turn = { ...m.turn };
      switch (event.type) {
        case "assistant_chunk":
          turn.text = `${turn.text}${event.text}`;
          break;
        case "tool_call":
          turn.toolCalls = [
            ...turn.toolCalls,
            {
              name: event.name,
              argsJson: event.argsJson,
              resultJson: null,
              durationMs: null,
              errored: false,
            },
          ];
          break;
        case "tool_result": {
          const idx = turn.toolCalls.findIndex(
            (tc) => tc.name === event.name && tc.resultJson === null,
          );
          if (idx >= 0) {
            const next = [...turn.toolCalls];
            next[idx] = {
              ...next[idx],
              resultJson: event.resultJson,
              durationMs: event.durationMs,
              errored: event.errored,
            };
            turn.toolCalls = next;
          }
          break;
        }
        case "proposal":
          turn.proposals = [
            ...turn.proposals,
            {
              proposalId: event.proposalId,
              moduleCode: event.moduleCode,
              proposalType: event.proposalType,
              summary: event.summary,
              status: "pending",
            },
          ];
          break;
        case "complete":
          turn.status = "complete";
          turn.usage = event.usage;
          break;
        case "error":
          turn.status = "error";
          turn.error = { code: event.code, message: event.message };
          break;
      }
      return { ...m, text: turn.text, turn };
    }),
  );
}
