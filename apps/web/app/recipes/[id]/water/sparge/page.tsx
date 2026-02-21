"use client";

import { Link } from "../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BrewSelect } from "../../../../_components/BrewSelect";
import { ModeFieldset } from "../_components/ModeFieldset";
import { RecipeMetaLine } from "../_components/RecipeMetaLine";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "../_components/SaltAdditionsEditor";
import { MathHelpPopover } from "../../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../../_components/SurfaceMathToggleRow";
import { parseWaterProfilesResponse } from "@brewery/contracts";
import { Button, H1, H2, H3, Input, SizableText, View, XStack, YStack } from "tamagui";

import { ErrorBox, FieldBadge, RecipeEditFieldLabel } from "../../../../_components/recipe-edit";

import { apiFetch, type WaterProfilesResponse } from "../_lib/api";
import type { IonProfilePpm } from "../_lib/waterChem";
import { bicarbonatePpmToAlkalinityPpmCaCO3, combineAfterSaltsAndAcid } from "../_lib/waterChem";
import { mathExplain } from "../_lib/mathExplain";
import { buildWaterMathBody } from "../_lib/mathBodies";
import { parseSpargeComputeAndSaveResponse } from "@brewery/contracts";
import { formatWithHint } from "../../../../../src/i18n/format";
import {
  fetchRecipeWaterSettings,
  saveRecipeWaterSettings,
  type RecipeWaterSettingsResponse,
} from "../_lib/waterSettings";

type SpargeResult = {
  acidRequiredMl: number | null;
  acidRequiredTsp: number | null;
  acidRequiredGrams: number | null;
  acidRequiredKg: number | null;
  finalAlkalinityPpmCaCO3: number;
  sulfateAddedPpm: number;
  chlorideAddedPpm: number;
};

type SpargeManualCalcResult = {
  achievedPh: number;
  predicted: SpargeResult;
  clamped: "none" | "low" | "high";
  iterations: number;
  targetAmount: number;
  predictedAmount: number;
};

type SaltAdditionsResult = {
  baseProfile: IonProfilePpm;
  resultingProfile: IonProfilePpm;
  deltasPpm: IonProfilePpm;
  breakdown: Array<{ saltKey: SaltKey; grams: number; deltasPpm: Partial<IonProfilePpm> }>;
};

