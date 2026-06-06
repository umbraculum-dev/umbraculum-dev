import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

// Phase 4b-1 regression-pin: cross-workspace isolation on the brew-sessions surface.
//
// The Phase 4a route surface audit (docs/TESTING.md → "Phase 4a route surface
// audit") identified this as the single highest-signal L2 coverage gap: 17
// routes on `services/api/src/modules/brewery/routes/brewSessions.ts`
// (relocated in Week 1 audit per RFC-0006) operate on
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

