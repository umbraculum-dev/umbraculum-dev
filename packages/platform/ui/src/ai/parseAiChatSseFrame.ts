import type { IncomingEvent } from "./aiChatStreamTypes";

export function parseAiChatSseFrame(frame: string): IncomingEvent | null {
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

function drainFrames(buf: string, onEvent: (event: IncomingEvent) => void): string {
  let idx = buf.indexOf("\n\n");
  while (idx !== -1) {
    const frame = buf.slice(0, idx);
    buf = buf.slice(idx + 2);
    const event = parseAiChatSseFrame(frame);
    if (event) onEvent(event);
    idx = buf.indexOf("\n\n");
  }
  return buf;
}

/**
 * Consume an SSE response. Prefers the streaming `getReader()` path
 * (works in browsers + Hermes RN 0.72+); falls back to `text()` when
 * the runtime does not expose `body.getReader`.
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
  const text = await res.text();
  drainFrames(text.endsWith("\n\n") ? text : `${text}\n\n`, onEvent);
}
