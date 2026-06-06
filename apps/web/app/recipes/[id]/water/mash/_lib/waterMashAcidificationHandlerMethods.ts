import type { FormEvent } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import {
  calcMashOverall,
  computeAndSaveMash,
  estimateMashPh,
} from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation } from "@umbraculum/contracts";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import type {
  MashOverallResult,
  WaterAcidResult,
  WaterAcidificationMode,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type {
  MashAdjustmentFieldsRef,
  MashGristBridgeRef,
  MashSaltsBridgeLike,
} from "./waterMashAcidificationHydration";
import {
  assertCanComputeAndSaveMash,
  assertMixedSourceProfile,
  buildComputeAndSaveMashPayload,
  buildMashSaveSettingsPayload,
  buildOverallMashPayload,
  mapEstimateMashPhGristRequest,
} from "./waterMashAcidificationPayloads";
import {
  applyDerivedComputeResultsState,
  deriveApplyComputeResultsState,
  parseEstimatedMashPhFromResult,
  type ComputeAndSaveMashResult,
} from "./waterMashAcidificationComputeState";

export type WaterMashAcidificationHandlerDeps = {
  canCall: boolean;
  recipeId: string;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  saltsBridgeRef: MashSaltsBridgeLike;
  adjustmentFieldsRef: MashAdjustmentFieldsRef;
  gristBridgeRef: MashGristBridgeRef;
  mashStartingAlk: number;
  mashStartingPh: number;
  mashTargetPh: number;
  mashAcidType: string;
  mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
  mashStrengthValue: number;
  mashAcidificationMode: WaterAcidificationMode;
  mashManualAcidAdded: number;
  saltAdditions: SaltAdditionRow[];
  setMashSaveStatus: (value: string | null) => void;
  setSavingMash: (value: boolean) => void;
  setOverallDerivation: (value: WaterCalcDerivation | null) => void;
  setMashError: (value: string | null) => void;
  setMashStatus: (value: string | null) => void;
  setMashManualStatus: (value: string | null) => void;
  setMashCalcSaveStatus: (value: string | null) => void;
  setMashResult: (value: WaterAcidResult | null) => void;
  setMashManualResult: (value: WaterManualCalcResult | null) => void;
  setAcidDerivation: (value: WaterCalcDerivation | null) => void;
  setMashSubmitting: (value: boolean) => void;
  setOverallError: (value: string | null) => void;
  setOverallStatus: (value: string | null) => void;
  setOverallSaveStatus: (value: string | null) => void;
  setSavingOverall: (value: boolean) => void;
  setOverallResult: (value: MashOverallResult | null) => void;
};

export function buildWaterMashAcidificationHandlerMethods(deps: WaterMashAcidificationHandlerDeps) {
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

  const computeOverallMash = async () => {
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
    onSaveMashInputs: async () => {
      const { tapVolumeLiters, dilutionVolumeLiters, derivedMashWaterVolumeLiters } =
        deps.adjustmentFieldsRef.current;
      deps.setSavingError(null);
      deps.setMashSaveStatus(null);
      deps.setSavingMash(true);
      try {
        await deps.saveSettings(
          buildMashSaveSettingsPayload({
            tapVolumeLiters,
            dilutionVolumeLiters,
            derivedMashWaterVolumeLiters,
            mashStartingAlk: deps.mashStartingAlk,
            mashStartingPh: deps.mashStartingPh,
            mashTargetPh: deps.mashTargetPh,
            mashAcidType: deps.mashAcidType,
            mashStrengthKind: deps.mashStrengthKind,
            mashStrengthValue: deps.mashStrengthValue,
            mashAcidificationMode: deps.mashAcidificationMode,
            mashManualAcidAdded: deps.mashManualAcidAdded,
          }),
        );
        deps.setMashSaveStatus("Saved mash draft.");
      } catch (err) {
        deps.setSavingError(String(err));
      } finally {
        deps.setSavingMash(false);
      }
    },
    onSubmitMash: async (e: FormEvent) => {
      e.preventDefault();
      if (!deps.canCall) return;
      deps.setMashError(null);
      deps.setMashStatus(null);
      deps.setMashManualStatus(null);
      deps.setMashCalcSaveStatus(null);
      deps.setMashResult(null);
      deps.setMashManualResult(null);
      deps.setAcidDerivation(null);
      deps.setMashSubmitting(true);
      try {
        applyComputeResults(await computeAndSaveMashSnapshots());
      } catch (err) {
        deps.setMashError(String(err));
      } finally {
        deps.setMashSubmitting(false);
      }
    },
    onCalculateOverall: async (saveAlso: boolean) => {
      deps.setOverallError(null);
      deps.setOverallStatus(null);
      deps.setOverallSaveStatus(null);
      deps.setSavingOverall(true);
      try {
        if (saveAlso) {
          applyComputeResults(await computeAndSaveMashSnapshots());
          deps.setOverallSaveStatus("Calculated & saved overall snapshot.");
        } else {
          await deps.saltsBridgeRef.current.ensureZeroSaltsSnapshotIfMissing();
          deps.setOverallResult(await computeOverallMash());
          deps.setOverallStatus("Calculated.");
        }
      } catch (err) {
        deps.setOverallError(String(err));
      } finally {
        deps.setSavingOverall(false);
      }
    },
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
