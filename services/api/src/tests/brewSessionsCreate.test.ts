import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("brew sessions (account scoped)", () => {
  const app = buildApp();
  let cookie = "";
  let workspaceId = "";
  let recipeId = "";
  let brewSessionId = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeAccount: true });
    cookie = sess.cookie;
    workspaceId = sess.workspaceId;

    const beerJsonRecipeJson = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Brew session test recipe",
            type: "all grain",
            author: "brewery-app",
            efficiency: { brewhouse: { unit: "%", value: 75 } },
            batch_size: { unit: "l", value: 20 },
            mash: {
              name: "Mash",
              grain_temperature: { unit: "C", value: 20 },
              mash_steps: [
                { name: "Mash in", type: "infusion", step_temperature: { unit: "C", value: 67 }, step_time: { unit: "min", value: 60 } },
                { name: "Mash out", type: "temperature", step_temperature: { unit: "C", value: 72 }, step_time: { unit: "min", value: 10 } },
              ],
            },
            ingredients: {
              fermentable_additions: [
                {
                  id: "row-1",
                  name: "Pale malt",
                  type: "grain",
                  yield: { potential: { unit: "sg", value: 1.037 } },
                  color: { unit: "Lovi", value: 2.0 },
                  amount: { unit: "kg", value: 4.5 },
                },
                {
                  id: "row-2",
                  name: "Roasted barley",
                  type: "grain",
                  yield: { potential: { unit: "sg", value: 1.025 } },
                  color: { unit: "Lovi", value: 300 },
                  amount: { unit: "kg", value: 0.3 },
                  brewery_app_late_addition: true,
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

    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie },
      payload: {
        name: "Brew session test recipe",
        styleKey: "custom",
        beerJsonRecipeJson,
      },
    });
    expect(create.statusCode).toBe(200);
    recipeId = (create.json()).recipe.id as string;
  });
  afterAll(async () => {
    if (brewSessionId) {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId } });
      await app.prisma.brewSession.deleteMany({ where: { id: brewSessionId, workspaceId } });
    }
    if (recipeId) {
      await app.prisma.recipe.deleteMany({ where: { id: recipeId, workspaceId } });
    }
    await app.close();
  });
  it("creates a brew session from recipe and returns seeded steps", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.brewSession.id).toBe("string");
    expect(typeof body.brewSession.code).toBe("string");
    expect(Array.isArray(body.steps)).toBe(true);
    expect(body.steps.length).toBeGreaterThan(0);

    const startMash = (body.steps as any[]).find((s) => s?.name === "Start mash");
    expect(startMash).toBeTruthy();
    expect(startMash.minutesPlanned).toBe(70);

    const mashIn = (body.steps as any[]).find((s) => s?.name === "Mash in");
    const mashOut = (body.steps as any[]).find((s) => s?.name === "Mash out");
    expect(mashIn).toBeTruthy();
    expect(mashOut).toBeTruthy();
    expect(mashIn.relativeToStepId).toBe(startMash.id);
    expect(mashOut.relativeToStepId).toBe(startMash.id);
    expect(mashIn.offsetMinutesFromEnd).toBe(-70);
    expect(mashOut.offsetMinutesFromEnd).toBe(-10);

    const mashSteps = (body.steps as any[]).filter((s) => s?.sectionId === "mash");
    const mashInIdx = mashSteps.findIndex((s) => s?.name === "Mash in");
    expect(mashInIdx).toBeGreaterThanOrEqual(0);

    const addPaleIdx = mashSteps.findIndex((s) => String(s?.name ?? "").includes("Add fermentable: Pale malt"));
    const addRoastIdx = mashSteps.findIndex((s) => String(s?.name ?? "").includes("Add fermentable: Roasted barley"));
    expect(addPaleIdx).toBeGreaterThanOrEqual(0);
    expect(addRoastIdx).toBeGreaterThanOrEqual(0);
    expect(addPaleIdx).toBeGreaterThan(mashInIdx);

    const vorlaufIdx = mashSteps.findIndex((s) => {
      const n = String(s?.name ?? "").toLowerCase();
      return n.includes("vorlauf") || n.includes("volauf");
    });
    expect(vorlaufIdx).toBeGreaterThanOrEqual(0);
    expect(addRoastIdx).toBeLessThan(vorlaufIdx);

    brewSessionId = body.brewSession.id;
  });
  it("allows deleting a stopped session", async () => {
    // Create another session, stop it, then delete.
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json()).brewSession.id as string;

    const stop = await app.inject({
      method: "POST",
      url: `/brew-sessions/${id2}/stop`,
      headers: { cookie },
    });
    expect(stop.statusCode).toBe(200);

    const del = await app.inject({
      method: "DELETE",
      url: `/brew-sessions/${id2}`,
      headers: { cookie },
    });
    expect(del.statusCode).toBe(200);
    expect(del.json()).toEqual({ ok: true });
  });

  it("rejects deleting a running session", async () => {
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json()).brewSession.id as string;

    const start = await app.inject({
      method: "POST",
      url: `/brew-sessions/${id2}/start`,
      headers: { cookie },
    });
    expect(start.statusCode).toBe(200);

    const del = await app.inject({
      method: "DELETE",
      url: `/brew-sessions/${id2}`,
      headers: { cookie },
    });
    expect(del.statusCode).toBe(400);
    expect((del.json())?.ok).toBe(false);
  });
});
