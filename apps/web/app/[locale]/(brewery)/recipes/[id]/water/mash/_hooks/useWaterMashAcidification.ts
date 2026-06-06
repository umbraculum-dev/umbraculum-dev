"use client";

import { useCallback, useState } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";
import { DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";

import {
  applyMashAcidificationHydrationState,
  buildWaterMashAcidificationModel,
  createWaterMashAcidificationHandlers,
  deriveMashAcidificationHydrationState,
  type MashAdjustmentFieldsRef,
  type MashGristBridgeRef,
} from "../_lib/waterMashAcidificationHelpers";
import type {
  MashOverallResult,
  WaterAcidResult,
  WaterAcidificationMode,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettings } from "../../_lib/waterSettings";
import type { MashSaltsBridgeRef } from "./useWaterMashSalts";

export type { MashAdjustmentFieldsRef, MashGristBridgeRef };

export function useWaterMashAcidification(params: {
  canCall: boolean;
  recipeId: string;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  saltsBridgeRef: MashSaltsBridgeRef;
  adjustmentFieldsRef: MashAdjustmentFieldsRef;
  gristBridgeRef: MashGristBridgeRef;
}) {
  const {
    canCall,
    recipeId,
    saveSettings,
    setSavingError,
    setFormatHints,
    saltsBridgeRef,
    adjustmentFieldsRef,
    gristBridgeRef,
  } = params;

  const [mashStartingAlk, setMashStartingAlk] = useState(0);
  const [mashStartingAlkTouched, setMashStartingAlkTouched] = useState(false);
  const [mashStartingPh, setMashStartingPh] = useState(7.0);
  const [mashTargetPh, setMashTargetPh] = useState(DEFAULT_MASH_TARGET_PH);
  const [mashAcidType, setMashAcidType] = useState("lactic");
  const [mashStrengthKind, setMashStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">(
    "percent",
  );
  const [mashStrengthValue, setMashStrengthValue] = useState(88);
  const [mashAcidificationMode, setMashAcidificationMode] = useState<WaterAcidificationMode>("targetPh");
  const [mashManualAcidAdded, setMashManualAcidAdded] = useState(0);
  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);

  const [mashError, setMashError] = useState<string | null>(null);
  const [_mashStatus, setMashStatus] = useState<string | null>(null);
  const [_mashManualStatus, setMashManualStatus] = useState<string | null>(null);
  const [mashSaveStatus, setMashSaveStatus] = useState<string | null>(null);
  const [mashCalcSaveStatus, setMashCalcSaveStatus] = useState<string | null>(null);
  const [mashSubmitting, setMashSubmitting] = useState(false);
  const [savingMash, setSavingMash] = useState(false);
  const [mashResult, setMashResult] = useState<WaterAcidResult | null>(null);
  const [mashManualResult, setMashManualResult] = useState<WaterManualCalcResult | null>(null);
  const [acidDerivation, setAcidDerivation] = useState<WaterCalcDerivation | null>(null);

  const [overallError, setOverallError] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [overallSaveStatus, setOverallSaveStatus] = useState<string | null>(null);
  const [savingOverall, setSavingOverall] = useState(false);
  const [overallResult, setOverallResult] = useState<MashOverallResult | null>(null);
  const [overallDerivation, setOverallDerivation] = useState<WaterCalcDerivation | null>(null);

  const hydrateMashAcidification = useCallback((s: RecipeWaterSettings) => {
    applyMashAcidificationHydrationState(deriveMashAcidificationHydrationState(s), {
      setMashStartingAlk,
      setMashStartingAlkTouched,
      setMashStartingPh,
      setMashTargetPh,
      setMashAcidType,
      setMashStrengthKind,
      setMashStrengthValue,
      setMashAcidificationMode,
      setMashManualAcidAdded,
      setMashResult,
      setMashStatus,
      setMashManualResult,
      setMashManualStatus,
      setOverallResult,
      setOverallStatus,
    });
  }, []);

  const handlers = createWaterMashAcidificationHandlers({
    canCall,
    recipeId,
    saveSettings,
    setSavingError,
    setFormatHints,
    saltsBridgeRef,
    adjustmentFieldsRef,
    gristBridgeRef,
    mashStartingAlk,
    mashStartingPh,
    mashTargetPh,
    mashAcidType,
    mashStrengthKind,
    mashStrengthValue,
    mashAcidificationMode,
    mashManualAcidAdded,
    saltAdditions,
    setMashSaveStatus,
    setSavingMash,
    setOverallDerivation,
    setMashError,
    setMashStatus,
    setMashManualStatus,
    setMashCalcSaveStatus,
    setMashResult,
    setMashManualResult,
    setAcidDerivation,
    setMashSubmitting,
    setOverallError,
    setOverallStatus,
    setOverallSaveStatus,
    setSavingOverall,
    setOverallResult,
  });

  return buildWaterMashAcidificationModel({
    mashStartingAlk,
    setMashStartingAlk,
    mashStartingAlkTouched,
    setMashStartingAlkTouched,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashManualAcidAdded,
    setMashManualAcidAdded,
    saltAdditions,
    setSaltAdditions,
    mashError,
    setMashError,
    _mashStatus,
    setMashStatus,
    _mashManualStatus,
    setMashManualStatus,
    mashSaveStatus,
    setMashSaveStatus,
    mashCalcSaveStatus,
    setMashCalcSaveStatus,
    mashSubmitting,
    setMashSubmitting,
    savingMash,
    setSavingMash,
    mashResult,
    setMashResult,
    mashManualResult,
    setMashManualResult,
    acidDerivation,
    setAcidDerivation,
    overallError,
    setOverallError,
    overallStatus,
    setOverallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    savingOverall,
    setSavingOverall,
    overallResult,
    setOverallResult,
    overallDerivation,
    setOverallDerivation,
    hydrateMashAcidification,
    ...handlers,
  });
}
