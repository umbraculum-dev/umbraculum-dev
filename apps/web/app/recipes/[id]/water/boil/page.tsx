"use client";

import { Link } from "../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import { MathHelpPopover } from "../../../../_components/MathHelpPopover";
import { BrewSelect } from "../../../../_components/BrewSelect";
import { ErrorBox, FieldBadge, MessageBox, RecipeEditFieldLabel } from "../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../_components/SurfaceMathToggleRow";
import { ModeFieldset } from "@umbraculum/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { Button, H1, H2, H3, Input, SizableText, View, XStack, YStack } from "tamagui";

import {
  calcBoilOverall,
  calcSaltAdditions,
  computeAndSaveBoil,
  getRecipe,
  listWaterProfiles,
} from "@umbraculum/api-client/brewery";
import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { fetchAuthMe } from "../../../../_lib/fetchAuthMe";
import type { WaterProfile, WaterProfilesResponse } from "../_lib/api";
import type { IonProfilePpm } from "../_lib/waterChem";
import { bicarbonatePpmToAlkalinityPpmCaCO3, mixIonProfilesByVolume } from "../_lib/waterChem";
import { mathExplain } from "../_lib/mathExplain";
import { buildWaterMathBody } from "../_lib/mathBodies";
import type { WaterCalcDerivation } from "@umbraculum/contracts";
import { asRecord } from "../../../../_lib/typeGuards";
import { formatWithHint } from "../../../../../src/i18n/format";
import { fetchRecipeWaterSettings, saveRecipeWaterSettings } from "../_lib/waterSettings";

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

  const loadRecipeMeta = useCallback(async (id: string) => {
    try {
      const data = await getRecipe(webBreweryApiClient(), id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
  }, []);

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
  const [_acidDerivation, setAcidDerivation] = useState<WaterCalcDerivation | null>(null);

  // Salts
  const [saltsError, setSaltsError] = useState<string | null>(null);
  const [saltsStatus, setSaltsStatus] = useState<string | null>(null);
  const [saltsSaveStatus, setSaltsSaveStatus] = useState<string | null>(null);
  const [saltsCalcSaveStatus, setSaltsCalcSaveStatus] = useState<string | null>(null);
  const [saltsSubmitting, setSaltsSubmitting] = useState(false);
  const [savingSalts, setSavingSalts] = useState(false);
  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);
  const [saltsResult, setSaltsResult] = useState<SaltAdditionsResult | null>(null);
  const [saltDerivation, setSaltDerivation] = useState<WaterCalcDerivation | null>(null);

  // Overall snapshot
  const [overallError, setOverallError] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [overallSaveStatus, setOverallSaveStatus] = useState<string | null>(null);
  const [savingOverall, setSavingOverall] = useState(false);
  const [overallResult, setOverallResult] = useState<BoilOverallResultV0 | null>(null);
  const [overallDerivation, setOverallDerivation] = useState<WaterCalcDerivation | null>(null);
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
      const res = await fetchAuthMe();
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
      const profilesRes = await listWaterProfiles(webBreweryApiClient());
      setProfiles(profilesRes);
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
      const data = (await fetchRecipeWaterSettings(recipeId));
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

      const rawStrengthKind = s.boilStrengthKind;
      const savedKind: "percent" | "normality" | "molarity" | "solid" =
        rawStrengthKind === "percent" ||
        rawStrengthKind === "normality" ||
        rawStrengthKind === "molarity" ||
        rawStrengthKind === "solid"
          ? rawStrengthKind
          : "percent";
      setStrengthKind(savedKind);
      setStrengthValue(s.boilStrengthValue ?? 10);
      setAcidificationMode(s.boilAcidificationMode === "manual" ? "manual" : "targetPh");
      setManualAcidAdded(
        savedKind === "solid" ? (s.boilManualAcidAddedGrams ?? 0) : (s.boilManualAcidAddedMl ?? 0),
      );

      if (Array.isArray(s.boilSaltAdditionsJson)) {
        setSaltAdditions(s.boilSaltAdditionsJson as SaltAdditionRow[]);
      }
      const lastResult = asRecord(s.boilSaltsLastResultJson);
      if (lastResult) {
        const innerResult = asRecord(lastResult['result']);
        if (innerResult) {
          setSaltsResult(innerResult as unknown as SaltAdditionsResult);
          if (typeof lastResult['calculatedAt'] === "string") {
            setSaltsStatus(`Last calculated: ${new Date(lastResult['calculatedAt']).toLocaleString()}`);
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
     
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    void loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, recipeId]);

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const wsp = profiles?.workspace ?? [];
    return [...sys, ...pub, ...wsp];
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
      const data = await calcSaltAdditions(webBreweryApiClient(), {
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
      });
      const result = data.result as SaltAdditionsResult;
      setSaltsResult(result);
      setSaltDerivation(data.derivation as WaterCalcDerivation);

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

  const _boilCalciumPpm = useMemo(() => {
    const v = saltsResult?.resultingProfile?.calcium ?? mixedSourceProfile?.calcium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [saltsResult, mixedSourceProfile]);
  const _boilMagnesiumPpm = useMemo(() => {
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

    return computeAndSaveBoil(webBreweryApiClient(), recipeId, payload);
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
      setSaltsResult(computed.salts.result as unknown as SaltAdditionsResult);
      setSaltDerivation(computed.salts.derivation);
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
    if (strengthKind !== "solid") payload['strengthValue'] = strengthValue;
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

  const onCalculateOverall = async (saveAlso: boolean) => {
    setOverallError(null);
    setOverallStatus(null);
    setOverallSaveStatus(null);
    setSavingOverall(true);
    try {
      if (saveAlso) {
        const computed = await computeAndSaveBoilSnapshots();
        setFormatHints(computed.formatHints as Record<string, { decimals?: number }> | undefined);
        setSaltsResult(computed.salts.result as unknown as SaltAdditionsResult);
        setSaltDerivation(computed.salts.derivation);
        setAcidDerivation(computed.acid.derivation);
        setOverallDerivation(computed.overall.derivation);
        setOverallResult(computed.overall.result as unknown as BoilOverallResultV0);
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
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {label}: <code>{p.name}</code>
      </SizableText>
    ) : (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {label}: <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">—</SizableText>
      </SizableText>
    );

  return (
    <>
      <H1 mb="$2">{t("title")}</H1>
      <RecipeMetaLine recipeId={recipeId} enabled={authed} loadRecipeMeta={loadRecipeMeta} />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authChecked && !canCall ? (
        <ErrorBox>
          {tWater.rich("notAuthenticated", {
            signIn: (chunks) => <Link href={`/login?next=/${locale}/recipes/${recipeId}/water/boil`}>{chunks}</Link>,
          })}
        </ErrorBox>
      ) : null}

      <YStack gap="$4">
        <View className="brew-panel" aria-labelledby="boil-adjustment-heading">
          <H2 id="boil-adjustment-heading" mt={0}>
            {t("adjustmentHeading")}
          </H2>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("adjustmentHelp")}
          </SizableText>

          <XStack gap="$3" flexWrap="wrap" ai="flex-end">
            <View flex={1} minWidth={180}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="boil-source-profile">
                Source water profile
              </RecipeEditFieldLabel>
              <BrewSelect
                id="boil-source-profile"
                value={sourceProfileId}
                onValueChange={setSourceProfileId}
                options={[
                  { value: "", label: "(none)" },
                  ...waterProfiles.map((p) => ({
                    value: p.id,
                    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                  })),
                ]}
                width="full"
              />
              <View mt="$1.5">{selectedProfileInfo(selectedSource, "Selected")}</View>
              </YStack>
            </View>

            <View flex={1} minWidth={180}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="boil-target-profile">
                Target water profile
              </RecipeEditFieldLabel>
              <BrewSelect
                id="boil-target-profile"
                value={targetProfileId}
                onValueChange={setTargetProfileId}
                options={[
                  { value: "", label: "(none)" },
                  ...waterProfiles.map((p) => ({
                    value: p.id,
                    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                  })),
                ]}
                width="full"
              />
              <View mt="$1.5">{selectedProfileInfo(selectedTarget, "Selected")}</View>
              </YStack>
            </View>

            <View flex={1} minWidth={180}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="boil-dilution-profile">
                Dilution water profile
              </RecipeEditFieldLabel>
              <BrewSelect
                id="boil-dilution-profile"
                value={dilutionProfileId}
                onValueChange={setDilutionProfileId}
                options={[
                  { value: "", label: "(none)" },
                  ...dilutionProfiles.map((p) => ({
                    value: p.id,
                    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                  })),
                ]}
                width="full"
              />
              <View mt="$1.5">{selectedProfileInfo(selectedDilution, "Selected")}</View>
              </YStack>
            </View>
          </XStack>

          <XStack gap="$3" flexWrap="wrap" mt="$3" ai="flex-end">
            <View flex={1} minWidth={200}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="boil-source-volume">
                {t("sourceVolumeLabel", { unit: tUnits("L") })}
              </RecipeEditFieldLabel>
              <Input
                id="boil-source-volume"
                keyboardType="decimal-pad"
                value={String(tapVolumeLiters)}
                onChangeText={(text) => setTapVolumeLiters(Number(text) || 0)}
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
                <RecipeEditFieldLabel htmlFor="boil-dilution-volume">
                {t("dilutionVolumeLabel", { unit: tUnits("L") })}
              </RecipeEditFieldLabel>
              <Input
                id="boil-dilution-volume"
                keyboardType="decimal-pad"
                value={String(dilutionVolumeLiters)}
                onChangeText={(text) => setDilutionVolumeLiters(Number(text) || 0)}
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
          </XStack>

          <YStack gap="$2" mt="$3">
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void refreshProfiles()} disabled={!canCall || loadingProfiles}>
                {loadingProfiles ? "Reloading…" : "Reload water profiles"}
              </Button>
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveAdjustment()} disabled={!canCall || savingAdjustment}>
                {savingAdjustment ? "Saving…" : "Save profile and volumes"}
              </Button>
            </XStack>
            {adjustmentSaveStatus ? (
              <MessageBox
                variant="success"
                role="status"
                aria-live="polite"
                dismissAfter={5000}
                onDismiss={() => setAdjustmentSaveStatus(null)}
              >
                {adjustmentSaveStatus}
              </MessageBox>
            ) : null}
          </YStack>

          {mixedSourceProfile ? (
            <details className="brew-field-block brew-field-block--readonly brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <SizableText fontWeight="bold">Mixed water ions</SizableText>
                <FieldBadge>Read-only</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Computed from profiles + volumes</SizableText>
              </summary>
              <View className="brew-table-wrap">
                <table className="brew-table">
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
              </View>
            </details>
          ) : (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
              {t("saltAdditionsHelp")}
            </SizableText>
          )}

          {profilesError ? (
            <ErrorBox mt="$3">{profilesError}</ErrorBox>
          ) : null}
        </View>

        <View className="brew-panel" aria-labelledby="boil-salts-heading">
          <H2 id="boil-salts-heading" mt={0}>
            {t("saltAdditionsHeading")}
          </H2>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("saltAdditionsBaseHelp")}
          </SizableText>

          <SaltAdditionsEditor rows={saltAdditions} onChange={setSaltAdditions} idPrefix="boil" disabled={!canCall} />

          <YStack mt="$3" gap="$2">
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSaltAdditions()} disabled={!canCall || savingSalts}>
                {savingSalts ? "Saving…" : "Save salts draft"}
              </Button>
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
                {saltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
              </Button>
              {saltsStatus ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
                  {saltsStatus}
                </SizableText>
              ) : null}
            </XStack>
            {(saltsSaveStatus || saltsCalcSaveStatus) ? (
              <MessageBox
                variant="success"
                role="status"
                aria-live="polite"
                dismissAfter={5000}
                onDismiss={() => {
                  setSaltsSaveStatus(null);
                  setSaltsCalcSaveStatus(null);
                }}
              >
                {saltsSaveStatus ?? saltsCalcSaveStatus}
              </MessageBox>
            ) : null}
          </YStack>

          {saltsError ? (
            <ErrorBox mt="$3">{saltsError}</ErrorBox>
          ) : null}

          {saltsResult ? (
            <details className="brew-field-block brew-field-block--computed brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <SizableText fontWeight="bold">Resulting ions (after salts only)</SizableText>
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
                <FieldBadge>Computed</FieldBadge>
              </summary>
              <View className="brew-table-wrap">
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
              </View>
            </details>
          ) : null}
        </View>

        <View className="brew-panel" aria-labelledby="boil-acid-heading">
          <H2 id="boil-acid-heading" mt={0}>
            {t("acidificationHeading")}
          </H2>

          <form onSubmit={(...a) => { void onSubmitAcid(...(a as Parameters<typeof onSubmitAcid>)); }} aria-describedby={boilError ? "boil-error" : undefined}>
            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View width="100%" flexBasis="100%">
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
              </View>

              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="boil-starting-alk">
                  {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
                </RecipeEditFieldLabel>
                <Input
                  id="boil-starting-alk"
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
                  <RecipeEditFieldLabel htmlFor="boil-starting-ph">
                  Starting pH
                </RecipeEditFieldLabel>
                <Input
                  id="boil-starting-ph"
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

              {acidificationMode === "targetPh" ? (
                <View flex={1} minWidth={200}>
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="boil-target-ph">
                    Target pH
                  </RecipeEditFieldLabel>
                  <Input
                    id="boil-target-ph"
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
                  <RecipeEditFieldLabel htmlFor="boil-acid-type">
                  Acid type
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="boil-acid-type"
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
                  <RecipeEditFieldLabel htmlFor="boil-strength-kind">
                  Strength kind
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="boil-strength-kind"
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
                  <RecipeEditFieldLabel htmlFor="boil-strength-value">
                  Strength value {strengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
                </RecipeEditFieldLabel>
                <Input
                  id="boil-strength-value"
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

              {acidificationMode === "manual" ? (
                <View width="100%" flexBasis="100%">
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="boil-manual-acid-added">
                    Acid added ({strengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                  </RecipeEditFieldLabel>
                  <Input
                    id="boil-manual-acid-added"
                    keyboardType="decimal-pad"
                    value={String(manualAcidAdded)}
                    onChangeText={(text) => setManualAcidAdded(Number(text) || 0)}
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

            <YStack mt="$3" gap="$2">
              <XStack gap="$3" alignItems="center" flexWrap="wrap">
                <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={!canCall || submitting}>
                  {submitting
                    ? "Working…"
                    : acidificationMode === "manual"
                      ? "Estimate & save snapshot"
                      : "Calculate & save snapshot"}
                </Button>
                <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveInputs()} disabled={!canCall || savingInputs}>
                  {savingInputs ? "Saving…" : "Save boil draft"}
                </Button>
                {boilStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{boilStatus}</SizableText> : null}
              </XStack>
              {(boilSaveStatus || calcSaveStatus) ? (
                <MessageBox
                  variant="success"
                  role="status"
                  aria-live="polite"
                  dismissAfter={5000}
                  onDismiss={() => {
                    setBoilSaveStatus(null);
                    setCalcSaveStatus(null);
                  }}
                >
                  {boilSaveStatus ?? calcSaveStatus}
                </MessageBox>
              ) : null}
            </YStack>

            {boilError ? (
              <ErrorBox id="boil-error" mt="$3">{boilError}</ErrorBox>
            ) : null}
          </form>

          {acidificationMode === "targetPh" && acidResult ? (
            <View className="brew-field-block brew-field-block--computed brew-mt3">
              <View className="brew-field-block-header">
                <SizableText fontWeight="bold">Result</SizableText>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">From current inputs</SizableText>
              </View>
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
            </View>
          ) : null}

          {acidificationMode === "manual" && manualResult ? (
            <details className="brew-field-block brew-field-block--computed brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <SizableText fontWeight="bold">Result (manual acid amount mode)</SizableText>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Estimated from manual acid amount</SizableText>
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

          <View height={1} bg="var(--border)" my="$4" />

          <H3 id="overall-boil-water-result" mt={0}>
            {t("overallResultHeading")}
          </H3>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Click <strong>Preview overall</strong> to preview, or <strong>Calculate &amp; save overall snapshot</strong> to persist a snapshot.
          </SizableText>
          <YStack mt="$3" gap="$2">
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateOverall(false)} disabled={!canCall || savingOverall}>
                {savingOverall ? "Calculating…" : "Preview overall"}
              </Button>
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateOverall(true)} disabled={!canCall || savingOverall}>
                {savingOverall ? "Calculating…" : "Calculate & save overall snapshot"}
              </Button>
              {overallStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{overallStatus}</SizableText> : null}
            </XStack>
            {overallSaveStatus ? (
              <MessageBox
                variant="success"
                role="status"
                aria-live="polite"
                dismissAfter={5000}
                onDismiss={() => setOverallSaveStatus(null)}
              >
                {overallSaveStatus}
              </MessageBox>
            ) : null}
          </YStack>
          {overallError ? (
            <ErrorBox mt="$3">{overallError}</ErrorBox>
          ) : null}

          {overallResult ? (
            <View className="brew-field-block brew-field-block--computed brew-mt3">
              <View className="brew-field-block-header">
                <SizableText fontWeight="bold">Overall boil snapshot</SizableText>
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
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Uses latest inputs; persist a snapshot to debug</SizableText>
              </View>
              <ul>
                <li>
                  pH: {overallResult.ph.kind} <code>{fmt("pH", overallResult.ph.value, 2)}</code>
                </li>
                <li>
                  Final alkalinity:{" "}
                  <code>{fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(overallResult.finalAlkalinityPpmCaCO3), 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
              </ul>
              <View className="brew-table-wrap-mt">
                <table className="brew-table">
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
              </View>
            </View>
          ) : null}
        </View>

        {settingsError ? <ErrorBox>{settingsError}</ErrorBox> : null}
        {savingError ? <ErrorBox>{savingError}</ErrorBox> : null}
      </YStack>
    </>
  );
}

