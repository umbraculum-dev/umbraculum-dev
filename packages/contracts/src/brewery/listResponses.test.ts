import { describe, expect, it } from "vitest";

import {
  parseBrewSessionsListResponse,
  parseBrewSessionCreateResponse,
  parseRecipesListResponse,
} from "./listResponses";

describe("parseRecipesListResponse", () => {
  it("parses a valid list", () => {
    const parsed = parseRecipesListResponse({
      ok: true,
      recipes: [{ id: "r1", name: "IPA", styleKey: "american-ipa" }],
    });
    expect(parsed.recipes).toHaveLength(1);
    expect(parsed.recipes[0]?.id).toBe("r1");
  });

  it("rejects missing recipes", () => {
    expect(() => parseRecipesListResponse({ ok: true })).toThrow();
  });
});

describe("parseBrewSessionsListResponse", () => {
  it("parses sessions with ISO date strings", () => {
    const parsed = parseBrewSessionsListResponse({
      ok: true,
      brewSessions: [
        {
          id: "s1",
          code: "BS-001",
          status: "planned",
          createdAt: "2026-01-01T00:00:00.000Z",
          startedAt: null,
          stoppedAt: null,
        },
      ],
    });
    expect(parsed.brewSessions[0]?.code).toBe("BS-001");
  });
});

describe("parseBrewSessionCreateResponse", () => {
  it("extracts brewSession id", () => {
    const parsed = parseBrewSessionCreateResponse({
      ok: true,
      brewSession: { id: "s-new" },
    });
    expect(parsed.brewSession.id).toBe("s-new");
  });
});
