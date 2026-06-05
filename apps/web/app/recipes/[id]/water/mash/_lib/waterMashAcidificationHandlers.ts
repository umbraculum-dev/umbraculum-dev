import type { FormEvent } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import {
  calcMashOverall,
  computeAndSaveMash,
  estimateMashPh,
} from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation } from "@umbraculum/contracts";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../_lib/typeGuards";
import type {
  MashOverallResult,
  SaltAdditionsResult,
  WaterAcidResult,
  WaterAcidificationMode,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettings } from "../../_lib/waterSettings";
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

export type ComputeAndSaveMashResult = Awaited<ReturnType<typeof computeAndSaveMash>>;

export type ApplyComputeResultsState = {
  formatHints: Record<string, { decimals?: number }> | undefined;
  saltsResult: SaltAdditionsResult;
  saltsDerivation: WaterCalcDerivation;
  acidDerivation: WaterCalcDerivation;
  overallDerivation: WaterCalcDerivation;
  overallResult: MashOverallResult;
  overallStatus: string;
  mashManualResult: WaterManualCalcResult | null;
  mashManualStatus: string | null;
  mashResult: WaterAcidResult | null;
  mashStatus: string | null;
  mashCalcSaveStatus: string;
};

export function deriveApplyComputeResultsState(computed: ComputeAndSaveMashResult): ApplyComputeResultsState {
  const base = {
    formatHints: computed.formatHints as Record<string, { decimals?: number }> | undefined,
    saltsResult: computed.salts.result as unknown as SaltAdditionsResult,
    saltsDerivation: computed.salts.derivation as WaterCalcDerivation,
    acidDerivation: computed.acid.derivation,
    overallDerivation: computed.overall.derivation,
    overallResult: computed.overall.result as unknown as MashOverallResult,
    overallStatus: "Calculated.",
  };

  if (computed.acid.kind === "mash_acidification_manual") {
    return {
      ...base,
      mashManualResult: computed.acid.result,
      mashManualStatus: "Estimated (manual mode).",
      mashResult: computed.acid.result.predicted ?? null,
      mashStatus: null,
      mashCalcSaveStatus: "Estimated & saved snapshot.",
    };
  }

  return {
    ...base,
    mashManualResult: null,
    mashManualStatus: null,
    mashResult: computed.acid.result,
    mashStatus: "Calculated.",
    mashCalcSaveStatus: "Calculated & saved snapshot.",
  };
}

export function parseEstimatedMashPhFromResult(result: unknown): number | undefined {
  const resultRec = asRecord(result);
  return resultRec?.["estimatedMashPhRoomTemp"] as number;
}

export type ApplyComputeResultsSetters = {
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  applySaltsFromCompute: (result: SaltAdditionsResult, derivation: WaterCalcDerivation) => void;
  setAcidDerivation: (value: WaterCalcDerivation | null) => void;
  setOverallDerivation: (value: WaterCalcDerivation | null) => void;
  setOverallResult: (value: MashOverallResult | null) => void;
  setOverallStatus: (value: string | null) => void;
  setMashManualResult: (value: WaterManualCalcResult | null) => void;
  setMashManualStatus: (value: string | null) => void;
  setMashResult: (value: WaterAcidResult | null) => void;
  setMashStatus: (value: string | null) => void;
  setMashCalcSaveStatus: (value: string | null) => void;
};

export function applyDerivedComputeResultsState(next: ApplyComputeResultsState, set: ApplyComputeResultsSetters) {
  set.setFormatHints(next.formatHints);
  set.applySaltsFromCompute(next.saltsResult, next.saltsDerivation);
  set.setAcidDerivation(next.acidDerivation);
  set.setOverallDerivation(next.overallDerivation);
  set.setOverallResult(next.overallResult);
  set.setOverallStatus(next.overallStatus);
  set.setMashManualResult(next.mashManualResult);
  set.setMashManualStatus(next.mashManualStatus);
  set.setMashResult(next.mashResult);
  set.setMashStatus(next.mashStatus);
  set.setMashCalcSaveStatus(next.mashCalcSaveStatus);
}

export type WaterMashAcidificationModel = {
  mashStartingAlk: number;
  setMashStartingAlk: (value: number) => void;
  mashStartingAlkTouched: boolean;
  setMashStartingAlkTouched: (value: boolean) => void;
  mashStartingPh: number;
  setMashStartingPh: (value: number) => void;
  mashTargetPh: number;
  setMashTargetPh: (value: number) => void;
  mashAcidType: string;
  setMashAcidType: (value: string) => void;
  mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
  setMashStrengthKind: (value: "percent" | "normality" | "molarity" | "solid") => void;
  mashStrengthValue: number;
  setMashStrengthValue: (value: number) => void;
  mashAcidificationMode: WaterAcidificationMode;
  setMashAcidificationMode: (value: WaterAcidificationMode) => void;
  mashManualAcidAdded: number;
  setMashManualAcidAdded: (value: number) => void;
  saltAdditions: SaltAdditionRow[];
  setSaltAdditions: (value: SaltAdditionRow[]) => void;
  mashError: string | null;
  setMashError: (value: string | null) => void;
  _mashStatus: string | null;
  setMashStatus: (value: string | null) => void;
  _mashManualStatus: string | null;
  setMashManualStatus: (value: string | null) => void;
  mashSaveStatus: string | null;
  setMashSaveStatus: (value: string | null) => void;
  mashCalcSaveStatus: string | null;
  setMashCalcSaveStatus: (value: string | null) => void;
  mashSubmitting: boolean;
  setMashSubmitting: (value: boolean) => void;
  savingMash: boolean;
  setSavingMash: (value: boolean) => void;
  mashResult: WaterAcidResult | null;
  setMashResult: (value: WaterAcidResult | null) => void;
  mashManualResult: WaterManualCalcResult | null;
  setMashManualResult: (value: WaterManualCalcResult | null) => void;
  acidDerivation: WaterCalcDerivation | null;
  setAcidDerivation: (value: WaterCalcDerivation | null) => void;
  overallError: string | null;
  setOverallError: (value: string | null) => void;
  overallStatus: string | null;
  setOverallStatus: (value: string | null) => void;
  overallSaveStatus: string | null;
  setOverallSaveStatus: (value: string | null) => void;
  savingOverall: boolean;
  setSavingOverall: (value: boolean) => void;
  overallResult: MashOverallResult | null;
  setOverallResult: (value: MashOverallResult | null) => void;
  overallDerivation: WaterCalcDerivation | null;
  setOverallDerivation: (value: WaterCalcDerivation | null) => void;
  hydrateMashAcidification: (s: RecipeWaterSettings) => void;
  onSaveMashInputs: () => Promise<void>;
  computeAndSaveMashSnapshots: () => Promise<ComputeAndSaveMashResult>;
  computeOverallMash: () => Promise<MashOverallResult>;
  onCalculateOverall: (saveAlso: boolean) => Promise<void>;
  onSubmitMash: (e: FormEvent) => Promise<void>;
  _calcMashEstimatedPh: (args: {
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
  }) => Promise<number | null>;
};

export function buildWaterMashAcidificationModel(model: WaterMashAcidificationModel) {
  return model;
}

export function createWaterMashAcidificationHandlers(deps: {
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
}) {
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
    computeAndSaveMashSnapshots,
    computeOverallMash,
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
