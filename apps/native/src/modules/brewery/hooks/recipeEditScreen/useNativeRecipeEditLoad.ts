import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { getRecipe, getRecipeWaterSettings } from "@umbraculum/api-client/brewery";
import {
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  mergeYeastAttenuationRangeFromExt,
  type EditorMashStep,
  type EditorYeastRow,
} from "@umbraculum/brewery-beerjson";

import { asRecord } from "../../../../lib/typeGuards";
import type { Recipe } from "../../lib/recipeEditTypes";

type ApiClient = Parameters<typeof getRecipe>[0];

export type NativeRecipeEditLoadHydrators = {
  setGristRows: (rows: ReturnType<typeof editorStateFromBeerJson>["gristRows"]) => void;
  setHopsRows: (rows: ReturnType<typeof editorStateFromBeerJson>["hopsRows"]) => void;
  setYeastRows: (rows: EditorYeastRow[]) => void;
  setYeastAttenuationOverrides: (overrides: Record<string, string>) => void;
  hydrateYeastAmountText: (rows: EditorYeastRow[]) => void;
  setSelectedEquipmentProfileId: (id: string) => void;
};

export function useNativeRecipeEditLoad(params: {
  api: ApiClient | null;
  recipeId: string;
  canCall: boolean;
  locale: string;
  hydrators: NativeRecipeEditLoadHydrators;
}) {
  const { api, recipeId, canCall, hydrators } = params;
  const {
    setGristRows,
    setHopsRows,
    setYeastRows,
    setYeastAttenuationOverrides,
    hydrateYeastAmountText,
    setSelectedEquipmentProfileId,
  } = hydrators;

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recipeState, setRecipe] = useState<Recipe | null>(null);

  const [name, setName] = useState("");
  const [styleKey, setStyleKey] = useState("");
  const [notes, setNotes] = useState("");
  const [boilTimeMinutes, setBoilTimeMinutes] = useState("");

  const [mashProcedure, setMashProcedure] = useState<{ name: string; grainTemperatureC: number } | null>(null);
  const [mashRows, setMashRows] = useState<EditorMashStep[]>([]);
  const [waterSettings, setWaterSettings] = useState<{
    spargeStepTemperatureC?: number | null;
    spargeStepTimeMin?: number | null;
    spargeStepRampMin?: number | null;
    spargeMethodType?: string | null;
  } | null>(null);

  const loadRecipe = useCallback(async () => {
    if (!api || !recipeId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getRecipe(api, recipeId);
      const r = (res.recipe ?? null) as Recipe | null;
      if (!r) throw new Error("Recipe not found");
      setRecipe(r);
      setName(typeof r.name === "string" ? r.name : "");
      setStyleKey(typeof r.styleKey === "string" ? r.styleKey : "custom");
      setNotes(typeof r.notes === "string" ? r.notes : "");

      const extRec = asRecord(r.recipeExtJson);
      const linksRec = asRecord(extRec?.["ingredientLinks"]);
      const yeastOverridesRaw = asRecord(extRec?.["yeastAttenuationOverridesPercent"]);
      if (yeastOverridesRaw) {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(yeastOverridesRaw)) {
          if (typeof k === "string" && typeof v === "number" && Number.isFinite(v)) out[k] = String(v);
        }
        setYeastAttenuationOverrides(out);
      } else {
        setYeastAttenuationOverrides({});
      }

      const yeastFermentationTempRaw = asRecord(extRec?.["yeastFermentationTempOverrides"]);
      const yeastOxygenationRaw = asRecord(extRec?.["yeastOxygenationOverrides"]);
      const yeastDiacetylRestRaw = asRecord(extRec?.["yeastDiacetylRestOverrides"]);
      const yeastFormatRaw = asRecord(extRec?.["yeastFormatOverrides"] ?? extRec?.["yeastTypeOverrides"]);

      const equipmentSource = asRecord(extRec?.["equipmentSource"]);
      const equipmentProfileId =
        typeof equipmentSource?.["equipmentProfileId"] === "string" ? equipmentSource["equipmentProfileId"] : "";
      setSelectedEquipmentProfileId(equipmentProfileId);

      const boilTimeMinutesOverrideRaw = extRec?.["boilTimeMinutesOverride"];
      const boilTimeMinutesOverride =
        typeof boilTimeMinutesOverrideRaw === "number" && Number.isFinite(boilTimeMinutesOverrideRaw)
          ? boilTimeMinutesOverrideRaw
          : null;
      if (boilTimeMinutesOverride != null && boilTimeMinutesOverride >= 0) {
        setBoilTimeMinutes(String(Math.round(boilTimeMinutesOverride)));
      } else {
        setBoilTimeMinutes("60");
      }

      if (!r.beerJsonRecipeJson) {
        setGristRows([]);
        setHopsRows([]);
        setYeastRows([]);
        setMashProcedure(null);
        setMashRows([]);
        return;
      }
      const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
      setGristRows(s.gristRows);
      setHopsRows(s.hopsRows);
      const mashMerged = mergeMashDeduceFromExt(s.mash, r.recipeExtJson);
      if (mashMerged) {
        setMashProcedure({
          name: mashMerged.name || "Mash",
          grainTemperatureC: mashMerged.grainTemperatureC,
        });
        setMashRows(mashMerged.steps);
      } else {
        setMashProcedure(null);
        setMashRows([]);
      }
      const baseYeast = mergeYeastAttenuationRangeFromExt(s.yeastRows, r.recipeExtJson);
      const yeastLinks = asRecord(linksRec?.["yeast"]);
      const mappedYeastRows: EditorYeastRow[] = baseYeast.map((row) => {
        const fermentationTempC =
          yeastFermentationTempRaw &&
          typeof yeastFermentationTempRaw[row.id] === "number" &&
          Number.isFinite(yeastFermentationTempRaw[row.id])
            ? (yeastFermentationTempRaw[row.id] as number)
            : null;
        const oxygenation =
          yeastOxygenationRaw &&
          (yeastOxygenationRaw[row.id] === "yes" || yeastOxygenationRaw[row.id] === "no")
            ? (yeastOxygenationRaw[row.id] as "yes" | "no")
            : null;
        const diacetylRest =
          yeastDiacetylRestRaw &&
          (yeastDiacetylRestRaw[row.id] === "yes" || yeastDiacetylRestRaw[row.id] === "no")
            ? (yeastDiacetylRestRaw[row.id] as "yes" | "no")
            : null;
        const formatOverride =
          yeastFormatRaw &&
          (yeastFormatRaw[row.id] === "dry" ||
            yeastFormatRaw[row.id] === "liquid" ||
            yeastFormatRaw[row.id] === "slurry")
            ? (yeastFormatRaw[row.id] as "dry" | "liquid" | "slurry")
            : null;

        const inferredFormat: NonNullable<EditorYeastRow["format"]> =
          formatOverride ??
          (row.format === "dry" || row.format === "liquid" || row.format === "slurry" ? row.format : null) ??
          (row.amountKg != null && Number.isFinite(row.amountKg) ? "dry" : "liquid");

        return {
          ...row,
          ingredientId: typeof yeastLinks?.[row.id] === "string" ? (yeastLinks[row.id] as string) : null,
          fermentationTempC: fermentationTempC ?? undefined,
          oxygenation: oxygenation ?? undefined,
          diacetylRest: diacetylRest ?? undefined,
          format: inferredFormat,
        };
      });

      setYeastRows(mappedYeastRows);
      hydrateYeastAmountText(mappedYeastRows);
    } catch (err) {
      setLoadError(String(err));
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [
    api,
    recipeId,
    setGristRows,
    setHopsRows,
    setYeastRows,
    setYeastAttenuationOverrides,
    hydrateYeastAmountText,
    setSelectedEquipmentProfileId,
  ]);

  useEffect(() => {
    if (canCall && recipeId) {
      void loadRecipe();
    }
  }, [canCall, recipeId, loadRecipe]);

  useEffect(() => {
    if (!canCall || !recipeId || !api) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await getRecipeWaterSettings(api, recipeId);
        if (cancelled) return;
        const data = res.settings as Record<string, unknown> | null | undefined;
        setWaterSettings(data ?? null);
      } catch {
        if (!cancelled) setWaterSettings(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCall, recipeId, api]);

  useFocusEffect(
    useCallback(() => {
      if (canCall && recipeId && recipeState) {
        void loadRecipe();
      }
    }, [canCall, recipeId, recipeState, loadRecipe]),
  );

  return {
    loading,
    loadError,
    recipe: recipeState,
    setRecipe,
    name,
    setName,
    styleKey,
    setStyleKey,
    notes,
    setNotes,
    boilTimeMinutes,
    setBoilTimeMinutes,
    mashProcedure,
    mashRows,
    waterSettings,
    loadRecipe,
  };
}
