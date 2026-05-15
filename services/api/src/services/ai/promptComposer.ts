/**
 * Prompt composer — pure function building the system prompt for a single
 * chat turn. v0 supported BASE + BREWERY_OVERLAY only; Sprint #2 adds an
 * optional per-workspace memory slot rendered as a trailing section.
 *
 * Composition order is **base → moduleOverlay → routeOverlay → workspaceMemory**.
 * Optional slots are only emitted when they have content, so the
 * memoryless / route-less call sites produce the same string as v0.
 *
 * Kept side-effect free so it can be unit-tested without any infrastructure.
 */

export const BASE_PROMPT = [
  "You are an AI consultant embedded inside a brewing operations platform.",
  "You answer the user's questions using the workspace's real data via the tools provided.",
  "When a tool is relevant, call it instead of guessing. Prefer concise, numerical answers when the user is asking for a value.",
  "If a tool returns no data, say so directly; do not invent values.",
  "Always answer in the user's preferred language. If unsure, infer from the user's message.",
].join(" ");

export const BREWERY_OVERLAY = [
  "Domain context: the workspace is a brewery. Recipes are stored in BeerJSON format with internal extensions.",
  "Water chemistry uses ppm CaCO3 alkalinity, mash pH targets, and per-step salt additions. Use SI units in your reasoning; show conversions only when asked.",
  "When the user references 'my recipe', resolve it with the recipeLookup tool — if multiple candidates exist, list a few and ask the user to choose.",
  "When you fetch equipment, recipes, sessions, or inventory, summarize the data — do not dump raw tool output back to the user.",
].join(" ");

/**
 * Per-workspace operational memory blob, v0.
 *
 * Kept intentionally simple: a flat array of facts (workspace-level claims
 * carried across sessions) and a flat array of recurring issues
 * (problems/observations seen often enough to remember). The serializer
 * is responsible for keeping the rendered form compact.
 *
 * `schemaVersion` is locked at 0 in Sprint #2; bump it the first time a
 * destructive shape change ships.
 */
export interface WorkspaceAiMemoryBlob {
  facts: string[];
  recurringIssues: string[];
  lastUpdated: string | null;
  schemaVersion: 0;
}

export interface PromptCompositionInput {
  base?: string;
  /** Vertical-module overlay (e.g. brewery). Defaults to BREWERY_OVERLAY. */
  moduleOverlay?: string;
  /** Back-compat alias for {@link PromptCompositionInput.moduleOverlay}. */
  breweryOverlay?: string;
  /** Route- or screen-specific overlay (optional). */
  routeOverlay?: string;
  /** Per-workspace operational memory (optional). */
  workspaceMemory?: WorkspaceAiMemoryBlob | null;
}

/**
 * Compose the system prompt. All inputs are optional and default to the
 * module-level constants so callers can override per-test without
 * rebuilding the module.
 */
export function composePrompt(input: PromptCompositionInput = {}): string {
  const base = input.base ?? BASE_PROMPT;
  const moduleOverlay = input.moduleOverlay ?? input.breweryOverlay ?? BREWERY_OVERLAY;
  const parts: string[] = [base, moduleOverlay];
  if (input.routeOverlay && input.routeOverlay.trim().length > 0) {
    parts.push(input.routeOverlay.trim());
  }
  const memorySection = renderMemory(input.workspaceMemory ?? null);
  if (memorySection) parts.push(memorySection);
  return parts.join("\n\n");
}

/**
 * Render the workspace memory blob into a compact, human-readable prompt
 * section. Returns `null` when there is nothing useful to show.
 */
export function renderMemory(memory: WorkspaceAiMemoryBlob | null): string | null {
  if (!memory) return null;
  const facts = Array.isArray(memory.facts) ? memory.facts.filter(Boolean) : [];
  const issues = Array.isArray(memory.recurringIssues)
    ? memory.recurringIssues.filter(Boolean)
    : [];
  if (facts.length === 0 && issues.length === 0) return null;
  const lines: string[] = [
    "Workspace memory (carried forward from previous sessions; treat as factual unless contradicted by tool output):",
  ];
  if (facts.length > 0) {
    lines.push("Facts:");
    for (const f of facts) lines.push(`- ${f}`);
  }
  if (issues.length > 0) {
    lines.push("Recurring issues:");
    for (const r of issues) lines.push(`- ${r}`);
  }
  return lines.join("\n");
}

/**
 * Default empty memory blob — useful for tests and for first-write seeds.
 */
export function emptyMemoryBlob(): WorkspaceAiMemoryBlob {
  return { facts: [], recurringIssues: [], lastUpdated: null, schemaVersion: 0 };
}
