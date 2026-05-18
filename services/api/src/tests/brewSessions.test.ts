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

  it("can save steps order and disable flag", async () => {
    const detail = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionId}`,
      headers: { cookie },
    });
    expect(detail.statusCode).toBe(200);
    const session = (detail.json()).brewSession;
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
    const saved = save.json();
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

  it("pauses/stops all running step timers when session is paused/stopped", async () => {
    // Create a fresh session for this behavior test.
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json()).brewSession.id as string;

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
      const steps1 = ((detail1.json()).brewSession.steps ?? []) as any[];
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
      expect((paused.json()).brewSession.status).toBe("paused");

      const detail2 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail2.statusCode).toBe(200);
      const steps2 = ((detail2.json()).brewSession.steps ?? []) as any[];
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
      expect((stopped.json()).brewSession.status).toBe("stopped");

      const detail3 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail3.statusCode).toBe(200);
      const steps3 = ((detail3.json()).brewSession.steps ?? []) as any[];
      const updated3 = steps3.find((s) => s.id === stepId);
      expect(updated3).toBeTruthy();
      expect(updated3.timerState).toBe("stopped");
      expect(updated3.timerStoppedAt).toBeTruthy();
    } finally {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSession.deleteMany({ where: { id: id2, workspaceId } });
    }
  });

  it("resumes step timers paused by session pause when session resumes", async () => {
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json()).brewSession.id as string;

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
      const steps1 = ((detail1.json()).brewSession.steps ?? []) as any[];
      const mashAnchor = steps1.find((s) => s?.name === "Start mash") ?? steps1[0];
      expect(mashAnchor?.id).toBeTruthy();

      const timerStarted = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/steps/${mashAnchor.id}/timer/start`,
        headers: { cookie },
      });
      expect(timerStarted.statusCode).toBe(200);
      expect((timerStarted.json()).step.timerState).toBe("running");

      const paused = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/pause`,
        headers: { cookie },
      });
      expect(paused.statusCode).toBe(200);
      expect((paused.json()).brewSession.status).toBe("paused");

      const resumed = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/start`,
        headers: { cookie },
      });
      expect(resumed.statusCode).toBe(200);
      expect((resumed.json()).brewSession.status).toBe("running");

      const detail2 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail2.statusCode).toBe(200);
      const steps2 = ((detail2.json()).brewSession.steps ?? []) as any[];
      const mash2 = steps2.find((s) => s.id === mashAnchor.id);
      expect(mash2).toBeTruthy();
      expect(mash2.timerState).toBe("running");
      expect(mash2.timerLastStartedAt).toBeTruthy();
    } finally {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSession.deleteMany({ where: { id: id2, workspaceId } });
    }
  });

  it("persists customTimerEnabled on a step", async () => {
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json()).brewSession.id as string;

    try {
      const detail1 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail1.statusCode).toBe(200);
      const steps1 = ((detail1.json()).brewSession.steps ?? []) as any[];
      expect(steps1.length).toBeGreaterThan(0);
      const stepId = steps1[0].id as string;

      const patch = await app.inject({
        method: "PATCH",
        url: `/brew-sessions/${id2}/steps/${stepId}`,
        headers: { cookie },
        payload: { customTimerEnabled: true },
      });
      expect(patch.statusCode).toBe(200);
      expect((patch.json())?.ok).toBe(true);
      expect((patch.json())?.step?.customTimerEnabled).toBe(true);

      const timerStarted = await app.inject({
        method: "POST",
        url: `/brew-sessions/${id2}/steps/${stepId}/timer/start`,
        headers: { cookie },
      });
      expect(timerStarted.statusCode).toBe(200);

      const detail2 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail2.statusCode).toBe(200);
      const steps2 = ((detail2.json()).brewSession.steps ?? []) as any[];
      const updated = steps2.find((s) => s.id === stepId);
      expect(updated).toBeTruthy();
      expect(updated.customTimerEnabled).toBe(true);
    } finally {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSession.deleteMany({ where: { id: id2, workspaceId } });
    }
  });

  it("allows removing a step even if others referenced it", async () => {
    const created = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(created.statusCode).toBe(200);
    const id2 = (created.json()).brewSession.id as string;

    try {
      const detail1 = await app.inject({
        method: "GET",
        url: `/brew-sessions/${id2}`,
        headers: { cookie },
      });
      expect(detail1.statusCode).toBe(200);
      const steps1 = ((detail1.json()).brewSession.steps ?? []) as any[];
      expect(steps1.length).toBeGreaterThan(1);

      const base = steps1.find((s) => typeof s?.minutesPlanned === "number" && s.minutesPlanned > 0) ?? steps1[0];
      const baseId = base.id as string;

      // Force another step to reference base as a relative anchor.
      const other = steps1.find((s) => s.id !== baseId) ?? steps1[1];
      const otherId = other.id as string;

      const payload = steps1.map((s: any, _idx: number) => ({
        id: s.id,
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        name: s.name,
        isDisabled: !!s.isDisabled,
        minutesPlanned: s.minutesPlanned,
        relativeToStepId: s.id === otherId ? baseId : s.relativeToStepId,
        offsetMinutesFromEnd: s.id === otherId ? -1 : s.offsetMinutesFromEnd,
        customTimerEnabled: !!s.customTimerEnabled,
      }));

      const save1 = await app.inject({
        method: "PATCH",
        url: `/brew-sessions/${id2}/steps`,
        headers: { cookie },
        payload: { steps: payload },
      });
      expect(save1.statusCode).toBe(200);

      const removedPayload = payload.filter((s: any) => s.id !== baseId);
      const save2 = await app.inject({
        method: "PATCH",
        url: `/brew-sessions/${id2}/steps`,
        headers: { cookie },
        payload: { steps: removedPayload },
      });
      expect(save2.statusCode).toBe(200);
      const stepsOut = (save2.json()).steps as any[];
      expect(stepsOut.some((s) => s.id === baseId)).toBe(false);
      const otherOut = stepsOut.find((s) => s.id === otherId);
      expect(otherOut).toBeTruthy();
      // Reference must be cleared when the base step is removed.
      expect(otherOut.relativeToStepId).toBe(null);
      expect(otherOut.offsetMinutesFromEnd).toBe(null);
    } finally {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: id2 } });
      await app.prisma.brewSession.deleteMany({ where: { id: id2, workspaceId } });
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

