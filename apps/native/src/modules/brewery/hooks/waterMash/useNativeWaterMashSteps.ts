import { useCallback, useMemo, useState } from "react";

import { patchRecipe } from "@umbraculum/api-client/brewery";
import {
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  MASH_TEMPLATES,
  newMashRowId,
  replaceMashInBeerJsonDocument,
  validateMashBeforeSave,
  type EditorMashStep,
} from "@umbraculum/brewery-beerjson";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/contracts";
import type { WaterVolumes } from "@umbraculum/brewery-recipes-ui";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";

type MashRecipe = {
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
  analysis?: unknown;
};

export function useNativeWaterMashSteps(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  derivedMashWaterVolumeLiters: number;
  setError: (value: string | null) => void;
  t: (key: string) => string;
  onAfterSave: () => void;
}) {
  const { canCall, recipeId, baseUrl, token, derivedMashWaterVolumeLiters, setError, t, onAfterSave } = params;

  const [recipe, setRecipe] = useState<MashRecipe | null>(null);
  const [mashProcedure, setMashProcedure] = useState<{ name: string; grainTemperatureC: number } | null>(null);
  const [mashRows, setMashRows] = useState<EditorMashStep[]>([]);
  const [mashStepsDirty, setMashStepsDirty] = useState(false);
  const [mashStepsSaving, setMashStepsSaving] = useState(false);

  const waterVolumes = useMemo((): WaterVolumes | null => {
    const analysis = recipe?.analysis;
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
  }, [recipe]);

  const computeFirstStepAmountL = useMemo(() => {
    const otherInfusionSum = mashRows
      .slice(1)
      .filter((r) => r.deduceFromMashIn === true)
      .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
    return Math.max(0, derivedMashWaterVolumeLiters - otherInfusionSum);
  }, [mashRows, derivedMashWaterVolumeLiters]);

  const applyRecipeMashState = useCallback(
    (d: MashRecipe, mashStepsDirtyFlag: boolean) => {
      setRecipe(d);
      if (d["beerJsonRecipeJson"] && !mashStepsDirtyFlag) {
        const s = editorStateFromBeerJson(d["beerJsonRecipeJson"]);
        const mashMerged = mergeMashDeduceFromExt(s.mash, d["recipeExtJson"]);
        if (mashMerged?.steps?.length) {
          setMashProcedure({ name: mashMerged.name, grainTemperatureC: mashMerged.grainTemperatureC });
          setMashRows(mashMerged.steps);
        } else if (derivedMashWaterVolumeLiters > 0) {
          setMashProcedure({ name: "Mash", grainTemperatureC: 20 });
          setMashRows([
            {
              id: newMashRowId(),
              name: "Mash In",
              type: "infusion",
              stepTemperatureC: 67,
              stepTimeMin: 60,
              amountL: derivedMashWaterVolumeLiters,
            },
          ]);
        }
      }
    },
    [derivedMashWaterVolumeLiters],
  );

  const checkMashStepsBudget = useCallback(() => {
    if (derivedMashWaterVolumeLiters > 0) {
      const otherInfusionSum = mashRows
        .slice(1)
        .filter((r) => r.deduceFromMashIn === true)
        .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
      if (otherInfusionSum > derivedMashWaterVolumeLiters) {
        setError(t("mashStepsBudgetExceeded"));
        return false;
      }
    }
    return true;
  }, [derivedMashWaterVolumeLiters, mashRows, setError, t]);

  const addMashStep = () => {
    if (!checkMashStepsBudget()) return;

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
      if (idx < 0) return prev;

      const row = prev[idx];
      if (!row) return prev;
      let nextPatch = { ...patch };

      if (idx > 0 && "deduceFromMashIn" in nextPatch) {
        const checked = nextPatch.deduceFromMashIn === true;
        nextPatch = {
          ...nextPatch,
          deduceFromMashIn: checked,
          ...(checked ? {} : { amountL: 0 }),
        };
      }

      if (idx > 0 && "amountL" in nextPatch) {
        const requested = typeof nextPatch.amountL === "number" && Number.isFinite(nextPatch.amountL) ? nextPatch.amountL : 0;
        if (row.deduceFromMashIn !== true && nextPatch.deduceFromMashIn !== true) {
          nextPatch = { ...nextPatch, amountL: 0 };
        } else {
          const otherSum = prev
            .filter((r, i) => i !== idx && i !== 0)
            .reduce((s, r) => s + (r.deduceFromMashIn === true ? (r.amountL ?? 0) : 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          nextPatch = { ...nextPatch, amountL: Math.min(Math.max(0, requested), available) };
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
      const target = next[targetIdx];
      if (!tmp || !target) return prev;
      next[idx] = target;
      next[targetIdx] = tmp;
      return next;
    });
  };

  const addMashFromTemplate = (templateId: string) => {
    const tpl = MASH_TEMPLATES.find((x) => x.id === templateId);
    if (!tpl) return;

    if (!checkMashStepsBudget()) return;

    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      ...tpl.steps.map((s) => ({ ...s, id: newMashRowId(), deduceFromMashIn: false })),
    ]);
  };

  const saveMashSteps = async () => {
    if (!canCall || !recipe?.beerJsonRecipeJson) return;
    setError(null);
    setMashStepsSaving(true);
    try {
      if (!checkMashStepsBudget()) return;

      const stepsForSave = mashRows.map((r, idx) => {
        if (r.type === "sparge" && r.name.trim().toLowerCase() === "sparge" && waterVolumes) {
          return { ...r, amountL: waterVolumes.spargeLiters };
        }
        if (idx === 0 && r.type === "infusion" && derivedMashWaterVolumeLiters > 0) {
          return { ...r, amountL: computeFirstStepAmountL };
        }
        return r;
      });

      const mash =
        mashRows.length > 0 && mashProcedure
          ? { name: mashProcedure.name, grainTemperatureC: mashProcedure.grainTemperatureC, steps: stepsForSave }
          : mashRows.length > 0
            ? { name: "Mash", grainTemperatureC: 20, steps: stepsForSave }
            : null;
      const validation = validateMashBeforeSave(mash);
      if (!validation.ok) {
        setError(validation.errors);
        return;
      }
      const newDoc = replaceMashInBeerJsonDocument(recipe.beerJsonRecipeJson, mash);
      const extBase =
        recipe.recipeExtJson && typeof recipe.recipeExtJson === "object"
          ? recipe.recipeExtJson
          : ({ version: 1 } as Record<string, unknown>);
      const mashStepDeduceFromMashIn = Object.fromEntries(
        mashRows
          .map((r, idx) => [String(idx), r.deduceFromMashIn === true] as const)
          .filter(([k, v]) => k !== "0" && v === true),
      );
      const recipeExtJson = { ...(extBase as Record<string, unknown>), mashStepDeduceFromMashIn };
      const api = nativePlatformApiClient(token!, baseUrl);
      await patchRecipe(api, recipeId, {
        beerJsonRecipeJson: newDoc,
        recipeExtJson,
      });
      setMashStepsDirty(false);
      onAfterSave();
    } catch (err) {
      setError(String(err));
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
    mashStepsSaving,
    setMashStepsSaving,
    waterVolumes,
    computeFirstStepAmountL,
    applyRecipeMashState,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    saveMashSteps,
  };
}
