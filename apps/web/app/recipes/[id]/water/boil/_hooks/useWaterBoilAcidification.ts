"use client";

import { useCallback, useState, type MutableRefObject } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { calcBoilOverall, computeAndSaveBoil } from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation } from "@umbraculum/contracts";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import type { IonProfilePpm } from "../../_lib/waterChem";
import {
  parseWaterStrengthKind,
  type BoilOverallResultV0,
  type SaltAdditionsResult,
  type WaterAcidResult,
  type WaterAcidificationMode,
  type WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";

type MixedSourceProfile = {
  name: string;
  totalVolumeLiters: number;
} & IonProfilePpm;

export type BoilAdjustmentFieldsRef = MutableRefObject<{
  sourceProfileId: string;
  targetProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  mixedSourceProfile: MixedSourceProfile | null;
  derivedBoilWaterVolumeLiters: number;
}>;

export type BoilSaltsBridgeRef = MutableRefObject<{
  applySaltsFromCompute: (result: SaltAdditionsResult, derivation: WaterCalcDerivation | null) => void;
  ensureZeroSaltsSnapshotIfMissing: () => Promise<void>;
}>;

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

  const displayAlkalinityPpmCaCO3 = (v: number) => {
    if (v < 0 && v > -1) return 0;
    return v;
  };

  const hydrateBoilAcidification = useCallback((s: NonNullable<RecipeWaterSettingsResponse["settings"]>) => {
    const savedStartingAlk = s.boilStartingAlkalinityPpmCaCO3;
    if (typeof savedStartingAlk === "number" && Number.isFinite(savedStartingAlk)) {
      setStartingAlk(savedStartingAlk);
      setStartingAlkTouched(savedStartingAlk !== 0);
    } else {
      setStartingAlk(0);
      setStartingAlkTouched(false);
    }
    setStartingPh(String(s.boilStartingPh ?? 7.0));
    setTargetPh(s.boilTargetPh ?? 5.6);
    setAcidType(s.boilAcidType ?? "phosphoric");
    const savedKind = parseWaterStrengthKind(s.boilStrengthKind);
    setStrengthKind(savedKind);
    setStrengthValue(s.boilStrengthValue ?? 10);
    setAcidificationMode(s.boilAcidificationMode === "manual" ? "manual" : "targetPh");
    setManualAcidAdded(savedKind === "solid" ? (s.boilManualAcidAddedGrams ?? 0) : (s.boilManualAcidAddedMl ?? 0));

    if (s.boilLastCalculatedAt) {
      setAcidResult({
        acidRequiredMl: s.boilLastAcidRequiredMl ?? null,
        acidRequiredTsp: s.boilLastAcidRequiredTsp ?? null,
        acidRequiredGrams: s.boilLastAcidRequiredGrams ?? null,
        acidRequiredKg: s.boilLastAcidRequiredKg ?? null,
        finalAlkalinityPpmCaCO3: s.boilLastFinalAlkalinityPpmCaCO3 ?? 0,
        sulfateAddedPpm: s.boilLastSulfateAddedPpm ?? 0,
        chlorideAddedPpm: s.boilLastChlorideAddedPpm ?? 0,
      });
      setBoilStatus(`Last calculated: ${new Date(s.boilLastCalculatedAt).toLocaleString()}`);
    }

    if (s.boilManualLastCalculatedAt) {
      setManualResult({
        achievedPh: s.boilManualLastAchievedPh ?? 0,
        predicted: {
          acidRequiredMl: null,
          acidRequiredTsp: null,
          acidRequiredGrams: null,
          acidRequiredKg: null,
          finalAlkalinityPpmCaCO3: s.boilManualLastFinalAlkalinityPpmCaCO3 ?? 0,
          sulfateAddedPpm: s.boilManualLastSulfateAddedPpm ?? 0,
          chlorideAddedPpm: s.boilManualLastChlorideAddedPpm ?? 0,
        },
        clamped: "none",
        iterations: 0,
        targetAmount: Number.NaN,
        predictedAmount: Number.NaN,
      });
    }

    if (s.boilOverallLastResultJson && typeof s.boilOverallLastResultJson === "object") {
      setOverallResult(s.boilOverallLastResultJson as BoilOverallResultV0);
    }
    if (s.boilOverallLastCalculatedAt) {
      setOverallStatus(`Last calculated: ${new Date(s.boilOverallLastCalculatedAt).toLocaleString()}`);
    }
  }, []);

  const onSaveInputs = async () => {
    const {
      sourceProfileId,
      targetProfileId,
      dilutionProfileId,
      tapVolumeLiters,
      dilutionVolumeLiters,
    } = adjustmentFieldsRef.current;
    setSavingError(null);
    setBoilSaveStatus(null);
    setSavingInputs(true);
    try {
      await saveSettings({
        boilSourceWaterProfileId: sourceProfileId || null,
        boilTargetWaterProfileId: targetProfileId || null,
        boilDilutionWaterProfileId: dilutionProfileId || null,
        boilTapWaterVolumeLiters: tapVolumeLiters,
        boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
        boilStartingAlkalinityPpmCaCO3: startingAlk,
        ...(startingPh.trim() === "" ? {} : { boilStartingPh: Number(startingPh) }),
        boilTargetPh: targetPh,
        boilAcidType: acidType,
        boilStrengthKind: strengthKind,
        boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
        boilAcidificationMode: acidificationMode,
        boilManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
        boilManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
        boilSaltAdditionsJson: saltAdditions,
      });
      setBoilSaveStatus("Saved boil draft.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingInputs(false);
    }
  };

  const computeAndSaveBoilSnapshots = async () => {
    const { sourceProfileId, dilutionProfileId, tapVolumeLiters, dilutionVolumeLiters } =
      adjustmentFieldsRef.current;
    if (!canCall) throw new Error("Not ready to call API.");
    if (!recipeId) throw new Error("Missing recipe id.");
    if (!sourceProfileId) throw new Error("Select a Source water profile.");

    const payload: Record<string, unknown> = {
      boilSourceWaterProfileId: sourceProfileId,
      boilDilutionWaterProfileId: dilutionProfileId || null,
      boilTapWaterVolumeLiters: tapVolumeLiters,
      boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
      boilStartingAlkalinityPpmCaCO3: startingAlk,
      boilStartingPh: Number(startingPh),
      boilTargetPh: targetPh,
      boilAcidType: acidType,
      boilStrengthKind: strengthKind,
      boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
      boilAcidificationMode: acidificationMode,
      boilManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
      boilManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
      boilSaltAdditionsJson: saltAdditions,
    };

    return computeAndSaveBoil(webBreweryApiClient(), recipeId, payload);
  };

  const computeOverallBoil = async (): Promise<BoilOverallResultV0> => {
    const { mixedSourceProfile, derivedBoilWaterVolumeLiters } = adjustmentFieldsRef.current;
    if (!mixedSourceProfile) throw new Error("Set Source profile + Source volume first (Dilution optional).");
    if (!Number.isFinite(derivedBoilWaterVolumeLiters) || !(derivedBoilWaterVolumeLiters > 0)) {
      throw new Error("Boil water volume must be > 0 (set Water adjustment volumes).");
    }

    const baseProfile: IonProfilePpm = {
      calcium: mixedSourceProfile.calcium,
      magnesium: mixedSourceProfile.magnesium,
      sodium: mixedSourceProfile.sodium,
      sulfate: mixedSourceProfile.sulfate,
      chloride: mixedSourceProfile.chloride,
      bicarbonate: mixedSourceProfile.bicarbonate,
    };

    const payload: Record<string, unknown> = {
      boilMode: acidificationMode,
      startingAlkalinityPpmCaCO3: startingAlk,
      startingPh: Number(startingPh),
      targetPh,
      volumeLiters: derivedBoilWaterVolumeLiters,
      baseProfile,
      additions: saltAdditions,
      acidType,
      strengthKind,
    };
    if (strengthKind !== "solid") payload["strengthValue"] = strengthValue;
    if (acidificationMode === "manual") {
      Object.assign(
        payload,
        strengthKind === "solid" ? { acidAddedGrams: manualAcidAdded } : { acidAddedMl: manualAcidAdded },
      );
    }

    const data = await calcBoilOverall(webBreweryApiClient(), payload);
    setOverallDerivation(data.derivation as WaterCalcDerivation);
    return data.result as BoilOverallResultV0;
  };

  const onSubmitAcid = async (e: React.FormEvent) => {
    e.preventDefault();
    const { derivedBoilWaterVolumeLiters } = adjustmentFieldsRef.current;
    if (!canCall) return;
    if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) {
      setBoilError("Starting pH is required (select a profile with pH or enter it manually).");
      return;
    }
    if (!Number.isFinite(derivedBoilWaterVolumeLiters) || !(derivedBoilWaterVolumeLiters > 0)) {
      setBoilError("Boil water volume must be > 0 (set Water adjustment volumes).");
      return;
    }
    try {
      await saltsBridgeRef.current.ensureZeroSaltsSnapshotIfMissing();
    } catch (err) {
      setBoilError(String(err));
      return;
    }
    setBoilError(null);
    setBoilStatus(null);
    setCalcSaveStatus(null);
    setAcidResult(null);
    setManualResult(null);
    setAcidDerivation(null);
    setSubmitting(true);
    try {
      const computed = await computeAndSaveBoilSnapshots();
      setFormatHints(computed.formatHints as Record<string, { decimals?: number }> | undefined);
      saltsBridgeRef.current.applySaltsFromCompute(
        computed.salts.result as unknown as SaltAdditionsResult,
        computed.salts.derivation as WaterCalcDerivation,
      );
      setAcidDerivation(computed.acid.derivation);
      setOverallDerivation(computed.overall.derivation);
      setOverallResult(computed.overall.result as unknown as BoilOverallResultV0);
      setOverallStatus("Calculated.");

      if (computed.acid.kind === "boil_acidification_manual") {
        setManualResult(computed.acid.result);
        setAcidResult(computed.acid.result.predicted ?? null);
        setBoilStatus("Estimated (manual mode).");
        setCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        setManualResult(null);
        setAcidResult(computed.acid.result);
        setBoilStatus("Calculated.");
        setCalcSaveStatus("Calculated & saved snapshot.");
      }
    } catch (err) {
      setBoilError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onCalculateOverall = async (saveAlso: boolean) => {
    setOverallError(null);
    setOverallStatus(null);
    setOverallSaveStatus(null);
    setSavingOverall(true);
    try {
      if (saveAlso) {
        const computed = await computeAndSaveBoilSnapshots();
        setFormatHints(computed.formatHints as Record<string, { decimals?: number }> | undefined);
        saltsBridgeRef.current.applySaltsFromCompute(
          computed.salts.result as unknown as SaltAdditionsResult,
          computed.salts.derivation as WaterCalcDerivation,
        );
        setAcidDerivation(computed.acid.derivation);
        setOverallDerivation(computed.overall.derivation);
        setOverallResult(computed.overall.result as unknown as BoilOverallResultV0);
        setOverallStatus("Calculated.");
        setOverallSaveStatus("Calculated & saved overall snapshot.");
      } else {
        await saltsBridgeRef.current.ensureZeroSaltsSnapshotIfMissing();
        const overall = await computeOverallBoil();
        setOverallResult(overall);
        setOverallStatus("Calculated.");
      }
    } catch (err) {
      setOverallError(String(err));
    } finally {
      setSavingOverall(false);
    }
  };

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
    onSaveInputs,
    computeAndSaveBoilSnapshots,
    onSubmitAcid,
    computeOverallBoil,
    onCalculateOverall,
  };
}
