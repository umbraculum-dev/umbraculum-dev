"use client";

import { useEffect, useMemo, useState } from "react";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/contracts";

import { webBreweryApiClient } from "../../../../../../../_lib/breweryWaterClient";
import {
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  newMashRowId,
  type EditorMashStep,
} from "../../../../_lib/beerjsonRecipe";

export type WaterMashStepsRecipe = {
  id: string;
  updatedAt: string;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
  analysis?: unknown;
};

export function useWaterMashStepsLoad(params: {
  canCall: boolean;
  recipeId: string;
  derivedMashWaterVolumeLiters: number;
}) {
  const { canCall, recipeId, derivedMashWaterVolumeLiters } = params;

  const [recipe, setRecipe] = useState<WaterMashStepsRecipe | null>(null);
  const [mashProcedure, setMashProcedure] = useState<{ name: string; grainTemperatureC: number } | null>(null);
  const [mashRows, setMashRows] = useState<EditorMashStep[]>([]);
  const [mashStepsDirty, setMashStepsDirty] = useState(false);
  const [mashStepsSaveStatus, setMashStepsSaveStatus] = useState<string | null>(null);
  const [mashStepsSaveError, setMashStepsSaveError] = useState<string | null>(null);
  const [mashStepsSaving, setMashStepsSaving] = useState(false);

  useEffect(() => {
    if (!canCall || !recipeId) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await getRecipe(webBreweryApiClient(), recipeId);
        if (cancelled) return;
        setRecipe(data.recipe as WaterMashStepsRecipe);
        setMashStepsDirty(false);
      } catch (err) {
        if (!cancelled) setMashStepsSaveError(String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCall, recipeId]);

  const waterVolumes = useMemo(() => {
    const analysis = recipe?.analysis;
    if (!analysis) return null;
    try {
      const parsed = parseGravityAnalysisResponseV1(analysis);
      const preBoil = parsed?.derivations?.["analysis.pre_boil_volume"];
      if (!preBoil?.inputs) return null;
      const mashIn = preBoil.inputs.find((i: { id: string }) => i.id === "mashWaterVolumeLiters")?.value;
      const spargeIn = preBoil.inputs.find((i: { id: string }) => i.id === "spargeVolumeLiters")?.value;
      const mashL = mashIn?.kind === "number" ? mashIn.value : null;
      const spargeL = spargeIn?.kind === "number" ? spargeIn.value : null;
      return mashL != null && spargeL != null ? { mashLiters: mashL, spargeLiters: spargeL } : null;
    } catch {
      return null;
    }
  }, [recipe?.analysis]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace(/^#/, "") || "";
    if (hash !== "mash-steps") return;
    const scrollToEl = () => {
      const el = document.getElementById("mash-steps");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToEl);
    });
    return () => cancelAnimationFrame(t);
  }, [recipe]);

  useEffect(() => {
    if (!recipe) return;
    const r = recipe;
    if (!r?.beerJsonRecipeJson) {
      if (!mashStepsDirty) {
        setMashProcedure(null);
        setMashRows([]);
      }
      return;
    }
    const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
    const mashMerged = mergeMashDeduceFromExt(s.mash, r.recipeExtJson);
    if (mashMerged && mashMerged.steps.length > 0) {
      if (!mashStepsDirty) {
        setMashProcedure({ name: mashMerged.name, grainTemperatureC: mashMerged.grainTemperatureC });
        setMashRows(mashMerged.steps);
      }
      return;
    }
    if (mashStepsDirty || mashRows.length > 0) return;
    const budget = derivedMashWaterVolumeLiters;
    if (budget > 0) {
      const step = {
        id: newMashRowId(),
        name: "Mash In",
        type: "infusion" as const,
        stepTemperatureC: 67,
        stepTimeMin: 60,
        amountL: budget,
      };
      setMashProcedure({ name: "Mash", grainTemperatureC: 20 });
      setMashRows([step]);
    } else {
      setMashProcedure(null);
      setMashRows([]);
    }
  }, [recipe, derivedMashWaterVolumeLiters, mashRows.length, mashStepsDirty]);

  return {
    recipe,
    setRecipe,
    mashProcedure,
    setMashProcedure,
    mashRows,
    setMashRows,
    mashStepsDirty,
    setMashStepsDirty,
    mashStepsSaveStatus,
    setMashStepsSaveStatus,
    mashStepsSaveError,
    setMashStepsSaveError,
    mashStepsSaving,
    setMashStepsSaving,
    waterVolumes,
  };
}
