/**
 * Prompt composer — pure function building the system prompt for a single
 * chat turn.
 *
 * Composition order: **base → platform (+ reference notes) → module overlays
 * → routeOverlay → workspaceMemory**.
 */

import { PLATFORM_OVERLAY } from "./prompts/platform.js";

export const BASE_PROMPT = [
  "You are an AI consultant embedded inside an operational workspace platform.",
  "You answer the user's questions using the workspace's real data via the tools provided.",
  "When a tool is relevant, call it instead of guessing. Prefer concise, numerical answers when the user is asking for a value.",
  "If a tool returns no data, say so directly; do not invent values.",
  "Always answer in the user's preferred language. If unsure, infer from the user's message.",
].join(" ");

/** @deprecated Use brewery module overlay via registerModule; kept for tests. */
export { BREWERY_MODULE_OVERLAY as BREWERY_OVERLAY } from "../../modules/brewery/services/ai/prompts/brewery.js";

export interface WorkspaceAiMemoryBlob {
  facts: string[];
  recurringIssues: string[];
  lastUpdated: string | null;
  schemaVersion: 0;
}

export interface PromptCompositionInput {
  base?: string;
  platformOverlay?: string;
  /** Static knowledge snippets (from module registry), appended under platform context. */
  knowledgeSnippets?: readonly string[];
  /** Module overlays in stable order (typically alphabetical by module code). */
  moduleOverlays?: readonly string[];
  /** Back-compat: single module overlay when only one module contributes. */
  moduleOverlay?: string;
  /** Back-compat alias for {@link PromptCompositionInput.moduleOverlay}. */
  breweryOverlay?: string;
  routeOverlay?: string;
  workspaceMemory?: WorkspaceAiMemoryBlob | null;
}

export interface WorkspaceSystemPromptInput {
  moduleOverlays?: readonly string[];
  knowledgeSnippets?: readonly string[];
  routeOverlay?: string;
  workspaceMemory?: WorkspaceAiMemoryBlob | null;
}

function renderPlatformSection(
  platformOverlay: string,
  knowledgeSnippets: readonly string[],
): string {
  const parts = [platformOverlay.trim()];
  const notes = knowledgeSnippets.map((s) => s.trim()).filter(Boolean);
  if (notes.length > 0) {
    parts.push(
      [
        "Reference notes (static module knowledge; treat as factual unless contradicted by tool output):",
        ...notes.map((n) => `- ${n}`),
      ].join("\n"),
    );
  }
  return parts.join("\n\n");
}

/**
 * Primary entry for the orchestrator — composes the full workspace system prompt.
 */
export function composeWorkspaceSystemPrompt(input: WorkspaceSystemPromptInput = {}): string {
  return composePrompt({
    platformOverlay: PLATFORM_OVERLAY,
    knowledgeSnippets: input.knowledgeSnippets ?? [],
    moduleOverlays: input.moduleOverlays ?? [],
    ...(input.routeOverlay !== undefined ? { routeOverlay: input.routeOverlay } : {}),
    workspaceMemory: input.workspaceMemory ?? null,
  });
}

export function composePrompt(input: PromptCompositionInput = {}): string {
  const base = input.base ?? BASE_PROMPT;
  const platformOverlay = input.platformOverlay ?? PLATFORM_OVERLAY;
  const knowledgeSnippets = input.knowledgeSnippets ?? [];

  const legacyModule =
    input.moduleOverlay ?? input.breweryOverlay ?? undefined;
  const moduleOverlays =
    input.moduleOverlays !== undefined
      ? [...input.moduleOverlays]
      : legacyModule !== undefined
        ? [legacyModule]
        : [];

  const parts: string[] = [base, renderPlatformSection(platformOverlay, knowledgeSnippets)];

  for (const overlay of moduleOverlays) {
    const trimmed = overlay.trim();
    if (trimmed.length > 0) parts.push(trimmed);
  }

  if (input.routeOverlay && input.routeOverlay.trim().length > 0) {
    parts.push(input.routeOverlay.trim());
  }

  const memorySection = renderMemory(input.workspaceMemory ?? null);
  if (memorySection) parts.push(memorySection);

  return parts.join("\n\n");
}

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

export function emptyMemoryBlob(): WorkspaceAiMemoryBlob {
  return { facts: [], recurringIssues: [], lastUpdated: null, schemaVersion: 0 };
}
