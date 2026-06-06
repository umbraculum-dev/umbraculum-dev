import type { EditorYeastRow } from "../../../_lib/beerjsonRecipe";

export function buildYeastOverrideMaps(yeastRows: EditorYeastRow[]) {
  const yeastPitchRateOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.pitchRate != null && String(r.pitchRate).trim())
      .map((r) => [r.id, String(r.pitchRate).trim()]),
  );
  const yeastFermentationTempOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.fermentationTempC != null && Number.isFinite(r.fermentationTempC) && r.fermentationTempC >= -10 && r.fermentationTempC <= 50,
      )
      .map((r) => [r.id, r.fermentationTempC as number]),
  );
  const yeastOxygenationOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.oxygenation === "yes" || r.oxygenation === "no")
      .map((r) => [r.id, r.oxygenation as "yes" | "no"]),
  );
  const yeastDiacetylRestOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.diacetylRest === "yes" || r.diacetylRest === "no")
      .map((r) => [r.id, r.diacetylRest as "yes" | "no"]),
  );
  const yeastFormatOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.format === "dry" || r.format === "liquid" || r.format === "slurry")
      .map((r) => [r.id, r.format as "dry" | "liquid" | "slurry"]),
  );
  const yeastSpeciesOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.species === "saccharomyces_cerevisiae" ||
          r.species === "saccharomyces_pastorianus" ||
          r.species === "brettanomyces" ||
          r.species === "diastaticus" ||
          r.species === "other",
      )
      .map((r) => [r.id, r.species!]),
  );
  const yeastNeedsPropagationOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.needsPropagation === "yes" || r.needsPropagation === "no")
      .map((r) => [r.id, r.needsPropagation as "yes" | "no"]),
  );
  const yeastCellsPerLOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride) && r.cellsPerLOverride > 0,
      )
      .map((r) => [r.id, r.cellsPerLOverride as number]),
  );
  const yeastCellsPerKGOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride) && r.cellsPerKGOverride > 0,
      )
      .map((r) => [r.id, r.cellsPerKGOverride as number]),
  );
  const yeastManualCellCountOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.manualCellCount != null &&
          (r.manualCellCount.dilutionFactor === 200 || r.manualCellCount.dilutionFactor === 2000) &&
          Number.isFinite(r.manualCellCount.aliveCells) &&
          r.manualCellCount.aliveCells > 0 &&
          Number.isFinite(r.manualCellCount.totalCells) &&
          r.manualCellCount.totalCells > 0 &&
          r.manualCellCount.aliveCells <= r.manualCellCount.totalCells,
      )
      .map((r) => [
        r.id,
        {
          dilutionFactor: r.manualCellCount!.dilutionFactor,
          aliveCells: r.manualCellCount!.aliveCells,
          totalCells: r.manualCellCount!.totalCells,
        },
      ]),
  );

  return {
    yeastPitchRateOverrides,
    yeastFermentationTempOverrides,
    yeastOxygenationOverrides,
    yeastDiacetylRestOverrides,
    yeastFormatOverrides,
    yeastSpeciesOverrides,
    yeastNeedsPropagationOverrides,
    yeastCellsPerLOverrides,
    yeastCellsPerKGOverrides,
    yeastManualCellCountOverrides,
  };
}
