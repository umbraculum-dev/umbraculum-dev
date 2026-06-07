import { describe, expect, it } from "vitest";

import {
  buildBeerJsonRecipeDocument,
  editorStateFromBeerJson,
  replaceMashInBeerJsonDocument,
  validateMashBeforeSave,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMiscRow,
  type EditorYeastRow,
} from "./index";

/**
 * Phase 2 safety net.
 *
 * `packages/verticals/brewery/beerjson` had zero unit tests when Phase 2 began (decision
 * 2026-05-16: chose Option B — write tests as part of the type-tightening
 * change to avoid silently changing runtime behavior). These three tests
 * cover the only public round-trip surface of the package: the editor
 * state → BeerJSON document → editor state path.
 *
 * They are intentionally coarse (round-trip equality, not field-by-field
 * spec adherence) because the full BeerJSON spec is out of Phase 2 scope.
 * The goal is to detect "the type-cleanup commit accidentally changed
 * what the parser produces", not to enforce schema conformance.
 */

const sampleGrist: EditorGristRow[] = [
  {
    id: "grist-1",
    ingredientId: null,
    name: "Pilsner Malt",
    producer: "Weyermann",
    group: "base",
    amountKg: 4.5,
    colorLovibond: 1.8,
    potential: { kind: "yieldPercent", value: 80 },
    maltClass: "base",
    timingUse: "add_to_mash",
    lateAddition: false,
  },
  {
    id: "grist-2",
    ingredientId: null,
    name: "Munich Light",
    producer: null,
    group: "base",
    amountKg: 0.5,
    colorLovibond: 8,
    potential: { kind: "yieldPercent", value: 78 },
    maltClass: "base",
  },
];

const sampleHops: EditorHopRow[] = [
  {
    id: "hop-1",
    ingredientId: null,
    name: "Saaz",
    country: "CZ",
    form: "pellet",
    amountGrams: 30,
    alphaAcidPercent: 3.5,
    use: "boil",
    timeMinutes: 60,
  },
  {
    id: "hop-2",
    ingredientId: null,
    name: "Citra",
    country: "US",
    form: "pellet",
    amountGrams: 20,
    alphaAcidPercent: 12,
    use: "dryhop",
    timeMinutes: 0,
  },
];

const sampleYeast: EditorYeastRow[] = [
  {
    id: "yeast-1",
    ingredientId: null,
    name: "Wyeast 1056",
    lab: "Wyeast",
    productId: "1056",
    attenuationMin: 73,
    attenuationMax: 77,
    amountL: 0.125,
    format: "liquid",
  },
];

const sampleMisc: EditorMiscRow[] = [
  {
    id: "misc-1",
    ingredientId: null,
    name: "Irish Moss",
    type: "fining",
    use: "boil",
    timeMinutes: 15,
    amount: 0.005,
    amountIsWeight: true,
  },
];

const sampleMash: NonNullable<EditorMash> = {
  name: "Single infusion",
  grainTemperatureC: 20,
  steps: [
    {
      id: "step-1",
      name: "Mash In",
      type: "infusion",
      stepTemperatureC: 67,
      stepTimeMin: 60,
    },
    {
      id: "step-2",
      name: "Mash Out",
      type: "temperature",
      stepTemperatureC: 76,
      stepTimeMin: 10,
    },
  ],
};

