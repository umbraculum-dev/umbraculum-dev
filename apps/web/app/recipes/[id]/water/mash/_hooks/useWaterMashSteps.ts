"use client";

import { useEffect, useMemo, useState } from "react";

import { getRecipe, patchRecipe } from "@umbraculum/api-client/brewery";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/contracts";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../_lib/typeGuards";
import {
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  replaceMashInBeerJsonDocument,
  validateMashBeforeSave,
  MASH_TEMPLATES,
  newMashRowId,
  type EditorMashStep,
} from "../../../../_lib/beerjsonRecipe";

type RecipeResponse = {
  recipe: {
    id: string;
    updatedAt: string;
    beerJsonRecipeJson?: unknown;
    recipeExtJson?: unknown;
    analysis?: unknown;
  };
};

export function useWaterMashSteps(params: {
  canCall: boolean;
  recipeId: string;
  derivedMashWaterVolumeLiters: number;
}) {
  const { canCall, recipeId, derivedMashWaterVolumeLiters } = params;

  const [recipe, setRecipe] = useState<RecipeResponse["recipe"] | null>(null);
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
        setRecipe(data.recipe as RecipeResponse["recipe"]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mashRows.length is intentional guard
  }, [recipe, derivedMashWaterVolumeLiters, mashRows.length, mashStepsDirty]);

  const computeFirstStepAmountL = useMemo(() => {
    const otherInfusionSum = mashRows
      .slice(1)
      .filter((r) => r.deduceFromMashIn === true)
      .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
    return Math.max(0, derivedMashWaterVolumeLiters - otherInfusionSum);
  }, [mashRows, derivedMashWaterVolumeLiters]);

  const addMashStep = () => {
    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      {
        id: newMashRowId(),
        name: "",
        type: "infusion",
        stepTemperatureC: 67,
        stepTimeMin: 60,
        amountL: 0,
        deduceFromMashIn: false,
      },
    ]);
  };

  const updateMashStep = (id: string, patch: Partial<EditorMashStep>) => {
    setMashStepsDirty(true);
    setMashRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const row = idx >= 0 ? prev[idx] : null;
      if (!row) return prev;

      let nextPatch = patch;

      if ("deduceFromMashIn" in nextPatch && idx > 0) {
        if (nextPatch.deduceFromMashIn !== true) {
          nextPatch = { ...nextPatch, amountL: 0 };
        } else if (row.amountL != null) {
          const otherSum = prev
            .filter((r, i) => i !== idx && i !== 0 && r.deduceFromMashIn === true)
            .reduce((s, r) => s + (r.amountL ?? 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          nextPatch = { ...nextPatch, amountL: Math.min(row.amountL, available) };
        }
      }

      if ("amountL" in nextPatch && nextPatch.amountL != null && idx > 0) {
        if ((row.deduceFromMashIn ?? false) !== true) {
          nextPatch = { ...nextPatch, amountL: 0 };
        } else {
          const otherSum = prev
            .filter((r, i) => i !== idx && i !== 0 && r.deduceFromMashIn === true)
            .reduce((s, r) => s + (r.amountL ?? 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          nextPatch = { ...nextPatch, amountL: Math.min(nextPatch.amountL, available) };
        }
      }

      return prev.map((r) => (r.id === id ? { ...r, ...nextPatch } : r));
    });
  };

  const deleteMashStep = (id: string) => {
    setMashStepsDirty(true);
    setMashRows((prev) => prev.filter((r) => r.id !== id));
  };

  const moveMashStep = (id: string, direction: "up" | "down") => {
    setMashStepsDirty(true);
    setMashRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const row = idx >= 0 ? prev[idx] : null;
      if (!row) return prev;

      const isSpargeRow = (r: EditorMashStep) => r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
      if (idx <= 0 || isSpargeRow(row)) return prev;

      const movable = prev
        .map((r, i) => ({ r, i }))
        .filter(({ r, i }) => i > 0 && !isSpargeRow(r))
        .map(({ i }) => i);
      if (!movable.length) return prev;

      const targetIdx =
        direction === "up"
          ? [...movable].reverse().find((i) => i < idx) ?? null
          : movable.find((i) => i > idx) ?? null;
      if (targetIdx == null) return prev;

      const next = prev.slice();
      const tmp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = tmp;
      return next;
    });
  };

  const addMashFromTemplate = (templateId: string) => {
    const tpl = MASH_TEMPLATES.find((x) => x.id === templateId);
    if (!tpl) return;
    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      ...tpl.steps.map((s) => ({
        ...s,
        id: newMashRowId(),
        deduceFromMashIn: false,
      })),
    ]);
  };

  const updateMashProcedure = (patch: { name?: string; grainTemperatureC?: number }) => {
    setMashStepsDirty(true);
    setMashProcedure((prev) => {
      const base = prev ?? { name: "Mash", grainTemperatureC: 20 };
      return { ...base, ...patch };
    });
  };

  const saveMashSteps = async () => {
    if (!canCall || !recipeId || !recipe?.beerJsonRecipeJson) return;
    setMashStepsSaveError(null);
    setMashStepsSaveStatus(null);
    setMashStepsSaving(true);
    try {
      const stepsForSave = mashRows.map((r, idx) => {
        if (r.type === "sparge" && r.name.trim().toLowerCase() === "sparge" && waterVolumes) {
          return { ...r, amountL: waterVolumes.spargeLiters };
        }
        if (idx === 0 && r.type === "infusion" && derivedMashWaterVolumeLiters > 0) {
          return { ...r, amountL: computeFirstStepAmountL };
        }
        if (idx > 0 && r.deduceFromMashIn !== true) {
          return { ...r, amountL: 0 };
        }
        return r;
      });
      const mash =
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
        setMashStepsSaveError(mashValidation.errors);
        return;
      }
      const newDoc = replaceMashInBeerJsonDocument(recipe.beerJsonRecipeJson, mash);
      const extBase = asRecord(recipe.recipeExtJson) ?? { version: 1 };
      const mashStepDeduceFromMashIn = Object.fromEntries(
        mashRows
          .map((r, idx) => [String(idx), r.deduceFromMashIn === true] as const)
          .filter(([k, v]) => k !== "0" && v === true),
      );
      const recipeExtJson = { ...extBase, mashStepDeduceFromMashIn };
      await patchRecipe(webBreweryApiClient(), recipeId, { beerJsonRecipeJson: newDoc, recipeExtJson });
      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      setRecipe(reload.recipe as RecipeResponse["recipe"]);
      setMashStepsDirty(false);
      setMashStepsSaveStatus("Saved.");
    } catch (err) {
      setMashStepsSaveError(String(err));
    } finally {
      setMashStepsSaving(false);
    }
  };

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
    computeFirstStepAmountL,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    updateMashProcedure,
    saveMashSteps,
  };
}
