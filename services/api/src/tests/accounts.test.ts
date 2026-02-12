import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEV_ACCOUNT_ID = "00000000-0000-0000-0000-0000000000a1";

describe("auth headers + accounts", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();

    // Ensure seed baseline exists (tests should be repeatable).
    await app.prisma.user.upsert({
      where: { id: DEV_USER_ID },
      create: { id: DEV_USER_ID, email: "dev@brewery.local" },
      update: { email: "dev@brewery.local" },
    });

    await app.prisma.account.upsert({
      where: { id: DEV_ACCOUNT_ID },
      create: { id: DEV_ACCOUNT_ID, name: "Dev Brewery" },
      update: { name: "Dev Brewery" },
    });

    await app.prisma.accountMember.upsert({
      where: { accountId_userId: { accountId: DEV_ACCOUNT_ID, userId: DEV_USER_ID } },
      create: { accountId: DEV_ACCOUNT_ID, userId: DEV_USER_ID, role: "owner" },
      update: { role: "owner" },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects /me when headers are missing", async () => {
    const res = await app.inject({ method: "GET", url: "/me" });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_auth", message: "Missing auth headers" },
    });
  });

  it("lists accounts for seeded user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/accounts",
      headers: {
        "x-user-id": DEV_USER_ID,
        "x-account-id": DEV_ACCOUNT_ID,
      },
    });
    expect(res.statusCode).toBe(200);

    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.accounts)).toBe(true);
    expect(body.accounts.some((a: any) => a.id === DEV_ACCOUNT_ID)).toBe(true);
  });
});

