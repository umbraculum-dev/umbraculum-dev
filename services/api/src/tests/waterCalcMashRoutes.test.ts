import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

describe("water calc: mash acidification + salt additions", () => {
  it("requires X-Account-Id for mash-acidification", async () => {
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-acidification",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
      },
      payload: {
        acidType: "phosphoric",
        strengthKind: "percent",
        strengthValue: 10,
        mashStartingAlkalinityPpmCaCO3: 50,
        mashStartingPh: 7.0,
        mashTargetPh: 5.6,
        mashWaterVolumeLiters: 10,
      },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it("estimates achieved pH for mash manual acid entry", async () => {
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-acidification-manual",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
        "x-account-id": "00000000-0000-0000-0000-0000000000a1",
      },
      payload: {
        acidType: "phosphoric",
        strengthKind: "percent",
        strengthValue: 10,
        mashStartingAlkalinityPpmCaCO3: 50,
        mashStartingPh: 7.0,
        mashWaterVolumeLiters: 10,
        acidAddedMl: 1.5,
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(body.result.achievedPh).toBeGreaterThan(3.0);
    expect(body.result.achievedPh).toBeLessThan(8.0);
    await app.close();
  });

  it("computes salt additions", async () => {
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/salt-additions",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
        "x-account-id": "00000000-0000-0000-0000-0000000000a1",
      },
      payload: {
        volumeLiters: 10,
        baseProfile: {
          calcium: 0,
          magnesium: 0,
          sodium: 0,
          sulfate: 0,
          chloride: 0,
          bicarbonate: 0,
        },
        additions: [{ saltKey: "gypsum", grams: 1 }],
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(body.result.resultingProfile.calcium).toBeGreaterThan(0);
    expect(body.result.resultingProfile.sulfate).toBeGreaterThan(0);
    await app.close();
  });
});