// Phase 4b-1 regression-pin: cross-workspace isolation on the brew-sessions surface.
//
// The Phase 4a route surface audit (docs/TESTING.md → "Phase 4a route surface
// audit") identified this as the single highest-signal L2 coverage gap: 17
// routes on `services/api/src/routes/brewSessions.ts` operate on
// `:brewSessionId` path params, but the existing `brew sessions (account
// scoped)` describe block above uses ONE workspace/cookie throughout. A
// missing scope filter in a route handler (e.g. forgetting
// `where: { workspaceId: ctx.activeWorkspaceId }` on a Prisma query) would
// silently leak another workspace's session.
//
// This block sets up TWO independent workspaces (A creates a brew session;
// B has its own workspace but no relationship to A's data) and asserts
// that B trying to touch A's `brewSessionId` returns 404 (the standard
// "don't leak existence" pattern used by `BrewSessionsService.getSessionDetail`
// → `NotFoundError("brew_session_not_found")` → HTTP 404 in
// `services/api/src/errors.ts:32-34`).
//
// Scope chosen per the Phase 4a backlog (Phase 4b-1: ~6 highest-risk
// routes): GET detail + PATCH date + DELETE + start/pause/stop.
// Step-mutating routes (PATCH /steps, timer routes, log) are not pinned
// here — their workspace scope is enforced by the same `assertMembership`
// + `findFirst({ where: { workspaceId } })` plumbing the 6 routes pinned
// here share, so once these 6 are green a missing scope filter on the
// step-mutating routes would be a separate, easy-to-add follow-on.
describe("brew sessions cross-workspace isolation (Phase 4b-1)", () => {
  const app = buildApp();
  let cookieA = "";
  let cookieB = "";
  let workspaceIdA = "";
  let recipeIdA = "";
  let brewSessionIdA = "";

  beforeAll(async () => {
    await app.ready();

    // Persona A: owns the recipe + brew session.
    const sessA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessA.cookie;
    workspaceIdA = sessA.workspaceId;

    // Persona B: independent workspace; never given access to A's data.
    // Used purely as the cross-workspace probe.
    const sessB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessB.cookie;

    const createRecipe = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Phase 4b-1 isolation recipe",
        styleKey: "custom",
        beerJsonRecipeJson: {
          beerjson: {
            version: 1,
            recipes: [
              {
                name: "Phase 4b-1 isolation recipe",
                type: "all grain",
                author: "brewery-app",
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
        },
      },
    });
    expect(createRecipe.statusCode).toBe(200);
    recipeIdA = (createRecipe.json()).recipe.id as string;

    const createSession = await app.inject({
      method: "POST",
      url: `/recipes/${recipeIdA}/brew-sessions`,
      headers: { cookie: cookieA },
    });
    expect(createSession.statusCode).toBe(200);
    brewSessionIdA = (createSession.json()).brewSession.id as string;
  });

  afterAll(async () => {
    if (brewSessionIdA) {
      await app.prisma.brewSessionLog.deleteMany({ where: { brewSessionId: brewSessionIdA } });
      await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: brewSessionIdA } });
      await app.prisma.brewSession.deleteMany({
        where: { id: brewSessionIdA, workspaceId: workspaceIdA },
      });
    }
    if (recipeIdA) {
      await app.prisma.recipe.deleteMany({ where: { id: recipeIdA, workspaceId: workspaceIdA } });
    }
    await app.close();
  });

  it("baseline sanity: persona A can GET its own brew session (200)", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionIdA}`,
      headers: { cookie: cookieA },
    });
    expect(res.statusCode).toBe(200);
    expect((res.json()).brewSession.id).toBe(brewSessionIdA);
  });

  it("GET /brew-sessions/:id from another workspace returns 404 (not 200)", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionIdA}`,
      headers: { cookie: cookieB },
    });
    expect(res.statusCode).toBe(404);
  });

  it("PATCH /brew-sessions/:id from another workspace returns 404", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/brew-sessions/${brewSessionIdA}`,
      headers: { cookie: cookieB },
      payload: { scheduledDate: new Date().toISOString() },
    });
    expect(res.statusCode).toBe(404);
  });

  it("DELETE /brew-sessions/:id from another workspace returns 404", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: `/brew-sessions/${brewSessionIdA}`,
      headers: { cookie: cookieB },
    });
    expect(res.statusCode).toBe(404);

    // Belt-and-suspenders: the session must still exist in A's workspace.
    const stillThere = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionIdA}`,
      headers: { cookie: cookieA },
    });
    expect(stillThere.statusCode).toBe(200);
  });

  it("POST /brew-sessions/:id/start from another workspace returns 404", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionIdA}/start`,
      headers: { cookie: cookieB },
    });
    expect(res.statusCode).toBe(404);

    // Belt-and-suspenders: the session in A's workspace must still be in
    // its pre-start status (i.e. not silently mutated by B's call).
    const stillDraft = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionIdA}`,
      headers: { cookie: cookieA },
    });
    expect(stillDraft.statusCode).toBe(200);
    expect((stillDraft.json()).brewSession.status).toBe("draft");
  });

  it("POST /brew-sessions/:id/pause from another workspace returns 404", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionIdA}/pause`,
      headers: { cookie: cookieB },
    });
    expect(res.statusCode).toBe(404);
  });

  it("POST /brew-sessions/:id/stop from another workspace returns 404", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionIdA}/stop`,
      headers: { cookie: cookieB },
    });
    expect(res.statusCode).toBe(404);
  });
});

