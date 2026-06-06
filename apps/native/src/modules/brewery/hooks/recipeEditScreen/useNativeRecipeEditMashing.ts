import { useMemo } from "react";

import { parseGravityAnalysisResponseV1 } from "@umbraculum/brewery-contracts";
import type { EditorMashStep } from "@umbraculum/brewery-beerjson";
import type { WaterVolumes } from "@umbraculum/brewery-recipes-ui";

export function useNativeRecipeEditMashing(params: { analysis: unknown; mashRows: EditorMashStep[] }) {
  const { analysis, mashRows } = params;

  const waterVolumes = useMemo((): WaterVolumes | null => {
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
  }, [analysis]);

  const spargeConfigured = waterVolumes != null && waterVolumes.spargeLiters > 0;

  const mashRowsFiltered = useMemo(() => {
    if (!spargeConfigured) return mashRows;
    return mashRows.filter(
      (r) => !(r.type === "sparge" && r.name.trim().toLowerCase() === "sparge"),
    );
  }, [mashRows, spargeConfigured]);

  const spargeRows = useMemo(
    () => mashRows.filter((r) => r.type === "sparge"),
    [mashRows],
  );

  return { waterVolumes, spargeConfigured, mashRowsFiltered, spargeRows };
}
