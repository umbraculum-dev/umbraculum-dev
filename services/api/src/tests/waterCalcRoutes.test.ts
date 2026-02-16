import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("water-calc routes", () => {
  const app = buildApp();
  let cookieWithAccount = "";
  let cookieNoAccount = "";

  beforeAll(async () => {
    await app.ready();
    cookieWithAccount = (await createSessionForTestUser(app, { activeAccount: true })).cookie;
    cookieNoAccount = (await createSessionForTestUser(app, { activeAccount: false })).cookie;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 401 when active account is missing", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/sparge-acidification",
      headers: { cookie: cookieNoAccount },
      payload: { acidType: "phosphoric", strengthKind: "percent", strengthValue: 1 },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_active_account", message: "No active account selected" },
    });
  });

  it("returns a result for phosphoric acid", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/sparge-acidification",
      headers: { cookie: cookieWithAccount },
      payload: {
        startingAlkalinityPpmCaCO3: 0,
        startingPh: 7,
        targetPh: 5.6,
        volumeLiters: 3.785,
        acidType: "phosphoric",
        strengthKind: "percent",
        strengthValue: 1,
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(body.result).toBeTruthy();
    expect(body.result.acidRequiredMl).toBeCloseTo(0.361072950558936, 9);
  });

  it("estimates achieved pH from a manual acid amount", async () => {
    const acidAddedMl = 0.361072950558936;
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/sparge-acidification-manual",
      headers: { cookie: cookieWithAccount },
      payload: {
        startingAlkalinityPpmCaCO3: 0,
        startingPh: 7,
        volumeLiters: 3.785,
        acidType: "phosphoric",
        strengthKind: "percent",
        strengthValue: 1,
        acidAddedMl,
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(body.result).toBeTruthy();
    expect(body.result.achievedPh).toBeCloseTo(5.6, 2);
    expect(body.result.predicted.acidRequiredMl).toBeCloseTo(acidAddedMl, 3);
  });
});

