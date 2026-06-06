import {
  buildWaterMashAcidificationHandlerMethods,
  type WaterMashAcidificationHandlerDeps,
} from "./waterMashAcidificationHandlerMethods";

export function createWaterMashAcidificationHandlers(deps: WaterMashAcidificationHandlerDeps) {
  const methods = buildWaterMashAcidificationHandlerMethods(deps);
  return {
    onSaveMashInputs: methods.onSaveMashInputs,
    computeAndSaveMashSnapshots: methods.computeAndSaveMashSnapshots,
    computeOverallMash: methods.computeOverallMash,
    onSubmitMash: methods.onSubmitMash,
    onCalculateOverall: methods.onCalculateOverall,
    _calcMashEstimatedPh: methods._calcMashEstimatedPh,
  };
}
