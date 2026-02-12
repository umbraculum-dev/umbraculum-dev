import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEV_ACCOUNT_A = "00000000-0000-0000-0000-0000000000a1";
const VIEWER_USER_ID = "00000000-0000-0000-0000-000000000002";

describe("water-profiles", () => {
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

    await app.prisma.user.upsert({
      where: { id: VIEWER_USER_ID },
      create: { id: VIEWER_USER_ID, email: "viewer@brewery.local" },
      update: { email: "viewer@brewery.local" },
    });
    await app.prisma.accountMember.upsert({
      where: { accountId_userId: { accountId: DEV_ACCOUNT_A, userId: VIEWER_USER_ID } },
      create: { accountId: DEV_ACCOUNT_A, userId: VIEWER_USER_ID, role: "viewer" },
      update: { role: "viewer" },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("requires X-User-Id for GET /water-profiles", async () => {
    const res = await app.inject({ method: "GET", url: "/water-profiles" });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_auth", message: "Missing auth headers" },
    });
  });

  it("lists system profiles for user (no account header)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/water-profiles",
      headers: { "x-user-id": DEV_USER_ID },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.system)).toBe(true);
    expect(body.system.length).toBeGreaterThan(10);
    expect(Array.isArray(body.public)).toBe(true);
    expect(Array.isArray(body.account)).toBe(true);
    expect(body.account.length).toBe(0);
  });

  it("prevents non-admin from creating a profile", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-profiles",
      headers: { "x-user-id": VIEWER_USER_ID, "x-account-id": DEV_ACCOUNT_A },
      payload: {
        scope: "public",
        type: "water",
        name: "My City Water",
        calcium: 10,
        magnesium: 2,
        sodium: 5,
        sulfate: 8,
        chloride: 7,
        bicarbonate: 25,
      },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "insufficient_role", message: "Only brewery admins can manage water profiles" },
    });
  });

  it("admin can create and verify/unverify a profile", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/water-profiles",
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
      payload: {
        scope: "public",
        type: "water",
        name: "Test Profile",
        calcium: 10,
        magnesium: 2,
        sodium: 5,
        sulfate: 8,
        chloride: 7,
        bicarbonate: 25,
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);
    expect(created.profile.scope).toBe("public");
    expect(created.profile.verificationStatus).toBe("unverified");

    const verify = await app.inject({
      method: "POST",
      url: `/water-profiles/${created.profile.id}/verify`,
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
    });
    expect(verify.statusCode).toBe(200);
    const verified = verify.json() as any;
    expect(verified.ok).toBe(true);
    expect(verified.profile.verificationStatus).toBe("verified");

    const unverify = await app.inject({
      method: "POST",
      url: `/water-profiles/${created.profile.id}/unverify`,
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
    });
    expect(unverify.statusCode).toBe(200);
    const unverified = unverify.json() as any;
    expect(unverified.ok).toBe(true);
    expect(unverified.profile.verificationStatus).toBe("unverified");
  });
});

