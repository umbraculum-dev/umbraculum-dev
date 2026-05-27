import { describe, expect, it } from "vitest";

import {
  BASE_PROMPT,
  BREWERY_OVERLAY,
  composePrompt,
  composeWorkspaceSystemPrompt,
  emptyMemoryBlob,
  renderMemory,
} from "../../services/ai/promptComposer.js";
import { PLATFORM_OVERLAY } from "../../services/ai/prompts/platform.js";

describe("promptComposer", () => {
  it("composes base + platform by default (no implicit brewery overlay)", () => {
    const out = composePrompt();
    expect(out.startsWith(BASE_PROMPT)).toBe(true);
    expect(out).toContain(PLATFORM_OVERLAY);
    expect(out.toLowerCase()).not.toContain("beerjson");
  });

  it("accepts explicit module overlays for testability", () => {
    const out = composePrompt({ base: "BASE", moduleOverlays: ["OVERLAY"] });
    expect(out).toBe(`BASE\n\n${PLATFORM_OVERLAY}\n\nOVERLAY`);
  });

  it("treats moduleOverlay and breweryOverlay as legacy single-overlay inputs", () => {
    const out = composePrompt({ base: "BASE", moduleOverlay: "OVERLAY" });
    expect(out).toContain("OVERLAY");
    const out2 = composePrompt({ base: "BASE", breweryOverlay: "OVERLAY" });
    expect(out2).toContain("OVERLAY");
  });

  it("ships a non-empty base prompt mentioning tools", () => {
    expect(BASE_PROMPT.length).toBeGreaterThan(50);
    expect(BASE_PROMPT.toLowerCase()).toContain("tool");
    expect(BASE_PROMPT.toLowerCase()).toContain("operational");
  });

  it("exports brewery overlay for tests", () => {
    expect(BREWERY_OVERLAY.length).toBeGreaterThan(50);
    expect(BREWERY_OVERLAY.toLowerCase()).toMatch(/beerjson|recipe/);
  });

  describe("workspaceMemory slot", () => {
    it("omits the memory section when the blob is null/empty", () => {
      expect(composePrompt({ workspaceMemory: null })).toBe(composePrompt());
      expect(composePrompt({ workspaceMemory: emptyMemoryBlob() })).toBe(
        composePrompt(),
      );
    });

    it("appends the memory section after module overlays", () => {
      const out = composePrompt({
        base: "BASE",
        moduleOverlays: ["OVERLAY"],
        workspaceMemory: {
          facts: ["mash pH target is 5.4"],
          recurringIssues: ["FV-3 runs cold"],
          lastUpdated: "2026-05-15T10:00:00Z",
          schemaVersion: 0,
        },
      });
      expect(out).toContain("Workspace memory");
      expect(out).toContain("mash pH target is 5.4");
      expect(out).toContain("FV-3 runs cold");
    });

    it("composes in order base → platform → module → route → memory", () => {
      const out = composePrompt({
        base: "B",
        moduleOverlays: ["M"],
        routeOverlay: "R",
        workspaceMemory: {
          facts: ["fact"],
          recurringIssues: [],
          lastUpdated: null,
          schemaVersion: 0,
        },
      });
      const bIdx = out.indexOf("B");
      const pIdx = out.indexOf(PLATFORM_OVERLAY);
      const mIdx = out.indexOf("M");
      const rIdx = out.indexOf("R");
      const memIdx = out.indexOf("Workspace memory");
      expect(bIdx).toBeLessThan(pIdx);
      expect(pIdx).toBeLessThan(mIdx);
      expect(mIdx).toBeLessThan(rIdx);
      expect(rIdx).toBeLessThan(memIdx);
    });
  });

  describe("knowledge snippets", () => {
    it("appends reference notes under the platform section", () => {
      const out = composeWorkspaceSystemPrompt({
        knowledgeSnippets: ["Note one", "Note two"],
      });
      expect(out).toContain("Reference notes");
      expect(out).toContain("Note one");
      expect(out).toContain("Note two");
    });
  });

  describe("renderMemory", () => {
    it("returns null for null / empty memory blobs", () => {
      expect(renderMemory(null)).toBeNull();
      expect(renderMemory(emptyMemoryBlob())).toBeNull();
    });

    it("renders facts and issues under labelled subsections", () => {
      const out = renderMemory({
        facts: ["f1", "f2"],
        recurringIssues: ["i1"],
        lastUpdated: null,
        schemaVersion: 0,
      });
      expect(out).toContain("Facts:");
      expect(out).toContain("- f1");
      expect(out).toContain("- f2");
      expect(out).toContain("Recurring issues:");
      expect(out).toContain("- i1");
    });
  });
});
