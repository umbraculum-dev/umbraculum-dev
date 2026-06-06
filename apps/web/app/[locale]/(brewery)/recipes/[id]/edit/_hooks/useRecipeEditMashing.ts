"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { parseGravityAnalysisResponseV1 } from "@umbraculum/brewery-contracts";

import { mergeMashDeduceFromExt, type EditorMashStep } from "../../../_lib/beerjsonRecipe";
import { fetchRecipeWaterSettings, type RecipeWaterSettingsResponse } from "../../water/_lib/waterSettings";

export function useRecipeEditMashing(params: {
  analysis: unknown;
  tSparge: (key: string) => string;
  canCallAccountScoped: boolean;
  recipeId: string;
}) {
  const { analysis, tSparge, canCallAccountScoped, recipeId } = params;

  const [mashProcedure, setMashProcedure] = useState<{ name: string; grainTemperatureC: number } | null>(null);
  const [mashRows, setMashRows] = useState<EditorMashStep[]>([]);
  const [waterSettings, setWaterSettings] = useState<RecipeWaterSettingsResponse["settings"]>(null);

  const waterVolumes = useMemo(() => {
    if (!analysis) return null;
    try {
      const parsed = parseGravityAnalysisResponseV1(analysis);
      const preBoil = parsed?.derivations?.["analysis.pre_boil_volume"];
      if (!preBoil?.inputs) return null;
      const mashIn = preBoil.inputs.find((i) => i.id === "mashWaterVolumeLiters")?.value;
      const spargeIn = preBoil.inputs.find((i) => i.id === "spargeVolumeLiters")?.value;
      const mashL = mashIn?.kind === "number" ? mashIn.value : null;
      const spargeL = spargeIn?.kind === "number" ? spargeIn.value : null;
      return mashL != null && spargeL != null ? { mashLiters: mashL, spargeLiters: spargeL } : null;
    } catch {
      return null;
    }
  }, [analysis]);

  const spargeConfigured = waterVolumes != null && waterVolumes.spargeLiters > 0;

  const mashRowsFiltered = useMemo(() => {
    if (!spargeConfigured) return mashRows;
    return mashRows.filter((r) => !(r.type === "sparge" && r.name.trim().toLowerCase() === "sparge"));
  }, [mashRows, spargeConfigured]);

  useEffect(() => {
    if (!canCallAccountScoped || !recipeId) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchRecipeWaterSettings(recipeId);
        if (cancelled) return;
        setWaterSettings(data.settings as RecipeWaterSettingsResponse["settings"]);
      } catch {
        if (!cancelled) setWaterSettings(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCallAccountScoped, recipeId]);

  const hydrateMash = useCallback((params: {
    mash: { name: string; grainTemperatureC: number; steps: EditorMashStep[] } | null;
    ext: Record<string, unknown> | null;
  }) => {
    const mashMerged = mergeMashDeduceFromExt(params.mash, params.ext);
    if (mashMerged) {
      setMashProcedure({ name: mashMerged.name, grainTemperatureC: mashMerged.grainTemperatureC });
      setMashRows(mashMerged.steps);
      return;
    }
    setMashProcedure(null);
    setMashRows([]);
  }, []);

  const spargeStepTempDisplay = waterSettings?.spargeStepTemperatureC ?? 75;
  const spargeMethodLabel =
    waterSettings?.spargeMethodType === "batch_sparge"
      ? tSparge("spargeMethodBatchSparge")
      : tSparge("spargeMethodFlySparge");

  return {
    mashProcedure,
    setMashProcedure,
    mashRows,
    setMashRows,
    waterSettings,
    waterVolumes,
    spargeConfigured,
    mashRowsFiltered,
    spargeStepTempDisplay,
    spargeMethodLabel,
    hydrateMash,
  };
}
