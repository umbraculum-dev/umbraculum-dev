import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEV_ACCOUNT_A = "00000000-0000-0000-0000-0000000000a1";

describe("water-calc routes", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();

    await app.prisma.user.upsert({
      where: { id: DEV_USER_ID },
      create: { id: DEV_USER_ID, email: "dev@brewery.local" },
      update: { email: "dev@brewery.local" },
    });
    await app.prisma.account.upsert({
      where: { id: DEV_ACCOUNT_A },
      create: { id: DEV_ACCOUNT_A, name: "Dev Brewery A" },
      update: { name: "Dev Brewery A" },
    });
    await app.prisma.accountMember.upsert({
      where: { accountId_userId: { accountId: DEV_ACCOUNT_A, userId: DEV_USER_ID } },
      create: { accountId: DEV_ACCOUNT_A, userId: DEV_USER_ID, role: "owner" },
      update: { role: "owner" },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 400 when X-Account-Id is missing", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/sparge-acidification",
      headers: { "x-user-id": DEV_USER_ID },
      payload: { acidType: "phosphoric", strengthKind: "percent", strengthValue: 1 },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_account_id", message: "Missing header: X-Account-Id" },
    });
  });

  it("returns a result for phosphoric acid", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/sparge-acidification",
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
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
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
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

