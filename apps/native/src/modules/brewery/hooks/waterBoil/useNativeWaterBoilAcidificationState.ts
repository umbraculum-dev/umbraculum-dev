import { useCallback, useEffect, useState } from "react";

import type {
  NativeWaterAcidificationManualResult,
  NativeWaterAcidificationMode,
  NativeWaterAcidificationResult,
  NativeWaterAcidStrengthKind,
} from "../waterSparge/nativeWaterAcidificationOptions";

export function useNativeWaterBoilAcidificationState(params: {
  derivedStartingAlkPpmCaCO3: number | null;
}) {
  const { derivedStartingAlkPpmCaCO3 } = params;

  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<NativeWaterAcidStrengthKind>("percent");
  const [strengthValue, setStrengthValue] = useState(10);
  const [acidificationMode, setAcidificationMode] = useState<NativeWaterAcidificationMode>("targetPh");
  const [manualAcidAdded, setManualAcidAdded] = useState(0);

  const [acidResult, setAcidResult] = useState<NativeWaterAcidificationResult | null>(null);
  const [manualResult, setManualResult] = useState<NativeWaterAcidificationManualResult | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedStartingAlkPpmCaCO3, startingAlkTouched]);

  const hydrateBoilAcidification = useCallback((s: Record<string, unknown>) => {
    const savedAlk = s["boilStartingAlkalinityPpmCaCO3"];
    setStartingAlk(typeof savedAlk === "number" && Number.isFinite(savedAlk) ? savedAlk : 0);
    setStartingAlkTouched(typeof savedAlk === "number" && Number.isFinite(savedAlk) && savedAlk !== 0);
    setStartingPh(String(s["boilStartingPh"] ?? 7.0));
    setTargetPh((s["boilTargetPh"] as number) ?? 5.6);
    setAcidType((s["boilAcidType"] as string) ?? "phosphoric");
    setStrengthKind(((s["boilStrengthKind"] as string) ?? "percent") as NativeWaterAcidStrengthKind);
    setStrengthValue((s["boilStrengthValue"] as number) ?? 10);
    setAcidificationMode(s["boilAcidificationMode"] === "manual" ? "manual" : "targetPh");
    const savedManual =
      (s["boilStrengthKind"] as string) === "solid"
        ? ((s["boilManualAcidAddedGrams"] as number) ?? 0)
        : ((s["boilManualAcidAddedMl"] as number) ?? 0);
    setManualAcidAdded(savedManual);
    if (s["boilLastCalculatedAt"]) {
      setAcidResult({
        acidRequiredMl: s["boilLastAcidRequiredMl"] as number | null,
        acidRequiredTsp: s["boilLastAcidRequiredTsp"] as number | null,
        acidRequiredGrams: s["boilLastAcidRequiredGrams"] as number | null,
        acidRequiredKg: s["boilLastAcidRequiredKg"] as number | null,
        finalAlkalinityPpmCaCO3: (s["boilLastFinalAlkalinityPpmCaCO3"] as number) ?? 0,
        sulfateAddedPpm: (s["boilLastSulfateAddedPpm"] as number) ?? 0,
        chlorideAddedPpm: (s["boilLastChlorideAddedPpm"] as number) ?? 0,
      });
    }
    if (s["boilManualLastCalculatedAt"]) {
      setManualResult({
        achievedPh: (s["boilManualLastAchievedPh"] as number) ?? 0,
        predicted: {
          finalAlkalinityPpmCaCO3: (s["boilManualLastFinalAlkalinityPpmCaCO3"] as number) ?? 0,
          sulfateAddedPpm: (s["boilManualLastSulfateAddedPpm"] as number) ?? 0,
          chlorideAddedPpm: (s["boilManualLastChlorideAddedPpm"] as number) ?? 0,
        },
      });
    }
  }, []);

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
    acidResult,
    setAcidResult,
    manualResult,
    setManualResult,
    calcSaveStatus,
    setCalcSaveStatus,
    submitting,
    setSubmitting,
    hydrateBoilAcidification,
  };
}

export type NativeWaterBoilAcidificationState = ReturnType<typeof useNativeWaterBoilAcidificationState>;