describe("buildBeerJsonRecipeDocument → editorStateFromBeerJson round-trip", () => {
  it("preserves grist, hops, yeast, misc rows through the BeerJSON boundary", () => {
    const doc = buildBeerJsonRecipeDocument({
      name: "Test Pilsner",
      notes: "Round-trip test",
      gristRows: sampleGrist,
      hopsRows: sampleHops,
      yeastRows: sampleYeast,
      miscRows: sampleMisc,
      mash: null,
      batchSizeLiters: 20,
      brewhouseEfficiencyPercent: 75,
    });

    const restored = editorStateFromBeerJson(doc);

    expect(restored.gristRows).toHaveLength(2);
    expect(restored.gristRows[0]?.name).toBe("Pilsner Malt");
    expect(restored.gristRows[0]?.amountKg).toBeCloseTo(4.5, 5);
    expect(restored.gristRows[0]?.colorLovibond).toBeCloseTo(1.8, 5);
    expect(restored.gristRows[1]?.name).toBe("Munich Light");

    expect(restored.hopsRows).toHaveLength(2);
    expect(restored.hopsRows[0]?.name).toBe("Saaz");
    expect(restored.hopsRows[0]?.amountGrams).toBeCloseTo(30, 5);
    expect(restored.hopsRows[0]?.use).toBe("boil");
    expect(restored.hopsRows[0]?.timeMinutes).toBe(60);
    expect(restored.hopsRows[1]?.name).toBe("Citra");
    expect(restored.hopsRows[1]?.use).toBe("dryhop");

    expect(restored.yeastRows).toHaveLength(1);
    expect(restored.yeastRows[0]?.name).toBe("Wyeast 1056");
    expect(restored.yeastRows[0]?.amountL).toBeCloseTo(0.125, 5);

    expect(restored.miscRows).toHaveLength(1);
    expect(restored.miscRows[0]?.name).toBe("Irish Moss");
    expect(restored.miscRows[0]?.type).toBe("fining");
    expect(restored.miscRows[0]?.use).toBe("boil");
    expect(restored.miscRows[0]?.timeMinutes).toBe(15);
  });

  it("preserves mash steps through the BeerJSON boundary", () => {
    const doc = buildBeerJsonRecipeDocument({
      name: "Test",
      notes: null,
      gristRows: sampleGrist,
      hopsRows: [],
      yeastRows: [],
      miscRows: [],
      mash: sampleMash,
    });

    const restored = editorStateFromBeerJson(doc);

    expect(restored.mash).not.toBeNull();
    expect(restored.mash?.name).toBe("Single infusion");
    expect(restored.mash?.grainTemperatureC).toBeCloseTo(20, 5);
    expect(restored.mash?.steps).toHaveLength(2);
    expect(restored.mash?.steps[0]?.name).toBe("Mash In");
    expect(restored.mash?.steps[0]?.type).toBe("infusion");
    expect(restored.mash?.steps[0]?.stepTemperatureC).toBeCloseTo(67, 5);
    expect(restored.mash?.steps[0]?.stepTimeMin).toBe(60);
    expect(restored.mash?.steps[1]?.type).toBe("temperature");
    expect(restored.mash?.steps[1]?.stepTemperatureC).toBeCloseTo(76, 5);
  });
});

describe("replaceMashInBeerJsonDocument", () => {
  it("replaces the mash on an existing recipe document and is reversible via editorStateFromBeerJson", () => {
    const initial = buildBeerJsonRecipeDocument({
      name: "Test",
      notes: null,
      gristRows: sampleGrist,
      hopsRows: [],
      yeastRows: [],
      miscRows: [],
      mash: null,
    });

    expect(editorStateFromBeerJson(initial).mash).toBeNull();

    const newMash: NonNullable<EditorMash> = {
      name: "Step mash",
      grainTemperatureC: 18,
      steps: [
        {
          id: "s1",
          name: "Saccharification",
          type: "temperature",
          stepTemperatureC: 65,
          stepTimeMin: 45,
        },
      ],
    };

    const updated = replaceMashInBeerJsonDocument(initial, newMash);

    const restoredAfter = editorStateFromBeerJson(updated);
    expect(restoredAfter.mash).not.toBeNull();
    expect(restoredAfter.mash?.name).toBe("Step mash");
    expect(restoredAfter.mash?.steps).toHaveLength(1);
    expect(restoredAfter.mash?.steps[0]?.type).toBe("temperature");
    expect(restoredAfter.mash?.steps[0]?.stepTimeMin).toBe(45);

    const cleared = replaceMashInBeerJsonDocument(updated, null);
    expect(editorStateFromBeerJson(cleared).mash).toBeNull();

    expect(editorStateFromBeerJson(initial).mash).toBeNull();
  });
});

describe("validateMashBeforeSave (sanity smoke test)", () => {
  it("accepts a valid mash and rejects an invalid temperature", () => {
    expect(validateMashBeforeSave(sampleMash).ok).toBe(true);

    const bad: NonNullable<EditorMash> = {
      ...sampleMash,
      grainTemperatureC: Number.NaN,
    };
    const result = validateMashBeforeSave(bad);
    expect(result.ok).toBe(false);
  });
});
