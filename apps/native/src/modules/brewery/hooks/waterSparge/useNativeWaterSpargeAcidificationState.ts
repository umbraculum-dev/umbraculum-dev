import { useCallback, useEffect, useMemo, useState } from "react";

import type { WaterProfile } from "@umbraculum/contracts";

import { bicarbonatePpmToAlkalinityPpmCaCO3 } from "./waterSpargeHelpers";
import type {
  NativeWaterAcidificationManualResult,
  NativeWaterAcidificationMode,
  NativeWaterAcidificationResult,
  NativeWaterAcidStrengthKind,
} from "./nativeWaterAcidificationOptions";

export function useNativeWaterSpargeAcidificationState(params: {
  waterProfiles: WaterProfile[];
}) {
  const { waterProfiles } = params;

  const [spargeWaterProfileId, setSpargeWaterProfileId] = useState("");
  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [volumeLiters, setVolumeLiters] = useState(20);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<NativeWaterAcidStrengthKind>("percent");
  const [strengthValue, setStrengthValue] = useState(10);
  const [acidificationMode, setAcidificationMode] = useState<NativeWaterAcidificationMode>("targetPh");
  const [manualAcidAdded, setManualAcidAdded] = useState(0);

  const [spargeResult, setSpargeResult] = useState<NativeWaterAcidificationResult | null>(null);
  const [spargeManualResult, setSpargeManualResult] = useState<NativeWaterAcidificationManualResult | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedProfile = useMemo(
    () => waterProfiles.find((p) => p.id === spargeWaterProfileId) ?? null,
    [spargeWaterProfileId, waterProfiles],
  );

  const derivedStartingAlkPpmCaCO3 = useMemo(() => {
    if (!selectedProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(selectedProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [selectedProfile]);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedStartingAlkPpmCaCO3, startingAlkTouched]);

  const hydrateSpargeAcidification = useCallback((s: Record<string, unknown>) => {
    setSpargeWaterProfileId((s["spargeWaterProfileId"] as string) ?? "");
    const savedAlk = s["spargeStartingAlkalinityPpmCaCO3"];
    setStartingAlk(typeof savedAlk === "number" && Number.isFinite(savedAlk) ? savedAlk : 0);
    setStartingAlkTouched(typeof savedAlk === "number" && Number.isFinite(savedAlk) && savedAlk !== 0);
    setStartingPh(String(s["spargeStartingPh"] ?? 7.0));
    setTargetPh((s["spargeTargetPh"] as number) ?? 5.6);
    setVolumeLiters((s["spargeVolumeLiters"] as number) ?? 20);
    setAcidType((s["spargeAcidType"] as string) ?? "phosphoric");
    setStrengthKind(((s["spargeStrengthKind"] as string) ?? "percent") as NativeWaterAcidStrengthKind);
    setStrengthValue((s["spargeStrengthValue"] as number) ?? 10);
    setAcidificationMode(s["spargeAcidificationMode"] === "manual" ? "manual" : "targetPh");
    const savedManual =
      (s["spargeStrengthKind"] as string) === "solid"
        ? ((s["spargeManualAcidAddedGrams"] as number) ?? 0)
        : ((s["spargeManualAcidAddedMl"] as number) ?? 0);
    setManualAcidAdded(savedManual);
    if (s["spargeLastCalculatedAt"]) {
      setSpargeResult({
        acidRequiredMl: s["spargeLastAcidRequiredMl"] as number | null,
        acidRequiredTsp: s["spargeLastAcidRequiredTsp"] as number | null,
        acidRequiredGrams: s["spargeLastAcidRequiredGrams"] as number | null,
        acidRequiredKg: s["spargeLastAcidRequiredKg"] as number | null,
        finalAlkalinityPpmCaCO3: (s["spargeLastFinalAlkalinityPpmCaCO3"] as number) ?? 0,
        sulfateAddedPpm: (s["spargeLastSulfateAddedPpm"] as number) ?? 0,
        chlorideAddedPpm: (s["spargeLastChlorideAddedPpm"] as number) ?? 0,
      });
    }
    if (s["spargeManualLastCalculatedAt"]) {
      setSpargeManualResult({
        achievedPh: (s["spargeManualLastAchievedPh"] as number) ?? 0,
        predicted: {
          finalAlkalinityPpmCaCO3: (s["spargeManualLastFinalAlkalinityPpmCaCO3"] as number) ?? 0,
          sulfateAddedPpm: (s["spargeManualLastSulfateAddedPpm"] as number) ?? 0,
          chlorideAddedPpm: (s["spargeManualLastChlorideAddedPpm"] as number) ?? 0,
        },
      });
    }
  }, []);

  return {
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
    acidificationMode,
    setAcidificationMode,
    manualAcidAdded,
    setManualAcidAdded,
    spargeResult,
    setSpargeResult,
    spargeManualResult,
    setSpargeManualResult,
    calcSaveStatus,
    setCalcSaveStatus,
    submitting,
    setSubmitting,
    selectedProfile,
    derivedStartingAlkPpmCaCO3,
    hydrateSpargeAcidification,
  };
}

export type NativeWaterSpargeAcidificationState = ReturnType<typeof useNativeWaterSpargeAcidificationState>;
