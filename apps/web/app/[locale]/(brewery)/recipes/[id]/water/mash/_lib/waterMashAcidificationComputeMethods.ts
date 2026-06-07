import {
  calcMashOverall,
  computeAndSaveMash,
  estimateMashPh,
} from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";

import type { MashOverallResult } from "../../_lib/waterCalcTypes";
import {
  assertCanComputeAndSaveMash,
  assertMixedSourceProfile,
  buildComputeAndSaveMashPayload,
  buildOverallMashPayload,
  mapEstimateMashPhGristRequest,
} from "./waterMashAcidificationPayloads";
import {
  applyDerivedComputeResultsState,
  deriveApplyComputeResultsState,
  parseEstimatedMashPhFromResult,
  type ComputeAndSaveMashResult,
} from "./waterMashAcidificationComputeState";
import type { WaterMashAcidificationHandlerDeps } from "./waterMashAcidificationHandlerMethods";

export function buildWaterMashAcidificationComputeMethods(deps: WaterMashAcidificationHandlerDeps) {
  const applyComputeResults = (computed: ComputeAndSaveMashResult) => {
    applyDerivedComputeResultsState(deriveApplyComputeResultsState(computed), {
      setFormatHints: deps.setFormatHints,
      applySaltsFromCompute: (result, derivation) =>
        deps.saltsBridgeRef.current.applySaltsFromCompute(result, derivation),
      setAcidDerivation: deps.setAcidDerivation,
      setOverallDerivation: deps.setOverallDerivation,
      setOverallResult: deps.setOverallResult,
      setOverallStatus: deps.setOverallStatus,
      setMashManualResult: deps.setMashManualResult,
      setMashManualStatus: deps.setMashManualStatus,
      setMashResult: deps.setMashResult,
      setMashStatus: deps.setMashStatus,
      setMashCalcSaveStatus: deps.setMashCalcSaveStatus,
    });
  };

  const computeAndSaveMashSnapshots = async () => {
    const { sourceProfileId, dilutionProfileId, tapVolumeLiters, dilutionVolumeLiters } =
      deps.adjustmentFieldsRef.current;
    assertCanComputeAndSaveMash(deps.canCall, deps.recipeId, sourceProfileId);

    const payload = buildComputeAndSaveMashPayload({
      sourceProfileId,
      dilutionProfileId,
      tapVolumeLiters,
      dilutionVolumeLiters,
      mashStartingAlk: deps.mashStartingAlk,
      mashStartingPh: deps.mashStartingPh,
      mashTargetPh: deps.mashTargetPh,
      mashAcidType: deps.mashAcidType,
      mashStrengthKind: deps.mashStrengthKind,
      mashStrengthValue: deps.mashStrengthValue,
      mashAcidificationMode: deps.mashAcidificationMode,
      mashManualAcidAdded: deps.mashManualAcidAdded,
      saltAdditions: deps.saltAdditions,
      gristRows: deps.gristBridgeRef.current.gristImportedRows,
    });

    return computeAndSaveMash(webBreweryApiClient(), deps.recipeId, payload);
  };

  const computeOverallMash = async (): Promise<MashOverallResult> => {
    const { mixedSourceProfile, derivedMashWaterVolumeLiters } = deps.adjustmentFieldsRef.current;
    assertMixedSourceProfile(mixedSourceProfile);

    const payload = buildOverallMashPayload({
      mashAcidificationMode: deps.mashAcidificationMode,
      mashStartingAlk: deps.mashStartingAlk,
      mashStartingPh: deps.mashStartingPh,
      mashTargetPh: deps.mashTargetPh,
      derivedMashWaterVolumeLiters,
      mixedSourceProfile,
      saltAdditions: deps.saltAdditions,
      mashAcidType: deps.mashAcidType,
      mashStrengthKind: deps.mashStrengthKind,
      mashStrengthValue: deps.mashStrengthValue,
      mashManualAcidAdded: deps.mashManualAcidAdded,
      gristRows: deps.gristBridgeRef.current.gristImportedRows,
    });

    const data = await calcMashOverall(webBreweryApiClient(), payload);
    deps.setOverallDerivation(data.derivation as WaterCalcDerivation);
    return data.result as MashOverallResult;
  };

  return {
    applyComputeResults,
    computeAndSaveMashSnapshots,
    computeOverallMash,
    _calcMashEstimatedPh: async (args: {
      volumeLiters: number;
      alkalinityPpmCaCO3: number;
      calciumPpm?: number;
      magnesiumPpm?: number;
      grist: Array<{
        amountKg: number;
        colorLovibond: number | null;
        maltClass: "base" | "crystal" | "roast" | "acid";
        mashDiPh?: number | null;
        mashTaToPh57_mEqPerKg?: number | null;
      }>;
      acidAdded_mEqPerL?: number;
    }) => {
      if (!deps.canCall) return null;
      const data = await estimateMashPh(webBreweryApiClient(), {
        volumeLiters: args.volumeLiters,
        alkalinityPpmCaCO3: args.alkalinityPpmCaCO3,
        calciumPpm: args.calciumPpm,
        magnesiumPpm: args.magnesiumPpm,
        grist: mapEstimateMashPhGristRequest(args.grist),
        acidAdded_mEqPerL: args.acidAdded_mEqPerL,
      });
      return parseEstimatedMashPhFromResult(data.result) ?? null;
    },
  };
}
