import { sgToPlato } from "@umbraculum/brewery-core";

import {
  CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
  type YeastFormat,
  type YeastPitchRateKey,
} from "./editorTypes";

export function computeEstimatedCellsB(
  batchSizeLiters: number | null | undefined,
  ogEstimatedSg: number | null | undefined,
  pitchRateKey: YeastPitchRateKey | string | null | undefined,
): number | null {
  if (
    typeof batchSizeLiters !== "number" ||
    !Number.isFinite(batchSizeLiters) ||
    batchSizeLiters <= 0
  )
    return null;
  if (
    typeof ogEstimatedSg !== "number" ||
    !Number.isFinite(ogEstimatedSg) ||
    ogEstimatedSg <= 1
  )
    return null;
  const plato = sgToPlato(ogEstimatedSg);
  if (plato == null || plato <= 0) return null;
  const rate =
    pitchRateKey && pitchRateKey in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P
      ? PITCH_RATE_TO_MILLION_CELLS_PER_ML_P[pitchRateKey as YeastPitchRateKey]
      : null;
  if (rate == null) return null;
  const cellsB = batchSizeLiters * plato * rate;
  return Number.isFinite(cellsB) && cellsB > 0 ? cellsB : null;
}

export function computeCellsPerLFromManualCount(manual: {
  dilutionFactor: 200 | 2000;
  aliveCells: number;
  totalCells: number;
}): number | null {
  const { dilutionFactor, aliveCells, totalCells } = manual;
  if (
    !Number.isFinite(aliveCells) ||
    aliveCells <= 0 ||
    !Number.isFinite(totalCells) ||
    totalCells <= 0 ||
    aliveCells > totalCells
  )
    return null;
  if (dilutionFactor !== 200 && dilutionFactor !== 2000) return null;
  const cellsPerL = aliveCells * dilutionFactor * 0.05;
  return Number.isFinite(cellsPerL) && cellsPerL > 0 ? cellsPerL : null;
}

export function computeAmountFromCellsB(
  cellsB: number,
  format: YeastFormat,
  cellsPerLOverride?: number | null,
  cellsPerKGOverride?: number | null,
): { amountL: number | null; amountKg: number | null } {
  if (!Number.isFinite(cellsB) || cellsB <= 0) return { amountL: null, amountKg: null };
  if (format === "dry") {
    const cellsPerKg =
      cellsPerKGOverride != null && Number.isFinite(cellsPerKGOverride) && cellsPerKGOverride > 0
        ? cellsPerKGOverride
        : CELLS_PER_KG_DRY;
    const amountKg = cellsB / cellsPerKg;
    return { amountL: null, amountKg: Number.isFinite(amountKg) && amountKg > 0 ? amountKg : null };
  }
  const cellsPerL =
    cellsPerLOverride != null && Number.isFinite(cellsPerLOverride) && cellsPerLOverride > 0
      ? cellsPerLOverride
      : format === "liquid"
        ? CELLS_PER_L_LIQUID
        : CELLS_PER_L_SLURRY;
  const amountL = cellsB / cellsPerL;
  return { amountL: Number.isFinite(amountL) && amountL > 0 ? amountL : null, amountKg: null };
}
