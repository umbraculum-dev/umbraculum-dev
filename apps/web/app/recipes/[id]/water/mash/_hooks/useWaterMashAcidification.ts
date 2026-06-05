"use client";

import { useCallback, useState, type MutableRefObject } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import {
  calcMashOverall,
  computeAndSaveMash,
  estimateMashPh,
} from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation } from "@umbraculum/contracts";
import { DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../_lib/typeGuards";
import type { GristRow } from "../../../../../_lib/grist";
import type { IonProfilePpm } from "../../_lib/waterChem";
import {
  parseWaterStrengthKind,
  type MashOverallResult,
  type SaltAdditionsResult,
  type WaterAcidResult,
  type WaterAcidificationMode,
  type WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettings } from "../../_lib/waterSettings";
import type { MashSaltsBridgeRef } from "./useWaterMashSalts";

type MixedSourceProfile = {
  name: string;
  totalVolumeLiters: number;
} & IonProfilePpm;

export type MashAdjustmentFieldsRef = MutableRefObject<{
  sourceProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  mixedSourceProfile: MixedSourceProfile | null;
  derivedMashWaterVolumeLiters: number;
}>;

export type MashGristBridgeRef = MutableRefObject<{
  gristImportedRows: GristRow[];
}>;

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
    const savedStartingAlk = s.mashStartingAlkalinityPpmCaCO3;
    if (typeof savedStartingAlk === "number" && Number.isFinite(savedStartingAlk)) {
      setMashStartingAlk(savedStartingAlk);
      setMashStartingAlkTouched(savedStartingAlk !== 0);
    } else {
      setMashStartingAlk(0);
      setMashStartingAlkTouched(false);
    }
    setMashStartingPh(s.mashStartingPh ?? 7.0);
    setMashTargetPh(s.mashTargetPh ?? DEFAULT_MASH_TARGET_PH);
    setMashAcidType(s.mashAcidType ?? "lactic");
    const savedKind = parseWaterStrengthKind(s.mashStrengthKind);
    setMashStrengthKind(savedKind);
    setMashStrengthValue(s.mashStrengthValue ?? 88);
    setMashAcidificationMode(s.mashAcidificationMode === "manual" ? "manual" : "targetPh");
    setMashManualAcidAdded(
      savedKind === "solid" ? (s.mashManualAcidAddedGrams ?? 0) : (s.mashManualAcidAddedMl ?? 0),
    );

    if (s.mashLastCalculatedAt) {
      setMashResult({
        acidRequiredMl: s.mashLastAcidRequiredMl ?? null,
        acidRequiredTsp: s.mashLastAcidRequiredTsp ?? null,
        acidRequiredGrams: s.mashLastAcidRequiredGrams ?? null,
        acidRequiredKg: s.mashLastAcidRequiredKg ?? null,
        finalAlkalinityPpmCaCO3: s.mashLastFinalAlkalinityPpmCaCO3 ?? 0,
        sulfateAddedPpm: s.mashLastSulfateAddedPpm ?? 0,
        chlorideAddedPpm: s.mashLastChlorideAddedPpm ?? 0,
      });
      setMashStatus(`Last calculated: ${new Date(s.mashLastCalculatedAt).toLocaleString()}`);
    }

    if (s.mashManualLastCalculatedAt) {
      setMashManualResult({
        achievedPh: s.mashManualLastAchievedPh ?? 0,
        predicted: {
          acidRequiredMl: null,
          acidRequiredTsp: null,
          acidRequiredGrams: null,
          acidRequiredKg: null,
          finalAlkalinityPpmCaCO3: s.mashManualLastFinalAlkalinityPpmCaCO3 ?? 0,
          sulfateAddedPpm: s.mashManualLastSulfateAddedPpm ?? 0,
          chlorideAddedPpm: s.mashManualLastChlorideAddedPpm ?? 0,
        },
        clamped: "none",
        iterations: 0,
        targetAmount: Number.NaN,
        predictedAmount: Number.NaN,
      });
      setMashManualStatus(`Last calculated: ${new Date(s.mashManualLastCalculatedAt).toLocaleString()}`);
    }

    if (s.mashOverallLastResultJson && typeof s.mashOverallLastResultJson === "object") {
      setOverallResult(s.mashOverallLastResultJson as MashOverallResult);
    }
    if (s.mashOverallLastCalculatedAt) {
      setOverallStatus(`Last calculated: ${new Date(s.mashOverallLastCalculatedAt).toLocaleString()}`);
    }
  }, []);

  const onSaveMashInputs = async () => {
    const { tapVolumeLiters, dilutionVolumeLiters, derivedMashWaterVolumeLiters } =
      adjustmentFieldsRef.current;
    setSavingError(null);
    setMashSaveStatus(null);
    setSavingMash(true);
    try {
      await saveSettings({
        tapWaterVolumeLiters: tapVolumeLiters,
        dilutionWaterVolumeLiters: dilutionVolumeLiters,
        mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
        mashStartingPh,
        mashTargetPh,
        mashWaterVolumeLiters: derivedMashWaterVolumeLiters,
        mashAcidType,
        mashStrengthKind,
        mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
        mashAcidificationMode,
        mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
        mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
      });
      setMashSaveStatus("Saved mash draft.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingMash(false);
    }
  };

  const computeAndSaveMashSnapshots = async () => {
    const { sourceProfileId, dilutionProfileId, tapVolumeLiters, dilutionVolumeLiters } =
      adjustmentFieldsRef.current;
    if (!canCall) throw new Error("Not ready to call API.");
    if (!recipeId) throw new Error("Missing recipe id.");
    if (!sourceProfileId) throw new Error("Select a Source water profile.");

    const gristRows = gristBridgeRef.current.gristImportedRows.map((r) => ({
      amountKg: r.amountKg,
      colorLovibond: r.colorLovibond,
      maltClass: r.maltClass,
    }));

    const payload: Record<string, unknown> = {
      sourceWaterProfileId: sourceProfileId,
      dilutionWaterProfileId: dilutionProfileId || null,
      tapWaterVolumeLiters: tapVolumeLiters,
      dilutionWaterVolumeLiters: dilutionVolumeLiters,
      mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
      mashStartingPh,
      mashTargetPh,
      mashAcidType,
      mashStrengthKind,
      mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
      mashAcidificationMode,
      mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
      mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
      mashSaltAdditionsJson: saltAdditions,
      ...(gristRows.length ? { grist: gristRows } : {}),
    };

    return computeAndSaveMash(webBreweryApiClient(), recipeId, payload);
  };

  const computeOverallMash = async () => {
    const { mixedSourceProfile, derivedMashWaterVolumeLiters } = adjustmentFieldsRef.current;
    if (!mixedSourceProfile) throw new Error("Set Source profile + Source volume first (Dilution optional).");

    const baseProfile: IonProfilePpm = {
      calcium: mixedSourceProfile.calcium,
      magnesium: mixedSourceProfile.magnesium,
      sodium: mixedSourceProfile.sodium,
      sulfate: mixedSourceProfile.sulfate,
      chloride: mixedSourceProfile.chloride,
      bicarbonate: mixedSourceProfile.bicarbonate,
    };

    const gristRows = gristBridgeRef.current.gristImportedRows.map((r) => ({
      amountKg: r.amountKg,
      colorLovibond: r.colorLovibond,
      maltClass: r.maltClass,
    }));

    const payload: Record<string, unknown> = {
      mashMode: mashAcidificationMode,
      mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
      mashStartingPh,
      mashTargetPh,
      mashWaterVolumeLiters: derivedMashWaterVolumeLiters,
      volumeLiters: derivedMashWaterVolumeLiters,
      baseProfile,
      additions: saltAdditions,
      acidType: mashAcidType,
      strengthKind: mashStrengthKind,
      ...(gristRows.length ? { grist: gristRows } : {}),
    };
    if (mashStrengthKind !== "solid") payload["strengthValue"] = mashStrengthValue;
    if (mashAcidificationMode === "manual") {
      Object.assign(
        payload,
        mashStrengthKind === "solid"
          ? { acidAddedGrams: mashManualAcidAdded }
          : { acidAddedMl: mashManualAcidAdded },
      );
    }

    const data = await calcMashOverall(webBreweryApiClient(), payload);
    setOverallDerivation(data.derivation as WaterCalcDerivation);
    return data.result as MashOverallResult;
  };

  const applyComputeResults = (computed: Awaited<ReturnType<typeof computeAndSaveMash>>) => {
    setFormatHints(computed.formatHints as Record<string, { decimals?: number }> | undefined);
    saltsBridgeRef.current.applySaltsFromCompute(
      computed.salts.result as unknown as SaltAdditionsResult,
      computed.salts.derivation as WaterCalcDerivation,
    );
    setAcidDerivation(computed.acid.derivation);
    setOverallDerivation(computed.overall.derivation);
    setOverallResult(computed.overall.result as unknown as MashOverallResult);
    setOverallStatus("Calculated.");

    if (computed.acid.kind === "mash_acidification_manual") {
      setMashManualResult(computed.acid.result);
      setMashManualStatus("Estimated (manual mode).");
      setMashResult(computed.acid.result.predicted ?? null);
      setMashCalcSaveStatus("Estimated & saved snapshot.");
    } else {
      setMashManualResult(null);
      setMashManualStatus(null);
      setMashResult(computed.acid.result);
      setMashStatus("Calculated.");
      setMashCalcSaveStatus("Calculated & saved snapshot.");
    }
  };

  const onSubmitMash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCall) return;
    setMashError(null);
    setMashStatus(null);
    setMashManualStatus(null);
    setMashCalcSaveStatus(null);
    setMashResult(null);
    setMashManualResult(null);
    setAcidDerivation(null);
    setMashSubmitting(true);
    try {
      const computed = await computeAndSaveMashSnapshots();
      applyComputeResults(computed);
    } catch (err) {
      setMashError(String(err));
    } finally {
      setMashSubmitting(false);
    }
  };

  const onCalculateOverall = async (saveAlso: boolean) => {
    setOverallError(null);
    setOverallStatus(null);
    setOverallSaveStatus(null);
    setSavingOverall(true);
    try {
      if (saveAlso) {
        const computed = await computeAndSaveMashSnapshots();
        applyComputeResults(computed);
        setOverallSaveStatus("Calculated & saved overall snapshot.");
      } else {
        await saltsBridgeRef.current.ensureZeroSaltsSnapshotIfMissing();
        const overall = await computeOverallMash();
        setOverallResult(overall);
        setOverallStatus("Calculated.");
      }
    } catch (err) {
      setOverallError(String(err));
    } finally {
      setSavingOverall(false);
    }
  };

  const _calcMashEstimatedPh = async (args: {
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
    if (!canCall) return null;
    const data = await estimateMashPh(webBreweryApiClient(), {
      volumeLiters: args.volumeLiters,
      alkalinityPpmCaCO3: args.alkalinityPpmCaCO3,
      calciumPpm: args.calciumPpm,
      magnesiumPpm: args.magnesiumPpm,
      grist: args.grist.map((r) => ({
        amountKg: r.amountKg,
        colorLovibond: r.colorLovibond,
        maltClass: r.maltClass,
        mashDiPh: r.mashDiPh ?? null,
        mashTaToPh57_mEqPerKg: r.mashTaToPh57_mEqPerKg ?? null,
      })),
      acidAdded_mEqPerL: args.acidAdded_mEqPerL,
    });
    const resultRec = asRecord(data.result);
    return resultRec?.["estimatedMashPhRoomTemp"] as number;
  };

  return {
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
    onSaveMashInputs,
    computeAndSaveMashSnapshots,
    computeOverallMash,
    onCalculateOverall,
    onSubmitMash,
    _calcMashEstimatedPh,
  };
}
