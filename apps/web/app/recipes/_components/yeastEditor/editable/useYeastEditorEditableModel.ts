"use client";

import { useEffect, useState } from "react";

import {
  computeAmountFromCellsB,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
  type EditorYeastRow,
} from "../../../_lib/beerjsonRecipe";
import type { YeastEditorEditableProps, YeastEditorRowContext } from "../yeastEditorTypes";

export function useYeastEditorAmountRecalc(params: {
  yeastRows: EditorYeastRow[];
  batchSizeForCells: number | null;
  analysisOg: number | null | undefined;
  onUpdateRow: YeastEditorEditableProps["onUpdateRow"];
}) {
  const { yeastRows, batchSizeForCells, analysisOg, onUpdateRow } = params;
  const [amountRecalcTrigger, setAmountRecalcTrigger] = useState(0);
  const requestAmountRecalc = () => setAmountRecalcTrigger((n) => n + 1);

  useEffect(() => {
    for (const r of yeastRows) {
      const format = r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
      const pitchRateValid = r.pitchRate && r.pitchRate in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P;
      if (!format || !pitchRateValid || batchSizeForCells == null || analysisOg == null) continue;
      const cellsB = computeEstimatedCellsB(
        batchSizeForCells,
        analysisOg,
        r.pitchRate,
      );
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
        if (curr == null || Math.abs(curr - amountKg) > 0.0001) onUpdateRow(r.id, { amountKg });
      } else if (amountL != null) {
        const curr = r.amountL != null && Number.isFinite(r.amountL) ? r.amountL : null;
        if (curr == null || Math.abs(curr - amountL) > 0.0001) onUpdateRow(r.id, { amountL });
      }
    }
  }, [yeastRows, batchSizeForCells, analysisOg, onUpdateRow, amountRecalcTrigger]);

  return { requestAmountRecalc };
}

export function buildYeastEditorRowContext(params: {
  yeastRows: EditorYeastRow[];
  yeastAttenuationOverrides: YeastEditorEditableProps["yeastAttenuationOverrides"];
  batchSizeForCells: YeastEditorEditableProps["batchSizeForCells"];
  analysisOg: YeastEditorEditableProps["analysisOg"];
  surfaceMath: YeastEditorEditableProps["surfaceMath"];
  onRemoveRow: YeastEditorEditableProps["onRemoveRow"];
  onUpdateRow: YeastEditorEditableProps["onUpdateRow"];
  onAttenuationOverrideChange: YeastEditorEditableProps["onAttenuationOverrideChange"];
  onSave: YeastEditorEditableProps["onSave"];
  saving: YeastEditorEditableProps["saving"];
  canCallAccountScoped: YeastEditorEditableProps["canCallAccountScoped"];
  t: YeastEditorEditableProps["t"];
  tAnalysis: YeastEditorEditableProps["tAnalysis"];
  tUnits: YeastEditorEditableProps["tUnits"];
  formatAmount: YeastEditorEditableProps["formatAmount"];
  locale: YeastEditorEditableProps["locale"];
  lowViabilityWarning: YeastEditorEditableProps["lowViabilityWarning"];
  requestAmountRecalc: () => void;
}): YeastEditorRowContext {
  const firstManualCountRowIdx = params.yeastRows.findIndex(
    (r) =>
      r.format === "slurry" &&
      r.manualCellCount &&
      r.manualCellCount.aliveCells > 0 &&
      r.manualCellCount.totalCells > 0 &&
      (r.manualCellCount.dilutionFactor === 200 || r.manualCellCount.dilutionFactor === 2000),
  );

  return {
    yeastAttenuationOverrides: params.yeastAttenuationOverrides,
    batchSizeForCells: params.batchSizeForCells,
    analysisOg: params.analysisOg,
    surfaceMath: params.surfaceMath,
    onRemoveRow: params.onRemoveRow,
    onUpdateRow: params.onUpdateRow,
    onAttenuationOverrideChange: params.onAttenuationOverrideChange,
    onSave: params.onSave,
    saving: params.saving,
    canCallAccountScoped: params.canCallAccountScoped,
    t: params.t,
    tAnalysis: params.tAnalysis,
    tUnits: params.tUnits,
    formatAmount: params.formatAmount,
    locale: params.locale,
    lowViabilityWarning: params.lowViabilityWarning,
    firstManualCountRowIdx,
    requestAmountRecalc: params.requestAmountRecalc,
  };
}
