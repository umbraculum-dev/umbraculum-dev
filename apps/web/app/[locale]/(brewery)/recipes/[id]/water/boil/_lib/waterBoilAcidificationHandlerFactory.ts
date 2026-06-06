import type { FormEvent } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { calcBoilOverall, computeAndSaveBoil } from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import type {
  BoilOverallResultV0,
  SaltAdditionsResult,
  WaterAcidResult,
  WaterAcidificationMode,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { BoilAdjustmentFieldsRef, BoilSaltsBridgeRef } from "./waterBoilAcidificationHydration";
import {
  assertCanComputeAndSaveBoil,
  assertCanSubmitBoilAcid,
  assertMixedSourceProfile,
  buildBoilSaveSettingsPayload,
  buildComputeAndSaveBoilPayload,
  buildOverallBoilPayload,
} from "./waterBoilAcidificationPayloads";
import {
  deriveApplyBoilComputeResultsState,
  type ComputeAndSaveBoilResult,
} from "./waterBoilAcidificationComputeState";

export function createWaterBoilAcidificationHandlers(deps: {
  canCall: boolean;
  recipeId: string;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  saltsBridgeRef: BoilSaltsBridgeRef;
  adjustmentFieldsRef: BoilAdjustmentFieldsRef;
  startingAlk: number;
  startingPh: string;
  targetPh: number;
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  acidificationMode: WaterAcidificationMode;
  manualAcidAdded: number;
  saltAdditions: SaltAdditionRow[];
  setBoilSaveStatus: (value: string | null) => void;
  setSavingInputs: (value: boolean) => void;
  setBoilError: (value: string | null) => void;
  setBoilStatus: (value: string | null) => void;
  setCalcSaveStatus: (value: string | null) => void;
  setAcidResult: (value: WaterAcidResult | null) => void;
  setManualResult: (value: WaterManualCalcResult | null) => void;
  setAcidDerivation: (value: WaterCalcDerivation | null) => void;
  setSubmitting: (value: boolean) => void;
  setOverallError: (value: string | null) => void;
  setOverallStatus: (value: string | null) => void;
  setOverallSaveStatus: (value: string | null) => void;
  setSavingOverall: (value: boolean) => void;
  setOverallResult: (value: BoilOverallResultV0 | null) => void;
  setOverallDerivation: (value: WaterCalcDerivation | null) => void;
}) {
  const applyComputeResults = (computed: ComputeAndSaveBoilResult) => {
    const next = deriveApplyBoilComputeResultsState(computed);
    deps.setFormatHints(next.formatHints);
    deps.saltsBridgeRef.current.applySaltsFromCompute(
      computed.salts.result as unknown as SaltAdditionsResult,
      computed.salts.derivation as WaterCalcDerivation,
    );
    deps.setAcidDerivation(next.acidDerivation);
    deps.setOverallDerivation(next.overallDerivation);
    deps.setOverallResult(next.overallResult);
    deps.setOverallStatus(next.overallStatus);
    deps.setManualResult(next.manualResult);
    deps.setAcidResult(next.acidResult);
    deps.setBoilStatus(next.boilStatus);
    deps.setCalcSaveStatus(next.calcSaveStatus);
  };

  const computeAndSaveBoilSnapshots = async () => {
    const { sourceProfileId, dilutionProfileId, tapVolumeLiters, dilutionVolumeLiters } =
      deps.adjustmentFieldsRef.current;
    assertCanComputeAndSaveBoil(deps.canCall, deps.recipeId, sourceProfileId);

    return computeAndSaveBoil(
      webBreweryApiClient(),
      deps.recipeId,
      buildComputeAndSaveBoilPayload({
        sourceProfileId,
        dilutionProfileId,
        tapVolumeLiters,
        dilutionVolumeLiters,
        startingAlk: deps.startingAlk,
        startingPh: deps.startingPh,
        targetPh: deps.targetPh,
        acidType: deps.acidType,
        strengthKind: deps.strengthKind,
        strengthValue: deps.strengthValue,
        acidificationMode: deps.acidificationMode,
        manualAcidAdded: deps.manualAcidAdded,
        saltAdditions: deps.saltAdditions,
      }),
    );
  };

  const computeOverallBoil = async (): Promise<BoilOverallResultV0> => {
    const { mixedSourceProfile, derivedBoilWaterVolumeLiters } = deps.adjustmentFieldsRef.current;
    assertMixedSourceProfile(mixedSourceProfile);
    if (!Number.isFinite(derivedBoilWaterVolumeLiters) || !(derivedBoilWaterVolumeLiters > 0)) {
      throw new Error("Boil water volume must be > 0 (set Water adjustment volumes).");
    }

    const payload = buildOverallBoilPayload({
      acidificationMode: deps.acidificationMode,
      startingAlk: deps.startingAlk,
      startingPh: deps.startingPh,
      targetPh: deps.targetPh,
      derivedBoilWaterVolumeLiters,
      mixedSourceProfile,
      saltAdditions: deps.saltAdditions,
      acidType: deps.acidType,
      strengthKind: deps.strengthKind,
      strengthValue: deps.strengthValue,
      manualAcidAdded: deps.manualAcidAdded,
    });

    const data = await calcBoilOverall(webBreweryApiClient(), payload);
    deps.setOverallDerivation(data.derivation as WaterCalcDerivation);
    return data.result as BoilOverallResultV0;
  };

  return {
    onSaveInputs: async () => {
      const { sourceProfileId, targetProfileId, dilutionProfileId, tapVolumeLiters, dilutionVolumeLiters } =
        deps.adjustmentFieldsRef.current;
      deps.setSavingError(null);
      deps.setBoilSaveStatus(null);
      deps.setSavingInputs(true);
      try {
        await deps.saveSettings(
          buildBoilSaveSettingsPayload({
            sourceProfileId,
            targetProfileId,
            dilutionProfileId,
            tapVolumeLiters,
            dilutionVolumeLiters,
            startingAlk: deps.startingAlk,
            startingPh: deps.startingPh,
            targetPh: deps.targetPh,
            acidType: deps.acidType,
            strengthKind: deps.strengthKind,
            strengthValue: deps.strengthValue,
            acidificationMode: deps.acidificationMode,
            manualAcidAdded: deps.manualAcidAdded,
            saltAdditions: deps.saltAdditions,
          }),
        );
        deps.setBoilSaveStatus("Saved boil draft.");
      } catch (err) {
        deps.setSavingError(String(err));
      } finally {
        deps.setSavingInputs(false);
      }
    },
    computeAndSaveBoilSnapshots,
    computeOverallBoil,
    onSubmitAcid: async (e: FormEvent) => {
      e.preventDefault();
      const { derivedBoilWaterVolumeLiters } = deps.adjustmentFieldsRef.current;
      if (!deps.canCall) return;
      try {
        assertCanSubmitBoilAcid(derivedBoilWaterVolumeLiters, deps.startingPh);
        await deps.saltsBridgeRef.current.ensureZeroSaltsSnapshotIfMissing();
      } catch (err) {
        deps.setBoilError(String(err));
        return;
      }
      deps.setBoilError(null);
      deps.setBoilStatus(null);
      deps.setCalcSaveStatus(null);
      deps.setAcidResult(null);
      deps.setManualResult(null);
      deps.setAcidDerivation(null);
      deps.setSubmitting(true);
      try {
        applyComputeResults(await computeAndSaveBoilSnapshots());
      } catch (err) {
        deps.setBoilError(String(err));
      } finally {
        deps.setSubmitting(false);
      }
    },
    onCalculateOverall: async (saveAlso: boolean) => {
      deps.setOverallError(null);
      deps.setOverallStatus(null);
      deps.setOverallSaveStatus(null);
      deps.setSavingOverall(true);
      try {
        if (saveAlso) {
          applyComputeResults(await computeAndSaveBoilSnapshots());
          deps.setOverallSaveStatus("Calculated & saved overall snapshot.");
        } else {
          await deps.saltsBridgeRef.current.ensureZeroSaltsSnapshotIfMissing();
          deps.setOverallResult(await computeOverallBoil());
          deps.setOverallStatus("Calculated.");
        }
      } catch (err) {
        deps.setOverallError(String(err));
      } finally {
        deps.setSavingOverall(false);
      }
    },
  };
}
