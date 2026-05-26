/**
 * Contract snapshots: the "list" endpoints that apps/native consumes
 * for the inventory/lookup screens.
 *
 *   - GET /equipment-profiles
 *   - GET /ingredients/fermentables
 *   - GET /ingredients/hops
 *   - GET /ingredients/yeasts
 *
 * These four endpoints share a session fixture (admin with active
 * workspace) so the suite stays fast. Each of the four needs at least
 * one row in its underlying table for the snapshot to capture the
 * element shape (rather than just `__length: "empty"`). The test DB
 * does not have system-level seed data for fermentables/hops/yeasts,
 * so the fixture creates one minimal row of each inline.
 *
 * None of these have L1 parser companions yet; the L4 snapshots here
 * provide the wire-format pin a future `parse*` parser can validate
 * against without guesswork.
 *
 * To intentionally update:
 *   UPDATE_CONTRACTS=1 npm test -w @umbraculum/api -- contracts/inventoryEndpoints.contract.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createSessionForTestUser } from "../helpers/session.js";
import { assertSnapshotShape } from "./shapeHelpers.js";

describe("contract: equipment-profiles + ingredients list endpoints", () => {
  const app = buildApp();
  let cookie = "";
  let workspaceId = "";
  let createdEquipmentProfileId = "";
  let createdFermentableId = "";
  let createdHopId = "";
  let createdYeastId = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookie = sess.cookie;
    workspaceId = sess.workspaceId;

    // Equipment-profiles is workspace-scoped with no seed data —
    // create one inline so the response `profiles` array is non-empty.
    const create = await app.inject({
      method: "POST",
      url: "/equipment-profiles",
      headers: { cookie },
      payload: {
        name: "Contract Snapshot Equipment",
        kettleVolumeLiters: 30,
        kettleLossesLiters: 1.5,
        kettleBoilEvaporationRatePercentPerHour: 8,
        kettleCoolingShrinkagePercent: 4,
        kettleHopsAbsorptionLiters: 0.5,
        mashVolumeLiters: 40,
        mashEfficiencyPercent: 75,
        mashLossesLiters: 1.2,
        mashThicknessLPerKg: 3,
        mashGrainAbsorptionLPerKg: 1,
        mashWaterLeftoverLiters: 0,
        otherLossesLiters: 0.5,
      },
    });
    if (create.statusCode !== 200) {
      throw new Error(
        `equipment-profile create failed (${create.statusCode}): ${create.body}`,
      );
    }
    createdEquipmentProfileId = create.json().profile.id;

    // Test DB doesn't seed system-level ingredients — create one of each.
    // workspaceId stays null so the row qualifies as a "system" entry that
    // the GET route returns regardless of caller's active workspace.
    const fermentable = await app.prisma.fermentable.create({
      data: {
        name: "Contract Snapshot Pale Ale Malt",
        producer: "Contract Brewery",
        group: "base",
        type: "grain",
        country: "GB",
        colorEbc: 5,
        colorLovibond: 2.5,
        yieldPercent: 80,
        ppg: 37,
      },
    });
    createdFermentableId = fermentable.id;

    const hop = await app.prisma.hop.create({
      data: {
        name: "Contract Snapshot Cascade",
        country: "US",
        type: "aroma",
        alphaMin: 4.5,
        alphaMax: 7.0,
        betaMin: 4.8,
        betaMax: 7.0,
      },
    });
    createdHopId = hop.id;

    const yeast = await app.prisma.yeast.create({
      data: {
        name: "Contract Snapshot Ale Yeast",
        lab: "Contract Lab",
        productId: "CS-001",
        type: "ale",
        form: "dry",
        attenuationMin: 75,
        attenuationMax: 82,
      },
    });
    createdYeastId = yeast.id;
  });

  afterAll(async () => {
    if (createdEquipmentProfileId) {
      await app.prisma.equipmentProfile
        .deleteMany({ where: { id: createdEquipmentProfileId, workspaceId } })
        .catch(() => undefined);
    }
    if (createdFermentableId) {
      await app.prisma.fermentable
        .deleteMany({ where: { id: createdFermentableId } })
        .catch(() => undefined);
    }
    if (createdHopId) {
      await app.prisma.hop
        .deleteMany({ where: { id: createdHopId } })
        .catch(() => undefined);
    }
    if (createdYeastId) {
      await app.prisma.yeast
        .deleteMany({ where: { id: createdYeastId } })
        .catch(() => undefined);
    }
    await app.close();
  });

  it("GET /equipment-profiles list shape is stable", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/equipment-profiles",
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.profiles)).toBe(true);
    expect(body.profiles.length).toBeGreaterThan(0);
    assertSnapshotShape("equipmentProfiles.list", body);
  });

  it("GET /ingredients/fermentables list shape is stable", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/ingredients/fermentables?limit=5",
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
    expect(typeof body.total).toBe("number");
    expect(typeof body.offset).toBe("number");
    expect(typeof body.limit).toBe("number");
    assertSnapshotShape("ingredients.fermentables", body);
  });

  it("GET /ingredients/hops list shape is stable", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/ingredients/hops?limit=5",
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
    assertSnapshotShape("ingredients.hops", body);
  });

  it("GET /ingredients/yeasts list shape is stable", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/ingredients/yeasts?limit=5",
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
    assertSnapshotShape("ingredients.yeasts", body);
  });
});
