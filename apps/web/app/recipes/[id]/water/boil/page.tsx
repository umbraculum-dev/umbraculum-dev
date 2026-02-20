"use client";

import { Link } from "../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ModeFieldset } from "../_components/ModeFieldset";
import { RecipeMetaLine } from "../_components/RecipeMetaLine";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "../_components/SaltAdditionsEditor";
import { MathHelpPopover } from "../../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../../_components/SurfaceMathToggleRow";
import { parseWaterProfilesResponse } from "@brewery/contracts";
import { H1 } from "tamagui";

import { apiFetch, type WaterProfile, type WaterProfilesResponse } from "../_lib/api";
import type { IonProfilePpm } from "../_lib/waterChem";
import { bicarbonatePpmToAlkalinityPpmCaCO3, combineAfterSaltsAndAcid, mixIonProfilesByVolume } from "../_lib/waterChem";
import { mathExplain } from "../_lib/mathExplain";
import { buildWaterMathBody } from "../_lib/mathBodies";
import { parseBoilComputeAndSaveResponse } from "@brewery/contracts";
import { formatWithHint } from "../../../../../src/i18n/format";
import {
  fetchRecipeWaterSettings,
  saveRecipeWaterSettings,
  type RecipeWaterSettingsResponse,
} from "../_lib/waterSettings";

type BoilAcidResult = {
  acidRequiredMl: number | null;
  acidRequiredTsp: number | null;
  acidRequiredGrams: number | null;
  acidRequiredKg: number | null;
  finalAlkalinityPpmCaCO3: number;
  sulfateAddedPpm: number;
  chlorideAddedPpm: number;
};

