"use client";

import { useEffect } from "react";

import { asRecord } from "../../../../../../_shell/_lib/typeGuards";
import { editorStateFromBeerJson, type EditorMiscRow } from "../../../_lib/beerjsonRecipe";
import type { Recipe } from "../_lib/recipeEditTypes";
import type { RecipeEditHydrators } from "./useRecipeEditLoad";

export function useRecipeEditLoadHydrate(params: {
  recipe: Recipe | null;
  hydrators: RecipeEditHydrators;
  setMiscRows: (rows: EditorMiscRow[]) => void;
  setSelectedEquipmentProfileId: (id: string) => void;
  setBoilTimeMinutes: (value: string) => void;
}) {
  const {
    recipe,
    hydrators,
    setMiscRows,
    setSelectedEquipmentProfileId,
    setBoilTimeMinutes,
  } = params;
  const {
    hydrateGristRows,
    hydrateHopsRows,
    hydrateYeast,
    hydrateYeastAttenuationOverrides,
    hydrateMash,
  } = hydrators;

  useEffect(() => {
    if (!recipe?.beerJsonRecipeJson) return;
    const r = recipe;

    const ext = asRecord(r.recipeExtJson);
    const links = ext ? asRecord(ext["ingredientLinks"]) : null;
    const linksGrist = links ? asRecord(links["grist"]) : null;
    const linksHops = links ? asRecord(links["hops"]) : null;
    const linksYeast = links ? asRecord(links["yeast"]) : null;
    const linksMisc = links ? asRecord(links["misc"]) : null;
    const mashPhModel = ext ? asRecord(ext["mashPhModel"]) : null;
    const yeastOverridesRaw = ext ? asRecord(ext["yeastAttenuationOverridesPercent"]) : null;
    hydrateYeastAttenuationOverrides(yeastOverridesRaw);

    const yeastPitchRateRaw = ext ? asRecord(ext["yeastPitchRateOverrides"]) : null;
    const yeastFermentationTempRaw = ext ? asRecord(ext["yeastFermentationTempOverrides"]) : null;
    const yeastOxygenationRaw = ext ? asRecord(ext["yeastOxygenationOverrides"]) : null;
    const yeastDiacetylRestRaw = ext ? asRecord(ext["yeastDiacetylRestOverrides"]) : null;
    const yeastFormatRaw = ext
      ? (asRecord(ext["yeastFormatOverrides"]) ?? asRecord(ext["yeastTypeOverrides"]))
      : null;
    const yeastSpeciesRaw = ext ? asRecord(ext["yeastSpeciesOverrides"]) : null;
    const yeastNeedsPropagationRaw = ext ? asRecord(ext["yeastNeedsPropagationOverrides"]) : null;
    const yeastCellsPerLRaw = ext ? asRecord(ext["yeastCellsPerLOverrides"]) : null;
    const yeastCellsPerKGRaw = ext ? asRecord(ext["yeastCellsPerKGOverrides"]) : null;
    const yeastCellsPerGRaw = ext ? asRecord(ext["yeastCellsPerGOverrides"]) : null;

    const equipmentSource = ext ? asRecord(ext["equipmentSource"]) : null;
    const equipmentProfileId =
      equipmentSource && typeof equipmentSource["equipmentProfileId"] === "string"
        ? equipmentSource["equipmentProfileId"]
        : "";
    setSelectedEquipmentProfileId(equipmentProfileId);

    const s = editorStateFromBeerJson(r.beerJsonRecipeJson);

    const boilTimeMinutesOverride =
      ext &&
      typeof ext["boilTimeMinutesOverride"] === "number" &&
      Number.isFinite(ext["boilTimeMinutesOverride"])
        ? ext["boilTimeMinutesOverride"]
        : null;
    if (boilTimeMinutesOverride != null && boilTimeMinutesOverride >= 0) {
      setBoilTimeMinutes(String(Math.round(boilTimeMinutesOverride)));
    } else {
      const hopsForBoil = s.hopsRows.filter((h) => h.use === "boil");
      const maxMin =
        hopsForBoil.length > 0
          ? Math.max(
              ...hopsForBoil
                .map((h) =>
                  typeof h.timeMinutes === "number" && Number.isFinite(h.timeMinutes) ? h.timeMinutes : 0,
                )
                .filter((m) => m > 0),
              0,
            )
          : 0;
      setBoilTimeMinutes(maxMin > 0 ? String(Math.round(maxMin)) : "60");
    }

    const hopFormOverrides = ext ? asRecord(ext["hopFormOverrides"]) : null;
    const misc = s.miscRows.map((row) => ({
      ...row,
      ingredientId:
        linksMisc && typeof linksMisc[row.id] === "string" ? (linksMisc[row.id] as string) : null,
    })) as EditorMiscRow[];

    hydrateGristRows({ gristRows: s.gristRows, linksGrist, mashPhModel });
    hydrateHopsRows({ hopsRows: s.hopsRows, linksHops, hopFormOverrides });
    hydrateYeast({
      yeastRows: s.yeastRows,
      ext,
      linksYeast,
      yeastPitchRateRaw,
      yeastFermentationTempRaw,
      yeastOxygenationRaw,
      yeastDiacetylRestRaw,
      yeastFormatRaw,
      yeastSpeciesRaw,
      yeastNeedsPropagationRaw,
      yeastCellsPerLRaw,
      yeastCellsPerKGRaw,
      yeastCellsPerGRaw,
    });
    setMiscRows(misc);
    hydrateMash({ mash: s.mash, ext });
  }, [
    recipe,
    hydrateGristRows,
    hydrateHopsRows,
    hydrateMash,
    hydrateYeast,
    hydrateYeastAttenuationOverrides,
    setMiscRows,
    setSelectedEquipmentProfileId,
    setBoilTimeMinutes,
  ]);
}
