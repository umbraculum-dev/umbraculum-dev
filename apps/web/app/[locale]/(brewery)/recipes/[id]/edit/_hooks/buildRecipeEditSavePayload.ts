import { patchRecipe } from "@umbraculum/api-client/brewery";

import { asRecord } from "../../../../../../_lib/typeGuards";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  validateMashBeforeSave,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMashStep,
  type EditorMiscRow,
  type EditorYeastRow,
} from "../../../_lib/beerjsonRecipe";
import type { Recipe } from "../_lib/recipeEditTypes";

export function buildRecipeEditSavePayload(params: {
  recipe: Recipe | null;
  name: string;
  styleKey: string;
  notes: string;
  boilTimeMinutes: string;
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  mashProcedure: { name: string; grainTemperatureC: number } | null;
  mashRows: EditorMashStep[];
  waterVolumes: { spargeLiters: number } | null | undefined;
  buildYeastOverrides: () => Record<string, Record<string, unknown>>;
}):
  | { ok: true; payload: Parameters<typeof patchRecipe>[2] }
  | { ok: false; errors: string[] } {
  const {
    recipe,
    name,
    styleKey,
    notes,
    boilTimeMinutes,
    gristRows,
    hopsRows,
    yeastRows,
    miscRows,
    mashProcedure,
    mashRows,
    waterVolumes,
    buildYeastOverrides,
  } = params;

  const extBase = asRecord(recipe?.recipeExtJson);
  const extBaseForSave: Record<string, unknown> = extBase ? { ...extBase } : {};

  const boilTimeMinutesVal = (() => {
    const trimmed = boilTimeMinutes.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0 || n > 600) return null;
    return Math.round(n);
  })();
  if (boilTimeMinutesVal != null) {
    extBaseForSave["boilTimeMinutesOverride"] = boilTimeMinutesVal;
  } else {
    delete extBaseForSave["boilTimeMinutesOverride"];
  }

  const {
    yeastAttenuationOverridesPercent,
    yeastPitchRateOverrides,
    yeastFermentationTempOverrides,
    yeastOxygenationOverrides,
    yeastDiacetylRestOverrides,
    yeastFormatOverrides,
    yeastSpeciesOverrides,
    yeastNeedsPropagationOverrides,
    yeastCellsPerLOverrides,
    yeastCellsPerKGOverrides,
  } = buildYeastOverrides() as {
    yeastAttenuationOverridesPercent: Record<string, unknown>;
    yeastPitchRateOverrides: Record<string, unknown>;
    yeastFermentationTempOverrides: Record<string, unknown>;
    yeastOxygenationOverrides: Record<string, unknown>;
    yeastDiacetylRestOverrides: Record<string, unknown>;
    yeastFormatOverrides: Record<string, unknown>;
    yeastSpeciesOverrides: Record<string, unknown>;
    yeastNeedsPropagationOverrides: Record<string, unknown>;
    yeastCellsPerLOverrides: Record<string, unknown>;
    yeastCellsPerKGOverrides: Record<string, unknown>;
  };

  const yeastOverrideFields: [string, Record<string, unknown>][] = [
    ["yeastAttenuationOverridesPercent", yeastAttenuationOverridesPercent],
    ["yeastPitchRateOverrides", yeastPitchRateOverrides],
    ["yeastFermentationTempOverrides", yeastFermentationTempOverrides],
    ["yeastOxygenationOverrides", yeastOxygenationOverrides],
    ["yeastDiacetylRestOverrides", yeastDiacetylRestOverrides],
    ["yeastFormatOverrides", yeastFormatOverrides],
    ["yeastSpeciesOverrides", yeastSpeciesOverrides],
    ["yeastNeedsPropagationOverrides", yeastNeedsPropagationOverrides],
    ["yeastCellsPerLOverrides", yeastCellsPerLOverrides],
    ["yeastCellsPerKGOverrides", yeastCellsPerKGOverrides],
  ];
  for (const [key, val] of yeastOverrideFields) {
    if (Object.keys(val).length) extBaseForSave[key] = val;
    else delete extBaseForSave[key];
  }
  delete extBaseForSave["yeastTypeOverrides"];
  delete extBaseForSave["yeastCellsPerGOverrides"];

  const batchSizeLiters =
    typeof extBaseForSave["batchSizeLiters"] === "number" ? extBaseForSave["batchSizeLiters"] : null;
  const brewhouseEfficiencyPercent =
    typeof extBaseForSave["brewhouseEfficiencyPercent"] === "number"
      ? extBaseForSave["brewhouseEfficiencyPercent"]
      : null;

  const stepsForSave = mashRows.map((r) => {
    if (r.type === "sparge" && r.name.trim().toLowerCase() === "sparge" && waterVolumes) {
      return { ...r, amountL: waterVolumes.spargeLiters };
    }
    return r;
  });

  const mash: EditorMash =
    mashRows.length > 0 && mashProcedure
      ? {
          name: mashProcedure.name || "Mash",
          grainTemperatureC: mashProcedure.grainTemperatureC,
          steps: stepsForSave,
        }
      : mashRows.length > 0
        ? { name: "Mash", grainTemperatureC: 20, steps: stepsForSave }
        : null;

  const mashValidation = validateMashBeforeSave(mash);
  if (!mashValidation.ok) {
    return { ok: false, errors: mashValidation.errors };
  }

  extBaseForSave["mashStepDeduceFromMashIn"] = Object.fromEntries(
    mashRows
      .map((r, idx) => [String(idx), r.deduceFromMashIn === true] as const)
      .filter(([k, v]) => k !== "0" && v === true),
  );

  const beerJsonRecipeJson = buildBeerJsonRecipeDocument({
    name,
    notes: notes || null,
    gristRows,
    hopsRows,
    yeastRows,
    miscRows,
    mash,
    batchSizeLiters,
    brewhouseEfficiencyPercent,
  });

  const recipeExtJson = buildRecipeExtJsonFromEditorState({
    gristRows,
    hopsRows,
    yeastRows,
    miscRows,
    extBase: extBaseForSave,
  });

  return {
    ok: true,
    payload: {
      name,
      styleKey,
      notes: notes || null,
      beerJsonRecipeJson,
      recipeExtJson,
    },
  };
}
