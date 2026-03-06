import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("tilt integrations (device attach)", () => {
  const app = buildApp();
  let cookie = "";
  let workspaceId = "";
  let recipeId = "";
  let brewSessionId1 = "";
  let brewSessionId2 = "";
  let integrationId = "";
  let deviceId = "";
  let integrationToken = "";

  const ensureIntegrationAndDevice = async () => {
    if (integrationId && integrationToken && deviceId) return;
    const createIntegration = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/integrations/tilt`,
      headers: { cookie },
    });
    expect(createIntegration.statusCode).toBe(200);
    const ci = createIntegration.json() as any;
    integrationId = ci.integrationId as string;
    integrationToken = ci.token as string;

    const first = await app.inject({
      method: "POST",
      url: `/integrations/tilt/${encodeURIComponent(integrationToken)}`,
      payload: { Temp: "68.0", SG: "1.050", Color: "ORANGE", Beer: "test", Comment: "" },
    });
    expect(first.statusCode).toBe(200);
    deviceId = (first.json() as any).deviceId as string;
  };

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeWorkspace: true });
    cookie = sess.cookie;
    workspaceId = sess.workspaceId;

    const beerJsonRecipeJson = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Tilt integration test recipe",
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
                {
                  name: "Mash out",
                  type: "temperature",
                  step_temperature: { unit: "C", value: 72 },
                  step_time: { unit: "min", value: 10 },
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
    };

    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie },
      payload: { name: "Tilt integration test recipe", styleKey: "custom", beerJsonRecipeJson },
    });
    expect(create.statusCode).toBe(200);
    recipeId = (create.json() as any).recipe.id as string;

    const bs1 = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(bs1.statusCode).toBe(200);
    brewSessionId1 = (bs1.json() as any).brewSession.id as string;

    const bs2 = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/brew-sessions`,
      headers: { cookie },
    });
    expect(bs2.statusCode).toBe(200);
    brewSessionId2 = (bs2.json() as any).brewSession.id as string;
  });

  afterAll(async () => {
    if (integrationId) {
      await app.prisma.integrationReading.deleteMany({
        where: { device: { integrationId } },
      });
      await app.prisma.integrationDeviceAttachment.deleteMany({
        where: { device: { integrationId } },
      });
      await app.prisma.integrationDevice.deleteMany({ where: { integrationId } });
      await app.prisma.integration.deleteMany({ where: { id: integrationId } });
    }

    if (brewSessionId1 || brewSessionId2) {
      await app.prisma.brewSessionLog.deleteMany({
        where: { brewSessionId: { in: [brewSessionId1, brewSessionId2].filter(Boolean) as string[] } },
      });
      await app.prisma.brewSessionStep.deleteMany({
        where: { brewSessionId: { in: [brewSessionId1, brewSessionId2].filter(Boolean) as string[] } },
      });
      await app.prisma.brewSession.deleteMany({
        where: { id: { in: [brewSessionId1, brewSessionId2].filter(Boolean) as string[] }, workspaceId },
      });
    }

    if (recipeId) {
      await app.prisma.recipe.deleteMany({ where: { id: recipeId, workspaceId } });
    }

    await app.close();
  });

  it("ingests readings, then routes them to the active attachment", async () => {
    const createIntegration = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/integrations/tilt`,
      headers: { cookie },
    });
    expect(createIntegration.statusCode).toBe(200);
    const ci = createIntegration.json() as any;
    expect(ci.ok).toBe(true);
    expect(typeof ci.token).toBe("string");
    expect(typeof ci.integrationId).toBe("string");
    integrationId = ci.integrationId as string;

    const token = ci.token as string;
    integrationToken = token;
    const first = await app.inject({
      method: "POST",
      url: `/integrations/tilt/${encodeURIComponent(token)}`,
      payload: { Temp: "68.0", SG: "1.050", Color: "ORANGE", Beer: "test", Comment: "" },
    });
    expect(first.statusCode).toBe(200);
    const firstBody = first.json() as any;
    expect(firstBody.ok).toBe(true);
    expect(typeof firstBody.deviceId).toBe("string");
    expect(firstBody.brewSessionId).toBeNull();
    deviceId = firstBody.deviceId as string;

    const devices1 = await app.inject({
      method: "GET",
      url: `/workspaces/${workspaceId}/integrations/tilt/devices`,
      headers: { cookie },
    });
    expect(devices1.statusCode).toBe(200);
    const d1 = devices1.json() as any;
    expect(d1.ok).toBe(true);
    expect(d1.devices.length).toBe(1);
    expect(d1.devices[0].activeAttachment).toBeNull();
    expect(d1.devices[0].lastReading).toBeTruthy();
    expect(d1.devices[0].lastReading.gravitySg).toBeCloseTo(1.05, 6);
    // 68°F -> 20°C
    expect(d1.devices[0].lastReading.temperatureC).toBeCloseTo(20, 3);

    const attach1 = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/integrations/tilt/devices/${deviceId}/attach`,
      headers: { cookie },
      payload: { brewSessionId: brewSessionId1 },
    });
    expect(attach1.statusCode).toBe(200);
    expect((attach1.json() as any).ok).toBe(true);

    const second = await app.inject({
      method: "POST",
      url: `/integrations/tilt/${encodeURIComponent(token)}`,
      payload: { Temp: 70, SG: 1.048, Color: "ORANGE" },
    });
    expect(second.statusCode).toBe(200);
    const secondBody = second.json() as any;
    expect(secondBody.ok).toBe(true);
    expect(secondBody.brewSessionId).toBe(brewSessionId1);

    // Re-attach to another session -> single-active routing changes
    const attach2 = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/integrations/tilt/devices/${deviceId}/attach`,
      headers: { cookie },
      payload: { brewSessionId: brewSessionId2 },
    });
    expect(attach2.statusCode).toBe(200);

    const third = await app.inject({
      method: "POST",
      url: `/integrations/tilt/${encodeURIComponent(token)}`,
      payload: { Temp: 72, SG: 1.046, Color: "ORANGE" },
    });
    expect(third.statusCode).toBe(200);
    const thirdBody = third.json() as any;
    expect(thirdBody.ok).toBe(true);
    expect(thirdBody.brewSessionId).toBe(brewSessionId2);
  });

  it("attaches from the brew session and exposes readings by session", async () => {
    await ensureIntegrationAndDevice();

    const attach = await app.inject({
      method: "POST",
      url: `/brew-sessions/${brewSessionId1}/integrations/attach`,
      headers: { cookie },
      payload: { kind: "tilt", deviceId },
    });
    expect(attach.statusCode).toBe(200);
    expect((attach.json() as any).ok).toBe(true);

    const ingest = await app.inject({
      method: "POST",
      url: `/integrations/tilt/${encodeURIComponent(integrationToken)}`,
      payload: { Temp: 66, SG: 1.052, Color: "ORANGE" },
    });
    expect(ingest.statusCode).toBe(200);

    const readings = await app.inject({
      method: "GET",
      url: `/brew-sessions/${brewSessionId1}/integrations/readings?kind=tilt&limit=10`,
      headers: { cookie },
    });
    expect(readings.statusCode).toBe(200);
    const body = readings.json() as any;
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.readings)).toBe(true);
    expect(body.readings.length).toBeGreaterThan(0);
  });

  it("rotates token and rejects the old token", async () => {
    // Reveal should return the current token consistently.
    const reveal = await app.inject({
      method: "GET",
      url: `/workspaces/${workspaceId}/integrations/tilt/reveal`,
      headers: { cookie },
    });
    expect(reveal.statusCode).toBe(200);
    const revealed = reveal.json() as any;
    expect(revealed.ok).toBe(true);
    expect(revealed.token).toBe(integrationToken);

    const rotate = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/integrations/tilt/rotate-token`,
      headers: { cookie },
    });
    expect(rotate.statusCode).toBe(200);
    const rotated = rotate.json() as any;
    expect(rotated.ok).toBe(true);
    const newToken = rotated.token as string;
    expect(typeof newToken).toBe("string");

    const rejected = await app.inject({
      method: "POST",
      url: `/integrations/tilt/${encodeURIComponent(integrationToken)}`,
      payload: { Temp: 70, SG: 1.048, Color: "ORANGE" },
    });
    expect(rejected.statusCode).toBe(401);

    const ok = await app.inject({
      method: "POST",
      url: `/integrations/tilt/${encodeURIComponent(newToken)}`,
      payload: { Temp: 70, SG: 1.048, Color: "ORANGE" },
    });
    expect(ok.statusCode).toBe(200);
    expect((ok.json() as any).ok).toBe(true);

    const reveal2 = await app.inject({
      method: "GET",
      url: `/workspaces/${workspaceId}/integrations/tilt/reveal`,
      headers: { cookie },
    });
    expect(reveal2.statusCode).toBe(200);
    const revealed2 = reveal2.json() as any;
    expect(revealed2.ok).toBe(true);
    expect(revealed2.token).toBe(newToken);
  });
});