type BoilManualCalcResult = {
  achievedPh: number;
  predicted: BoilAcidResult;
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

type BoilOverallResultV0 = {
  calculatedAt: string;
  ionsPpm: IonProfilePpm;
  finalAlkalinityPpmCaCO3: number;
  ph: { kind: "target" | "estimated"; value: number };
  debug: {
    startingAlkalinityPpmCaCO3: number;
    startingAlkalinityAfterSaltsPpmCaCO3: number;
    saltsDeltaBicarbonatePpm: number;
    acidSulfateAddedPpm: number;
    acidChlorideAddedPpm: number;
    boilMode: "targetPh" | "manual";
  };
};

export default function BoilWaterPage() {
  const locale = useLocale();
  const tWater = useTranslations("recipes.water.common");
  const t = useTranslations("recipes.water.boil");
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

  // Adjustment selections (boil)
  const [sourceProfileId, setSourceProfileId] = useState<string>("");
  const [targetProfileId, setTargetProfileId] = useState<string>("");
  const [dilutionProfileId, setDilutionProfileId] = useState<string>("");
  const [tapVolumeLiters, setTapVolumeLiters] = useState(0);
  const [dilutionVolumeLiters, setDilutionVolumeLiters] = useState(0);

  const [adjustmentSaveStatus, setAdjustmentSaveStatus] = useState<string | null>(null);
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  // Acidification inputs
  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState<string>("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [strengthValue, setStrengthValue] = useState(10);
  const [acidificationMode, setAcidificationMode] = useState<"targetPh" | "manual">("targetPh");
  const [manualAcidAdded, setManualAcidAdded] = useState(0);

  const [boilError, setBoilError] = useState<string | null>(null);
  const [boilStatus, setBoilStatus] = useState<string | null>(null);
  const [boilSaveStatus, setBoilSaveStatus] = useState<string | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingInputs, setSavingInputs] = useState(false);
  const [acidResult, setAcidResult] = useState<BoilAcidResult | null>(null);
  const [manualResult, setManualResult] = useState<BoilManualCalcResult | null>(null);
  const [acidDerivation, setAcidDerivation] = useState<any | null>(null);

  // Salts
  const [saltsError, setSaltsError] = useState<string | null>(null);
  const [saltsStatus, setSaltsStatus] = useState<string | null>(null);
  const [saltsSaveStatus, setSaltsSaveStatus] = useState<string | null>(null);
  const [saltsCalcSaveStatus, setSaltsCalcSaveStatus] = useState<string | null>(null);
  const [saltsSubmitting, setSaltsSubmitting] = useState(false);
  const [savingSalts, setSavingSalts] = useState(false);
  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);
  const [saltsResult, setSaltsResult] = useState<SaltAdditionsResult | null>(null);
  const [saltDerivation, setSaltDerivation] = useState<any | null>(null);

  // Overall snapshot
  const [overallError, setOverallError] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [overallSaveStatus, setOverallSaveStatus] = useState<string | null>(null);
  const [savingOverall, setSavingOverall] = useState(false);
  const [overallResult, setOverallResult] = useState<BoilOverallResultV0 | null>(null);
  const [overallDerivation, setOverallDerivation] = useState<any | null>(null);
  const [formatHints, setFormatHints] = useState<Record<string, { decimals?: number }> | undefined>(undefined);

  const fmt = (unitKey: string, value: unknown, fallback: number) =>
    formatWithHint(locale, value, formatHints, unitKey, fallback);

  const [surfaceMath, setSurfaceMath] = useState(false);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("brewery:surfaceMath:boil");
      if (v === "1") setSurfaceMath(true);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("brewery:surfaceMath:boil", surfaceMath ? "1" : "0");
    } catch {
      // ignore
    }
  }, [surfaceMath]);

  const displayAlkalinityPpmCaCO3 = (v: number) => {
    // Small negatives can happen with very tiny acid amounts (or floating/solver tolerances).
    // Treat values near zero as zero for display, but preserve meaningful negative alkalinity.
    if (v < 0 && v > -1) return 0;
    return v;
  };

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

      setSourceProfileId(s.boilSourceWaterProfileId ?? "");
      setTargetProfileId(s.boilTargetWaterProfileId ?? "");
      setDilutionProfileId(s.boilDilutionWaterProfileId ?? "");
      setTapVolumeLiters(s.boilTapWaterVolumeLiters ?? 0);
      setDilutionVolumeLiters(s.boilDilutionWaterVolumeLiters ?? 0);

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

      const savedKind = ((s.boilStrengthKind as any) ?? "percent") as "percent" | "normality" | "molarity" | "solid";
      setStrengthKind(savedKind);
      setStrengthValue((s.boilStrengthValue as any) ?? 10);
      setAcidificationMode(s.boilAcidificationMode === "manual" ? "manual" : "targetPh");
      setManualAcidAdded(
        savedKind === "solid" ? (s.boilManualAcidAddedGrams ?? 0) : (s.boilManualAcidAddedMl ?? 0),
      );

      if (Array.isArray(s.boilSaltAdditionsJson)) setSaltAdditions(s.boilSaltAdditionsJson as any);
      if (s.boilSaltsLastResultJson && typeof s.boilSaltsLastResultJson === "object") {
        const v: any = s.boilSaltsLastResultJson as any;
        if (v?.result && typeof v.result === "object") {
          setSaltsResult(v.result as SaltAdditionsResult);
          if (typeof v.calculatedAt === "string") {
            setSaltsStatus(`Last calculated: ${new Date(v.calculatedAt).toLocaleString()}`);
          }
        }
      }

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
  const dilutionProfiles = useMemo(() => allProfiles.filter((p) => p.type === "dilution"), [allProfiles]);

  const selectedSource = useMemo(() => waterProfiles.find((p) => p.id === sourceProfileId) ?? null, [sourceProfileId, waterProfiles]);
  const selectedTarget = useMemo(() => waterProfiles.find((p) => p.id === targetProfileId) ?? null, [targetProfileId, waterProfiles]);
  const selectedDilution = useMemo(() => dilutionProfiles.find((p) => p.id === dilutionProfileId) ?? null, [dilutionProfileId, dilutionProfiles]);

  const mixedSourceProfile = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    const total = tap + dil;
    if (!(total > 0)) return null;

    // Intuitive rule: you can’t “dilute nothing”.
    // - Source must be present and have volume > 0.
    // - Dilution is optional, but if dilution volume > 0, a dilution profile is required.
    if (!(tap > 0) || !selectedSource) return null;
    if (dil > 0 && !selectedDilution) return null;

    // Source-only (no dilution volume)
    if (!(dil > 0)) {
      return {
        name: `Source (${selectedSource.name})`,
        totalVolumeLiters: tap,
        calcium: selectedSource.calcium,
        magnesium: selectedSource.magnesium,
        sodium: selectedSource.sodium,
        sulfate: selectedSource.sulfate,
        chloride: selectedSource.chloride,
        bicarbonate: selectedSource.bicarbonate,
      };
    }

    if (!selectedSource || !selectedDilution) return null;
    const mixed = mixIonProfilesByVolume(
      {
        calcium: selectedSource.calcium,
        magnesium: selectedSource.magnesium,
        sodium: selectedSource.sodium,
        sulfate: selectedSource.sulfate,
        chloride: selectedSource.chloride,
        bicarbonate: selectedSource.bicarbonate,
      },
      tap,
      {
        calcium: selectedDilution.calcium,
        magnesium: selectedDilution.magnesium,
        sodium: selectedDilution.sodium,
        sulfate: selectedDilution.sulfate,
        chloride: selectedDilution.chloride,
        bicarbonate: selectedDilution.bicarbonate,
      },
      dil,
    );
    if (!mixed) return null;
    return {
      name: `Mixed (${selectedSource.name} + ${selectedDilution.name})`,
      totalVolumeLiters: total,
      ...mixed,
    };
  }, [selectedSource, selectedDilution, tapVolumeLiters, dilutionVolumeLiters]);

  const derivedBoilStartingAlkPpmCaCO3 = useMemo(() => {
    if (!mixedSourceProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(mixedSourceProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [mixedSourceProfile]);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedBoilStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedBoilStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedBoilStartingAlkPpmCaCO3, startingAlkTouched]);

  const derivedBoilWaterVolumeLiters = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    return tap + dil;
  }, [tapVolumeLiters, dilutionVolumeLiters]);

  const saveSettings = async (patch: Record<string, unknown>) => {
    if (!canCall) return;
    await saveRecipeWaterSettings(recipeId, patch);
  };

  const onSaveAdjustment = async () => {
    setSavingError(null);
    setAdjustmentSaveStatus(null);
    setSavingAdjustment(true);
    try {
      await saveSettings({
        boilSourceWaterProfileId: sourceProfileId || null,
        boilTargetWaterProfileId: targetProfileId || null,
        boilDilutionWaterProfileId: dilutionProfileId || null,
        boilTapWaterVolumeLiters: tapVolumeLiters,
        boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
      });
      setAdjustmentSaveStatus("Saved profile and volumes.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingAdjustment(false);
    }
  };

  const onSaveInputs = async () => {
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

  const onCalcSalts = async () => {
    if (!canCall) return;
    if (!mixedSourceProfile) {
      const tap = Math.max(0, Number(tapVolumeLiters) || 0);
      const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
      if (!(tap > 0)) setSaltsError("Source volume must be > 0.");
      else if (!selectedSource) setSaltsError("Select a Source water profile.");
      else if (dil > 0 && !selectedDilution)
        setSaltsError("Select a Dilution water profile (or set Dilution volume to 0).");
      else setSaltsError("Compute mixed water first (check Water adjustment inputs).");
      return;
    }
    setSaltsError(null);
    setSaltsStatus(null);
    setSaltsCalcSaveStatus(null);
    setSaltsResult(null);
    setSaltDerivation(null);
    setSaltsSubmitting(true);
    try {
      const res = await apiFetch("/api/water-calc/salt-additions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volumeLiters: mixedSourceProfile.totalVolumeLiters,
          baseProfile: {
            calcium: mixedSourceProfile.calcium,
            magnesium: mixedSourceProfile.magnesium,
            sodium: mixedSourceProfile.sodium,
            sulfate: mixedSourceProfile.sulfate,
            chloride: mixedSourceProfile.chloride,
            bicarbonate: mixedSourceProfile.bicarbonate,
          },
          additions: saltAdditions,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const result = (res.data as any).result as SaltAdditionsResult;
      setSaltsResult(result);
      setSaltDerivation((res.data as any).derivation ?? null);

      await saveSettings({
        boilSaltAdditionsJson: saltAdditions,
        boilSaltsLastResultJson: { calculatedAt: new Date().toISOString(), result },
      });
      setSaltsStatus("Calculated.");
      setSaltsCalcSaveStatus("Calculated & saved salts snapshot.");
    } catch (err) {
      setSaltsError(String(err));
    } finally {
      setSaltsSubmitting(false);
    }
  };

  const onSaveSaltAdditions = async () => {
    setSavingError(null);
    setSaltsSaveStatus(null);
    setSavingSalts(true);
    try {
      await saveSettings({ boilSaltAdditionsJson: saltAdditions });
      setSaltsSaveStatus("Saved salts draft.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSalts(false);
    }
  };

  const hasNonZeroSaltAdditions = (rows: SaltAdditionRow[]) =>
    rows.some((r) => typeof r.grams === "number" && Number.isFinite(r.grams) && r.grams > 0);

  const ensureZeroSaltsSnapshotIfMissing = async () => {
    if (!canCall) return;
    if (saltsResult) return;
    if (hasNonZeroSaltAdditions(saltAdditions)) {
      throw new Error(
        "You entered salts but haven’t calculated them. Click “Calculate & save salts snapshot” first so overall/acidification uses the correct ions.",
      );
    }
    if (!mixedSourceProfile) {
      throw new Error("Set Source profile + Source volume first (Dilution optional).");
    }

    const base: IonProfilePpm = {
      calcium: mixedSourceProfile.calcium,
      magnesium: mixedSourceProfile.magnesium,
      sodium: mixedSourceProfile.sodium,
      sulfate: mixedSourceProfile.sulfate,
      chloride: mixedSourceProfile.chloride,
      bicarbonate: mixedSourceProfile.bicarbonate,
    };

    const result: SaltAdditionsResult = {
      baseProfile: base,
      resultingProfile: base,
      deltasPpm: { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
      breakdown: [],
    };

    const nowIso = new Date().toISOString();
    setSaltsResult(result);
    setSaltDerivation(null);
    await saveSettings({
      boilSaltAdditionsJson: saltAdditions,
      boilSaltsLastResultJson: { calculatedAt: nowIso, result },
    });
  };

  const boilCalciumPpm = useMemo(() => {
    const v = saltsResult?.resultingProfile?.calcium ?? mixedSourceProfile?.calcium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [saltsResult, mixedSourceProfile]);
  const boilMagnesiumPpm = useMemo(() => {
    const v = saltsResult?.resultingProfile?.magnesium ?? mixedSourceProfile?.magnesium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [saltsResult, mixedSourceProfile]);

  const computeAndSaveBoilSnapshots = async () => {
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

    const res = await apiFetch(`/api/recipes/${recipeId}/water-settings/boil/compute-and-save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(JSON.stringify(res.data));
    return parseBoilComputeAndSaveResponse(res.data);
  };

  const onSubmitAcid = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await ensureZeroSaltsSnapshotIfMissing();
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
      setSaltsResult(computed.salts.result as any);
      setSaltDerivation(computed.salts.derivation as any);
      setAcidDerivation(computed.acid.derivation as any);
      setOverallDerivation(computed.overall.derivation as any);
      setOverallResult(computed.overall.result as any);
      setOverallStatus("Calculated.");

      if (computed.acid.kind === "boil_acidification_manual") {
        setManualResult(computed.acid.result as any);
        setAcidResult((computed.acid.result as any).predicted ?? null);
        setBoilStatus("Estimated (manual mode).");
        setCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        setManualResult(null);
        setAcidResult(computed.acid.result as any);
        setBoilStatus("Calculated.");
        setCalcSaveStatus("Calculated & saved snapshot.");
      }
    } catch (err) {
      setBoilError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const computeOverallBoil = async (): Promise<BoilOverallResultV0> => {
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
    if (strengthKind !== "solid") payload.strengthValue = strengthValue;
    if (acidificationMode === "manual") {
      Object.assign(
        payload,
        strengthKind === "solid" ? { acidAddedGrams: manualAcidAdded } : { acidAddedMl: manualAcidAdded },
      );
    }

    const res = await apiFetch("/api/water-calc/boil-overall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(JSON.stringify(res.data));
    const body = res.data as any;
    setOverallDerivation(body.derivation ?? null);
    return body.result as BoilOverallResultV0;
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
        setSaltsResult(computed.salts.result as any);
        setSaltDerivation(computed.salts.derivation as any);
        setAcidDerivation(computed.acid.derivation as any);
        setOverallDerivation(computed.overall.derivation as any);
        setOverallResult(computed.overall.result as any);
        setOverallStatus("Calculated.");
        setOverallSaveStatus("Calculated & saved overall snapshot.");
      } else {
        await ensureZeroSaltsSnapshotIfMissing();
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

  const selectedProfileInfo = (p: WaterProfile | null, label: string) =>
    p ? (
      <span className="brew-muted">
        {label}: <code>{p.name}</code>
      </span>
    ) : (
      <span className="brew-muted">
        {label}: <span className="brew-muted">—</span>
      </span>
    );

  return (
    <>
      <H1 mb="$2">{t("title")}</H1>
      <RecipeMetaLine recipeId={recipeId} enabled={authed} />
      <SurfaceMathToggleRow
        left={
          <p style={{ margin: 0 }}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link>
          </p>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        style={{ marginTop: 0, marginBottom: 8 }}
      />

      {authChecked && !canCall ? (
        <p role="alert" className="brew-error-box">
          {tWater.rich("notAuthenticated", {
            signIn: (chunks) => <Link href={`/login?next=/${locale}/recipes/${recipeId}/water/boil`}>{chunks}</Link>,
          })}
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
        <section className="brew-panel" aria-labelledby="boil-adjustment-heading">
          <h2 id="boil-adjustment-heading" style={{ marginTop: 0 }}>
            {t("adjustmentHeading")}
          </h2>
          <p className="brew-muted" style={{ marginTop: 0 }}>
            {t("adjustmentHelp")}
          </p>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div>
              <label htmlFor="boil-source-profile" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                Source water profile
              </label>
              <select
                id="boil-source-profile"
                value={sourceProfileId}
                onChange={(e) => setSourceProfileId(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="">(none)</option>
                {waterProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.scope}/{p.verificationStatus}]
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 6 }}>{selectedProfileInfo(selectedSource, "Selected")}</div>
            </div>

            <div>
              <label htmlFor="boil-target-profile" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                Target water profile
              </label>
              <select
                id="boil-target-profile"
                value={targetProfileId}
                onChange={(e) => setTargetProfileId(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="">(none)</option>
                {waterProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.scope}/{p.verificationStatus}]
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 6 }}>{selectedProfileInfo(selectedTarget, "Selected")}</div>
            </div>

            <div>
              <label htmlFor="boil-dilution-profile" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                Dilution water profile
              </label>
              <select
                id="boil-dilution-profile"
                value={dilutionProfileId}
                onChange={(e) => setDilutionProfileId(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="">(none)</option>
                {dilutionProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.scope}/{p.verificationStatus}]
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 6 }}>{selectedProfileInfo(selectedDilution, "Selected")}</div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label htmlFor="boil-source-volume" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                {t("sourceVolumeLabel", { unit: tUnits("L") })}
              </label>
              <input
                id="boil-source-volume"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={tapVolumeLiters}
                onChange={(e) => setTapVolumeLiters(Number(e.target.value))}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label htmlFor="boil-dilution-volume" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                {t("dilutionVolumeLabel", { unit: tUnits("L") })}
              </label>
              <input
                id="boil-dilution-volume"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={dilutionVolumeLiters}
                onChange={(e) => setDilutionVolumeLiters(Number(e.target.value))}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => void refreshProfiles()} disabled={!canCall || loadingProfiles}>
              {loadingProfiles ? "Reloading…" : "Reload water profiles"}
            </button>
            <button type="button" onClick={() => void onSaveAdjustment()} disabled={!canCall || savingAdjustment}>
              {savingAdjustment ? "Saving…" : "Save profile and volumes"}
            </button>
            {adjustmentSaveStatus ? (
              <span className="brew-muted" role="status" aria-live="polite">
                {adjustmentSaveStatus}
              </span>
            ) : null}
          </div>

          {mixedSourceProfile ? (
            <details className="brew-field-block brew-field-block--readonly" style={{ marginTop: 12 }}>
              <summary className="brew-field-block-header" style={{ cursor: "pointer" }}>
                <strong>Mixed water ions</strong>
                <span className="brew-field-badge">Read-only</span>
                <span className="brew-muted">Computed from profiles + volumes</span>
              </summary>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="right">Mixed (ppm)</th>
                      <th align="right">Target (ppm)</th>
                      <th align="right">Δ (mixed - target)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Ca", mixedSourceProfile.calcium, selectedTarget?.calcium ?? null],
                        ["Mg", mixedSourceProfile.magnesium, selectedTarget?.magnesium ?? null],
                        ["Na", mixedSourceProfile.sodium, selectedTarget?.sodium ?? null],
                        ["SO4", mixedSourceProfile.sulfate, selectedTarget?.sulfate ?? null],
                        ["Cl", mixedSourceProfile.chloride, selectedTarget?.chloride ?? null],
                        ["HCO3", mixedSourceProfile.bicarbonate, selectedTarget?.bicarbonate ?? null],
                      ] as const
                    ).map(([label, mixed, target]) => {
                      const delta = target === null ? null : mixed - target;
                      return (
                        <tr key={label}>
                          <td>{label}</td>
                          <td align="right">{fmt("ppm", mixed, 0)}</td>
                          <td align="right">{target === null ? "—" : fmt("ppm", target, 0)}</td>
                          <td align="right">{delta === null ? "—" : fmt("ppm", delta, 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          ) : (
            <p className="brew-muted" style={{ marginTop: 12, marginBottom: 0 }}>
              {t("saltAdditionsHelp")}
            </p>
          )}

          {profilesError ? (
            <pre className="brew-error-box" role="alert" style={{ marginTop: 12 }}>
              {profilesError}
            </pre>
          ) : null}
        </section>

        <section className="brew-panel" aria-labelledby="boil-salts-heading">
          <h2 id="boil-salts-heading" style={{ marginTop: 0 }}>
            {t("saltAdditionsHeading")}
          </h2>
          <p className="brew-muted" style={{ marginTop: 0 }}>
            {t("saltAdditionsBaseHelp")}
          </p>

          <SaltAdditionsEditor rows={saltAdditions} onChange={setSaltAdditions} idPrefix="boil" disabled={!canCall} />

          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => void onSaveSaltAdditions()} disabled={!canCall || savingSalts}>
              {savingSalts ? "Saving…" : "Save salts draft"}
            </button>
            <button type="button" onClick={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
              {saltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
            </button>
            {saltsStatus ? (
              <span className="brew-muted" role="status" aria-live="polite">
                {saltsStatus}
              </span>
            ) : null}
            {saltsSaveStatus ? (
              <span className="brew-muted" role="status" aria-live="polite">
                {saltsSaveStatus}
              </span>
            ) : null}
            {saltsCalcSaveStatus ? (
              <span className="brew-muted" role="status" aria-live="polite">
                {saltsCalcSaveStatus}
              </span>
            ) : null}
          </div>

          {saltsError ? (
            <pre className="brew-error-box" role="alert" style={{ marginTop: 12 }}>
              {saltsError}
            </pre>
          ) : null}

          {saltsResult ? (
            <details className="brew-field-block brew-field-block--computed" style={{ marginTop: 12 }}>
              <summary className="brew-field-block-header" style={{ cursor: "pointer" }}>
                <strong>Resulting ions (after salts only)</strong>
                {surfaceMath ? (() => {
                  const ex = mathExplain["boil.ionsAfterSalts"];
                  const title = tMath(ex.titleKey);
                  return (
                    <MathHelpPopover
                      title={title}
                      body={buildWaterMathBody({
                        key: "boil.ionsAfterSalts",
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
                <span className="brew-field-badge">Computed</span>
              </summary>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="left">After salts (ppm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Ca", saltsResult.resultingProfile.calcium],
                        ["Mg", saltsResult.resultingProfile.magnesium],
                        ["Na", saltsResult.resultingProfile.sodium],
                        ["SO4", saltsResult.resultingProfile.sulfate],
                        ["Cl", saltsResult.resultingProfile.chloride],
                        ["HCO3", saltsResult.resultingProfile.bicarbonate],
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
        </section>

        <section className="brew-panel" aria-labelledby="boil-acid-heading">
          <h2 id="boil-acid-heading" style={{ marginTop: 0 }}>
            {t("acidificationHeading")}
          </h2>

          <form onSubmit={onSubmitAcid} aria-describedby={boilError ? "boil-error" : undefined}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <ModeFieldset
                  legend="Mode"
                  name="boil-mode"
                  value={acidificationMode}
                  onChange={(v) => setAcidificationMode(v)}
                  options={[
                    { value: "targetPh", label: "Target pH (solve acid required)" },
                    { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
                  ]}
                />
              </div>

              <div>
                <label htmlFor="boil-starting-alk" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                  {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
                </label>
                <input
                  id="boil-starting-alk"
                  type="number"
                  inputMode="decimal"
                  value={startingAlk}
                  onChange={(e) => {
                    setStartingAlkTouched(true);
                    const n = Number(e.target.value);
                    setStartingAlk(Number.isFinite(n) ? n : 0);
                  }}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              <div>
                <label htmlFor="boil-starting-ph" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                  Starting pH
                </label>
                <input
                  id="boil-starting-ph"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={startingPh}
                  onChange={(e) => setStartingPh(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              {acidificationMode === "targetPh" ? (
                <div>
                  <label htmlFor="boil-target-ph" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                    Target pH
                  </label>
                  <input
                    id="boil-target-ph"
                    type="number"
                    inputMode="decimal"
                    step={0.01}
                    value={targetPh}
                    onChange={(e) => setTargetPh(Number(e.target.value))}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="boil-acid-type" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                  Acid type
                </label>
                <select
                  id="boil-acid-type"
                  value={acidType}
                  onChange={(e) => setAcidType(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="phosphoric">Phosphoric</option>
                  <option value="lactic">Lactic</option>
                  <option value="hydrochloric">Hydrochloric</option>
                  <option value="sulfuric">Sulfuric</option>
                  <option value="acetic">Acetic</option>
                  <option value="citric">Citric (solid)</option>
                  <option value="tartaric">Tartaric (solid)</option>
                  <option value="malic">Malic (solid)</option>
                </select>
              </div>

              <div>
                <label htmlFor="boil-strength-kind" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                  Strength kind
                </label>
                <select
                  id="boil-strength-kind"
                  value={strengthKind}
                  onChange={(e) => setStrengthKind(e.target.value as any)}
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="percent">Percent (%)</option>
                  <option value="normality">Normality (N)</option>
                  <option value="molarity">Molarity (M)</option>
                  <option value="solid">Solid (pure)</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="boil-strength-value" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                  Strength value {strengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
                </label>
                <input
                  id="boil-strength-value"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={strengthValue}
                  onChange={(e) => setStrengthValue(Number(e.target.value))}
                  disabled={strengthKind === "solid"}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              {acidificationMode === "manual" ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="boil-manual-acid-added" className="brew-muted" style={{ display: "block", fontSize: 12 }}>
                    Acid added ({strengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                  </label>
                  <input
                    id="boil-manual-acid-added"
                    type="number"
                    inputMode="decimal"
                    step={0.1}
                    value={manualAcidAdded}
                    onChange={(e) => setManualAcidAdded(Number(e.target.value))}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button type="submit" disabled={!canCall || submitting}>
                {submitting
                  ? "Working…"
                  : acidificationMode === "manual"
                    ? "Estimate & save snapshot"
                    : "Calculate & save snapshot"}
              </button>
              <button type="button" onClick={() => void onSaveInputs()} disabled={!canCall || savingInputs}>
                {savingInputs ? "Saving…" : "Save boil draft"}
              </button>
              {boilStatus ? <span className="brew-muted" role="status" aria-live="polite">{boilStatus}</span> : null}
              {boilSaveStatus ? <span className="brew-muted" role="status" aria-live="polite">{boilSaveStatus}</span> : null}
              {calcSaveStatus ? <span className="brew-muted" role="status" aria-live="polite">{calcSaveStatus}</span> : null}
            </div>

            {boilError ? (
              <pre id="boil-error" className="brew-error-box" role="alert" style={{ marginTop: 12 }}>
                {boilError}
              </pre>
            ) : null}
          </form>

          {acidificationMode === "targetPh" && acidResult ? (
            <div className="brew-field-block brew-field-block--computed" style={{ marginTop: 12 }}>
              <div className="brew-field-block-header">
                <strong>Result</strong>
                <span className="brew-field-badge">Computed</span>
                <span className="brew-muted">From current inputs</span>
              </div>
              <ul>
                {acidResult.acidRequiredMl !== null ? (
                  <li>
                    Acid required: <code>{fmt("mL", acidResult.acidRequiredMl, 0)}</code> {tUnits("mL")}{" "}
                    {acidResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{fmt("mL", acidResult.acidRequiredTsp, 0)}</code> {tUnits("tsp")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                {acidResult.acidRequiredGrams !== null ? (
                  <li>
                    Acid required: <code>{fmt("g", acidResult.acidRequiredGrams, 0)}</code> {tUnits("g")}{" "}
                    {acidResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{fmt("kg", acidResult.acidRequiredKg, 2)}</code> {tUnits("kg")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                <li>
                  Final alkalinity:{" "}
                  <code>{fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(acidResult.finalAlkalinityPpmCaCO3), 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
              </ul>
            </div>
          ) : null}

          {acidificationMode === "manual" && manualResult ? (
            <details className="brew-field-block brew-field-block--computed" style={{ marginTop: 12 }}>
              <summary className="brew-field-block-header" style={{ cursor: "pointer" }}>
                <strong>Result (manual acid amount mode)</strong>
                <span className="brew-field-badge">Computed</span>
                <span className="brew-muted">Estimated from manual acid amount</span>
              </summary>
              <ul>
                <li>
                  Estimated achieved pH: <code>{fmt("pH", manualResult.achievedPh, 2)}</code>
                </li>
                <li>
                  Final alkalinity:{" "}
                  <code>{fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(manualResult.predicted.finalAlkalinityPpmCaCO3), 0)}</code>{" "}
                  {tUnits("ppmAsCaCO3")}
                </li>
              </ul>
            </details>
          ) : null}

          <hr style={{ margin: "16px 0" }} />

          <h3 id="overall-boil-water-result" style={{ marginTop: 0 }}>
            {t("overallResultHeading")}
          </h3>
          <p className="brew-muted" style={{ marginTop: 0 }}>
            Click <strong>Preview overall</strong> to preview, or <strong>Calculate &amp; save overall snapshot</strong> to persist a snapshot.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => void onCalculateOverall(false)} disabled={!canCall || savingOverall}>
              {savingOverall ? "Calculating…" : "Preview overall"}
            </button>
            <button type="button" onClick={() => void onCalculateOverall(true)} disabled={!canCall || savingOverall}>
              {savingOverall ? "Calculating…" : "Calculate & save overall snapshot"}
            </button>
            {overallStatus ? <span className="brew-muted">{overallStatus}</span> : null}
            {overallSaveStatus ? <span className="brew-muted">{overallSaveStatus}</span> : null}
          </div>
          {overallError ? (
            <pre className="brew-error-box" role="alert" style={{ marginTop: 12 }}>
              {overallError}
            </pre>
          ) : null}

          {overallResult ? (
            <div className="brew-field-block brew-field-block--computed" style={{ marginTop: 12 }}>
              <div className="brew-field-block-header">
                <strong>Overall boil snapshot</strong>
                {surfaceMath ? (() => {
                  const ex = mathExplain["boil.overallSnapshot"];
                  const title = tMath(ex.titleKey);
                  return (
                    <MathHelpPopover
                      title={title}
                      body={buildWaterMathBody({
                        key: "boil.overallSnapshot",
                        tMath,
                        locale,
                        ctx: {
                          overallDerivation,
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
                <span className="brew-field-badge">Computed</span>
                <span className="brew-muted">Uses latest inputs; persist a snapshot to debug</span>
              </div>
              <ul>
                <li>
                  pH: {overallResult.ph.kind} <code>{fmt("pH", overallResult.ph.value, 2)}</code>
                </li>
                <li>
                  Final alkalinity:{" "}
                  <code>{fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(overallResult.finalAlkalinityPpmCaCO3), 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
              </ul>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="left">Overall (ppm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Ca", overallResult.ionsPpm.calcium],
                        ["Mg", overallResult.ionsPpm.magnesium],
                        ["Na", overallResult.ionsPpm.sodium],
                        ["SO4", overallResult.ionsPpm.sulfate],
                        ["Cl", overallResult.ionsPpm.chloride],
                        ["HCO3", overallResult.ionsPpm.bicarbonate],
                      ] as const
                    ).map(([label, v]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td align="left">{fmt("ppm", v, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>

        {settingsError ? <pre className="brew-error-box" role="alert">{settingsError}</pre> : null}
        {savingError ? <pre className="brew-error-box" role="alert">{savingError}</pre> : null}
      </div>
    </>
  );
}

