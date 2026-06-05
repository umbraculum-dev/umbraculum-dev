"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterCalcDerivation, WaterOverallResult, WaterProfile } from "@umbraculum/contracts";

import { bicarbonatePpmToAlkalinityPpmCaCO3 } from "../../_lib/waterChem";
import type { WaterAcidResult, WaterAcidificationMode, WaterManualCalcResult } from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";
import {
  applySpargeAcidificationHydrationState,
  deriveSpargeAcidificationHydrationState,
  type SpargeSaltsBridgeRef,
} from "../_lib/waterSpargeAcidificationHydration";
import { createWaterSpargeAcidificationHandlers } from "../_lib/waterSpargeAcidificationHandlers";
import { buildSelectedSpargeProfileInfo } from "../_lib/waterSpargeSelectedProfileInfo";

export type { SpargeSaltsBridgeRef };

export function useWaterSpargeAcidification(params: {
  canCall: boolean;
  recipeId: string;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  waterProfiles: WaterProfile[];
  fmt: (unitKey: string, value: unknown, fallback: number) => string;
  tUnits: (key: string) => string;
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  saltsBridgeRef: SpargeSaltsBridgeRef;
}) {
  const {
    canCall,
    recipeId,
    saveSettings,
    setSavingError,
    waterProfiles,
    fmt,
    tUnits,
    setFormatHints,
    saltsBridgeRef,
  } = params;

  const [spargeError, setSpargeError] = useState<string | null>(null);
  const [spargeStatus, setSpargeStatus] = useState<string | null>(null);
  const [spargeSaveStatus, setSpargeSaveStatus] = useState<string | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [spargeResult, setSpargeResult] = useState<WaterAcidResult | null>(null);
  const [acidDerivation, setAcidDerivation] = useState<WaterCalcDerivation | null>(null);
  const [spargeManualResult, setSpargeManualResult] = useState<WaterManualCalcResult | null>(null);
  const [spargeSubmitting, setSpargeSubmitting] = useState(false);
  const [savingSparge, setSavingSparge] = useState(false);

  const [spargeAcidificationMode, setSpargeAcidificationMode] = useState<WaterAcidificationMode>("targetPh");
  const [spargeManualAcidAdded, setSpargeManualAcidAdded] = useState(0);

  const [spargeWaterProfileId, setSpargeWaterProfileId] = useState<string>("");
  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState<string>("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [volumeLiters, setVolumeLiters] = useState(20);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [strengthValue, setStrengthValue] = useState(10);

  const [spargeSaltAdditions, setSpargeSaltAdditions] = useState<SaltAdditionRow[]>([]);
  const [spargeOverall, setSpargeOverall] = useState<{
    result: WaterOverallResult;
    derivation: WaterCalcDerivation;
  } | null>(null);

  const selectedSpargeProfile = useMemo(
    () => waterProfiles.find((p) => p.id === spargeWaterProfileId) ?? null,
    [spargeWaterProfileId, waterProfiles],
  );

  const derivedStartingAlkPpmCaCO3 = useMemo(() => {
    if (!selectedSpargeProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [selectedSpargeProfile]);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedStartingAlkPpmCaCO3, startingAlkTouched]);

  const hydrateSpargeAcidification = useCallback((s: NonNullable<RecipeWaterSettingsResponse["settings"]>) => {
    applySpargeAcidificationHydrationState(deriveSpargeAcidificationHydrationState(s), {
      setStartingAlk,
      setStartingAlkTouched,
      setStartingPh,
      setTargetPh,
      setVolumeLiters,
      setAcidType,
      setStrengthKind,
      setStrengthValue,
      setSpargeWaterProfileId,
      setSpargeAcidificationMode,
      setSpargeManualAcidAdded,
      setSpargeResult,
      setSpargeStatus,
      setSpargeManualResult,
    });
  }, []);

  const refreshSpargeOverallIfPossibleRef = useRef<() => Promise<void>>(async () => {});

  const handlers = createWaterSpargeAcidificationHandlers({
    canCall,
    recipeId,
    saveSettings,
    setSavingError,
    setFormatHints,
    saltsBridgeRef,
    refreshSpargeOverallIfPossibleRef,
    spargeWaterProfileId,
    startingAlk,
    startingPh,
    targetPh,
    volumeLiters,
    acidType,
    strengthKind,
    strengthValue,
    spargeAcidificationMode,
    spargeManualAcidAdded,
    spargeSaltAdditions,
    selectedSpargeProfile,
    setSpargeSaveStatus,
    setSavingSparge,
    setSpargeError,
    setSpargeStatus,
    setCalcSaveStatus,
    setSpargeResult,
    setSpargeManualResult,
    setAcidDerivation,
    setSpargeSubmitting,
    setSpargeOverall,
  });

  refreshSpargeOverallIfPossibleRef.current = handlers.refreshSpargeOverallIfPossible;

  const selectedSpargeProfileInfo = buildSelectedSpargeProfileInfo({
    selectedSpargeProfile,
    canCall,
    fmt,
    tUnits,
    setStartingAlk,
    setStartingPh,
  });

  return {
    spargeError,
    setSpargeError,
    spargeStatus,
    setSpargeStatus,
    spargeSaveStatus,
    setSpargeSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    spargeResult,
    setSpargeResult,
    acidDerivation,
    setAcidDerivation,
    spargeManualResult,
    setSpargeManualResult,
    spargeSubmitting,
    savingSparge,
    spargeAcidificationMode,
    setSpargeAcidificationMode,
    spargeManualAcidAdded,
    setSpargeManualAcidAdded,
    spargeWaterProfileId,
    setSpargeWaterProfileId,
    startingAlk,
    setStartingAlk,
    startingAlkTouched,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    volumeLiters,
    setVolumeLiters,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    spargeSaltAdditions,
    setSpargeSaltAdditions,
    spargeOverall,
    setSpargeOverall,
    selectedSpargeProfile,
    derivedStartingAlkPpmCaCO3,
    hydrateSpargeAcidification,
    refreshSpargeOverallIfPossible: handlers.refreshSpargeOverallIfPossible,
    onSaveSpargeInputs: handlers.onSaveSpargeInputs,
    onSubmitSparge: handlers.onSubmitSparge,
    selectedSpargeProfileInfo,
  };
}
