"use client";

import { useState } from "react";

import { getRecipe, patchRecipe } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../_lib/typeGuards";
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
import type { EquipmentProfile, Recipe } from "../_lib/recipeEditTypes";

export function useRecipeEditSaveActions(params: {
  t: (key: string) => string;
  tEquip: (key: string) => string;
  recipeId: string;
  recipe: Recipe | null;
  setRecipe: (r: Recipe | null) => void;
  setAnalysis: (a: unknown) => void;
  setStyleKey: (k: string) => void;
  styleKey: string;
  name: string;
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
  equipmentProfiles: EquipmentProfile[];
  selectedEquipmentProfileId: string;
}) {
  const {
    t,
    tEquip,
    recipeId,
    recipe,
    setRecipe,
    setAnalysis,
    setStyleKey,
    styleKey,
    name,
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
    equipmentProfiles,
    selectedEquipmentProfileId,
  } = params;

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [equipmentApplyError, setEquipmentApplyError] = useState<string | null>(null);
  const [equipmentApplying, setEquipmentApplying] = useState(false);

  const applyEquipmentProfileToRecipe = async (mode: "apply" | "reload") => {
    if (!recipeId) return;
    setEquipmentApplyError(null);
    setEquipmentApplying(true);
    try {
      const selected = equipmentProfiles.find((p) => p.id === selectedEquipmentProfileId) ?? null;
      if (!selected) throw new Error(tEquip("errors.selectFirst"));

      const extBase = asRecord(recipe?.recipeExtJson);
      const base: Record<string, unknown> = extBase ? { ...extBase } : {};

      base["version"] = 1;
      base["equipment"] = selected.equipment;
      base["equipmentSource"] = { equipmentProfileId: selected.id, copiedAt: new Date().toISOString() };

      await patchRecipe(webBreweryApiClient(), recipeId, { recipeExtJson: base });

      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      const r = reload.recipe as unknown as Recipe;
      setRecipe(r);
      setAnalysis(r.analysis ?? null);
      setSaveStatus(mode === "reload" ? t("status.equipmentReloaded") : t("status.equipmentApplied"));
    } catch (err) {
      setEquipmentApplyError(String(err));
    } finally {
      setEquipmentApplying(false);
    }
  };

  const onSave = async () => {
    if (!recipeId) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    try {
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
        setSaveError(mashValidation.errors);
        setSaving(false);
        return;
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

      await patchRecipe(webBreweryApiClient(), recipeId, {
        name,
        styleKey,
        notes: notes || null,
        beerJsonRecipeJson,
        recipeExtJson,
      });

      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      const r = reload.recipe as unknown as Recipe;
      setRecipe(r);
      setAnalysis(r.analysis ?? null);
      setStyleKey(r.styleKey ?? styleKey);
      setSaveStatus(t("status.saved"));
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveError,
    saveStatus,
    setSaveStatus,
    equipmentApplyError,
    equipmentApplying,
    applyEquipmentProfileToRecipe,
    onSave,
  };
}
