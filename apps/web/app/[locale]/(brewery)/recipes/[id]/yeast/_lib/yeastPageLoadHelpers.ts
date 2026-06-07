import { asRecord } from "../../../../../../_shared-layout/_lib/typeGuards";
import type { EditorYeastRow } from "../../../_lib/beerjsonRecipe";

export function parseYeastAttenuationOverridesFromExt(
  extRec: Record<string, unknown> | null,
): Record<string, string> {
  const yeastOverridesRaw = asRecord(extRec?.["yeastAttenuationOverridesPercent"]);
  if (yeastOverridesRaw) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(yeastOverridesRaw)) {
      if (typeof k !== "string") continue;
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      out[k] = String(v);
    }
    return out;
  }
  return {};
}

export function mergeYeastRowsWithExtOverrides(
  baseYeast: EditorYeastRow[],
  extRec: Record<string, unknown> | null,
  yeastLinks: Record<string, unknown> | null | undefined,
): EditorYeastRow[] {
  const yeastPitchRateRaw = asRecord(extRec?.["yeastPitchRateOverrides"]);
  const yeastFermentationTempRaw = asRecord(extRec?.["yeastFermentationTempOverrides"]);
  const yeastOxygenationRaw = asRecord(extRec?.["yeastOxygenationOverrides"]);
  const yeastDiacetylRestRaw = asRecord(extRec?.["yeastDiacetylRestOverrides"]);
  const yeastFormatRaw = asRecord(extRec?.["yeastFormatOverrides"] ?? extRec?.["yeastTypeOverrides"]);
  const yeastSpeciesRaw = asRecord(extRec?.["yeastSpeciesOverrides"]);
  const yeastNeedsPropagationRaw = asRecord(extRec?.["yeastNeedsPropagationOverrides"]);
  const yeastCellsPerLRaw = asRecord(extRec?.["yeastCellsPerLOverrides"]);
  const yeastCellsPerKGRaw = asRecord(extRec?.["yeastCellsPerKGOverrides"]);
  const yeastCellsPerGRaw = asRecord(extRec?.["yeastCellsPerGOverrides"]);
  const yeastManualCellCountRaw = asRecord(extRec?.["yeastManualCellCountOverrides"]);

  return baseYeast.map((row) => {
    const pitchRate =
      yeastPitchRateRaw && typeof yeastPitchRateRaw[row.id] === "string"
        ? (yeastPitchRateRaw[row.id] as string)
        : null;
    const fermentationTempC =
      yeastFermentationTempRaw &&
      typeof yeastFermentationTempRaw[row.id] === "number" &&
      Number.isFinite(yeastFermentationTempRaw[row.id])
        ? (yeastFermentationTempRaw[row.id] as number)
        : null;
    const oxygenation =
      yeastOxygenationRaw &&
      (yeastOxygenationRaw[row.id] === "yes" || yeastOxygenationRaw[row.id] === "no")
        ? (yeastOxygenationRaw[row.id] as "yes" | "no")
        : null;
    const diacetylRest =
      yeastDiacetylRestRaw &&
      (yeastDiacetylRestRaw[row.id] === "yes" || yeastDiacetylRestRaw[row.id] === "no")
        ? (yeastDiacetylRestRaw[row.id] as "yes" | "no")
        : null;
    const format =
      yeastFormatRaw &&
      (yeastFormatRaw[row.id] === "dry" || yeastFormatRaw[row.id] === "liquid" || yeastFormatRaw[row.id] === "slurry")
        ? (yeastFormatRaw[row.id] as "dry" | "liquid" | "slurry")
        : null;
    const speciesRaw = yeastSpeciesRaw ? yeastSpeciesRaw[row.id] : null;
    const validSpecies = [
      "saccharomyces_cerevisiae",
      "saccharomyces_pastorianus",
      "brettanomyces",
      "diastaticus",
      "other",
    ] as const;
    const species =
      typeof speciesRaw === "string" && (validSpecies as ReadonlyArray<string>).includes(speciesRaw)
        ? (speciesRaw as (typeof validSpecies)[number])
        : null;
    const needsPropagation =
      yeastNeedsPropagationRaw &&
      (yeastNeedsPropagationRaw[row.id] === "yes" || yeastNeedsPropagationRaw[row.id] === "no")
        ? (yeastNeedsPropagationRaw[row.id] as "yes" | "no")
        : null;
    const cellsPerLOverride =
      yeastCellsPerLRaw &&
      typeof yeastCellsPerLRaw[row.id] === "number" &&
      Number.isFinite(yeastCellsPerLRaw[row.id]) &&
      (yeastCellsPerLRaw[row.id] as number) > 0
        ? (yeastCellsPerLRaw[row.id] as number)
        : null;
    const cellsPerKGFromKG =
      yeastCellsPerKGRaw &&
      typeof yeastCellsPerKGRaw[row.id] === "number" &&
      Number.isFinite(yeastCellsPerKGRaw[row.id]) &&
      (yeastCellsPerKGRaw[row.id] as number) > 0
        ? (yeastCellsPerKGRaw[row.id] as number)
        : null;
    const cellsPerKGFromG =
      yeastCellsPerGRaw &&
      typeof yeastCellsPerGRaw[row.id] === "number" &&
      Number.isFinite(yeastCellsPerGRaw[row.id]) &&
      (yeastCellsPerGRaw[row.id] as number) > 0
        ? (yeastCellsPerGRaw[row.id] as number) * 1000
        : null;
    const cellsPerKGOverride = cellsPerKGFromKG ?? cellsPerKGFromG ?? null;
    const manualRaw =
      yeastManualCellCountRaw &&
      asRecord(yeastManualCellCountRaw[row.id])
        ? (yeastManualCellCountRaw[row.id] as { dilutionFactor?: number; aliveCells?: number; totalCells?: number })
        : null;
    const dilutionFactor =
      manualRaw?.dilutionFactor === 200 || manualRaw?.dilutionFactor === 2000
        ? (manualRaw.dilutionFactor)
        : undefined;
    const aliveCells =
      typeof manualRaw?.aliveCells === "number" && Number.isFinite(manualRaw.aliveCells) && manualRaw.aliveCells > 0
        ? manualRaw.aliveCells
        : undefined;
    const totalCells =
      typeof manualRaw?.totalCells === "number" && Number.isFinite(manualRaw.totalCells) && manualRaw.totalCells > 0
        ? manualRaw.totalCells
        : undefined;
    const manualCellCount =
      dilutionFactor != null && aliveCells != null && totalCells != null
        ? { dilutionFactor, aliveCells, totalCells }
        : undefined;
    return {
      ...row,
      ingredientId: typeof yeastLinks?.[row.id] === "string" ? (yeastLinks[row.id] as string) : null,
      pitchRate: pitchRate ?? undefined,
      fermentationTempC: fermentationTempC ?? undefined,
      oxygenation: oxygenation ?? undefined,
      diacetylRest: diacetylRest ?? undefined,
      format: format ?? undefined,
      species: species ?? undefined,
      needsPropagation: needsPropagation ?? undefined,
      cellsPerLOverride: cellsPerLOverride ?? undefined,
      cellsPerKGOverride: cellsPerKGOverride ?? undefined,
      manualCellCount: manualCellCount ?? undefined,
    };
  }) as EditorYeastRow[];
}
