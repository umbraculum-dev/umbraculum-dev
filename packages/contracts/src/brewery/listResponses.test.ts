import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import {
  BrewSessionDetailResponseSchema,
  parseBrewSessionsListResponse,
  parseBrewSessionCreateResponse,
  parseRecipesListResponse,
} from "./listResponses";

function expectSchemaPathError(
  schema: { parse: (value: unknown) => unknown },
  value: unknown,
  expectedPathPrefix: ReadonlyArray<string | number>,
): void {
  let error: unknown;
  try {
    schema.parse(value);
  } catch (e) {
    error = e;
  }
  if (!(error instanceof ZodError)) {
    throw new Error("expected ZodError, got: " + (error === undefined ? "no throw" : String(error)));
  }
  const path = error.issues[0]?.path ?? [];
  for (let i = 0; i < expectedPathPrefix.length; i++) {
    if (path[i] !== expectedPathPrefix[i]) {
      throw new Error(
        `expected error.issues[0].path[${i}] === ${JSON.stringify(expectedPathPrefix[i])}, got path=${JSON.stringify(path)}`,
      );
    }
  }
}

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
      brewSession: {
        id: "s-new",
        workspaceId: "ws-1",
        recipeId: "r-1",
        code: "BS-001",
        status: "draft",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        startedAt: null,
        pausedAt: null,
        stoppedAt: null,
        scheduledDate: null,
      },
      steps: [],
    });
    expect(parsed.brewSession.id).toBe("s-new");
  });
});

describe("BrewSessionDetailResponseSchema", () => {
  const baseSession = {
    id: "s1",
    workspaceId: "ws-1",
    recipeId: "r-1",
    code: "BS-001",
    status: "planned",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    startedAt: null,
    pausedAt: null,
    stoppedAt: null,
    scheduledDate: null,
  };

  it("accepts numeric recipe.version on nested recipe ref", () => {
    const parsed = BrewSessionDetailResponseSchema.parse({
      ok: true,
      brewSession: {
        ...baseSession,
        recipe: { id: "r-1", name: "IPA", version: 3 },
      },
    });
    expect(parsed.brewSession.recipe?.version).toBe(3);
  });

  it("rejects string recipe.version (recipes.version is Int in Prisma)", () => {
    expectSchemaPathError(
      BrewSessionDetailResponseSchema,
      {
        ok: true,
        brewSession: {
          ...baseSession,
          recipe: { id: "r-1", name: "IPA", version: "3" },
        },
      },
      ["brewSession", "recipe", "version"],
    );
  });
});
