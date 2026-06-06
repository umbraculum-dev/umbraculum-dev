import type { EditorYeastRow } from "../../../_lib/beerjsonRecipe";

export type ManualCellCount = NonNullable<EditorYeastRow["manualCellCount"]>;

export function isValidDilutionFactor(
  df: number | null | undefined,
): df is 200 | 2000 {
  return df === 200 || df === 2000;
}

export function buildManualCellCountFromDilutionFactor(
  df: 200 | 2000,
  prev: ManualCellCount | null | undefined,
): ManualCellCount {
  return {
    dilutionFactor: df,
    aliveCells:
      prev?.aliveCells != null && Number.isFinite(prev.aliveCells) && prev.aliveCells > 0
        ? prev.aliveCells
        : 0,
    totalCells:
      prev?.totalCells != null && Number.isFinite(prev.totalCells) && prev.totalCells > 0
        ? prev.totalCells
        : 0,
  };
}

export function buildManualCellCountWithAlive(
  df: 200 | 2000,
  alive: number | null,
  prev: ManualCellCount | null | undefined,
): ManualCellCount {
  const prevTotal =
    prev?.totalCells != null && Number.isFinite(prev.totalCells) && prev.totalCells > 0
      ? prev.totalCells
      : 0;
  return {
    dilutionFactor: df,
    aliveCells: alive ?? 0,
    totalCells: prevTotal,
  };
}

export function buildManualCellCountWithTotal(
  df: 200 | 2000,
  total: number | null,
  prev: ManualCellCount | null | undefined,
): ManualCellCount {
  const prevAlive =
    prev?.aliveCells != null && Number.isFinite(prev.aliveCells) && prev.aliveCells >= 0
      ? prev.aliveCells
      : 0;
  return {
    dilutionFactor: df,
    aliveCells: prevAlive,
    totalCells: total ?? 0,
  };
}

export function computeManualCountViability(aliveCells: number, totalCells: number) {
  const rawViability = (aliveCells / totalCells) * 100;
  return {
    rawViability,
    displayViability: Math.min(100, rawViability),
    isInvalid: rawViability > 100,
  };
}

export function isManualCountCompleteForSave(manualCellCount: ManualCellCount | null | undefined) {
  return (
    manualCellCount != null &&
    manualCellCount.aliveCells > 0 &&
    manualCellCount.totalCells > 0 &&
    isValidDilutionFactor(manualCellCount.dilutionFactor)
  );
}

export function computeLiveCellsPerGram(manualCellCount: ManualCellCount) {
  return manualCellCount.aliveCells * 5 * manualCellCount.dilutionFactor * 10000;
}

export function isTotalCellsTooLow(manualCellCount: ManualCellCount | null | undefined) {
  return (
    manualCellCount?.aliveCells != null &&
    manualCellCount.aliveCells > 0 &&
    manualCellCount?.totalCells != null &&
    manualCellCount.totalCells > 0 &&
    manualCellCount.totalCells < manualCellCount.aliveCells
  );
}
