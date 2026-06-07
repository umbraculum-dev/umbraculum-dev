"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useAiChatStream } from "@umbraculum/ui";

/**
 * Web binding of the shared {@link useAiChatStream} hook.
 *
 * Reads optional `?fromRoute=` (or `?routeId=`) for route-scoped prompt overlays.
 */
export function useAiChat() {
  const searchParams = useSearchParams();
  const routeId =
    searchParams.get("fromRoute") ?? searchParams.get("routeId") ?? null;

  const input = useMemo(
    () => ({
      routeId,
      chatFetch: (message: string, init: { signal: AbortSignal; routeId?: string | null }) =>
        fetch("/api/ai/chat", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            message,
            ...(init.routeId ? { routeId: init.routeId } : {}),
          }),
          signal: init.signal,
        }),
      proposalApply: async (proposalId: string) => {
        const res = await fetch(`/api/ai/proposals/${proposalId}/apply`, {
          method: "POST",
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error(`apply failed: ${res.status}`);
      },
      proposalReject: async (proposalId: string) => {
        const res = await fetch(`/api/ai/proposals/${proposalId}/reject`, {
          method: "POST",
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error(`reject failed: ${res.status}`);
      },
    }),
    [routeId],
  );
  return useAiChatStream(input);
}

export type { AiChatMessage, AiChatTurn, AiToolCallView } from "@umbraculum/ui";
