import type { PrismaClient } from "@prisma/client";

import {
  emptyMemoryBlob,
  type WorkspaceAiMemoryBlob,
} from "./promptComposer.js";

/**
 * Hard bound for the serialized memory blob — roughly ~2k Anthropic
 * tokens at 4 chars/token (plan §6.5, Sprint #2 acceptance criteria).
 */
export const MEMORY_BLOB_MAX_CHARS = 8000;

/**
 * Per-array hard caps so a runaway writer cannot bloat one bucket.
 */
export const MEMORY_MAX_FACTS = 64;
export const MEMORY_MAX_RECURRING_ISSUES = 32;

/**
 * Normalize an unknown blob (e.g. fresh Json column read) into a
 * well-typed memory blob, applying caps and dropping malformed entries.
 */
export function normalizeMemoryBlob(raw: unknown): WorkspaceAiMemoryBlob {
  const out = emptyMemoryBlob();
  if (!raw || typeof raw !== "object") return out;
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj['facts'])) {
    out.facts = obj['facts']
      .filter((f): f is string => typeof f === "string" && f.trim().length > 0)
      .map((f) => f.trim());
  }
  if (Array.isArray(obj['recurringIssues'])) {
    out.recurringIssues = obj['recurringIssues']
      .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
      .map((r) => r.trim());
  }
  if (typeof obj['lastUpdated'] === "string") {
    out.lastUpdated = obj['lastUpdated'];
  }
  return enforceBounds(out);
}

/**
 * Apply per-array caps and total-size cap. Prunes oldest entries first
 * (facts and recurringIssues are appended chronologically, so slicing
 * from the head drops the oldest).
 */
export function enforceBounds(blob: WorkspaceAiMemoryBlob): WorkspaceAiMemoryBlob {
  let facts = blob.facts.slice(-MEMORY_MAX_FACTS);
  let issues = blob.recurringIssues.slice(-MEMORY_MAX_RECURRING_ISSUES);
  let attempt: WorkspaceAiMemoryBlob = {
    facts,
    recurringIssues: issues,
    lastUpdated: blob.lastUpdated,
    schemaVersion: 0,
  };
  while (
    JSON.stringify(attempt).length > MEMORY_BLOB_MAX_CHARS &&
    (facts.length > 0 || issues.length > 0)
  ) {
    if (facts.length >= issues.length && facts.length > 0) {
      facts = facts.slice(1);
    } else if (issues.length > 0) {
      issues = issues.slice(1);
    }
    attempt = {
      facts,
      recurringIssues: issues,
      lastUpdated: blob.lastUpdated,
      schemaVersion: 0,
    };
  }
  return attempt;
}

/**
 * JSON-patch-style update emitted by the post-session writer. Keeps the
 * surface deliberately small in v0 so the prompt to Claude stays simple
 * and the merge logic stays auditable.
 */
export interface MemoryPatch {
  addFacts?: string[];
  removeFacts?: string[];
  addRecurringIssues?: string[];
  removeRecurringIssues?: string[];
}

/**
 * Apply a {@link MemoryPatch} to an existing blob. Duplicates are
 * deduped; removals are exact-string matches; bounds are enforced.
 */
export function applyMemoryPatch(
  current: WorkspaceAiMemoryBlob,
  patch: MemoryPatch,
  now: Date = new Date(),
): WorkspaceAiMemoryBlob {
  const factSet = new Set(current.facts);
  for (const f of patch.removeFacts ?? []) factSet.delete(f);
  for (const f of patch.addFacts ?? []) {
    const trimmed = (f ?? "").trim();
    if (trimmed.length > 0) factSet.add(trimmed);
  }
  const issueSet = new Set(current.recurringIssues);
  for (const r of patch.removeRecurringIssues ?? []) issueSet.delete(r);
  for (const r of patch.addRecurringIssues ?? []) {
    const trimmed = (r ?? "").trim();
    if (trimmed.length > 0) issueSet.add(trimmed);
  }
  return enforceBounds({
    facts: Array.from(factSet),
    recurringIssues: Array.from(issueSet),
    lastUpdated: now.toISOString(),
    schemaVersion: 0,
  });
}

/**
 * Read-or-default memory service. The store survives downgrades:
 * see schema docblock on `WorkspaceAiMemory` for the moat rationale.
 */
export class WorkspaceAiMemoryService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Read the workspace memory blob. Returns an empty blob if no row
   * exists yet (no row write — first chat turn does not need a seed).
   */
  async read(workspaceId: string): Promise<WorkspaceAiMemoryBlob> {
    const row = await this.prisma.workspaceAiMemory.findUnique({
      where: { workspaceId },
    });
    if (!row) return emptyMemoryBlob();
    return normalizeMemoryBlob(row.memoryBlob);
  }

  /**
   * Apply a patch and persist atomically. Bumps `version` and stamps
   * `lastWriterRunAt`. Idempotent for empty patches (still creates the
   * row if missing so subsequent reads see consistent metadata).
   */
  async applyPatch(
    workspaceId: string,
    patch: MemoryPatch,
    now: Date = new Date(),
  ): Promise<WorkspaceAiMemoryBlob> {
    const current = await this.read(workspaceId);
    const next = applyMemoryPatch(current, patch, now);
    await this.prisma.workspaceAiMemory.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        memoryBlob: next as unknown as object,
        version: 1,
        lastWriterRunAt: now,
      },
      update: {
        memoryBlob: next as unknown as object,
        version: { increment: 1 },
        lastWriterRunAt: now,
      },
    });
    return next;
  }
}
