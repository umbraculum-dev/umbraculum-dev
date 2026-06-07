import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * Cross-platform parity smoke test (Sprint #2 acceptance criteria).
 *
 * Verifies that the shared SSE consumer (used by both the web hook and the
 * native screen via `@umbraculum/ui`) produces identical events when fed:
 *
 *   1. a Web-style Response (streaming `body.getReader()`)
 *   2. a Native-style Response (no streaming body; only `text()`)
 *
 * Both paths must produce the same sequence of decoded events, proving
 * "same questions return materially the same answers and tools" on web
 * and native.
 *
 * The reference SSE bytes are produced by hitting the real `/ai/chat`
 * endpoint, so this also validates the server-side framing is consumable
 * by both client paths.
 */

const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  class Anthropic {
    public readonly messages: { create: typeof mockCreate };
    constructor(_opts: { apiKey: string }) {
      this.messages = { create: mockCreate };
    }
  }
  return { default: Anthropic };
});

import { buildApp } from "../../app.js";
import { createSessionForTestUser } from "../helpers/session.js";

/**
 * NOTE — keep in sync with `packages/platform/ui/src/ai/parseAiChatSseFrame.ts`.
 *
 * The shared consumer lives in `@umbraculum/ui`, which depends on Tamagui +
 * React Native and cannot be imported into a node-only test context. The
 * algorithm is small and self-contained, so we replicate it here. Any
 * drift would be caught at integration time, but a refactor of the shared
 * code MUST also update this copy.
 */
type IncomingEvent =
  | { type: "assistant_chunk"; text: string }
  | { type: "tool_call"; name: string; argsJson: string }
  | { type: "tool_result"; name: string; resultJson: string; durationMs: number; errored: boolean }
  | { type: "complete"; usage: unknown }
  | { type: "error"; code: string; message: string };

function parseSseFrame(frame: string): IncomingEvent | null {
  let event = "";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (!event || dataLines.length === 0) return null;
  try {
    return JSON.parse(dataLines.join("\n")) as IncomingEvent;
  } catch {
    return null;
  }
}

function drainFrames(buf: string, onEvent: (e: IncomingEvent) => void): string {
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

/**
 * Web-style consumption: streaming `body.getReader()`. We feed bytes in
 * small chunks to ensure cross-frame buffering works.
 */
async function consumeStreaming(payload: string): Promise<IncomingEvent[]> {
  const events: IncomingEvent[] = [];
  const bytes = new TextEncoder().encode(payload);
  let i = 0;
  // Synthetic ReadableStream that hands out 9-byte slices.
  const reader = {
    read(): Promise<{ done: boolean; value?: Uint8Array }> {
      if (i >= bytes.length) return Promise.resolve({ done: true });
      const end = Math.min(i + 9, bytes.length);
      const value = bytes.slice(i, end);
      i = end;
      return Promise.resolve({ done: false, value });
    },
  };
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) buf += decoder.decode(value, { stream: true });
    buf = drainFrames(buf, (e) => events.push(e));
  }
  if (buf.length > 0) drainFrames(`${buf}\n\n`, (e) => events.push(e));
  return events;
}

/**
 * Native-style consumption: buffered `text()` (no streaming body).
 */
function consumeBuffered(payload: string): IncomingEvent[] {
  const events: IncomingEvent[] = [];
  const ending = payload.endsWith("\n\n") ? payload : `${payload}\n\n`;
  drainFrames(ending, (e) => events.push(e));
  return events;
}

describe("ai cross-platform parity (web ↔ native)", () => {
  const app = buildApp();
  let adminCookie = "";
  let workspaceId = "";

  beforeAll(async () => {
    await app.ready();
    const admin = await createSessionForTestUser(app, {
      role: "brewery_admin",
      activeWorkspace: true,
    });
    adminCookie = admin.cookie;
    workspaceId = admin.workspaceId;
    await app.prisma.workspaceBilling.upsert({
      where: { workspaceId },
      create: { workspaceId, tier: "premium", source: "manual" },
      update: { tier: "premium" },
    });
    await app.inject({
      method: "PUT",
      url: `/workspaces/${workspaceId}/ai/settings`,
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: {
        enabled: true,
        apiKey: "sk-ant-parity",
        dataEgressAccepted: true,
        perUserDailyCap: 1000000,
      },
    });
  });

  afterAll(async () => {
    await app.prisma.workspaceAiMemory
      .deleteMany({ where: { workspaceId } })
      .catch(() => {});
    await app.prisma.aiUsageLedger.deleteMany({ where: { workspaceId } }).catch(() => {});
    await app.prisma.workspaceAiSettings
      .deleteMany({ where: { workspaceId } })
      .catch(() => {});
    await app.prisma.workspaceBilling.deleteMany({ where: { workspaceId } }).catch(() => {});
    await app.close();
  });

  it("web (streaming) and native (buffered) decode identical events from one tool-using turn", async () => {
    // Two-call mock: (1) tool_use; (2) final text. Writer mock is best-effort.
    mockCreate
      .mockResolvedValueOnce({
        id: "msg_tool_1",
        content: [
          {
            type: "tool_use",
            id: "toolu_x",
            name: "brewery.recipeLookup",
            input: { name: "ipa" },
          },
        ],
        stop_reason: "tool_use",
        usage: { input_tokens: 20, output_tokens: 5 },
      })
      .mockResolvedValueOnce({
        id: "msg_final",
        content: [{ type: "text", text: "Here are two candidates." }],
        stop_reason: "end_turn",
        usage: { input_tokens: 30, output_tokens: 7 },
      })
      .mockResolvedValueOnce({
        id: "msg_writer",
        content: [{ type: "text", text: "{}" }],
        stop_reason: "end_turn",
        usage: { input_tokens: 0, output_tokens: 0 },
      });

    const res = await app.inject({
      method: "POST",
      url: "/ai/chat",
      headers: {
        cookie: adminCookie,
        "content-type": "application/json",
      },
      payload: { message: "any ipas in stock?" },
    });
    expect(res.statusCode).toBe(200);

    const streamingEvents = await consumeStreaming(res.payload);
    const bufferedEvents = consumeBuffered(res.payload);

    // Parity assertion: same number of events, in the same order, with the
    // same shape. Stringification keeps the comparison stable regardless of
    // event-payload ordering of optional fields.
    expect(streamingEvents.length).toBe(bufferedEvents.length);
    expect(streamingEvents.length).toBeGreaterThan(0);
    for (let i = 0; i < streamingEvents.length; i++) {
      expect(streamingEvents[i]).toEqual(bufferedEvents[i]);
    }

    // Substance check: both decoders saw a tool_call + tool_result + final
    // assistant_chunk + complete. These four are the "materially the same
    // tools + answer" surface called out in Sprint #2 acceptance.
    const kinds = streamingEvents.map((e) => e.type);
    expect(kinds).toContain("tool_call");
    expect(kinds).toContain("tool_result");
    expect(kinds).toContain("assistant_chunk");
    expect(kinds).toContain("complete");
  });
});
