"use client";

import { useEffect, useState } from "react";

import { getRecipe, listRecipeVersions } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../_lib/typeGuards";
import { editorStateFromBeerJson, type EditorMiscRow } from "../../../_lib/beerjsonRecipe";
import type { Recipe, RecipeVersionListItem } from "../_lib/recipeEditTypes";

export type RecipeEditHydrators = {
  hydrateGristRows: (input: {
    gristRows: ReturnType<typeof editorStateFromBeerJson>["gristRows"];
    linksGrist: Record<string, unknown> | null;
    mashPhModel: Record<string, unknown> | null;
  }) => void;
  hydrateHopsRows: (input: {
    hopsRows: ReturnType<typeof editorStateFromBeerJson>["hopsRows"];
    linksHops: Record<string, unknown> | null;
    hopFormOverrides: Record<string, unknown> | null;
  }) => void;
  hydrateYeast: (input: {
    yeastRows: ReturnType<typeof editorStateFromBeerJson>["yeastRows"];
    ext: Record<string, unknown> | null;
    linksYeast: Record<string, unknown> | null;
    yeastPitchRateRaw: Record<string, unknown> | null;
    yeastFermentationTempRaw: Record<string, unknown> | null;
    yeastOxygenationRaw: Record<string, unknown> | null;
    yeastDiacetylRestRaw: Record<string, unknown> | null;
    yeastFormatRaw: Record<string, unknown> | null;
    yeastSpeciesRaw: Record<string, unknown> | null;
    yeastNeedsPropagationRaw: Record<string, unknown> | null;
    yeastCellsPerLRaw: Record<string, unknown> | null;
    yeastCellsPerKGRaw: Record<string, unknown> | null;
    yeastCellsPerGRaw: Record<string, unknown> | null;
  }) => void;
  hydrateYeastAttenuationOverrides: (raw: Record<string, unknown> | null) => void;
  hydrateMash: (input: { mash: ReturnType<typeof editorStateFromBeerJson>["mash"]; ext: Record<string, unknown> | null }) => void;
};

export function useRecipeEditLoad(params: {
  canCall: boolean;
  recipeId: string;
  hydrators: RecipeEditHydrators;
  setMiscRows: (rows: EditorMiscRow[]) => void;
  setSelectedEquipmentProfileId: (id: string) => void;
  setAnalysis: (analysis: unknown) => void;
}) {
  const { canCall, recipeId, hydrators, setMiscRows, setSelectedEquipmentProfileId, setAnalysis } = params;
  const {
    hydrateGristRows,
    hydrateHopsRows,
    hydrateYeast,
    hydrateYeastAttenuationOverrides,
    hydrateMash,
  } = hydrators;

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [name, setName] = useState("");
  const [styleKey, setStyleKey] = useState("custom");
  const [notes, setNotes] = useState("");
  const [boilTimeMinutes, setBoilTimeMinutes] = useState("");

  const [versions, setVersions] = useState<RecipeVersionListItem[] | null>(null);
  const [_versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);

  const [visibilityRefreshTrigger, setVisibilityRefreshTrigger] = useState(0);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => {
      if (document.visibilityState === "visible") {
        setVisibilityRefreshTrigger((t) => t + 1);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  useEffect(() => {
    if (!canCall) return;
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getRecipe(webBreweryApiClient(), recipeId);
        const r = data.recipe as unknown as Recipe;
        if (cancelled) return;
        setRecipe(r);
        setAnalysis(r.analysis ?? null);
        setName(r.name ?? "");
        setStyleKey(r.styleKey ?? "custom");
        setNotes(r.notes ?? "");
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

        if (!r.beerJsonRecipeJson) {
          throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
        }
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
      } catch (err) {
        if (cancelled) return;
        setLoadError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    canCall,
    recipeId,
    visibilityRefreshTrigger,
    hydrateGristRows,
    hydrateHopsRows,
    hydrateMash,
    hydrateYeast,
    hydrateYeastAttenuationOverrides,
    setMiscRows,
    setSelectedEquipmentProfileId,
    setAnalysis,
  ]);

  useEffect(() => {
    if (!canCall) return;
    let cancelled = false;

    void (async () => {
      setVersionsLoading(true);
      setVersionsError(null);
      try {
        const data = await listRecipeVersions(webBreweryApiClient(), recipeId);
        if (!cancelled) setVersions(data.versions as unknown as RecipeVersionListItem[]);
      } catch (err) {
        if (!cancelled) {
          setVersions(null);
          setVersionsError(String(err));
        }
      } finally {
        if (!cancelled) setVersionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canCall, recipeId, visibilityRefreshTrigger]);

  return {
    loading,
    loadError,
    recipe,
    setRecipe,
    name,
    setName,
    styleKey,
    setStyleKey,
    notes,
    setNotes,
    boilTimeMinutes,
    setBoilTimeMinutes,
    versions,
    _versionsLoading,
    versionsError,
  };
}
