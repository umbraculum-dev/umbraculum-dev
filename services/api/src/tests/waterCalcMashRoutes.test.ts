import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("water calc: mash acidification + salt additions", () => {
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

  it("requires an active account for mash-acidification", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-acidification",
      headers: { cookie: cookieNoAccount },
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
    expect(res.statusCode).toBe(401);
  });

  it("estimates achieved pH for mash manual acid entry", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-acidification-manual",
      headers: { cookie: cookieWithAccount },
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
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.result.achievedPh).toBeGreaterThan(3.0);
    expect(body.result.achievedPh).toBeLessThan(8.0);
  });

  it("estimates mash pH from grist + alkalinity", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-ph-estimate",
      headers: { cookie: cookieWithAccount },
      payload: {
        volumeLiters: 10,
        alkalinityPpmCaCO3: 50,
        grist: [{ amountKg: 5, colorLovibond: 2, maltClass: "base" }],
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.result.estimatedMashPhRoomTemp).toBeGreaterThan(0);
    expect(body.result.estimatedMashPhRoomTemp).toBeLessThan(14);
  });

  it("mash pH estimate decreases when Ca/Mg increase (RA-like)", async () => {
    const basePayload = {
      volumeLiters: 10,
      alkalinityPpmCaCO3: 150,
      grist: [{ amountKg: 5, mashDiPh: 5.76, mashTaToPh57_mEqPerKg: 0, colorLovibond: 2, maltClass: "base" }],
    };

    const resLow = await app.inject({
      method: "POST",
      url: "/water-calc/mash-ph-estimate",
      headers: { cookie: cookieWithAccount },
      payload: { ...basePayload, calciumPpm: 0, magnesiumPpm: 0 },
    });
    expect(resLow.statusCode).toBe(200);

    const resHigh = await app.inject({
      method: "POST",
      url: "/water-calc/mash-ph-estimate",
      headers: { cookie: cookieWithAccount },
      payload: { ...basePayload, calciumPpm: 100, magnesiumPpm: 20 },
    });
    expect(resHigh.statusCode).toBe(200);

    const low = (resLow.json()).result.estimatedMashPhRoomTemp as number;
    const high = (resHigh.json()).result.estimatedMashPhRoomTemp as number;
    expect(high).toBeLessThan(low);
  });

  it("estimates mash pH v1 from DI pH + TA + alkalinity", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-ph-estimate",
      headers: { cookie: cookieWithAccount },
      payload: {
        volumeLiters: 10,
        alkalinityPpmCaCO3: 50,
        grist: [{ amountKg: 5, mashDiPh: 5.76, mashTaToPh57_mEqPerKg: 0, colorLovibond: 2, maltClass: "base" }],
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.result.estimatedMashPhRoomTemp).toBeGreaterThan(0);
    expect(body.result.estimatedMashPhRoomTemp).toBeLessThan(14);
  });

  it("solves acid amount for target mash pH (grist-driven)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/mash-acidification-target-mash-ph",
      headers: { cookie: cookieWithAccount },
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
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.result.acidRequiredMl).toBeTypeOf("number");
    expect(body.result.acidRequiredMl).toBeGreaterThan(0);
    expect(body.result.estimatedMashPhRoomTemp).toBeTypeOf("number");
    // Heuristic solver + model coupling: keep the check loose enough to avoid brittle failures
    // while still ensuring the solver meaningfully targets the requested mash pH.
    expect(Math.abs(body.result.estimatedMashPhRoomTemp - 5.4)).toBeLessThan(0.15);
  });

  it("requires less acid for target mash pH when Ca/Mg increase (RA-like)", async () => {
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
      headers: { cookie: cookieWithAccount },
      payload: { ...basePayload, calciumPpm: 0, magnesiumPpm: 0 },
    });
    expect(resLow.statusCode).toBe(200);

    const resHigh = await app.inject({
      method: "POST",
      url: "/water-calc/mash-acidification-target-mash-ph",
      headers: { cookie: cookieWithAccount },
      payload: { ...basePayload, calciumPpm: 120, magnesiumPpm: 30 },
    });
    expect(resHigh.statusCode).toBe(200);

    const low = (resLow.json()).result.acidRequiredMl as number;
    const high = (resHigh.json()).result.acidRequiredMl as number;
    expect(high).toBeLessThan(low);
  });

  it("computes salt additions", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-calc/salt-additions",
      headers: { cookie: cookieWithAccount },
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
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.result.resultingProfile.calcium).toBeGreaterThan(0);
    expect(body.result.resultingProfile.sulfate).toBeGreaterThan(0);
  });

  it("mash-overall manual mode uses grist-driven mash pH estimate when grist is provided", async () => {
    const basePayload = {
      mashMode: "manual",
      mashStartingAlkalinityPpmCaCO3: 248,
      mashStartingPh: 7.0,
      mashTargetPh: 5.4,
      mashWaterVolumeLiters: 30,
      acidType: "phosphoric",
      strengthKind: "percent",
      strengthValue: 75,
      acidAddedMl: 10,
      baseProfile: {
        calcium: 0,
        magnesium: 0,
        sodium: 0,
        sulfate: 0,
        chloride: 0,
        // 248 ppm as CaCO3 ≈ 302.56 ppm as HCO3
        bicarbonate: 302.56,
      },
      additions: [
        { saltKey: "gypsum", grams: 5 },
        { saltKey: "calcium_chloride", grams: 15 },
      ],
    };

    const resNoGrist = await app.inject({
      method: "POST",
      url: "/water-calc/mash-overall",
      headers: { cookie: cookieWithAccount },
      payload: basePayload,
    });
    expect(resNoGrist.statusCode).toBe(200);

    const resWithGrist = await app.inject({
      method: "POST",
      url: "/water-calc/mash-overall",
      headers: { cookie: cookieWithAccount },
      payload: {
        ...basePayload,
        grist: [
          {
            amountKg: 6,
            mashDiPh: 5.76,
            mashTaToPh57_mEqPerKg: 50,
            colorLovibond: 2,
            maltClass: "base",
          },
        ],
      },
    });
    expect(resWithGrist.statusCode).toBe(200);

    const phNoGrist = ((resNoGrist.json()).result.ph.value ?? NaN) as number;
    const phWithGrist = ((resWithGrist.json()).result.ph.value ?? NaN) as number;

    expect(Number.isFinite(phNoGrist)).toBe(true);
    expect(Number.isFinite(phWithGrist)).toBe(true);
    // Grist should pull estimated mash pH downward vs water-only manual estimate.
    expect(phWithGrist).toBeLessThan(phNoGrist);
  });
});

