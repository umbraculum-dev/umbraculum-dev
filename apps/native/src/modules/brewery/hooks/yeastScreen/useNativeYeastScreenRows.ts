import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import {
  computeAmountFromCellsB,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  type EditorYeastRow,
  YEAST_PITCH_RATE_OPTIONS,
} from "@umbraculum/brewery-beerjson";

import { asRecord } from "../../../../lib/typeGuards";
import { newRowId } from "./yeastScreenHelpers";
import type { Recipe } from "./yeastScreenHelpers";

export function useNativeYeastScreenRows(params: {
  recipe: Recipe | null;
  yeastRows: EditorYeastRow[];
  setYeastRows: Dispatch<SetStateAction<EditorYeastRow[]>>;
  yeastAttenuationOverrides: Record<string, string>;
  setYeastAttenuationOverrides: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const { recipe, yeastRows, setYeastRows, setYeastAttenuationOverrides } = params;

  const [openAdvancedSections, setOpenAdvancedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenAdvancedSections((prev) => {
      const rowIds = new Set(yeastRows.map((r) => r.id));
      const next: Record<string, boolean> = {};
      for (const id of rowIds) {
        next[id] = prev[id] ?? true;
      }
      return next;
    });
  }, [yeastRows]);

  const addYeastRow = (row?: Partial<EditorYeastRow>) => {
    setYeastRows((prev) => [
      ...prev,
      { id: newRowId(), ingredientId: null, name: "", lab: null, productId: null, attenuationMin: null, attenuationMax: null, ...row },
    ]);
  };

  const removeYeastRow = (id: string) => {
    setYeastRows((prev) => prev.filter((r) => r.id !== id));
    setYeastAttenuationOverrides((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateYeastRow = (id: string, patch: Partial<EditorYeastRow>) =>
    setYeastRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const onAttenuationOverrideChange = (id: string, value: string) =>
    setYeastAttenuationOverrides((prev) => ({ ...prev, [id]: value }));

  const batchSizeForCells = asRecord(recipe?.recipeExtJson)?.['batchSizeLiters'] ?? null;
  const analysisKettleVolume = recipe?.analysis?.result?.kettleVolumeLiters ?? null;
  const analysisOg = recipe?.analysis?.result?.ogEstimatedSg ?? null;
  const batchSizeForCellsVal =
    typeof batchSizeForCells === "number" && Number.isFinite(batchSizeForCells) && batchSizeForCells > 0
      ? batchSizeForCells
      : typeof analysisKettleVolume === "number" && Number.isFinite(analysisKettleVolume) && analysisKettleVolume > 0
        ? analysisKettleVolume
        : null;

  useEffect(() => {
    for (const r of yeastRows) {
      const format = r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
      const pitchRateValid = r.pitchRate && YEAST_PITCH_RATE_OPTIONS.some((o) => o.value === r.pitchRate);
      if (!format || !pitchRateValid || batchSizeForCellsVal == null || analysisOg == null) continue;
      const cellsB = computeEstimatedCellsB(batchSizeForCellsVal, analysisOg, r.pitchRate);
      if (cellsB == null) continue;
      const cellsPerLOverride =
        format === "slurry" && r.manualCellCount
          ? computeCellsPerLFromManualCount(r.manualCellCount)
          : r.cellsPerLOverride;
      const { amountL, amountKg } = computeAmountFromCellsB(
        cellsB,
        format,
        cellsPerLOverride,
        r.cellsPerKGOverride,
      );
      if (format === "dry" && amountKg != null) {
        const curr = r.amountKg != null && Number.isFinite(r.amountKg) ? r.amountKg : null;
        if (curr == null || Math.abs(curr - amountKg) > 0.0001) updateYeastRow(r.id, { amountKg });
      } else if (amountL != null) {
        const curr = r.amountL != null && Number.isFinite(r.amountL) ? r.amountL : null;
        if (curr == null || Math.abs(curr - amountL) > 0.0001) updateYeastRow(r.id, { amountL });
      }
    }
  }, [yeastRows, batchSizeForCellsVal, analysisOg]);

  return {
    openAdvancedSections,
    setOpenAdvancedSections,
    addYeastRow,
    removeYeastRow,
    updateYeastRow,
    onAttenuationOverrideChange,
    batchSizeForCellsVal,
    analysisOg,
  };
}
