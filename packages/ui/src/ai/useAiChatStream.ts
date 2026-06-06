"use client";

import { useCallback, useRef, useState } from "react";

import type { AiChatMessage, UseAiChatStreamInput } from "./aiChatStreamTypes";
export type {
  AiChatMessage,
  AiChatTurn,
  AiProposalView,
  AiToolCallView,
  UseAiChatStreamInput,
} from "./aiChatStreamTypes";
export { consumeSseStream } from "./parseAiChatSseFrame";
import { consumeSseStream } from "./parseAiChatSseFrame";
import { applyAiChatTurnEvent, newAiChatTurnId } from "./useAiChatTurnAccumulator";

/**
 * Cross-platform AI chat stream hook.
 *
 * The hook owns the SSE wire-protocol decoding (event/data frames) and
 * the in-flight turn accumulator, but it does NOT know how to talk to
 * the API — the caller supplies a `chatFetch(message) => Promise<Response>`
 * function so each platform can wire its own auth.
 */
export function useAiChatStream(input: UseAiChatStreamInput) {
  const { chatFetch, routeId, proposalApply, proposalReject } = input;
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [terminalError, setTerminalError] = useState<
    { code: string; message: string } | null
  >(null);
  const abortRef = useRef<AbortController | null>(null);

  const applyProposal = useCallback(
    async (proposalId: string) => {
      if (!proposalApply) return;
      await proposalApply(proposalId);
      setMessages((prev) =>
        prev.map((m) => {
          if (!m.turn) return m;
          return {
            ...m,
            turn: {
              ...m.turn,
              proposals: m.turn.proposals.map((p) =>
                p.proposalId === proposalId ? { ...p, status: "applied" as const } : p,
              ),
            },
          };
        }),
      );
    },
    [proposalApply],
  );

  const rejectProposal = useCallback(
    async (proposalId: string) => {
      if (!proposalReject) return;
      await proposalReject(proposalId);
      setMessages((prev) =>
        prev.map((m) => {
          if (!m.turn) return m;
          return {
            ...m,
            turn: {
              ...m.turn,
              proposals: m.turn.proposals.map((p) =>
                p.proposalId === proposalId ? { ...p, status: "rejected" as const } : p,
              ),
            },
          };
        }),
      );
    },
    [proposalReject],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || pending) return;
      setPending(true);
      setTerminalError(null);

      const userMessage: AiChatMessage = {
        id: newAiChatTurnId(),
        role: "user",
        text: trimmed,
      };
      const turnId = newAiChatTurnId();
      const assistantMessage: AiChatMessage = {
        id: turnId,
        role: "assistant",
        text: "",
        turn: {
          id: turnId,
          status: "streaming",
          text: "",
          toolCalls: [],
          proposals: [],
          usage: null,
          error: null,
        },
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await chatFetch(trimmed, {
          signal: controller.signal,
          routeId: routeId ?? null,
        });
        if (!res.ok) {
          let code = `http_${res.status}`;
          let message = `Request failed (${res.status})`;
          try {
            const cloneable = (res as Response & { clone?: () => Response }).clone;
            const json = cloneable
              ? ((await cloneable.call(res).json()) as {
                  error?: { code?: string; message?: string };
                })
              : ((await res.json()) as { error?: { code?: string; message?: string } });
            if (json.error?.code) code = json.error.code;
            if (json.error?.message) message = json.error.message;
          } catch {
            /* non-JSON error body */
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === turnId
                ? {
                    ...m,
                    text: message,
                    turn: m.turn
                      ? { ...m.turn, status: "error", error: { code, message } }
                      : m.turn,
                  }
                : m,
            ),
          );
          setTerminalError({ code, message });
          return;
        }
        await consumeSseStream(res, (event) => applyAiChatTurnEvent(setMessages, turnId, event));
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        const message = err instanceof Error ? err.message : String(err);
        setTerminalError({ code: "stream_error", message });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === turnId
              ? {
                  ...m,
                  turn: m.turn
                    ? {
                        ...m.turn,
                        status: "error",
                        error: { code: "stream_error", message },
                      }
                    : m.turn,
                }
              : m,
          ),
        );
      } finally {
        setPending(false);
        abortRef.current = null;
      }
    },
    [pending, chatFetch, routeId],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setPending(false);
    setTerminalError(null);
  }, []);

  return { messages, pending, terminalError, send, reset, applyProposal, rejectProposal };
}
