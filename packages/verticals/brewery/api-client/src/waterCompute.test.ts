import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "@umbraculum/api-client";
import { createApiClient } from "@umbraculum/api-client";
import { computeAndSaveMash } from "./waterCompute.js";

const ions = {
  calcium: 80,
  magnesium: 5,
  sodium: 10,
  sulfate: 100,
  chloride: 60,
  bicarbonate: 50,
};

const validMashResponse = {
  ok: true,
  version: 1,
  settings: { recipeId: "r1" },
  salts: {
    result: {
      baseProfile: ions,
      resultingProfile: ions,
      deltasPpm: { calcium: 10, magnesium: 0, sodium: 0, sulfate: 20, chloride: 0, bicarbonate: 0 },
      breakdown: [{ saltKey: "gypsum", grams: 2, deltasPpm: { calcium: 10, sulfate: 20 } }],
    },
    derivation: {
      kind: "salts.compute",
      version: 1,
      formulaId: "salts.compute.simple",
      inputs: [{ id: "in", value: { kind: "number", value: 1, unit: "g" } }],
      intermediates: [{ id: "tmp", value: { kind: "string", value: "ok" } }],
    },
  },
  acid: {
    kind: "mash_acidification_target_mash_ph",
    result: {
      acidRequiredMl: 3.2,
      acidRequiredTsp: 0.65,
      acidRequiredGrams: null,
      acidRequiredKg: null,
      finalAlkalinityPpmCaCO3: 30,
      sulfateAddedPpm: 12,
      chlorideAddedPpm: 6,
      estimatedMashPhRoomTemp: 5.42,
    },
    derivation: {
      kind: "mash.acid",
      version: 1,
      formulaId: "mash.acid.target",
      inputs: [{ id: "in", value: { kind: "number", value: 1, unit: "g" } }],
      intermediates: [{ id: "tmp", value: { kind: "string", value: "ok" } }],
    },
  },
  overall: {
    result: {
      calculatedAt: "2026-05-12T10:00:00.000Z",
      ionsPpm: ions,
      finalAlkalinityPpmCaCO3: 30,
      ph: { kind: "estimated", value: 5.42 },
    },
    derivation: {
      kind: "mash.overall",
      version: 1,
      formulaId: "mash.overall.merge",
      inputs: [{ id: "in", value: { kind: "number", value: 1, unit: "g" } }],
      intermediates: [{ id: "tmp", value: { kind: "string", value: "ok" } }],
    },
  },
};

describe("waterCompute facades", () => {
  it("computeAndSaveMash parses mash compute-and-save response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(validMashResponse)),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await computeAndSaveMash(client, "r1", { sourceWaterProfileId: "p1" });
    expect(res.version).toBe(1);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/recipes/r1/water-settings/mash/compute-and-save",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
