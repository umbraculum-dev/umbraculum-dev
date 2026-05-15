import type Anthropic from "@anthropic-ai/sdk";

import { DEFAULT_MODEL } from "./anthropicClient.js";
import type { MemoryPatch } from "./memoryService.js";
import type { WorkspaceAiMemoryBlob } from "./promptComposer.js";

/**
 * Post-session memory writer.
 *
 * After each successful chat turn the orchestrator calls Claude one more
 * time, handing it the transcript + current memory blob and asking for a
 * JSON-patch-style update. The writer is best-effort: if the model
 * returns malformed output, an empty patch is returned and the memory
 * row is left unchanged (the orchestrator decides whether to still bump
 * `lastWriterRunAt`).
 *
 * Token budget intentionally tight (max ~512 output tokens) so the
 * writer cost is a tiny fraction of the chat turn itself.
 */

/**
 * One conversation entry as fed into the writer prompt. We summarize
 * tool calls in plain text to keep the writer focused on user-facing
 * facts, not protocol details.
 */
export interface MemoryWriterTurn {
  userMessage: string;
  assistantText: string;
  toolNamesUsed: string[];
}

const WRITER_SYSTEM_PROMPT = [
  "You are the memory updater for an AI consultant embedded in a brewery operations platform.",
  "Given the current operational memory blob and the latest chat turn, produce a small JSON patch that adds durable, workspace-level facts and recurring issues worth remembering across sessions.",
  "Workspace memory must be operationally useful, not chatty. Prefer concrete facts ('Default mash pH target is 5.4', 'Fermenter FV-3 has a known temperature offset of -0.6C').",
  "Do NOT store the user's transient question or one-off conversational asides.",
  "Do NOT store personally identifying information about individual people.",
  "Reply with a single JSON object on one line and nothing else. Allowed keys: addFacts (string[]), removeFacts (string[]), addRecurringIssues (string[]), removeRecurringIssues (string[]). Omit keys you don't need. If nothing is worth remembering, reply with {}.",
].join(" ");

export interface MemoryWriter {
  computePatch(
    current: WorkspaceAiMemoryBlob,
    turn: MemoryWriterTurn,
  ): Promise<MemoryPatch>;
}

/**
 * The default Anthropic-backed writer used in production.
 */
export class AnthropicMemoryWriter implements MemoryWriter {
  constructor(
    private readonly client: Anthropic,
    private readonly model: string = DEFAULT_MODEL,
  ) {}

  async computePatch(
    current: WorkspaceAiMemoryBlob,
    turn: MemoryWriterTurn,
  ): Promise<MemoryPatch> {
    const userPrompt = [
      "Current memory (JSON):",
      JSON.stringify(current),
      "",
      "Latest chat turn:",
      `User: ${truncate(turn.userMessage, 2000)}`,
      `Assistant: ${truncate(turn.assistantText, 2000)}`,
      turn.toolNamesUsed.length > 0
        ? `Tools used: ${turn.toolNamesUsed.join(", ")}`
        : "Tools used: (none)",
      "",
      "Return the JSON patch now.",
    ].join("\n");

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      system: WRITER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }] as never,
    });
    const blocks = Array.isArray(response.content) ? response.content : [];
    const text = blocks
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("")
      .trim();
    return parsePatchSafe(text);
  }
}

/**
 * Best-effort JSON parser for the writer's reply. Accepts the raw model
 * output (which may include surrounding code-fences or prose) and
 * returns an empty patch if anything is off.
 *
 * Exported for unit tests.
 */
export function parsePatchSafe(raw: string): MemoryPatch {
  if (!raw) return {};
  const candidate = extractJsonObject(raw);
  if (!candidate) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== "object") return {};
  const obj = parsed as Record<string, unknown>;
  const out: MemoryPatch = {};
  if (Array.isArray(obj.addFacts)) {
    out.addFacts = obj.addFacts.filter((f): f is string => typeof f === "string");
  }
  if (Array.isArray(obj.removeFacts)) {
    out.removeFacts = obj.removeFacts.filter((f): f is string => typeof f === "string");
  }
  if (Array.isArray(obj.addRecurringIssues)) {
    out.addRecurringIssues = obj.addRecurringIssues.filter(
      (f): f is string => typeof f === "string",
    );
  }
  if (Array.isArray(obj.removeRecurringIssues)) {
    out.removeRecurringIssues = obj.removeRecurringIssues.filter(
      (f): f is string => typeof f === "string",
    );
  }
  return out;
}

/**
 * Pull the first balanced top-level JSON object out of a string. Handles
 * the common "```json\n{...}\n```" wrapping that some models add even
 * when told not to.
 */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 16) + "...[truncated]";
}
