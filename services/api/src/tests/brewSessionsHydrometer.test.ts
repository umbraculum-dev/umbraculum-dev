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

    const createSession = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(createSession.statusCode).toBe(200);
    brewSessionId = (createSession.json()).brewSession.id as string;
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
  it("can start/pause/stop a session", async () => {
    const start = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionId}/start`,
      headers: { cookie },
    });
    expect(start.statusCode).toBe(200);
    expect((start.json()).brewSession.status).toBe("running");

    const pause = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionId}/pause`,
      headers: { cookie },
    });
    expect(pause.statusCode).toBe(200);
    expect((pause.json()).brewSession.status).toBe("paused");

    const stop = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionId}/stop`,
      headers: { cookie },
      payload: { reason: "manual" },
    });
    expect(stop.statusCode).toBe(200);
    expect((stop.json()).brewSession.status).toBe("stopped");

    const detail = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionId}`,
      headers: { cookie },
    });
    expect(detail.statusCode).toBe(200);
    const logs = ((detail.json()).brewSession.logs ?? []) as any[];
    const stoppedLog = logs.find((l) => l?.kind === "session_stopped");
    expect(stoppedLog).toBeTruthy();
    expect(stoppedLog.payloadJson?.reason).toBe("manual");
  });
  it("stores stop reason in session_stopped log payload", async () => {
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json()).brewSession.id as string;

    try {
      const stopAuto = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/stop`,
        headers: { cookie },
        payload: { reason: "auto" },
      });
      expect(stopAuto.statusCode).toBe(200);
      expect((stopAuto.json()).brewSession.status).toBe("stopped");

      const detail = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail.statusCode).toBe(200);
      const logs = ((detail.json()).brewSession.logs ?? []) as any[];
      const stoppedLog = logs.find((l) => l?.kind === "session_stopped");
      expect(stoppedLog).toBeTruthy();
      expect(stoppedLog.payloadJson?.reason).toBe("auto");
    } finally {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSession.deleteMany({ where: { id: id2, workspaceId } });
    }
  });
});
