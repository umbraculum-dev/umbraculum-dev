"use client";

import { useCallback, useState } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterCalcDerivation } from "@umbraculum/contracts";

import type {
  BoilOverallResultV0,
  WaterAcidResult,
  WaterAcidificationMode,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";
import {
  applyBoilAcidificationHydrationState,
  createWaterBoilAcidificationHandlers,
  deriveBoilAcidificationHydrationState,
  displayAlkalinityPpmCaCO3,
  type BoilAdjustmentFieldsRef,
  type BoilSaltsBridgeRef,
} from "../_lib/waterBoilAcidificationHelpers";

export type { BoilAdjustmentFieldsRef, BoilSaltsBridgeRef };

export function useWaterBoilAcidification(params: {
  canCall: boolean;
  recipeId: string;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  saltsBridgeRef: BoilSaltsBridgeRef;
  adjustmentFieldsRef: BoilAdjustmentFieldsRef;
}) {
  const {
    canCall,
    recipeId,
    saveSettings,
    setSavingError,
    setFormatHints,
    saltsBridgeRef,
    adjustmentFieldsRef,
  } = params;

  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState<string>("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [strengthValue, setStrengthValue] = useState(10);
  const [acidificationMode, setAcidificationMode] = useState<WaterAcidificationMode>("targetPh");
  const [manualAcidAdded, setManualAcidAdded] = useState(0);
  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);

  const [boilError, setBoilError] = useState<string | null>(null);
  const [boilStatus, setBoilStatus] = useState<string | null>(null);
  const [boilSaveStatus, setBoilSaveStatus] = useState<string | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingInputs, setSavingInputs] = useState(false);
  const [acidResult, setAcidResult] = useState<WaterAcidResult | null>(null);
  const [manualResult, setManualResult] = useState<WaterManualCalcResult | null>(null);
  const [_acidDerivation, setAcidDerivation] = useState<WaterCalcDerivation | null>(null);

  const [overallError, setOverallError] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [overallSaveStatus, setOverallSaveStatus] = useState<string | null>(null);
  const [savingOverall, setSavingOverall] = useState(false);
  const [overallResult, setOverallResult] = useState<BoilOverallResultV0 | null>(null);
  const [overallDerivation, setOverallDerivation] = useState<WaterCalcDerivation | null>(null);

  const hydrateBoilAcidification = useCallback((s: NonNullable<RecipeWaterSettingsResponse["settings"]>) => {
    applyBoilAcidificationHydrationState(deriveBoilAcidificationHydrationState(s), {
      setStartingAlk,
      setStartingAlkTouched,
      setStartingPh,
      setTargetPh,
      setAcidType,
      setStrengthKind,
      setStrengthValue,
      setAcidificationMode,
      setManualAcidAdded,
      setAcidResult,
      setBoilStatus,
      setManualResult,
      setOverallResult,
      setOverallStatus,
    });
  }, []);

  const handlers = createWaterBoilAcidificationHandlers({
    canCall,
    recipeId,
    saveSettings,
    setSavingError,
    setFormatHints,
    saltsBridgeRef,
    adjustmentFieldsRef,
    startingAlk,
    startingPh,
    targetPh,
    acidType,
    strengthKind,
    strengthValue,
    acidificationMode,
    manualAcidAdded,
    saltAdditions,
    setBoilSaveStatus,
    setSavingInputs,
    setBoilError,
    setBoilStatus,
    setCalcSaveStatus,
    setAcidResult,
    setManualResult,
    setAcidDerivation,
    setSubmitting,
    setOverallError,
    setOverallStatus,
    setOverallSaveStatus,
    setSavingOverall,
    setOverallResult,
    setOverallDerivation,
  });

  return {
    startingAlk,
    setStartingAlk,
    startingAlkTouched,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    acidificationMode,
    setAcidificationMode,
    manualAcidAdded,
    setManualAcidAdded,
    saltAdditions,
    setSaltAdditions,
    boilError,
    setBoilError,
    boilStatus,
    setBoilStatus,
    boilSaveStatus,
    setBoilSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    submitting,
    savingInputs,
    acidResult,
    setAcidResult,
    manualResult,
    setManualResult,
    _acidDerivation,
    setAcidDerivation,
    overallError,
    setOverallError,
    overallStatus,
    setOverallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    savingOverall,
    overallResult,
    setOverallResult,
    overallDerivation,
    setOverallDerivation,
    displayAlkalinityPpmCaCO3,
    hydrateBoilAcidification,
    onSaveInputs: handlers.onSaveInputs,
    computeAndSaveBoilSnapshots: handlers.computeAndSaveBoilSnapshots,
    onSubmitAcid: handlers.onSubmitAcid,
    computeOverallBoil: handlers.computeOverallBoil,
    onCalculateOverall: handlers.onCalculateOverall,
  };
}
