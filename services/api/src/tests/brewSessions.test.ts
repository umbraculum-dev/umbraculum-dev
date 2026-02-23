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
      payload: { reason: "manual" },
    });
    expect(stop.statusCode).toBe(200);
    expect((stop.json() as any).brewSession.status).toBe("stopped");

    const detail = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionId}`,
      headers: { cookie },
    });
    expect(detail.statusCode).toBe(200);
    const logs = ((detail.json() as any).brewSession.logs ?? []) as any[];
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
    const id2 = (created.json() as any).brewSession.id as string;

    try {
      const stopAuto = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/stop`,
        headers: { cookie },
        payload: { reason: "auto" },
      });
      expect(stopAuto.statusCode).toBe(200);
      expect((stopAuto.json() as any).brewSession.status).toBe("stopped");

      const detail = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail.statusCode).toBe(200);
      const logs = ((detail.json() as any).brewSession.logs ?? []) as any[];
      const stoppedLog = logs.find((l) => l?.kind === "session_stopped");
      expect(stoppedLog).toBeTruthy();
      expect(stoppedLog.payloadJson?.reason).toBe("auto");
    } finally {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSession.deleteMany({ where: { id: id2, accountId } });
    }
  });

  it("pauses/stops all running step timers when session is paused/stopped", async () => {
    // Create a fresh session for this behavior test.
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json() as any).brewSession.id as string;

    try {
      const started = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/start`,
        headers: { cookie },
      });
      expect(started.statusCode).toBe(200);

      const detail1 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail1.statusCode).toBe(200);
      const steps1 = ((detail1.json() as any).brewSession.steps ?? []) as any[];
      expect(steps1.length).toBeGreaterThan(0);
      const stepId = steps1[0].id as string;

      const timerStarted = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/steps/${stepId}/timer/start`,
        headers: { cookie },
      });
      expect(timerStarted.statusCode).toBe(200);

      const paused = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/pause`,
        headers: { cookie },
      });
      expect(paused.statusCode).toBe(200);
      expect((paused.json() as any).brewSession.status).toBe("paused");

      const detail2 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail2.statusCode).toBe(200);
      const steps2 = ((detail2.json() as any).brewSession.steps ?? []) as any[];
      const updated2 = steps2.find((s) => s.id === stepId);
      expect(updated2).toBeTruthy();
      expect(updated2.timerState).toBe("paused");
      expect(updated2.timerPausedAt).toBeTruthy();
      expect(updated2.timerLastStartedAt).toBe(null);

      const stopped = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/stop`,
        headers: { cookie },
      });
      expect(stopped.statusCode).toBe(200);
      expect((stopped.json() as any).brewSession.status).toBe("stopped");

      const detail3 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail3.statusCode).toBe(200);
      const steps3 = ((detail3.json() as any).brewSession.steps ?? []) as any[];
      const updated3 = steps3.find((s) => s.id === stepId);
      expect(updated3).toBeTruthy();
      expect(updated3.timerState).toBe("stopped");
      expect(updated3.timerStoppedAt).toBeTruthy();
    } finally {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSession.deleteMany({ where: { id: id2, accountId } });
    }
  });

  it("resumes step timers paused by session pause when session resumes", async () => {
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json() as any).brewSession.id as string;

    try {
      const started = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/start`,
        headers: { cookie },
      });
      expect(started.statusCode).toBe(200);

      const detail1 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail1.statusCode).toBe(200);
      const steps1 = ((detail1.json() as any).brewSession.steps ?? []) as any[];
      const mashAnchor = steps1.find((s) => s?.name === "Start mash") ?? steps1[0];
      expect(mashAnchor?.id).toBeTruthy();

      const timerStarted = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/steps/${mashAnchor.id}/timer/start`,
        headers: { cookie },
      });
      expect(timerStarted.statusCode).toBe(200);
      expect((timerStarted.json() as any).step.timerState).toBe("running");

      const paused = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/pause`,
        headers: { cookie },
      });
      expect(paused.statusCode).toBe(200);
      expect((paused.json() as any).brewSession.status).toBe("paused");

      const resumed = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/start`,
        headers: { cookie },
      });
      expect(resumed.statusCode).toBe(200);
      expect((resumed.json() as any).brewSession.status).toBe("running");

      const detail2 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail2.statusCode).toBe(200);
      const steps2 = ((detail2.json() as any).brewSession.steps ?? []) as any[];
      const mash2 = steps2.find((s) => s.id === mashAnchor.id);
      expect(mash2).toBeTruthy();
      expect(mash2.timerState).toBe("running");
      expect(mash2.timerLastStartedAt).toBeTruthy();
    } finally {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSession.deleteMany({ where: { id: id2, accountId } });
    }
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

