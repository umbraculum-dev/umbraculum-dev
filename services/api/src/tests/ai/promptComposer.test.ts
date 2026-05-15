import { describe, expect, it } from "vitest";

import {
  BASE_PROMPT,
  BREWERY_OVERLAY,
  composePrompt,
  emptyMemoryBlob,
  renderMemory,
} from "../../services/ai/promptComposer.js";

describe("promptComposer", () => {
  it("composes base + brewery overlay in order, separated by a blank line", () => {
    const out = composePrompt();
    expect(out.startsWith(BASE_PROMPT)).toBe(true);
    expect(out.endsWith(BREWERY_OVERLAY)).toBe(true);
    expect(out).toContain(`${BASE_PROMPT}\n\n${BREWERY_OVERLAY}`);
  });

  it("accepts overrides for testability", () => {
    const out = composePrompt({ base: "BASE", breweryOverlay: "OVERLAY" });
    expect(out).toBe("BASE\n\nOVERLAY");
  });

  it("treats moduleOverlay as a synonym for breweryOverlay", () => {
    const out = composePrompt({ base: "BASE", moduleOverlay: "OVERLAY" });
    expect(out).toBe("BASE\n\nOVERLAY");
  });

  it("ships a non-empty base prompt mentioning tools and concision", () => {
    expect(BASE_PROMPT.length).toBeGreaterThan(50);
    expect(BASE_PROMPT.toLowerCase()).toContain("tool");
  });

  it("ships a non-empty brewery overlay mentioning BeerJSON or recipes", () => {
    expect(BREWERY_OVERLAY.length).toBeGreaterThan(50);
    expect(BREWERY_OVERLAY.toLowerCase()).toMatch(/beerjson|recipe/);
  });

  describe("workspaceMemory slot (Sprint #2)", () => {
    it("omits the memory section when the blob is null/empty", () => {
      expect(composePrompt({ workspaceMemory: null })).toBe(composePrompt());
      expect(composePrompt({ workspaceMemory: emptyMemoryBlob() })).toBe(
        composePrompt(),
      );
    });

    it("appends the memory section after the module overlay", () => {
      const out = composePrompt({
        base: "BASE",
        moduleOverlay: "OVERLAY",
        workspaceMemory: {
          facts: ["mash pH target is 5.4"],
          recurringIssues: ["FV-3 runs cold"],
          lastUpdated: "2026-05-15T10:00:00Z",
          schemaVersion: 0,
        },
      });
      expect(out.startsWith("BASE\n\nOVERLAY\n\n")).toBe(true);
      expect(out).toContain("Workspace memory");
      expect(out).toContain("mash pH target is 5.4");
      expect(out).toContain("FV-3 runs cold");
    });

    it("composes in order base → moduleOverlay → routeOverlay → memory", () => {
      const out = composePrompt({
        base: "B",
        moduleOverlay: "M",
        routeOverlay: "R",
        workspaceMemory: {
          facts: ["fact"],
          recurringIssues: [],
          lastUpdated: null,
          schemaVersion: 0,
        },
      });
      const bIdx = out.indexOf("B");
      const mIdx = out.indexOf("M");
      const rIdx = out.indexOf("R");
      const memIdx = out.indexOf("Workspace memory");
      expect(bIdx).toBeLessThan(mIdx);
      expect(mIdx).toBeLessThan(rIdx);
      expect(rIdx).toBeLessThan(memIdx);
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
