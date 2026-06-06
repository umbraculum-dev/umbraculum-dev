"use client";

import { useWaterMashStepsLoad } from "./useWaterMashStepsLoad";
import { useWaterMashStepsMutations } from "./useWaterMashStepsMutations";
import { useWaterMashStepsSave } from "./useWaterMashStepsSave";

export function useWaterMashSteps(params: {
  canCall: boolean;
  recipeId: string;
  derivedMashWaterVolumeLiters: number;
}) {
  const load = useWaterMashStepsLoad(params);

  const mutations = useWaterMashStepsMutations({
    derivedMashWaterVolumeLiters: params.derivedMashWaterVolumeLiters,
    mashRows: load.mashRows,
    setMashRows: load.setMashRows,
    setMashProcedure: load.setMashProcedure,
    setMashStepsDirty: load.setMashStepsDirty,
  });

  const save = useWaterMashStepsSave({
    canCall: params.canCall,
    recipeId: params.recipeId,
    recipe: load.recipe,
    setRecipe: load.setRecipe,
    mashRows: load.mashRows,
    mashProcedure: load.mashProcedure,
    waterVolumes: load.waterVolumes,
    derivedMashWaterVolumeLiters: params.derivedMashWaterVolumeLiters,
    computeFirstStepAmountL: mutations.computeFirstStepAmountL,
    setMashStepsDirty: load.setMashStepsDirty,
    setMashStepsSaveError: load.setMashStepsSaveError,
    setMashStepsSaveStatus: load.setMashStepsSaveStatus,
    setMashStepsSaving: load.setMashStepsSaving,
  });

  return {
    recipe: load.recipe,
    setRecipe: load.setRecipe,
    mashProcedure: load.mashProcedure,
    setMashProcedure: load.setMashProcedure,
    mashRows: load.mashRows,
    setMashRows: load.setMashRows,
    mashStepsDirty: load.mashStepsDirty,
    setMashStepsDirty: load.setMashStepsDirty,
    mashStepsSaveStatus: load.mashStepsSaveStatus,
    setMashStepsSaveStatus: load.setMashStepsSaveStatus,
    mashStepsSaveError: load.mashStepsSaveError,
    setMashStepsSaveError: load.setMashStepsSaveError,
    mashStepsSaving: load.mashStepsSaving,
    setMashStepsSaving: load.setMashStepsSaving,
    waterVolumes: load.waterVolumes,
    computeFirstStepAmountL: mutations.computeFirstStepAmountL,
    addMashStep: mutations.addMashStep,
    updateMashStep: mutations.updateMashStep,
    deleteMashStep: mutations.deleteMashStep,
    moveMashStep: mutations.moveMashStep,
    addMashFromTemplate: mutations.addMashFromTemplate,
    updateMashProcedure: mutations.updateMashProcedure,
    saveMashSteps: save.saveMashSteps,
  };
}
