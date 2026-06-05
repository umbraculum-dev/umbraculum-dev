"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { Button, SizableText, View, XStack } from "tamagui";
import { calcSpargeOverall, computeAndSaveSparge } from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation, WaterOverallResult, WaterProfile } from "@umbraculum/contracts";

import { FieldBadge } from "../../../../../_components/recipe-edit";
import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../_lib/typeGuards";
import { bicarbonatePpmToAlkalinityPpmCaCO3 } from "../../_lib/waterChem";
import {
  parseWaterStrengthKind,
  type SaltAdditionsResult,
  type WaterAcidResult,
  type WaterAcidificationMode,
  type WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";

export type SpargeSaltsBridgeRef = MutableRefObject<{
  applySaltsFromCompute: (result: SaltAdditionsResult, derivation: WaterCalcDerivation | null) => void;
  buildSpargeSaltsInputsKey: () => string;
  spargeSaltsResult: SaltAdditionsResult | null;
}>;

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
    const savedStartingAlk = s.spargeStartingAlkalinityPpmCaCO3;
    if (typeof savedStartingAlk === "number" && Number.isFinite(savedStartingAlk)) {
      setStartingAlk(savedStartingAlk);
      setStartingAlkTouched(savedStartingAlk !== 0);
    } else {
      setStartingAlk(0);
      setStartingAlkTouched(false);
    }
    setStartingPh(String(s.spargeStartingPh ?? 7.0));
    setTargetPh(s.spargeTargetPh ?? 5.6);
    setVolumeLiters(s.spargeVolumeLiters ?? 20);
    setAcidType(s.spargeAcidType ?? "phosphoric");
    const savedStrengthKind = parseWaterStrengthKind(s.spargeStrengthKind);
    setStrengthKind(savedStrengthKind);
    setStrengthValue(s.spargeStrengthValue ?? 10);
    setSpargeWaterProfileId(s.spargeWaterProfileId ?? "");
    setSpargeAcidificationMode(s.spargeAcidificationMode === "manual" ? "manual" : "targetPh");
    setSpargeManualAcidAdded(
      savedStrengthKind === "solid" ? (s.spargeManualAcidAddedGrams ?? 0) : (s.spargeManualAcidAddedMl ?? 0),
    );

    if (s.spargeLastCalculatedAt) {
      setSpargeResult({
        acidRequiredMl: s.spargeLastAcidRequiredMl,
        acidRequiredTsp: s.spargeLastAcidRequiredTsp,
        acidRequiredGrams: s.spargeLastAcidRequiredGrams,
        acidRequiredKg: s.spargeLastAcidRequiredKg,
        finalAlkalinityPpmCaCO3: s.spargeLastFinalAlkalinityPpmCaCO3 ?? 0,
        sulfateAddedPpm: s.spargeLastSulfateAddedPpm ?? 0,
        chlorideAddedPpm: s.spargeLastChlorideAddedPpm ?? 0,
      });
      setSpargeStatus(`Last calculated: ${new Date(s.spargeLastCalculatedAt).toLocaleString()}`);
    }
    if (s.spargeManualLastCalculatedAt) {
      setSpargeManualResult({
        achievedPh: s.spargeManualLastAchievedPh ?? 0,
        predicted: {
          acidRequiredMl: null,
          acidRequiredTsp: null,
          acidRequiredGrams: null,
          acidRequiredKg: null,
          finalAlkalinityPpmCaCO3: s.spargeManualLastFinalAlkalinityPpmCaCO3 ?? 0,
          sulfateAddedPpm: s.spargeManualLastSulfateAddedPpm ?? 0,
          chlorideAddedPpm: s.spargeManualLastChlorideAddedPpm ?? 0,
        },
        clamped: "none",
        iterations: 0,
        targetAmount: Number.NaN,
        predictedAmount: Number.NaN,
      });
    }
  }, []);

  const refreshSpargeOverallIfPossibleRef = useRef<() => Promise<void>>(async () => {});

  const refreshSpargeOverallIfPossible = useCallback(async () => {
    const spargeSaltsResult = saltsBridgeRef.current.spargeSaltsResult;
    if (!canCall) return;
    if (!selectedSpargeProfile) return;
    if (!spargeSaltsResult) return;
    if (!spargeResult) return;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) return;
    if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) return;

    const payload: Record<string, unknown> = {
      spargeMode: spargeAcidificationMode,
      startingAlkalinityPpmCaCO3: startingAlk,
      startingPh: Number(startingPh),
      targetPh,
      volumeLiters,
      baseProfile: {
        calcium: selectedSpargeProfile.calcium,
        magnesium: selectedSpargeProfile.magnesium,
        sodium: selectedSpargeProfile.sodium,
        sulfate: selectedSpargeProfile.sulfate,
        chloride: selectedSpargeProfile.chloride,
        bicarbonate: selectedSpargeProfile.bicarbonate,
      },
      additions: spargeSaltAdditions,
      acidType,
      strengthKind,
    };
    if (strengthKind !== "solid") payload["strengthValue"] = strengthValue;
    if (spargeAcidificationMode === "manual") {
      Object.assign(
        payload,
        strengthKind === "solid" ? { acidAddedGrams: spargeManualAcidAdded } : { acidAddedMl: spargeManualAcidAdded },
      );
    }

    try {
      const data = await calcSpargeOverall(webBreweryApiClient(), payload);
      const result = asRecord(data.result);
      const derivation = asRecord(data.derivation);
      if (!result || !derivation) return;
      setSpargeOverall({
        result: result as unknown as WaterOverallResult,
        derivation: derivation as unknown as WaterCalcDerivation,
      });
    } catch {
      // ignore
    }
  }, [
    canCall,
    selectedSpargeProfile,
    spargeResult,
    volumeLiters,
    startingPh,
    spargeAcidificationMode,
    startingAlk,
    targetPh,
    spargeSaltAdditions,
    acidType,
    strengthKind,
    strengthValue,
    spargeManualAcidAdded,
    saltsBridgeRef,
  ]);

  refreshSpargeOverallIfPossibleRef.current = refreshSpargeOverallIfPossible;

  const onSaveSpargeInputs = async () => {
    setSavingError(null);
    setSpargeSaveStatus(null);
    setSavingSparge(true);
    try {
      await saveSettings({
        spargeWaterProfileId: spargeWaterProfileId || null,
        spargeStartingAlkalinityPpmCaCO3: startingAlk,
        ...(startingPh.trim() === "" ? {} : { spargeStartingPh: Number(startingPh) }),
        spargeTargetPh: targetPh,
        spargeVolumeLiters: volumeLiters,
        spargeAcidType: acidType,
        spargeStrengthKind: strengthKind,
        spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
        spargeAcidificationMode,
        spargeManualAcidAddedMl: strengthKind === "solid" ? null : spargeManualAcidAdded,
        spargeManualAcidAddedGrams: strengthKind === "solid" ? spargeManualAcidAdded : null,
        spargeSaltAdditionsJson: spargeSaltAdditions,
      });
      setSpargeSaveStatus("Saved sparge draft.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSparge(false);
    }
  };

  const onSubmitSparge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCall) return;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      setSpargeError("Sparge water volume must be > 0.");
      return;
    }
    if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) {
      setSpargeError("Starting pH is required (select a profile with pH or enter it manually).");
      return;
    }
    setSpargeError(null);
    setSpargeStatus(null);
    setCalcSaveStatus(null);
    setSpargeResult(null);
    setSpargeManualResult(null);
    setAcidDerivation(null);
    setSpargeSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        spargeWaterProfileId,
        spargeSaltAdditionsJson: spargeSaltAdditions,
        spargeStartingAlkalinityPpmCaCO3: startingAlk,
        spargeStartingPh: Number(startingPh),
        spargeTargetPh: targetPh,
        spargeVolumeLiters: volumeLiters,
        spargeAcidType: acidType,
        spargeStrengthKind: strengthKind,
        spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
        spargeAcidificationMode,
        spargeManualAcidAddedMl: strengthKind === "solid" ? null : spargeManualAcidAdded,
        spargeManualAcidAddedGrams: strengthKind === "solid" ? spargeManualAcidAdded : null,
      };

      const computed = await computeAndSaveSparge(webBreweryApiClient(), recipeId, payload);
      setFormatHints(computed.formatHints as Record<string, { decimals?: number }> | undefined);

      saltsBridgeRef.current.applySaltsFromCompute(
        computed.salts.result as unknown as SaltAdditionsResult,
        computed.salts.derivation as WaterCalcDerivation,
      );

      setAcidDerivation(computed.acid.derivation);
      if (computed.acid.kind === "sparge_acidification_manual") {
        setSpargeManualResult(computed.acid.result);
        setSpargeResult(computed.acid.result.predicted ?? null);
        setSpargeStatus("Estimated (manual mode).");
        setCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        setSpargeManualResult(null);
        setSpargeResult(computed.acid.result);
        setSpargeStatus("Calculated.");
        setCalcSaveStatus("Calculated & saved snapshot.");
      }

      await refreshSpargeOverallIfPossibleRef.current().catch(() => null);
    } catch (err) {
      setSpargeError(String(err));
    } finally {
      setSpargeSubmitting(false);
    }
  };

  const selectedSpargeProfileInfo = selectedSpargeProfile ? (
    <View className="brew-field-block brew-field-block--readonly brew-mt3">
      <View className="brew-field-block-header">
        <strong>Selected profile info</strong>
        <FieldBadge>Read-only</FieldBadge>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
          From selected profile
        </SizableText>
      </View>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        Bicarbonate: <code>{fmt("ppm", selectedSpargeProfile.bicarbonate, 0)}</code> {tUnits("ppm")} · Estimated
        alkalinity:{" "}
        <code>{fmt("ppm_as_CaCO3", bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate), 0)}</code>{" "}
        {tUnits("ppmAsCaCO3")} · pH:{" "}
        {selectedSpargeProfile.ph == null ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
            —
          </SizableText>
        ) : (
          <code>{fmt("pH", selectedSpargeProfile.ph, 2)}</code>
        )}
      </SizableText>
      <XStack mt="$2" gap="$3" alignItems="center" flexWrap="wrap">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          onPress={() => {
            setStartingAlk(bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate));
            setStartingPh(selectedSpargeProfile.ph == null ? "" : String(selectedSpargeProfile.ph));
          }}
          disabled={!canCall}
        >
          Use profile alkalinity + pH
        </Button>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          If profile pH is missing, we clear Starting pH so you can enter it.
        </SizableText>
      </XStack>
    </View>
  ) : (
    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
      (Optional) Select a sparge water profile; you can then apply its alkalinity to the input.
    </SizableText>
  );

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
    refreshSpargeOverallIfPossible,
    onSaveSpargeInputs,
    onSubmitSparge,
    selectedSpargeProfileInfo,
  };
}
