/**
 * Contract snapshots: brew-sessions endpoints consumed by apps/native
 *   - POST /recipes/:recipeId/brew-sessions (create)
 *   - GET  /recipes/:recipeId/brew-sessions (list)
 *   - GET  /brew-sessions/:brewSessionId    (detail, with auto-generated steps)
 *
 * These three endpoints power the BrewSessionsListScreen + BrewSessionDetail
 * screens in apps/native. There are no L1 parser companions yet (the native
 * code today consumes the response directly via `as any` casts on the
 * BrewSession shape — pinning this at L4 makes the wire format explicit
 * and provides the contract a future `parseBrewSession*` parser can
 * validate against without guesswork).
 *
 * The fixture deliberately uses a recipe with mash steps so the seeded
 * brew-session step list is non-empty and the snapshot captures the
 * BrewSessionStep element shape (id, name, sectionId, minutesPlanned,
 * offsetMinutesFromEnd, etc.).
 *
 * To intentionally update:
 *   UPDATE_CONTRACTS=1 npm test -w @umbraculum/api -- contracts/brewSessions.contract.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createSessionForTestUser } from "../helpers/session.js";
import { assertSnapshotShape } from "./shapeHelpers.js";

const RECIPE_NAME = "Contract Brew Session Recipe";

function buildBeerJsonRecipe(name: string) {
  return {
    beerjson: {
      version: 1,
      recipes: [
        {
          name,
          type: "all grain",
          author: "brewery-app-contract",
          efficiency: { brewhouse: { unit: "%", value: 75 } },
          batch_size: { unit: "l", value: 20 },
          mash: {
            name: "Mash",
            grain_temperature: { unit: "C", value: 20 },
            mash_steps: [
              {
                name: "Mash in",
                type: "infusion",
                step_temperature: { unit: "C", value: 67 },
                step_time: { unit: "min", value: 60 },
              },
              {
                name: "Mash out",
                type: "temperature",
                step_temperature: { unit: "C", value: 72 },
                step_time: { unit: "min", value: 10 },
              },
            ],
          },
          ingredients: {
            fermentable_additions: [
              {
                id: "contract-grain-1",
                name: "Pale Ale Malt",
                type: "grain",
                yield: { potential: { unit: "sg", value: 1.037 } },
                color: { unit: "Lovi", value: 3.0 },
                amount: { unit: "kg", value: 4.5 },
              },
            ],
            hop_additions: [],
            culture_additions: [],
            miscellaneous_additions: [],
          },
        },
      ],
    },
  };
}

describe("contract: brew-sessions endpoints", () => {
  const app = buildApp();
  let cookie = "";
  let workspaceId = "";
  let recipeId = "";
  let brewSessionId = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookie = sess.cookie;
    workspaceId = sess.workspaceId;

    const createRecipe = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie },
      payload: {
        name: RECIPE_NAME,
        styleKey: "custom",
        beerJsonRecipeJson: buildBeerJsonRecipe(RECIPE_NAME),
      },
    });
    if (createRecipe.statusCode !== 200) {
      throw new Error(
        `recipe create failed (${createRecipe.statusCode}): ${createRecipe.body}`,
      );
    }
    recipeId = createRecipe.json().recipe.id;
  });

  afterAll(async () => {
    if (brewSessionId) {
      await app.prisma.brewSessionLog
        .deleteMany({ where: { brewSessionId } })
        .catch(() => undefined);
      await app.prisma.brewSessionStep
        .deleteMany({ where: { brewSessionId } })
        .catch(() => undefined);
      await app.prisma.brewSession
        .deleteMany({ where: { id: brewSessionId, workspaceId } })
        .catch(() => undefined);
    }
    if (recipeId) {
      await app.prisma.recipe
        .deleteMany({ where: { id: recipeId, workspaceId } })
        .catch(() => undefined);
    }
    await app.close();
  });

  it("POST /recipes/:recipeId/brew-sessions response shape is stable", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    if (res.statusCode !== 200) {
      throw new Error(`create brew session failed (${res.statusCode}): ${res.body}`);
    }
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.brewSession.id).toBe("string");
    expect(Array.isArray(body.steps)).toBe(true);
    expect(body.steps.length).toBeGreaterThan(0);

    brewSessionId = body.brewSession.id;
    assertSnapshotShape("brewSessions.create", body);
  });

  it("GET /recipes/:recipeId/brew-sessions list shape is stable", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.brewSessions)).toBe(true);
    // Must include the session we just created (depends on test ordering — the
    // create test above runs first and sets brewSessionId).
    expect(body.brewSessions.length).toBeGreaterThan(0);
    assertSnapshotShape("brewSessions.listForRecipe", body);
  });

  it("GET /brew-sessions/:brewSessionId detail shape is stable", async () => {
    expect(brewSessionId).not.toBe("");
    const res = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionId}`,
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.brewSession.id).toBe(brewSessionId);
    expect(Array.isArray(body.brewSession.steps)).toBe(true);
    assertSnapshotShape("brewSessions.detail", body);
  });
});
