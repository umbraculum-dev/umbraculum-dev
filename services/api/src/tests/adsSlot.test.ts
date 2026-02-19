import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

const SAMPLE_AD_GLOBAL_TOP_ID = "00000000-0000-0000-0000-00000000ad01";

describe("ads slot resolution", () => {
  const app = buildApp();
  let cookie = "";
  let accountId = "";

  beforeAll(async () => {
    await app.ready();

    const sess = await createSessionForTestUser(app, { activeAccount: true });
    cookie = sess.cookie;
    accountId = sess.accountId;

    await app.prisma.account.update({ where: { id: accountId }, data: { adsDisabled: false }, select: { id: true } });
  });

  afterAll(async () => {
    await app.prisma.account.update({ where: { id: accountId }, data: { adsDisabled: false }, select: { id: true } }).catch(() => {});
    await app.close();
  });

  it("returns configured ad when ads are enabled", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/ads/slot/global_top?platform=web",
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      ok: true,
      placement: "global_top",
      platform: "web",
      disabled: false,
      ad: {
        id: SAMPLE_AD_GLOBAL_TOP_ID,
      },
    });
  });

  it("returns ad=null when no ad is configured for a placement", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/ads/slot/global_bottom?platform=web",
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      ok: true,
      placement: "global_bottom",
      platform: "web",
      disabled: false,
      ad: null,
    });
  });

  it("returns disabled=true for accounts with ads disabled", async () => {
    await app.prisma.account.update({ where: { id: accountId }, data: { adsDisabled: true }, select: { id: true } });

    const res = await app.inject({
      method: "GET",
      url: "/ads/slot/global_top?platform=web",
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      ok: true,
      placement: "global_top",
      platform: "web",
      disabled: true,
      ad: null,
    });

    await app.prisma.account.update({ where: { id: accountId }, data: { adsDisabled: false }, select: { id: true } });
  });
});

