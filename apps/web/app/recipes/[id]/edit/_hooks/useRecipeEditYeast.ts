"use client";

import { useCallback, useState } from "react";

import { mergeYeastAttenuationRangeFromExt, type EditorYeastRow } from "../../../_lib/beerjsonRecipe";

export function useRecipeEditYeast() {
  const [yeastRows, setYeastRows] = useState<EditorYeastRow[]>([]);
  const [yeastAttenuationOverrides, setYeastAttenuationOverrides] = useState<Record<string, string>>({});

  const hydrateYeast = useCallback((params: {
    yeastRows: EditorYeastRow[];
    ext: Record<string, unknown> | null;
    linksYeast: Record<string, unknown> | null;
    yeastPitchRateRaw: Record<string, unknown> | null;
    yeastFermentationTempRaw: Record<string, unknown> | null;
    yeastOxygenationRaw: Record<string, unknown> | null;
    yeastDiacetylRestRaw: Record<string, unknown> | null;
    yeastFormatRaw: Record<string, unknown> | null;
    yeastSpeciesRaw: Record<string, unknown> | null;
    yeastNeedsPropagationRaw: Record<string, unknown> | null;
    yeastCellsPerLRaw: Record<string, unknown> | null;
    yeastCellsPerKGRaw: Record<string, unknown> | null;
    yeastCellsPerGRaw: Record<string, unknown> | null;
  }) => {
    const {
      yeastRows: rows,
      ext,
      linksYeast,
      yeastPitchRateRaw,
      yeastFermentationTempRaw,
      yeastOxygenationRaw,
      yeastDiacetylRestRaw,
      yeastFormatRaw,
      yeastSpeciesRaw,
      yeastNeedsPropagationRaw,
      yeastCellsPerLRaw,
      yeastCellsPerKGRaw,
      yeastCellsPerGRaw,
    } = params;

    const baseYeast = mergeYeastAttenuationRangeFromExt(rows, ext);
    const yeast = baseYeast.map((row) => {
      const pitchRateVal = yeastPitchRateRaw?.[row.id];
      const pitchRate = typeof pitchRateVal === "string" ? pitchRateVal : null;

      const fermentationTempVal = yeastFermentationTempRaw?.[row.id];
      const fermentationTempC =
        typeof fermentationTempVal === "number" && Number.isFinite(fermentationTempVal) ? fermentationTempVal : null;

      const oxygenationVal = yeastOxygenationRaw?.[row.id];
      const oxygenation = oxygenationVal === "yes" || oxygenationVal === "no" ? oxygenationVal : null;

      const diacetylRestVal = yeastDiacetylRestRaw?.[row.id];
      const diacetylRest = diacetylRestVal === "yes" || diacetylRestVal === "no" ? diacetylRestVal : null;

      const formatVal = yeastFormatRaw?.[row.id];
      const format = formatVal === "dry" || formatVal === "liquid" || formatVal === "slurry" ? formatVal : null;

      const speciesRaw = yeastSpeciesRaw?.[row.id] ?? null;
      const validSpecies = [
        "saccharomyces_cerevisiae",
        "saccharomyces_pastorianus",
        "brettanomyces",
        "diastaticus",
        "other",
      ] as const;
      type YeastSpecies = (typeof validSpecies)[number];
      const species =
        typeof speciesRaw === "string" && (validSpecies as ReadonlyArray<string>).includes(speciesRaw)
          ? (speciesRaw as YeastSpecies)
          : null;

      const needsPropagationVal = yeastNeedsPropagationRaw?.[row.id];
      const needsPropagation = needsPropagationVal === "yes" || needsPropagationVal === "no" ? needsPropagationVal : null;

      const cellsPerLVal = yeastCellsPerLRaw?.[row.id];
      const cellsPerLOverride =
        typeof cellsPerLVal === "number" && Number.isFinite(cellsPerLVal) && cellsPerLVal > 0
          ? cellsPerLVal
          : null;

      const cellsPerKGVal = yeastCellsPerKGRaw?.[row.id];
      const cellsPerKGFromKG =
        typeof cellsPerKGVal === "number" && Number.isFinite(cellsPerKGVal) && cellsPerKGVal > 0
          ? cellsPerKGVal
          : null;

      const cellsPerGVal = yeastCellsPerGRaw?.[row.id];
      const cellsPerKGFromG =
        typeof cellsPerGVal === "number" && Number.isFinite(cellsPerGVal) && cellsPerGVal > 0
          ? cellsPerGVal * 1000
          : null;

      const cellsPerKGOverride = cellsPerKGFromKG ?? cellsPerKGFromG ?? null;

      return {
        ...row,
        ingredientId: linksYeast && typeof linksYeast[row.id] === "string" ? (linksYeast[row.id] as string) : null,
        pitchRate: pitchRate ?? undefined,
        fermentationTempC: fermentationTempC ?? undefined,
        oxygenation: oxygenation ?? undefined,
        diacetylRest: diacetylRest ?? undefined,
        format: format ?? undefined,
        species: species ?? undefined,
        needsPropagation: needsPropagation ?? undefined,
        cellsPerLOverride: cellsPerLOverride ?? undefined,
        cellsPerKGOverride: cellsPerKGOverride ?? undefined,
      };
    }) as EditorYeastRow[];
    setYeastRows(yeast);
  }, []);

  const hydrateYeastAttenuationOverrides = useCallback((raw: Record<string, unknown> | null) => {
    if (!raw) {
      setYeastAttenuationOverrides({});
      return;
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof k !== "string") continue;
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      out[k] = String(v);
    }
    setYeastAttenuationOverrides(out);
  }, []);

  const buildYeastOverrides = () => {
    const yeastAttenuationOverridesPercent = Object.fromEntries(
      Object.entries(yeastAttenuationOverrides)
        .map(([k, v]) => {
          const trimmed = v.trim();
          if (!trimmed) return null;
          const n = Number(trimmed);
          if (!Number.isFinite(n)) return null;
          return [k, n] as const;
        })
        .filter(Boolean) as Array<readonly [string, number]>,
    );
    const yeastPitchRateOverrides = Object.fromEntries(
      yeastRows
        .filter((r) => r.pitchRate != null && String(r.pitchRate).trim())
        .map((r) => [r.id, String(r.pitchRate).trim()]),
    );
    const yeastFermentationTempOverrides = Object.fromEntries(
      yeastRows
        .filter(
          (r) =>
            r.fermentationTempC != null &&
            Number.isFinite(r.fermentationTempC) &&
            r.fermentationTempC >= -10 &&
            r.fermentationTempC <= 50,
        )
        .map((r) => [r.id, r.fermentationTempC as number]),
    );
    const yeastOxygenationOverrides = Object.fromEntries(
      yeastRows.filter((r) => r.oxygenation === "yes" || r.oxygenation === "no").map((r) => [r.id, r.oxygenation]),
    );
    const yeastDiacetylRestOverrides = Object.fromEntries(
      yeastRows.filter((r) => r.diacetylRest === "yes" || r.diacetylRest === "no").map((r) => [r.id, r.diacetylRest]),
    );
    const yeastFormatOverrides = Object.fromEntries(
      yeastRows
        .filter((r) => r.format === "dry" || r.format === "liquid" || r.format === "slurry")
        .map((r) => [r.id, r.format]),
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
        .map((r) => [r.id, r.needsPropagation]),
    );
    const yeastCellsPerLOverrides = Object.fromEntries(
      yeastRows
        .filter((r) => r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride) && r.cellsPerLOverride > 0)
        .map((r) => [r.id, r.cellsPerLOverride]),
    );
    const yeastCellsPerKGOverrides = Object.fromEntries(
      yeastRows
        .filter(
          (r) => r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride) && r.cellsPerKGOverride > 0,
        )
        .map((r) => [r.id, r.cellsPerKGOverride]),
    );
    return {
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
    };
  };

  return {
    yeastRows,
    setYeastRows,
    yeastAttenuationOverrides,
    setYeastAttenuationOverrides,
    hydrateYeast,
    hydrateYeastAttenuationOverrides,
    buildYeastOverrides,
  };
}
