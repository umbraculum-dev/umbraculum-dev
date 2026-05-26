import { describe, expect, it } from "vitest";

import {
  applyMemoryPatch,
  enforceBounds,
  MEMORY_BLOB_MAX_CHARS,
  MEMORY_MAX_FACTS,
  MEMORY_MAX_RECURRING_ISSUES,
  normalizeMemoryBlob,
} from "../../services/ai/memoryService.js";
import { emptyMemoryBlob } from "../../services/ai/promptComposer.js";

describe("memoryService.normalizeMemoryBlob", () => {
  it("returns an empty blob for null/empty/non-object input", () => {
    expect(normalizeMemoryBlob(null)).toEqual(emptyMemoryBlob());
    expect(normalizeMemoryBlob(undefined)).toEqual(emptyMemoryBlob());
    expect(normalizeMemoryBlob("not-a-blob")).toEqual(emptyMemoryBlob());
    expect(normalizeMemoryBlob({})).toEqual(emptyMemoryBlob());
  });

  it("preserves valid facts and recurring issues, drops malformed entries", () => {
    const raw = {
      facts: ["valid fact", "", null, "  another valid fact  ", 42],
      recurringIssues: ["issue 1", undefined, "issue 2"],
      lastUpdated: "2026-05-15T10:00:00.000Z",
    };
    const out = normalizeMemoryBlob(raw);
    expect(out.facts).toEqual(["valid fact", "another valid fact"]);
    expect(out.recurringIssues).toEqual(["issue 1", "issue 2"]);
    expect(out.lastUpdated).toBe("2026-05-15T10:00:00.000Z");
    expect(out.schemaVersion).toBe(0);
  });
});

describe("memoryService.enforceBounds", () => {
  it("caps facts and recurring issues at per-array limits, pruning oldest first", () => {
    const facts = Array.from({ length: MEMORY_MAX_FACTS + 5 }, (_, i) => `f${i}`);
    const issues = Array.from(
      { length: MEMORY_MAX_RECURRING_ISSUES + 3 },
      (_, i) => `i${i}`,
    );
    const bounded = enforceBounds({
      facts,
      recurringIssues: issues,
      lastUpdated: null,
      schemaVersion: 0,
    });
    expect(bounded.facts.length).toBeLessThanOrEqual(MEMORY_MAX_FACTS);
    expect(bounded.recurringIssues.length).toBeLessThanOrEqual(
      MEMORY_MAX_RECURRING_ISSUES,
    );
    expect(bounded.facts[0]).toBe(`f5`); // oldest 5 pruned
    expect(bounded.recurringIssues[0]).toBe(`i3`);
  });

  it("prunes further until total serialized size fits within MEMORY_BLOB_MAX_CHARS", () => {
    const bigFact = "x".repeat(400);
    const blob = {
      facts: Array.from({ length: 64 }, () => bigFact),
      recurringIssues: ["short"],
      lastUpdated: null,
      schemaVersion: 0 as const,
    };
    const bounded = enforceBounds(blob);
    expect(JSON.stringify(bounded).length).toBeLessThanOrEqual(MEMORY_BLOB_MAX_CHARS);
  });
});

describe("memoryService.applyMemoryPatch", () => {
  const base = emptyMemoryBlob();

  it("adds facts and recurring issues; deduplicates", () => {
    const out = applyMemoryPatch(
      base,
      {
        addFacts: ["fact a", "fact a", "fact b"],
        addRecurringIssues: ["issue 1"],
      },
      new Date("2026-05-15T10:00:00Z"),
    );
    expect(out.facts).toEqual(["fact a", "fact b"]);
    expect(out.recurringIssues).toEqual(["issue 1"]);
    expect(out.lastUpdated).toBe("2026-05-15T10:00:00.000Z");
  });

  it("removes matching entries by exact string", () => {
    const start = { ...emptyMemoryBlob(), facts: ["a", "b", "c"] };
    const out = applyMemoryPatch(start, { removeFacts: ["b"] });
    expect(out.facts).toEqual(["a", "c"]);
  });

  it("is a no-op for an empty patch", () => {
    const out = applyMemoryPatch(base, {});
    expect(out.facts).toEqual([]);
    expect(out.recurringIssues).toEqual([]);
    expect(out.lastUpdated).not.toBeNull();
  });

  it("trims and rejects blank-only added entries", () => {
    const out = applyMemoryPatch(base, {
      addFacts: ["   ", "good fact   "],
      addRecurringIssues: [""],
    });
    expect(out.facts).toEqual(["good fact"]);
    expect(out.recurringIssues).toEqual([]);
  });
});
