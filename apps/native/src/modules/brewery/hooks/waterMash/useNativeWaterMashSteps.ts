import { useNativeWaterMashStepsLoad } from "./useNativeWaterMashStepsLoad";
import { useNativeWaterMashStepsMutations } from "./useNativeWaterMashStepsMutations";
import { useNativeWaterMashStepsSave } from "./useNativeWaterMashStepsSave";

export function useNativeWaterMashSteps(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  derivedMashWaterVolumeLiters: number;
  setError: (value: string | null) => void;
  t: (key: string) => string;
  onAfterSave: () => void;
}) {
  const { canCall, recipeId, baseUrl, token, derivedMashWaterVolumeLiters, setError, t, onAfterSave } = params;

  const load = useNativeWaterMashStepsLoad({ derivedMashWaterVolumeLiters });

  const mutations = useNativeWaterMashStepsMutations({
    derivedMashWaterVolumeLiters,
    mashRows: load.mashRows,
    setMashRows: load.setMashRows,
    setMashProcedure: load.setMashProcedure,
    setMashStepsDirty: load.setMashStepsDirty,
    setError,
    t,
  });

  const save = useNativeWaterMashStepsSave({
    canCall,
    recipeId,
    baseUrl,
    token,
    recipe: load.recipe,
    mashRows: load.mashRows,
    mashProcedure: load.mashProcedure,
    waterVolumes: load.waterVolumes,
    derivedMashWaterVolumeLiters,
    computeFirstStepAmountL: load.computeFirstStepAmountL,
    setMashStepsDirty: load.setMashStepsDirty,
    setMashStepsSaving: load.setMashStepsSaving,
    setError,
    checkMashStepsBudget: mutations.checkMashStepsBudget,
    onAfterSave,
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
    mashStepsSaving: load.mashStepsSaving,
    setMashStepsSaving: load.setMashStepsSaving,
    waterVolumes: load.waterVolumes,
    computeFirstStepAmountL: load.computeFirstStepAmountL,
    applyRecipeMashState: load.applyRecipeMashState,
    addMashStep: mutations.addMashStep,
    updateMashStep: mutations.updateMashStep,
    deleteMashStep: mutations.deleteMashStep,
    moveMashStep: mutations.moveMashStep,
    addMashFromTemplate: mutations.addMashFromTemplate,
    saveMashSteps: save.saveMashSteps,
  };
}
