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

  it("estimates mash pH from grist + alkalinity", async () => {
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-ph-estimate",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
        "x-account-id": "00000000-0000-0000-0000-0000000000a1",
      },
      payload: {
        volumeLiters: 10,
        alkalinityPpmCaCO3: 50,
        grist: [{ amountKg: 5, colorLovibond: 2, maltClass: "base" }],
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(body.result.estimatedMashPhRoomTemp).toBeGreaterThan(0);
    expect(body.result.estimatedMashPhRoomTemp).toBeLessThan(14);
    await app.close();
  });

  it("mash pH estimate decreases when Ca/Mg increase (RA-like)", async () => {
    const app = buildApp();
    await app.ready();

    const basePayload = {
      volumeLiters: 10,
      alkalinityPpmCaCO3: 150,
      grist: [{ amountKg: 5, mashDiPh: 5.76, mashTaToPh57_mEqPerKg: 0 }],
    };

    const resLow = await app.inject({
      method: "POST",
      url: "/water-calc/mash-ph-estimate-v1",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
        "x-account-id": "00000000-0000-0000-0000-0000000000a1",
      },
      payload: { ...basePayload, calciumPpm: 0, magnesiumPpm: 0 },
    });
    expect(resLow.statusCode).toBe(200);

    const resHigh = await app.inject({
      method: "POST",
      url: "/water-calc/mash-ph-estimate-v1",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
        "x-account-id": "00000000-0000-0000-0000-0000000000a1",
      },
      payload: { ...basePayload, calciumPpm: 100, magnesiumPpm: 20 },
    });
    expect(resHigh.statusCode).toBe(200);

    const low = (resLow.json() as any).result.estimatedMashPhRoomTemp as number;
    const high = (resHigh.json() as any).result.estimatedMashPhRoomTemp as number;
    expect(high).toBeLessThan(low);

    await app.close();
  });

  it("estimates mash pH v1 from DI pH + TA + alkalinity", async () => {
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-ph-estimate-v1",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
        "x-account-id": "00000000-0000-0000-0000-0000000000a1",
      },
      payload: {
        volumeLiters: 10,
        alkalinityPpmCaCO3: 50,
        grist: [{ amountKg: 5, mashDiPh: 5.76, mashTaToPh57_mEqPerKg: 0 }],
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(body.result.estimatedMashPhRoomTemp).toBeGreaterThan(0);
    expect(body.result.estimatedMashPhRoomTemp).toBeLessThan(14);
    await app.close();
  });

  it("solves acid amount for target mash pH (grist-driven)", async () => {
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-acidification-target-mash-ph",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
        "x-account-id": "00000000-0000-0000-0000-0000000000a1",
      },
      payload: {
        acidType: "lactic",
        strengthKind: "percent",
        strengthValue: 88,
        mashStartingAlkalinityPpmCaCO3: 200,
        mashStartingPh: 7.0,
        mashWaterVolumeLiters: 10,
        targetMashPh: 5.4,
        grist: [{ amountKg: 5, colorLovibond: 2, maltClass: "base" }],
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(body.result.acidRequiredMl).toBeTypeOf("number");
    expect(body.result.acidRequiredMl).toBeGreaterThan(0);
    expect(body.result.estimatedMashPhRoomTemp).toBeTypeOf("number");
    expect(Math.abs(body.result.estimatedMashPhRoomTemp - 5.4)).toBeLessThan(0.05);
    await app.close();
  });

  it("requires less acid for target mash pH when Ca/Mg increase (RA-like)", async () => {
    const app = buildApp();
    await app.ready();

    const basePayload = {
      acidType: "lactic",
      strengthKind: "percent",
      strengthValue: 88,
      mashStartingAlkalinityPpmCaCO3: 200,
      mashStartingPh: 7.0,
      mashWaterVolumeLiters: 10,
      targetMashPh: 5.4,
      grist: [{ amountKg: 5, colorLovibond: 2, maltClass: "base" }],
    };

    const resLow = await app.inject({
      method: "POST",
      url: "/water-calc/mash-acidification-target-mash-ph",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
        "x-account-id": "00000000-0000-0000-0000-0000000000a1",
      },
      payload: { ...basePayload, calciumPpm: 0, magnesiumPpm: 0 },
    });
    expect(resLow.statusCode).toBe(200);

    const resHigh = await app.inject({
      method: "POST",
      url: "/water-calc/mash-acidification-target-mash-ph",
      headers: {
        "x-user-id": "00000000-0000-0000-0000-000000000001",
        "x-account-id": "00000000-0000-0000-0000-0000000000a1",
      },
      payload: { ...basePayload, calciumPpm: 120, magnesiumPpm: 30 },
    });
    expect(resHigh.statusCode).toBe(200);

    const low = (resLow.json() as any).result.acidRequiredMl as number;
    const high = (resHigh.json() as any).result.acidRequiredMl as number;
    expect(high).toBeLessThan(low);

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

