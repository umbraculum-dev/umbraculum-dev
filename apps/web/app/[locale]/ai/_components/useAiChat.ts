"use client";

import { useMemo } from "react";

import { useAiChatStream } from "@umbraculum/ui";

/**
 * Web binding of the shared {@link useAiChatStream} hook.
 *
 * Uses `credentials: "same-origin"` so the session cookie is forwarded to
 * the API. The shared hook handles SSE decoding and turn state; this
 * wrapper exists so the page can stay obnoxiously short.
 */
export function useAiChat() {
  const input = useMemo(
    () => ({
      chatFetch: (message: string, init: { signal: AbortSignal }) =>
        fetch("/api/ai/chat", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ message }),
          signal: init.signal,
        }),
    }),
    [],
  );
  return useAiChatStream(input);
}

export type { AiChatMessage, AiChatTurn, AiToolCallView } from "@umbraculum/ui";
