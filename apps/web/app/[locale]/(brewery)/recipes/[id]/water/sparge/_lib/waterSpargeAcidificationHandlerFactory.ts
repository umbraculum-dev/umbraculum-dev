import type { FormEvent, MutableRefObject } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { calcSpargeOverall, computeAndSaveSparge } from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation, WaterOverallResult, WaterProfile } from "@umbraculum/brewery-contracts";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../../../_shared-layout/_lib/typeGuards";
import type {
  SaltAdditionsResult,
  WaterAcidResult,
  WaterAcidificationMode,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { SpargeSaltsBridgeRef } from "./waterSpargeAcidificationHydration";
import {
  assertCanSubmitSparge,
  buildComputeAndSaveSpargePayload,
  buildSpargeOverallPayload,
  buildSpargeSaveSettingsPayload,
} from "./waterSpargeAcidificationPayloads";
import {
  applySpargeComputeResultsState,
  deriveApplySpargeComputeResultsState,
  type ComputeAndSaveSpargeResult,
} from "./waterSpargeAcidificationComputeState";

export function createWaterSpargeAcidificationHandlers(deps: {
  canCall: boolean;
  recipeId: string;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  saltsBridgeRef: SpargeSaltsBridgeRef;
  refreshSpargeOverallIfPossibleRef: MutableRefObject<() => Promise<void>>;
  spargeWaterProfileId: string;
  startingAlk: number;
  startingPh: string;
  targetPh: number;
  volumeLiters: number;
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  spargeAcidificationMode: WaterAcidificationMode;
  spargeManualAcidAdded: number;
  spargeSaltAdditions: SaltAdditionRow[];
  selectedSpargeProfile: WaterProfile | null;
  setSpargeSaveStatus: (value: string | null) => void;
  setSavingSparge: (value: boolean) => void;
  setSpargeError: (value: string | null) => void;
  setSpargeStatus: (value: string | null) => void;
  setCalcSaveStatus: (value: string | null) => void;
  setSpargeResult: (value: WaterAcidResult | null) => void;
  setSpargeManualResult: (value: WaterManualCalcResult | null) => void;
  setAcidDerivation: (value: WaterCalcDerivation | null) => void;
  setSpargeSubmitting: (value: boolean) => void;
  setSpargeOverall: (value: { result: WaterOverallResult; derivation: WaterCalcDerivation } | null) => void;
}) {
  const applyComputeResults = (computed: ComputeAndSaveSpargeResult) => {
    applySpargeComputeResultsState(deriveApplySpargeComputeResultsState(computed), {
      setFormatHints: deps.setFormatHints,
      setAcidDerivation: deps.setAcidDerivation,
      setSpargeManualResult: deps.setSpargeManualResult,
      setSpargeResult: deps.setSpargeResult,
      setSpargeStatus: deps.setSpargeStatus,
      setCalcSaveStatus: deps.setCalcSaveStatus,
    });
    deps.saltsBridgeRef.current.applySaltsFromCompute(
      computed.salts.result as unknown as SaltAdditionsResult,
      computed.salts.derivation as WaterCalcDerivation,
    );
  };

  const refreshSpargeOverallIfPossible = async () => {
    const spargeSaltsResult = deps.saltsBridgeRef.current.spargeSaltsResult;
    if (!deps.canCall) return;
    if (!deps.selectedSpargeProfile) return;
    if (!spargeSaltsResult) return;
    if (!deps.spargeResult) return;
    if (!Number.isFinite(deps.volumeLiters) || !(deps.volumeLiters > 0)) return;
    if (deps.startingPh.trim() === "" || !Number.isFinite(Number(deps.startingPh))) return;

    const payload = buildSpargeOverallPayload({
      spargeAcidificationMode: deps.spargeAcidificationMode,
      startingAlk: deps.startingAlk,
      startingPh: deps.startingPh,
      targetPh: deps.targetPh,
      volumeLiters: deps.volumeLiters,
      selectedSpargeProfile: deps.selectedSpargeProfile,
      spargeSaltAdditions: deps.spargeSaltAdditions,
      acidType: deps.acidType,
      strengthKind: deps.strengthKind,
      strengthValue: deps.strengthValue,
      spargeManualAcidAdded: deps.spargeManualAcidAdded,
    });

    try {
      const data = await calcSpargeOverall(webBreweryApiClient(), payload);
      const result = asRecord(data.result);
      const derivation = asRecord(data.derivation);
      if (!result || !derivation) return;
      deps.setSpargeOverall({
        result: result as unknown as WaterOverallResult,
        derivation: derivation as unknown as WaterCalcDerivation,
      });
    } catch {
      // ignore
    }
  };

  return {
    refreshSpargeOverallIfPossible,
    onSaveSpargeInputs: async () => {
      deps.setSavingError(null);
      deps.setSpargeSaveStatus(null);
      deps.setSavingSparge(true);
      try {
        await deps.saveSettings(
          buildSpargeSaveSettingsPayload({
            spargeWaterProfileId: deps.spargeWaterProfileId,
            startingAlk: deps.startingAlk,
            startingPh: deps.startingPh,
            targetPh: deps.targetPh,
            volumeLiters: deps.volumeLiters,
            acidType: deps.acidType,
            strengthKind: deps.strengthKind,
            strengthValue: deps.strengthValue,
            spargeAcidificationMode: deps.spargeAcidificationMode,
            spargeManualAcidAdded: deps.spargeManualAcidAdded,
            spargeSaltAdditions: deps.spargeSaltAdditions,
          }),
        );
        deps.setSpargeSaveStatus("Saved sparge draft.");
      } catch (err) {
        deps.setSavingError(String(err));
      } finally {
        deps.setSavingSparge(false);
      }
    },
    onSubmitSparge: async (e: FormEvent) => {
      e.preventDefault();
      if (!deps.canCall) return;
      try {
        assertCanSubmitSparge(deps.volumeLiters, deps.startingPh);
      } catch (err) {
        deps.setSpargeError(String(err));
        return;
      }
      deps.setSpargeError(null);
      deps.setSpargeStatus(null);
      deps.setCalcSaveStatus(null);
      deps.setSpargeResult(null);
      deps.setSpargeManualResult(null);
      deps.setAcidDerivation(null);
      deps.setSpargeSubmitting(true);
      try {
        const computed = await computeAndSaveSparge(
          webBreweryApiClient(),
          deps.recipeId,
          buildComputeAndSaveSpargePayload({
            recipeId: deps.recipeId,
            spargeWaterProfileId: deps.spargeWaterProfileId,
            spargeSaltAdditions: deps.spargeSaltAdditions,
            startingAlk: deps.startingAlk,
            startingPh: deps.startingPh,
            targetPh: deps.targetPh,
            volumeLiters: deps.volumeLiters,
            acidType: deps.acidType,
            strengthKind: deps.strengthKind,
            strengthValue: deps.strengthValue,
            spargeAcidificationMode: deps.spargeAcidificationMode,
            spargeManualAcidAdded: deps.spargeManualAcidAdded,
          }),
        );
        applyComputeResults(computed);
        await deps.refreshSpargeOverallIfPossibleRef.current().catch(() => null);
      } catch (err) {
        deps.setSpargeError(String(err));
      } finally {
        deps.setSpargeSubmitting(false);
      }
    },
  };
}
