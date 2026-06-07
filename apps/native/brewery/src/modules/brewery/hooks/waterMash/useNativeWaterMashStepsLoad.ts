import { useCallback, useMemo, useState } from "react";

import {
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  newMashRowId,
  type EditorMashStep,
} from "@umbraculum/brewery-beerjson";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/brewery-contracts";
import type { WaterVolumes } from "@umbraculum/brewery-recipes-ui";

export type NativeWaterMashStepsRecipe = {
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
  analysis?: unknown;
};

export function useNativeWaterMashStepsLoad(params: { derivedMashWaterVolumeLiters: number }) {
  const { derivedMashWaterVolumeLiters } = params;

  const [recipe, setRecipe] = useState<NativeWaterMashStepsRecipe | null>(null);
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
    (d: NativeWaterMashStepsRecipe, mashStepsDirtyFlag: boolean) => {
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
  };
}
