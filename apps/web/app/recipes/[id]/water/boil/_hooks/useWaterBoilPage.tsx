/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { Button, H1, H2, H3, Input, SizableText, View, XStack, YStack } from "tamagui";
import {
  calcBoilOverall,
  calcSaltAdditions,
  computeAndSaveBoil,
  getRecipe,
  listWaterProfiles,
} from "@umbraculum/api-client/brewery";
import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { fetchAuthMe } from "../../../../../_lib/fetchAuthMe";
import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/contracts";
import type { IonProfilePpm } from "../../_lib/waterChem";
import { bicarbonatePpmToAlkalinityPpmCaCO3, mixIonProfilesByVolume } from "../../_lib/waterChem";
import type { WaterCalcDerivation } from "@umbraculum/contracts";
import { asRecord } from "../../../../../_lib/typeGuards";
import { formatWithHint } from "../../../../../../src/i18n/format";
import { fetchRecipeWaterSettings, saveRecipeWaterSettings } from "../../_lib/waterSettings";

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


export function useWaterBoilPage() {
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


  return {
    locale,
    tWater,
    t,
    tUnits,
    tMath,
    params,
    recipeId,
    loadRecipeMeta,
    authChecked,
    setAuthChecked,
    authed,
    setAuthed,
    profiles,
    setProfiles,
    loadingProfiles,
    setLoadingProfiles,
    profilesError,
    setProfilesError,
    settingsError,
    setSettingsError,
    savingError,
    setSavingError,
    sourceProfileId,
    setSourceProfileId,
    targetProfileId,
    setTargetProfileId,
    dilutionProfileId,
    setDilutionProfileId,
    tapVolumeLiters,
    setTapVolumeLiters,
    dilutionVolumeLiters,
    setDilutionVolumeLiters,
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
    savingAdjustment,
    setSavingAdjustment,
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
    boilError,
    setBoilError,
    boilStatus,
    setBoilStatus,
    boilSaveStatus,
    setBoilSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    submitting,
    setSubmitting,
    savingInputs,
    setSavingInputs,
    acidResult,
    setAcidResult,
    manualResult,
    setManualResult,
    _acidDerivation,
    setAcidDerivation,
    saltsError,
    setSaltsError,
    saltsStatus,
    setSaltsStatus,
    saltsSaveStatus,
    setSaltsSaveStatus,
    saltsCalcSaveStatus,
    setSaltsCalcSaveStatus,
    saltsSubmitting,
    setSaltsSubmitting,
    savingSalts,
    setSavingSalts,
    saltAdditions,
    setSaltAdditions,
    saltsResult,
    setSaltsResult,
    saltDerivation,
    setSaltDerivation,
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
    formatHints,
    setFormatHints,
    fmt,
    surfaceMath,
    setSurfaceMath,
    displayAlkalinityPpmCaCO3,
    canCall,
    refreshProfiles,
    loadSettings,
    allProfiles,
    waterProfiles,
    dilutionProfiles,
    selectedSource,
    selectedTarget,
    selectedDilution,
    mixedSourceProfile,
    derivedBoilStartingAlkPpmCaCO3,
    derivedBoilWaterVolumeLiters,
    saveSettings,
    onSaveAdjustment,
    onSaveInputs,
    onCalcSalts,
    onSaveSaltAdditions,
    hasNonZeroSaltAdditions,
    ensureZeroSaltsSnapshotIfMissing,
    _boilCalciumPpm,
    _boilMagnesiumPpm,
    computeAndSaveBoilSnapshots,
    onSubmitAcid,
    computeOverallBoil,
    onCalculateOverall,
    selectedProfileInfo,
  };
}

export type WaterBoilPageModel = ReturnType<typeof useWaterBoilPage>;
