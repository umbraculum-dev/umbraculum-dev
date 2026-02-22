import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("brew sessions (account scoped)", () => {
  const app = buildApp();
  let cookie = "";
  let accountId = "";
  let recipeId = "";
  let brewSessionId = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeAccount: true });
    cookie = sess.cookie;
    accountId = sess.accountId;

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
    recipeId = (create.json() as any).recipe.id as string;
  });

  afterAll(async () => {
    if (brewSessionId) {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId } });
      await app.prisma.brewSession.deleteMany({ where: { id: brewSessionId, accountId } });
    }
    if (recipeId) {
      await app.prisma.recipe.deleteMany({ where: { id: recipeId, accountId } });
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
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(typeof body.brewSession.id).toBe("string");
    expect(typeof body.brewSession.code).toBe("string");
    expect(Array.isArray(body.steps)).toBe(true);
    expect(body.steps.length).toBeGreaterThan(0);
    brewSessionId = body.brewSession.id;
  });

  it("can save steps order and disable flag", async () => {
    const detail = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionId}`,
      headers: { cookie },
    });
    expect(detail.statusCode).toBe(200);
    const session = (detail.json() as any).brewSession;
    const steps = session.steps as any[];
    expect(steps.length).toBeGreaterThan(1);

    const swapped = [steps[1], steps[0], ...steps.slice(2)].map((s, idx) => ({
      id: s.id,
      sectionId: s.sectionId,
      sectionName: s.sectionName,
      name: s.name,
      isDisabled: idx === 0,
      minutesPlanned: s.minutesPlanned,
    }));

    const save = await app.inject({
      method: "PATCH",
      url: `/brew-sessions/${brewSessionId}/steps`,
      headers: { cookie },
      payload: { steps: swapped },
    });
    expect(save.statusCode).toBe(200);
    const saved = save.json() as any;
    expect(saved.ok).toBe(true);
    expect(saved.steps[0].id).toBe(steps[1].id);
    expect(saved.steps[0].isDisabled).toBe(true);
  });

  it("can start/pause/stop a session", async () => {
    const start = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionId}/start`,
      headers: { cookie },
    });
    expect(start.statusCode).toBe(200);
    expect((start.json() as any).brewSession.status).toBe("running");

    const pause = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionId}/pause`,
      headers: { cookie },
    });
    expect(pause.statusCode).toBe(200);
    expect((pause.json() as any).brewSession.status).toBe("paused");

    const stop = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionId}/stop`,
      headers: { cookie },
    });
    expect(stop.statusCode).toBe(200);
    expect((stop.json() as any).brewSession.status).toBe("stopped");
  });

  it("allows deleting a stopped session", async () => {
    // Create another session, stop it, then delete.
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json() as any).brewSession.id as string;

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
    const id2 = (created.json() as any).brewSession.id as string;

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
    expect((del.json() as any)?.ok).toBe(false);
  });
});

