import { useCallback, useState } from "react";

import type { WaterAcidificationManualResult, WaterAcidificationResult } from "@umbraculum/brewery-contracts";

export function useNativeWaterMashAcidificationState() {
  const [mashStartingAlk, setMashStartingAlk] = useState(0);
  const [mashStartingPh, setMashStartingPh] = useState(7);
  const [mashTargetPh, setMashTargetPh] = useState(5.4);
  const [mashAcidType, setMashAcidType] = useState("lactic");
  const [mashAcidificationMode, setMashAcidificationMode] = useState<"targetPh" | "manual">("targetPh");
  const [mashStrengthKind, setMashStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [mashStrengthValue, setMashStrengthValue] = useState(88);
  const [mashManualAcidAdded, setMashManualAcidAdded] = useState(0);

  const [overallResult, setOverallResult] = useState<Record<string, unknown> | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [savingOverall, setSavingOverall] = useState(false);

  const [mashAcidResult, setMashAcidResult] = useState<WaterAcidificationResult | null>(null);
  const [mashManualResult, setMashManualResult] = useState<WaterAcidificationManualResult | null>(null);
  const [mashSaveStatus, setMashSaveStatus] = useState<string | null>(null);
  const [mashCalcSaveStatus, setMashCalcSaveStatus] = useState<string | null>(null);
  const [savingMash, setSavingMash] = useState(false);
  const [mashSubmitting, setMashSubmitting] = useState(false);

  const hydrateMashAcidification = useCallback((s: Record<string, unknown>) => {
    // eslint-disable-next-line no-constant-binary-expression -- pre-existing semantic bug: Number(x) ?? default never short-circuits (Number always returns a number, possibly NaN). Intended pattern is likely Number(x ?? default). Not fixed here because changing the precedence changes runtime behavior (NaN vs default). Tracked separately. See docs/LINTING.md.
    setMashStartingAlk(Number(s["mashStartingAlkalinityPpmCaCO3"]) ?? 0);
    // eslint-disable-next-line no-constant-binary-expression -- pre-existing: see above.
    setMashStartingPh(Number(s["mashStartingPh"]) ?? 7);
    // eslint-disable-next-line no-constant-binary-expression -- pre-existing: see above.
    setMashTargetPh(Number(s["mashTargetPh"]) ?? 5.4);
    setMashAcidType((s["mashAcidType"] as string) ?? "lactic");
    setMashAcidificationMode((s["mashAcidificationMode"] as string) === "manual" ? "manual" : "targetPh");
    setMashStrengthKind(((s["mashStrengthKind"] as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
    // eslint-disable-next-line no-constant-binary-expression -- pre-existing: see above.
    setMashStrengthValue(Number(s["mashStrengthValue"]) ?? 88);
    setMashManualAcidAdded(Number(s["mashManualAcidAddedMl"] ?? s["mashManualAcidAddedGrams"] ?? 0));
    if (s["mashOverallLastResultJson"] && typeof s["mashOverallLastResultJson"] === "object") {
      setOverallResult(s["mashOverallLastResultJson"] as Record<string, unknown>);
    }
  }, []);

  return {
    mashStartingAlk,
    setMashStartingAlk,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashManualAcidAdded,
    setMashManualAcidAdded,
    overallResult,
    setOverallResult,
    overallStatus,
    setOverallStatus,
    savingOverall,
    setSavingOverall,
    mashAcidResult,
    setMashAcidResult,
    mashManualResult,
    setMashManualResult,
    mashSaveStatus,
    setMashSaveStatus,
    mashCalcSaveStatus,
    setMashCalcSaveStatus,
    savingMash,
    setSavingMash,
    mashSubmitting,
    setMashSubmitting,
    hydrateMashAcidification,
  };
}