export default function SpargeWaterPage() {
  const locale = useLocale();
  const tWater = useTranslations("recipes.water.common");
  const t = useTranslations("recipes.water.sparge");
  const tUnits = useTranslations("units");
  const tMath = useTranslations("math");
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [savingError, setSavingError] = useState<string | null>(null);

  const [spargeError, setSpargeError] = useState<string | null>(null);
  const [spargeStatus, setSpargeStatus] = useState<string | null>(null);
  const [spargeSaveStatus, setSpargeSaveStatus] = useState<string | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [spargeResult, setSpargeResult] = useState<SpargeResult | null>(null);
  const [acidDerivation, setAcidDerivation] = useState<any | null>(null);
  const [spargeManualResult, setSpargeManualResult] = useState<SpargeManualCalcResult | null>(null);
  const [spargeSubmitting, setSpargeSubmitting] = useState(false);
  const [savingSparge, setSavingSparge] = useState(false);

  const [spargeAcidificationMode, setSpargeAcidificationMode] = useState<"targetPh" | "manual">(
    "targetPh",
  );
  const [spargeManualAcidAdded, setSpargeManualAcidAdded] = useState(0);

  // liters-first inputs (v0)
  const [spargeWaterProfileId, setSpargeWaterProfileId] = useState<string>("");
  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState<string>("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [volumeLiters, setVolumeLiters] = useState(20);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">(
    "percent",
  );
  const [strengthValue, setStrengthValue] = useState(10);

  const [spargeSaltsError, setSpargeSaltsError] = useState<string | null>(null);
  const [spargeSaltsStatus, setSpargeSaltsStatus] = useState<string | null>(null);
  const [spargeSaltsSaveStatus, setSpargeSaltsSaveStatus] = useState<string | null>(null);
  const [spargeSaltsCalcSaveStatus, setSpargeSaltsCalcSaveStatus] = useState<string | null>(null);
  const [spargeSaltsSubmitting, setSpargeSaltsSubmitting] = useState(false);
  const [savingSpargeSalts, setSavingSpargeSalts] = useState(false);
  const [spargeSaltAdditions, setSpargeSaltAdditions] = useState<SaltAdditionRow[]>([]);
  const [spargeSaltsResult, setSpargeSaltsResult] = useState<SaltAdditionsResult | null>(null);
  const [saltDerivation, setSaltDerivation] = useState<any | null>(null);
  const [spargeOverall, setSpargeOverall] = useState<any | null>(null);
  const [spargeSaltsInputsKey, setSpargeSaltsInputsKey] = useState<string | null>(null);
  const [formatHints, setFormatHints] = useState<Record<string, { decimals?: number }> | undefined>(undefined);

  const fmt = (unitKey: string, value: unknown, fallback: number) =>
    formatWithHint(locale, value, formatHints, unitKey, fallback);

  const [surfaceMath, setSurfaceMath] = useState(false);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("brewery:surfaceMath:sparge");
      if (v === "1") setSurfaceMath(true);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("brewery:surfaceMath:sparge", surfaceMath ? "1" : "0");
    } catch {
      // ignore
    }
  }, [surfaceMath]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch("/api/auth/me");
      if (cancelled) return;
      setAuthed(res.ok);
      setAuthChecked(true);
    })().catch(() => {
      if (!cancelled) {
        setAuthed(false);
        setAuthChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const canCall = useMemo(() => authed, [authed]);

  const refreshProfiles = async () => {
    setProfilesError(null);
    setLoadingProfiles(true);
    try {
      const profRes = await apiFetch("/api/water-profiles");
      if (!profRes.ok) throw new Error(JSON.stringify(profRes.data));
      setProfiles(parseWaterProfilesResponse(profRes.data));
    } catch (err) {
      setProfilesError(String(err));
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadSettings = async () => {
    if (!recipeId) return;
    setSettingsError(null);
    try {
      const data = (await fetchRecipeWaterSettings(recipeId)) as RecipeWaterSettingsResponse;
      const s = data.settings;
      if (!s) return;

      const savedStartingAlk = s.spargeStartingAlkalinityPpmCaCO3;
      if (typeof savedStartingAlk === "number" && Number.isFinite(savedStartingAlk)) {
        setStartingAlk(savedStartingAlk);
        // Treat a saved 0 as "likely unset" so we can derive from the selected profile.
        setStartingAlkTouched(savedStartingAlk !== 0);
      } else {
        setStartingAlk(0);
        setStartingAlkTouched(false);
      }
      setStartingPh(String(s.spargeStartingPh ?? 7.0));
      setTargetPh(s.spargeTargetPh ?? 5.6);
      setVolumeLiters(s.spargeVolumeLiters ?? 20);
      setAcidType(s.spargeAcidType ?? "phosphoric");
      const savedStrengthKind = ((s.spargeStrengthKind as any) ?? "percent") as
        | "percent"
        | "normality"
        | "molarity"
        | "solid";
      setStrengthKind(savedStrengthKind);
      setStrengthValue(s.spargeStrengthValue ?? 10);
      setSpargeWaterProfileId(s.spargeWaterProfileId ?? "");

      setSpargeAcidificationMode(s.spargeAcidificationMode === "manual" ? "manual" : "targetPh");
      setSpargeManualAcidAdded(
        savedStrengthKind === "solid"
          ? (s.spargeManualAcidAddedGrams ?? 0)
          : (s.spargeManualAcidAddedMl ?? 0),
      );

      if (Array.isArray(s.spargeSaltAdditionsJson)) setSpargeSaltAdditions(s.spargeSaltAdditionsJson as any);
      if (s.spargeSaltsLastResultJson && typeof s.spargeSaltsLastResultJson === "object") {
        const v: any = s.spargeSaltsLastResultJson as any;
        if (v?.result && typeof v.result === "object") {
          setSpargeSaltsResult(v.result as SaltAdditionsResult);
          setSpargeSaltsInputsKey(
            JSON.stringify({
              spargeWaterProfileId: s.spargeWaterProfileId ?? "",
              volumeLiters: s.spargeVolumeLiters ?? 20,
              additions: Array.isArray(s.spargeSaltAdditionsJson) ? s.spargeSaltAdditionsJson : [],
            }),
          );
          if (typeof v.calculatedAt === "string") {
            setSpargeSaltsStatus(`Last calculated: ${new Date(v.calculatedAt).toLocaleString()}`);
          }
        }
      }

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
    } catch (err) {
      setSettingsError(String(err));
    }
  };

  useEffect(() => {
    if (!authed) return;
    void refreshProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    void loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, recipeId]);

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const acc = profiles?.account ?? [];
    return [...sys, ...pub, ...acc];
  }, [profiles]);
  const waterProfiles = useMemo(() => allProfiles.filter((p) => p.type === "water"), [allProfiles]);
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

  const spargeCalciumPpm = useMemo(() => {
    const v = spargeSaltsResult?.resultingProfile?.calcium ?? selectedSpargeProfile?.calcium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [spargeSaltsResult, selectedSpargeProfile]);

  const spargeMagnesiumPpm = useMemo(() => {
    const v = spargeSaltsResult?.resultingProfile?.magnesium ?? selectedSpargeProfile?.magnesium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [spargeSaltsResult, selectedSpargeProfile]);

  const saveSettings = async (patch: Record<string, unknown>) => {
    if (!canCall) return;
    await saveRecipeWaterSettings(recipeId, patch);
  };

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
        spargeWaterProfileId: spargeWaterProfileId,
        spargeSaltAdditionsJson: spargeSaltAdditions,
        spargeStartingAlkalinityPpmCaCO3: startingAlk,
        spargeStartingPh: Number(startingPh),
        spargeTargetPh: targetPh,
        spargeVolumeLiters: volumeLiters,
        spargeAcidType: acidType,
        spargeStrengthKind: strengthKind,
        spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
        spargeAcidificationMode: spargeAcidificationMode,
        spargeManualAcidAddedMl: strengthKind === "solid" ? null : spargeManualAcidAdded,
        spargeManualAcidAddedGrams: strengthKind === "solid" ? spargeManualAcidAdded : null,
      };

      const res = await apiFetch(`/api/recipes/${recipeId}/water-settings/sparge/compute-and-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const computed = parseSpargeComputeAndSaveResponse(res.data);
      setFormatHints(computed.formatHints as Record<string, { decimals?: number }> | undefined);

      setSpargeSaltsResult(computed.salts.result as any);
      setSaltDerivation(computed.salts.derivation as any);
      setSpargeSaltsInputsKey(buildSpargeSaltsInputsKey());

      setAcidDerivation(computed.acid.derivation as any);
      if (computed.acid.kind === "sparge_acidification_manual") {
        setSpargeManualResult(computed.acid.result as any);
        setSpargeResult((computed.acid.result as any).predicted ?? null);
        setSpargeStatus("Estimated (manual mode).");
        setCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        setSpargeManualResult(null);
        setSpargeResult(computed.acid.result as any);
        setSpargeStatus("Calculated.");
        setCalcSaveStatus("Calculated & saved snapshot.");
      }

      await refreshSpargeOverallIfPossible().catch(() => null);
    } catch (err) {
      setSpargeError(String(err));
    } finally {
      setSpargeSubmitting(false);
    }
  };

  const onSaveSpargeSaltsInputs = async () => {
    setSavingError(null);
    setSpargeSaltsSaveStatus(null);
    setSavingSpargeSalts(true);
    try {
      await saveSettings({ spargeSaltAdditionsJson: spargeSaltAdditions });
      setSpargeSaltsSaveStatus("Saved salts draft.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSpargeSalts(false);
    }
  };

  const hasNonZeroSaltAdditions = (rows: SaltAdditionRow[]) =>
    rows.some((r) => typeof r.grams === "number" && Number.isFinite(r.grams) && r.grams > 0);

  const buildSpargeSaltsInputsKey = () => {
    return JSON.stringify({
      spargeWaterProfileId,
      volumeLiters,
      additions: spargeSaltAdditions,
    });
  };

  const ensureSpargeSaltsSnapshotForAcidification = async (): Promise<SaltAdditionsResult> => {
    if (!canCall) throw new Error("Not ready to call API.");
    if (!selectedSpargeProfile) {
      throw new Error("Select a sparge water profile first (base ion profile for recap).");
    }
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new Error("Sparge water volume must be > 0.");
    }

    const inputsKey = buildSpargeSaltsInputsKey();
    const saltsEntered = hasNonZeroSaltAdditions(spargeSaltAdditions);
    const isSnapshotStale = saltsEntered && (!!spargeSaltsResult && spargeSaltsInputsKey !== inputsKey);
    if (spargeSaltsResult && !isSnapshotStale) return spargeSaltsResult;

    const base: IonProfilePpm = {
      calcium: selectedSpargeProfile.calcium,
      magnesium: selectedSpargeProfile.magnesium,
      sodium: selectedSpargeProfile.sodium,
      sulfate: selectedSpargeProfile.sulfate,
      chloride: selectedSpargeProfile.chloride,
      bicarbonate: selectedSpargeProfile.bicarbonate,
    };

    if (!saltsEntered) {
      const result: SaltAdditionsResult = {
        baseProfile: base,
        resultingProfile: base,
        deltasPpm: { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
        breakdown: [],
      };

      const nowIso = new Date().toISOString();
      setSpargeSaltsResult(result);
      setSaltDerivation(null);
      setSpargeSaltsInputsKey(inputsKey);
      await saveSettings({
        spargeSaltAdditionsJson: spargeSaltAdditions,
        spargeSaltsLastResultJson: { calculatedAt: nowIso, result },
      });
      return result;
    }

    setSpargeSaltsStatus("Calculating salts for acidification…");
    const res = await apiFetch("/api/water-calc/salt-additions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        volumeLiters,
        baseProfile: base,
        additions: spargeSaltAdditions,
      }),
    });
    if (!res.ok) throw new Error(JSON.stringify(res.data));
    const result = (res.data as any).result as SaltAdditionsResult;
    setSaltDerivation((res.data as any).derivation ?? null);

    const nowIso = new Date().toISOString();
    setSpargeSaltsResult(result);
    setSpargeSaltsInputsKey(inputsKey);
    await saveSettings({
      spargeSaltAdditionsJson: spargeSaltAdditions,
      spargeSaltsLastResultJson: { calculatedAt: nowIso, result },
    });
    return result;
  };

  const onCalculateSpargeSalts = async () => {
    if (!canCall) return;
    setSpargeSaltsError(null);
    setSpargeSaltsStatus(null);
    setSpargeSaltsCalcSaveStatus(null);
    setSpargeSaltsResult(null);
    setSpargeSaltsSubmitting(true);
    try {
      if (!selectedSpargeProfile) throw new Error("Select a sparge water profile first (base ion profile for salts).");
      if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) throw new Error("Sparge water volume must be > 0.");

      setSpargeSaltsInputsKey(buildSpargeSaltsInputsKey());
      const res = await apiFetch("/api/water-calc/salt-additions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const result = (res.data as any).result as SaltAdditionsResult;
      setSpargeSaltsResult(result);
      setSaltDerivation((res.data as any).derivation ?? null);
      await refreshSpargeOverallIfPossible().catch(() => null);

      await saveSettings({
        spargeSaltAdditionsJson: spargeSaltAdditions,
        spargeSaltsLastResultJson: { calculatedAt: new Date().toISOString(), result },
      });
      setSpargeSaltsStatus("Calculated.");
      setSpargeSaltsCalcSaveStatus("Calculated & saved salts snapshot.");
    } catch (err) {
      setSpargeSaltsError(String(err));
    } finally {
      setSpargeSaltsSubmitting(false);
    }
  };

  const refreshSpargeOverallIfPossible = async () => {
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
    if (strengthKind !== "solid") payload.strengthValue = strengthValue;
    if (spargeAcidificationMode === "manual") {
      Object.assign(
        payload,
        strengthKind === "solid" ? { acidAddedGrams: spargeManualAcidAdded } : { acidAddedMl: spargeManualAcidAdded },
      );
    }

    const res = await apiFetch("/api/water-calc/sparge-overall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    const data = res.data as any;
    setSpargeOverall({ result: data.result, derivation: data.derivation });
  };

  const selectedSpargeProfileInfo = selectedSpargeProfile ? (
    <View className="brew-field-block brew-field-block--readonly brew-mt3">
      <View className="brew-field-block-header">
        <strong>Selected profile info</strong>
        <FieldBadge>Read-only</FieldBadge>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">From selected profile</SizableText>
      </View>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        Bicarbonate: <code>{fmt("ppm", selectedSpargeProfile.bicarbonate, 0)}</code> {tUnits("ppm")}{" · "}Estimated alkalinity:{" "}
        <code>{fmt("ppm_as_CaCO3", bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate), 0)}</code> {tUnits("ppmAsCaCO3")}{" "}
        {" · "}pH: {selectedSpargeProfile.ph == null ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">—</SizableText> : <code>{fmt("pH", selectedSpargeProfile.ph, 2)}</code>}
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
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">If profile pH is missing, we clear Starting pH so you can enter it.</SizableText>
      </XStack>
    </View>
  ) : (
    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
      (Optional) Select a sparge water profile; you can then apply its alkalinity to the input.
    </SizableText>
  );

  return (
    <>
      <H1 mb="$2">{t("title")}</H1>
      <RecipeMetaLine recipeId={recipeId} enabled={authed} />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/water/mash`}>{tWater("goToMash")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authChecked && !canCall ? (
        <ErrorBox>
          {tWater.rich("notAuthenticated", {
            signIn: (chunks) => <Link href={`/login?next=/${locale}/recipes/${recipeId}/water/sparge`}>{chunks}</Link>,
          })}
        </ErrorBox>
      ) : null}

      <YStack gap="$4">
        <View className="brew-panel" aria-labelledby="sparge-heading">
          <H2 id="sparge-heading" mt={0}>
            {t("acidificationHeading")}
          </H2>

          <form onSubmit={onSubmitSparge} aria-describedby={spargeError ? "sparge-error" : undefined}>
            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View width="100%" flexBasis="100%">
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="sparge-profile">
                  Sparge water profile
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="sparge-profile"
                  value={spargeWaterProfileId}
                  onValueChange={setSpargeWaterProfileId}
                  options={[
                    { value: "", label: "(none)" },
                    ...waterProfiles.map((p) => ({
                      value: p.id,
                      label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                    })),
                  ]}
                  width="full"
                />
                {selectedSpargeProfileInfo}
                </YStack>
              </View>

              <View width="100%" flexBasis="100%">
                <ModeFieldset
                  legend="Mode"
                  name="sparge-mode"
                  value={spargeAcidificationMode}
                  onChange={(v) => setSpargeAcidificationMode(v)}
                  options={[
                    { value: "targetPh", label: "Target pH (solve acid required)" },
                    { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
                  ]}
                />
              </View>

              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="starting-alk">
                  {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
                </RecipeEditFieldLabel>
                <Input
                  id="starting-alk"
                  keyboardType="decimal-pad"
                  value={String(startingAlk)}
                  onChangeText={(text) => {
                    setStartingAlkTouched(true);
                    const n = Number(text);
                    setStartingAlk(Number.isFinite(n) ? n : 0);
                  }}
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="volume-l">
                  {t("waterVolumeLabel", { unit: tUnits("L") })}
                </RecipeEditFieldLabel>
                <Input
                  id="volume-l"
                  keyboardType="decimal-pad"
                  value={String(volumeLiters)}
                  onChangeText={(text) => setVolumeLiters(Number(text) || 0)}
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="starting-ph">
                  Starting pH
                </RecipeEditFieldLabel>
                <Input
                  id="starting-ph"
                  keyboardType="decimal-pad"
                  value={startingPh}
                  onChangeText={setStartingPh}
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                </YStack>
              </View>
              {spargeAcidificationMode === "targetPh" ? (
                <View flex={1} minWidth={200}>
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="target-ph">
                    Target pH
                  </RecipeEditFieldLabel>
                  <Input
                    id="target-ph"
                    keyboardType="decimal-pad"
                    value={String(targetPh)}
                    onChangeText={(text) => setTargetPh(Number(text) || 0)}
                    size="$3"
                    w="100%"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                  </YStack>
                </View>
              ) : null}
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="acid-type">
                  Acid type
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="acid-type"
                  value={acidType}
                  onValueChange={setAcidType}
                  options={[
                    { value: "phosphoric", label: "Phosphoric" },
                    { value: "lactic", label: "Lactic" },
                    { value: "hydrochloric", label: "Hydrochloric" },
                    { value: "sulfuric", label: "Sulfuric" },
                    { value: "acetic", label: "Acetic" },
                    { value: "citric", label: "Citric (solid)" },
                    { value: "tartaric", label: "Tartaric (solid)" },
                    { value: "malic", label: "Malic (solid)" },
                  ]}
                  width="full"
                />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="strength-kind">
                  Strength kind
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="strength-kind"
                  value={strengthKind}
                  onValueChange={(v) => setStrengthKind(v as "percent" | "normality" | "molarity" | "solid")}
                  options={[
                    { value: "percent", label: "Percent (%)" },
                    { value: "normality", label: "Normality (N)" },
                    { value: "molarity", label: "Molarity (M)" },
                    { value: "solid", label: "Solid (pure)" },
                  ]}
                  width="full"
                />
                </YStack>
              </View>
              <View width="100%" flexBasis="100%">
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="strength-value">
                  Strength value {strengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
                </RecipeEditFieldLabel>
                <Input
                  id="strength-value"
                  keyboardType="decimal-pad"
                  value={String(strengthValue)}
                  onChangeText={(text) => setStrengthValue(Number(text) || 0)}
                  disabled={strengthKind === "solid"}
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                </YStack>
              </View>
              {spargeAcidificationMode === "manual" ? (
                <View width="100%" flexBasis="100%">
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="sparge-manual-acid-added">
                    Acid added ({strengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                  </RecipeEditFieldLabel>
                  <Input
                    id="sparge-manual-acid-added"
                    keyboardType="decimal-pad"
                    value={String(spargeManualAcidAdded)}
                    onChangeText={(text) => setSpargeManualAcidAdded(Number(text) || 0)}
                    size="$3"
                    w="100%"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                  </YStack>
                </View>
              ) : null}
            </XStack>

            <XStack mt="$3" gap="$3" alignItems="center">
              <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={!canCall || spargeSubmitting}>
                {spargeSubmitting
                  ? "Working…"
                  : spargeAcidificationMode === "manual"
                    ? "Estimate & save snapshot"
                    : "Calculate & save snapshot"}
              </Button>
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSpargeInputs()} disabled={!canCall || savingSparge}>
                {savingSparge ? "Saving…" : "Save sparge draft"}
              </Button>
              {spargeStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{spargeStatus}</SizableText> : null}
              {spargeSaveStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{spargeSaveStatus}</SizableText> : null}
              {calcSaveStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{calcSaveStatus}</SizableText> : null}
            </XStack>

            {spargeError ? (
              <ErrorBox id="sparge-error" mt="$3">{spargeError}</ErrorBox>
            ) : null}
          </form>

          {spargeAcidificationMode === "targetPh" && spargeResult ? (
            <View className="brew-field-block brew-field-block--computed brew-mt3">
              <View className="brew-field-block-header">
                <strong>Result</strong>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">From current inputs</SizableText>
              </View>
              <H3 mt={0}>{t("resultLastCalculated")}</H3>
              <ul>
                {spargeResult.acidRequiredMl !== null ? (
                  <li>
                    Acid required{" "}
                    {surfaceMath ? (() => {
                      const ex = mathExplain["sparge.acidRequired"];
                      const title = tMath(ex.titleKey);
                      return (
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "sparge.acidRequired",
                            tMath,
                            locale,
                            ctx: {
                              acidDerivation,
                            },
                            units: {
                              L: tUnits("L"),
                              ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                              ppm: tUnits("ppm"),
                              g: tUnits("g"),
                              LPerKg: tUnits("LPerKg"),
                            },
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      );
                    })() : null}
                    : <code>{fmt("mL", spargeResult.acidRequiredMl, 0)}</code> {tUnits("mL")}{" "}
                    {spargeResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{fmt("mL", spargeResult.acidRequiredTsp, 0)}</code> {tUnits("tsp")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                {spargeResult.acidRequiredGrams !== null ? (
                  <li>
                    Acid required{" "}
                    {surfaceMath ? (() => {
                      const ex = mathExplain["sparge.acidRequired"];
                      const title = tMath(ex.titleKey);
                      return (
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "sparge.acidRequired",
                            tMath,
                            locale,
                            ctx: {
                              acidDerivation,
                            },
                            units: {
                              L: tUnits("L"),
                              ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                              ppm: tUnits("ppm"),
                              g: tUnits("g"),
                              LPerKg: tUnits("LPerKg"),
                            },
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      );
                    })() : null}
                    : <code>{fmt("g", spargeResult.acidRequiredGrams, 0)}</code> {tUnits("g")}{" "}
                    {spargeResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{fmt("kg", spargeResult.acidRequiredKg, 2)}</code> {tUnits("kg")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                <li>
                  Final alkalinity{" "}
                  {surfaceMath ? (() => {
                    const ex = mathExplain["sparge.finalAlkalinity"];
                    const title = tMath(ex.titleKey);
                    return (
                      <MathHelpPopover
                        title={title}
                        body={buildWaterMathBody({
                          key: "sparge.finalAlkalinity",
                          tMath,
                          locale,
                          ctx: {
                            acidDerivation,
                          },
                          units: {
                            L: tUnits("L"),
                            ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                            ppm: tUnits("ppm"),
                            g: tUnits("g"),
                            LPerKg: tUnits("LPerKg"),
                          },
                        })}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  })() : null}
                  : <code>{fmt("ppm_as_CaCO3", spargeResult.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
                <li>
                  Sulfate added: <code>{fmt("ppm", spargeResult.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
                <li>
                  Chloride added: <code>{fmt("ppm", spargeResult.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
              </ul>
              {selectedSpargeProfile?.ph == null ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
                  Note: this profile has no pH. The calculation uses only the manually entered{" "}
                  <strong>Starting pH</strong>.
                </SizableText>
              ) : null}
            </View>
          ) : null}

          {spargeAcidificationMode === "manual" && spargeManualResult ? (
            <details className="brew-field-block brew-field-block--computed brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <strong>Result (manual acid amount mode)</strong>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Estimated from manual acid amount</SizableText>
              </summary>
              <ul>
                <li>
                  Estimated achieved pH: <code>{fmt("pH", spargeManualResult.achievedPh, 2)}</code>
                </li>
                {Number.isFinite(spargeManualResult.targetAmount) &&
                Number.isFinite(spargeManualResult.predictedAmount) ? (
                  <li>
                    Acid amount: <code>{fmt(strengthKind === "solid" ? "g" : "mL", spargeManualResult.targetAmount, 0)}</code>{" "}
                    {strengthKind === "solid" ? tUnits("g") : tUnits("mL")} (solver check:{" "}
                    <code>{fmt(strengthKind === "solid" ? "g" : "mL", spargeManualResult.predictedAmount, 0)}</code>)
                  </li>
                ) : null}
                <li>
                  Final alkalinity: <code>{fmt("ppm_as_CaCO3", spargeManualResult.predicted.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
                <li>
                  Sulfate added: <code>{fmt("ppm", spargeManualResult.predicted.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
                <li>
                  Chloride added: <code>{fmt("ppm", spargeManualResult.predicted.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
              </ul>
              {selectedSpargeProfile?.ph == null ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
                  Note: this profile has no pH. The calculation uses only the manually entered{" "}
                  <strong>Starting pH</strong>.
                </SizableText>
              ) : null}
            </details>
          ) : null}

          <View height={1} bg="var(--border)" my="$4" />

          <H3 mt={0}>{t("saltAdditionsManualV0")}</H3>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("saltAdditionsHelp")}
          </SizableText>

          <SaltAdditionsEditor
            rows={spargeSaltAdditions}
            onChange={setSpargeSaltAdditions}
            idPrefix="sparge"
            disabled={!canCall}
          />

          <XStack mt="$3" gap="$3" alignItems="center" flexWrap="wrap">
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSpargeSaltsInputs()} disabled={!canCall || savingSpargeSalts}>
              {savingSpargeSalts ? "Saving…" : "Save salts draft"}
            </Button>
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateSpargeSalts()} disabled={!canCall || spargeSaltsSubmitting || !selectedSpargeProfile}>
              {spargeSaltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
            </Button>
            {spargeSaltsStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{spargeSaltsStatus}</SizableText> : null}
            {spargeSaltsSaveStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{spargeSaltsSaveStatus}</SizableText> : null}
            {spargeSaltsCalcSaveStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{spargeSaltsCalcSaveStatus}</SizableText> : null}
          </XStack>

          {spargeSaltsError ? <ErrorBox mt="$3">{spargeSaltsError}</ErrorBox> : null}

          {spargeSaltsResult ? (
            <details className="brew-field-block brew-field-block--computed brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <strong>Resulting ions (after sparge salts only)</strong>
                {surfaceMath ? (() => {
                  const ex = mathExplain["sparge.ionsAfterSalts"];
                  const title = tMath(ex.titleKey);
                  return (
                    <MathHelpPopover
                      title={title}
                      body={buildWaterMathBody({
                        key: "sparge.ionsAfterSalts",
                        tMath,
                        locale,
                        ctx: {
                          saltDerivation,
                        },
                        units: {
                          L: tUnits("L"),
                          ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                          ppm: tUnits("ppm"),
                          g: tUnits("g"),
                          LPerKg: tUnits("LPerKg"),
                        },
                      })}
                      ariaLabel={tMath("fxLabel", { topic: title })}
                    />
                  );
                })() : null}
                <FieldBadge>Computed</FieldBadge>
              </summary>
              <div className="brew-table-wrap">
                <table className="brew-table">
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="left">After salts (ppm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Ca", spargeSaltsResult.resultingProfile.calcium],
                        ["Mg", spargeSaltsResult.resultingProfile.magnesium],
                        ["Na", spargeSaltsResult.resultingProfile.sodium],
                        ["SO4", spargeSaltsResult.resultingProfile.sulfate],
                        ["Cl", spargeSaltsResult.resultingProfile.chloride],
                        ["HCO3", spargeSaltsResult.resultingProfile.bicarbonate],
                      ] as const
                    ).map(([label, after]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td align="left">{fmt("ppm", after, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}

          {spargeSaltsResult && spargeResult ? (
            <View className="brew-field-block brew-field-block--computed brew-mt3">
              <View className="brew-field-block-header">
                <strong>Resulting ions (after sparge salts + acid, HCO3 derived from alkalinity)</strong>
                {surfaceMath ? (() => {
                  const ex = mathExplain["sparge.ionsAfterSaltsAndAcid"];
                  const title = tMath(ex.titleKey);
                  return (
                    <MathHelpPopover
                      title={title}
                      body={buildWaterMathBody({
                        key: "sparge.ionsAfterSaltsAndAcid",
                        tMath,
                        locale,
                        ctx: {
                          overallDerivation: spargeOverall?.derivation ?? null,
                        },
                        units: {
                          L: tUnits("L"),
                          ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                          ppm: tUnits("ppm"),
                          g: tUnits("g"),
                          LPerKg: tUnits("LPerKg"),
                        },
                      })}
                      ariaLabel={tMath("fxLabel", { topic: title })}
                    />
                  );
                })() : null}
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
                  Heuristic: Ca/Mg from salts reduce effective alkalinity, so salts can modestly change acid required.
                  {surfaceMath ? (() => {
                    const ex = mathExplain["sparge.alkalinityHeuristic"];
                    const title = tMath(ex.titleKey);
                    return (
                      <View as="span" display="inline" ml="$1">
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "sparge.alkalinityHeuristic",
                            tMath,
                            locale,
                            ctx: { acidDerivation },
                            units: {
                              L: tUnits("L"),
                              ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                              ppm: tUnits("ppm"),
                              g: tUnits("g"),
                              LPerKg: tUnits("LPerKg"),
                            },
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      </View>
                    );
                  })() : null}
                </SizableText>
              </View>
              <View className="brew-table-wrap">
                <table className="brew-table">
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="left">After salts + acid (ppm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const combined =
                        (spargeOverall?.result?.ionsPpm as any) ??
                        combineAfterSaltsAndAcid({
                          afterSalts: spargeSaltsResult.resultingProfile,
                          acidResult: spargeResult,
                        });
                      return ([
                        ["Ca", combined.calcium],
                        ["Mg", combined.magnesium],
                        ["Na", combined.sodium],
                        ["SO4", combined.sulfate],
                        ["Cl", combined.chloride],
                        ["HCO3", combined.bicarbonate],
                      ] as const).map(([label, v]) => (
                        <tr key={label}>
                          <td>{label}</td>
                          <td align="left">{fmt("ppm", v, 0)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </View>
            </View>
          ) : null}
        </View>

        {profilesError ? <ErrorBox>{profilesError}</ErrorBox> : null}
        {settingsError ? <ErrorBox>{settingsError}</ErrorBox> : null}
        {savingError ? <ErrorBox>{savingError}</ErrorBox> : null}
      </YStack>
    </>
  );
}

