"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Cross-platform AI chat stream hook.
 *
 * The hook owns the SSE wire-protocol decoding (event/data frames) and
 * the in-flight turn accumulator, but it does NOT know how to talk to
 * the API — the caller supplies a `chatFetch(message) => Promise<Response>`
 * function so each platform can wire its own auth:
 *
 *   web → `fetch("/api/ai/chat", { credentials: "same-origin", ... })`
 *   native → `fetch(`${baseUrl}/api/ai/chat`, { headers: { Authorization: "Bearer ..." } })`
 *
 * The response body must be a streaming SSE source. RN 0.72+ on Hermes
 * supports `response.body.getReader()` over HTTPS, which is the path
 * used by Expo SDK 50+. Older runtimes need a polyfill such as
 * `react-native-sse`; the contract here is a Response-like object with
 * either a `body.getReader()` ReadableStream or a `text()` fallback.
 */

export interface AiToolCallView {
  name: string;
  argsJson: string;
  resultJson: string | null;
  durationMs: number | null;
  errored: boolean;
}

export interface AiChatTurn {
  id: string;
  status: "streaming" | "complete" | "error";
  text: string;
  toolCalls: AiToolCallView[];
  usage: { tokensIn: number; tokensOut: number; durationMs: number; model: string } | null;
  error: { code: string; message: string } | null;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  turn?: AiChatTurn;
}

/**
 * The wire-event union, matching the server-side `AiSseEvent` exactly.
 * Kept local so this hook can ship without depending on the API package.
 */
type IncomingEvent =
  | { type: "assistant_chunk"; text: string }
  | { type: "tool_call"; name: string; argsJson: string }
  | {
      type: "tool_result";
      name: string;
      resultJson: string;
      durationMs: number;
      errored: boolean;
    }
  | { type: "complete"; usage: AiChatTurn["usage"] }
  | { type: "error"; code: string; message: string };

export interface UseAiChatStreamInput {
  /**
   * Caller-provided chat invocation. Receives the user's message and
   * an `AbortSignal` (used by the hook's `reset()` to cancel in-flight
   * requests). Must return a Response-like object whose body streams
   * SSE frames or whose `text()` returns the full SSE payload.
   */
  chatFetch: (
    message: string,
    init: { signal: AbortSignal },
  ) => Promise<Response>;
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Shared chat state machine. One in-flight turn at a time; `send()` while
 * `pending` is true is a no-op.
 */
export function useAiChatStream(input: UseAiChatStreamInput) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [terminalError, setTerminalError] = useState<
    { code: string; message: string } | null
  >(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || pending) return;
      setPending(true);
      setTerminalError(null);

      const userMessage: AiChatMessage = {
        id: newId(),
        role: "user",
        text: trimmed,
      };
      const turnId = newId();
      const assistantMessage: AiChatMessage = {
        id: turnId,
        role: "assistant",
        text: "",
        turn: {
          id: turnId,
          status: "streaming",
          text: "",
          toolCalls: [],
          usage: null,
          error: null,
        },
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await input.chatFetch(trimmed, { signal: controller.signal });
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
        await consumeSseStream(res, (event) =>
          applyEvent(setMessages, turnId, event),
        );
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
    [pending, input],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setPending(false);
    setTerminalError(null);
  }, []);

  return { messages, pending, terminalError, send, reset };
}

/**
 * Consume an SSE response. Prefers the streaming `getReader()` path
 * (works in browsers + Hermes RN 0.72+); falls back to `text()` when
 * the runtime does not expose `body.getReader` (older RN, polyfilled
 * fetch implementations).
 *
 * Exported so cross-platform parity tests can exercise the same code
 * path the React hook uses.
 */
export async function consumeSseStream(
  res: Response,
  onEvent: (event: IncomingEvent) => void,
): Promise<void> {
  const reader = (res.body as ReadableStream<Uint8Array> | null | undefined)?.getReader?.();
  if (reader) {
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      buf = drainFrames(buf, onEvent);
    }
    if (buf.length > 0) drainFrames(`${buf}\n\n`, onEvent);
    return;
  }
  // Fallback: buffered body (RN without streaming fetch).
  const text = await res.text();
  drainFrames(text.endsWith("\n\n") ? text : `${text}\n\n`, onEvent);
}

function drainFrames(buf: string, onEvent: (event: IncomingEvent) => void): string {
  let idx = buf.indexOf("\n\n");
  while (idx !== -1) {
    const frame = buf.slice(0, idx);
    buf = buf.slice(idx + 2);
    const event = parseSseFrame(frame);
    if (event) onEvent(event);
    idx = buf.indexOf("\n\n");
  }
  return buf;
}

function parseSseFrame(frame: string): IncomingEvent | null {
  let event = "";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (!event || dataLines.length === 0) return null;
  try {
    const json = JSON.parse(dataLines.join("\n")) as IncomingEvent;
    return json;
  } catch {
    return null;
  }
}

function applyEvent(
  setMessages: React.Dispatch<React.SetStateAction<AiChatMessage[]>>,
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
