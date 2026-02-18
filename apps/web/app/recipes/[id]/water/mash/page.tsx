"use client";

import { Link } from "../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import { parseGristJson, type GristRow } from "../../../../_lib/grist";
import { editorStateFromBeerJson } from "../../../_lib/beerjsonRecipe";
import { ModeFieldset } from "../_components/ModeFieldset";
import { RecipeMetaLine } from "../_components/RecipeMetaLine";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "../_components/SaltAdditionsEditor";
import { MathHelpPopover } from "../../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../../_components/SurfaceMathToggleRow";
import { apiFetch, type MeResponse, type WaterProfile, type WaterProfilesResponse } from "../_lib/api";
import type { IonProfilePpm } from "../_lib/waterChem";
import {
  bicarbonatePpmToAlkalinityPpmCaCO3,
  combineAfterSaltsAndAcid,
  mixIonProfilesByVolume,
} from "../_lib/waterChem";
import { mathExplain } from "../_lib/mathExplain";
import { buildWaterMathBody } from "../_lib/mathBodies";
import { parseMashComputeAndSaveResponse } from "../_lib/parseWaterComputeAndSave";
import {
  fetchRecipeWaterSettings,
  saveRecipeWaterSettings,
  type RecipeWaterSettingsResponse,
} from "../_lib/waterSettings";

type MashResult = {
  acidRequiredMl: number | null;
  acidRequiredTsp: number | null;
  acidRequiredGrams: number | null;
  acidRequiredKg: number | null;
  finalAlkalinityPpmCaCO3: number;
  sulfateAddedPpm: number;
  chlorideAddedPpm: number;
};

type MashManualCalcResult = {
  achievedPh: number;
  predicted: MashResult;
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

type MashOverallResult = {
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
    mashMode: "targetPh" | "manual";
  };
};

type RecipeResponse = {
  ok: true;
  recipe: {
    id: string;
    updatedAt: string;
    beerJsonRecipeJson?: unknown;
    recipeExtJson?: unknown;
  };
};

function isAdmin(role: string | null) {
  return role === "owner" || role === "brewery_admin";
}

export default function MashWaterPage() {
  const locale = useLocale();
  const tWater = useTranslations("recipes.water.common");
  const t = useTranslations("recipes.water.mash");
  const tMath = useTranslations("math");
  const authState = useRequireAuth({ requireActiveAccount: true });
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const [me, setMe] = useState<MeResponse | null>(null);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [savingError, setSavingError] = useState<string | null>(null);

  const [adjustmentSaveStatus, setAdjustmentSaveStatus] = useState<string | null>(null);
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  const [mashError, setMashError] = useState<string | null>(null);
  const [mashStatus, setMashStatus] = useState<string | null>(null);
  const [mashManualStatus, setMashManualStatus] = useState<string | null>(null);
  const [mashSaveStatus, setMashSaveStatus] = useState<string | null>(null);
  const [mashCalcSaveStatus, setMashCalcSaveStatus] = useState<string | null>(null);
  const [mashSubmitting, setMashSubmitting] = useState(false);
  const [savingMash, setSavingMash] = useState(false);
  const [mashResult, setMashResult] = useState<MashResult | null>(null);
  const [mashManualResult, setMashManualResult] = useState<MashManualCalcResult | null>(null);

  const [mashStartingAlk, setMashStartingAlk] = useState(0);
  const [mashStartingPh, setMashStartingPh] = useState(7.0);
  const [mashTargetPh, setMashTargetPh] = useState(5.4);
  const [mashAcidType, setMashAcidType] = useState("lactic");
  const [mashStrengthKind, setMashStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">(
    "percent",
  );
  const [mashStrengthValue, setMashStrengthValue] = useState(88);
  const [mashAcidificationMode, setMashAcidificationMode] = useState<"targetPh" | "manual">(
    "targetPh",
  );
  const [mashManualAcidAdded, setMashManualAcidAdded] = useState(0);

  const [saltsError, setSaltsError] = useState<string | null>(null);
  const [saltsStatus, setSaltsStatus] = useState<string | null>(null);
  const [saltsSaveStatus, setSaltsSaveStatus] = useState<string | null>(null);
  const [saltsCalcSaveStatus, setSaltsCalcSaveStatus] = useState<string | null>(null);
  const [saltsSubmitting, setSaltsSubmitting] = useState(false);
  const [savingSalts, setSavingSalts] = useState(false);
  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);
  const [saltsResult, setSaltsResult] = useState<SaltAdditionsResult | null>(null);
  const [saltsDerivation, setSaltsDerivation] = useState<any | null>(null);
  const [acidDerivation, setAcidDerivation] = useState<any | null>(null);
  const [overallDerivation, setOverallDerivation] = useState<any | null>(null);

  const [overallError, setOverallError] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [overallSaveStatus, setOverallSaveStatus] = useState<string | null>(null);
  const [savingOverall, setSavingOverall] = useState(false);
  const [overallResult, setOverallResult] = useState<MashOverallResult | null>(null);

  // Water adjustment inputs (profiles + dilution)
  const [sourceProfileId, setSourceProfileId] = useState<string>("");
  const [targetProfileId, setTargetProfileId] = useState<string>("");
  const [dilutionProfileId, setDilutionProfileId] = useState<string>("");
  const [tapVolumeLiters, setTapVolumeLiters] = useState(0);
  const [dilutionVolumeLiters, setDilutionVolumeLiters] = useState(0);

  // Grist snapshot: keep it for calculations, but don’t duplicate full display on this page.
  const [gristImportedRows, setGristImportedRows] = useState<GristRow[]>([]);
  const [gristImportedAt, setGristImportedAt] = useState<string | null>(null);
  const [gristSourceRecipeUpdatedAt, setGristSourceRecipeUpdatedAt] = useState<string | null>(null);
  const [gristImportStatus, setGristImportStatus] = useState<string | null>(null);
  const [gristImportError, setGristImportError] = useState<string | null>(null);
  const [importingGrist, setImportingGrist] = useState(false);

  const canCall = authState.status === "ready";

  const [surfaceMath, setSurfaceMath] = useState(false);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("brewery:surfaceMath:mash");
      if (v === "1") setSurfaceMath(true);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("brewery:surfaceMath:mash", surfaceMath ? "1" : "0");
    } catch {
      // ignore
    }
  }, [surfaceMath]);

  const refreshProfiles = async () => {
    if (authState.status !== "ready") return;
    setProfilesError(null);
    setLoadingProfiles(true);
    try {
      const meRes = await apiFetch("/api/auth/me");
      setMe(meRes.ok ? ((meRes.data as any) as MeResponse) : null);

      const profRes = await apiFetch("/api/water-profiles");
      if (!profRes.ok) throw new Error(JSON.stringify(profRes.data));
      setProfiles(profRes.data as WaterProfilesResponse);
    } catch (err) {
      setProfilesError(String(err));
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadSettings = async () => {
    if (authState.status !== "ready" || !recipeId) return;
    setSettingsError(null);
    try {
      const data = (await fetchRecipeWaterSettings(recipeId)) as RecipeWaterSettingsResponse;
      const s = data.settings;
      if (!s) return;

      // Adjustment selections
      setSourceProfileId(s.sourceWaterProfileId ?? "");
      setTargetProfileId(s.targetWaterProfileId ?? "");
      setDilutionProfileId(s.dilutionWaterProfileId ?? "");
      setTapVolumeLiters(s.tapWaterVolumeLiters ?? 0);
      setDilutionVolumeLiters(s.dilutionWaterVolumeLiters ?? 0);

      // Mash
      setMashStartingAlk(s.mashStartingAlkalinityPpmCaCO3 ?? 0);
      setMashStartingPh(s.mashStartingPh ?? 7.0);
      setMashTargetPh(s.mashTargetPh ?? 5.4);
      setMashAcidType(s.mashAcidType ?? "lactic");

      const savedKind = ((s.mashStrengthKind as any) ?? "percent") as
        | "percent"
        | "normality"
        | "molarity"
        | "solid";
      setMashStrengthKind(savedKind);
      setMashStrengthValue(s.mashStrengthValue ?? 88);
      setMashAcidificationMode(s.mashAcidificationMode === "manual" ? "manual" : "targetPh");
      setMashManualAcidAdded(
        savedKind === "solid" ? (s.mashManualAcidAddedGrams ?? 0) : (s.mashManualAcidAddedMl ?? 0),
      );

      if (Array.isArray(s.mashSaltAdditionsJson)) setSaltAdditions(s.mashSaltAdditionsJson as any);
      if (s.mashSaltsLastResultJson && typeof s.mashSaltsLastResultJson === "object") {
        const v: any = s.mashSaltsLastResultJson as any;
        if (v?.result && typeof v.result === "object") {
          setSaltsResult(v.result as SaltAdditionsResult);
          if (typeof v.calculatedAt === "string") {
            setSaltsStatus(`Last calculated: ${new Date(v.calculatedAt).toLocaleString()}`);
          }
        }
      }

      if (s.mashLastCalculatedAt) {
        setMashResult({
          acidRequiredMl: s.mashLastAcidRequiredMl,
          acidRequiredTsp: s.mashLastAcidRequiredTsp,
          acidRequiredGrams: s.mashLastAcidRequiredGrams,
          acidRequiredKg: s.mashLastAcidRequiredKg,
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

      // Grist snapshot
      if (s.mashGristImportedJson !== undefined) setGristImportedRows(parseGristJson(s.mashGristImportedJson));
      if (s.mashGristImportedAt) setGristImportedAt(s.mashGristImportedAt);
      if (s.mashGristSourceRecipeUpdatedAt) setGristSourceRecipeUpdatedAt(s.mashGristSourceRecipeUpdatedAt);

      // Back-compat / single source of truth:
      // If mixing volumes are not set but an older saved mashWaterVolumeLiters exists,
      // seed tap volume from the saved mash volume so the new derived volume model works.
      const tap = s.tapWaterVolumeLiters ?? 0;
      const dil = s.dilutionWaterVolumeLiters ?? 0;
      const totalMix = tap + dil;
      if (totalMix <= 0 && typeof s.mashWaterVolumeLiters === "number" && Number.isFinite(s.mashWaterVolumeLiters) && s.mashWaterVolumeLiters > 0) {
        setTapVolumeLiters(s.mashWaterVolumeLiters);
        setDilutionVolumeLiters(0);
      }
    } catch (err) {
      setSettingsError(String(err));
    }
  };

  useEffect(() => {
    void refreshProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

  useEffect(() => {
    void loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, recipeId]);

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
    // At this point we have dilution volume, so a dilution profile must exist.
    // (We check this above, but guard again for type narrowing.)
    if (!selectedDilution) return null;
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

  const derivedMashWaterVolumeLiters = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    return tap + dil;
  }, [tapVolumeLiters, dilutionVolumeLiters]);

  const saltDerivationForMath = useMemo(() => {
    if (saltsDerivation) return saltsDerivation;
    if (!saltsResult) return null;
    return {
      kind: "salt_additions",
      version: 1,
      formulaId: "water.salt_additions.v1",
      inputs: [
        { id: "volumeLiters", value: { kind: "number", value: derivedMashWaterVolumeLiters, unit: "L" } },
        { id: "base.calciumPpm", value: { kind: "number", value: saltsResult.baseProfile.calcium, unit: "ppm" } },
        { id: "base.magnesiumPpm", value: { kind: "number", value: saltsResult.baseProfile.magnesium, unit: "ppm" } },
        { id: "base.sodiumPpm", value: { kind: "number", value: saltsResult.baseProfile.sodium, unit: "ppm" } },
        { id: "base.sulfatePpm", value: { kind: "number", value: saltsResult.baseProfile.sulfate, unit: "ppm" } },
        { id: "base.chloridePpm", value: { kind: "number", value: saltsResult.baseProfile.chloride, unit: "ppm" } },
        { id: "base.bicarbonatePpm", value: { kind: "number", value: saltsResult.baseProfile.bicarbonate, unit: "ppm" } },
      ],
      intermediates: [{ id: "breakdownSum", value: { kind: "string", value: "sum_per_salt_deltas" } }],
      breakdowns: [
        {
          id: "perSaltDeltas",
          rows: saltsResult.breakdown.map((b) => ({
            saltKey: { kind: "string", value: b.saltKey },
            grams: { kind: "number", value: b.grams, unit: "g" },
            deltaCalciumPpm: { kind: "number", value: b.deltasPpm.calcium ?? 0, unit: "ppm" },
            deltaMagnesiumPpm: { kind: "number", value: b.deltasPpm.magnesium ?? 0, unit: "ppm" },
            deltaSodiumPpm: { kind: "number", value: b.deltasPpm.sodium ?? 0, unit: "ppm" },
            deltaSulfatePpm: { kind: "number", value: b.deltasPpm.sulfate ?? 0, unit: "ppm" },
            deltaChloridePpm: { kind: "number", value: b.deltasPpm.chloride ?? 0, unit: "ppm" },
            deltaBicarbonatePpm: { kind: "number", value: b.deltasPpm.bicarbonate ?? 0, unit: "ppm" },
          })),
        },
      ],
    };
  }, [derivedMashWaterVolumeLiters, saltsDerivation, saltsResult]);

  const saveSettings = async (patch: Record<string, unknown>) => {
    if (authState.status !== "ready") return;
    await saveRecipeWaterSettings(recipeId, patch);
  };

  const onSaveAdjustment = async () => {
    setSavingError(null);
    setAdjustmentSaveStatus(null);
    setSavingAdjustment(true);
    try {
      await saveSettings({
        sourceWaterProfileId: sourceProfileId || null,
        targetWaterProfileId: targetProfileId || null,
        dilutionWaterProfileId: dilutionProfileId || null,
        tapWaterVolumeLiters: tapVolumeLiters,
        dilutionWaterVolumeLiters: dilutionVolumeLiters,
      });
      setAdjustmentSaveStatus("Saved profile and volumes.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingAdjustment(false);
    }
  };

  const onSaveMashInputs = async () => {
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
      setSaltsDerivation((res.data as any).derivation ?? null);

      await saveSettings({
        tapWaterVolumeLiters: tapVolumeLiters,
        dilutionWaterVolumeLiters: dilutionVolumeLiters,
        mashSaltAdditionsJson: saltAdditions,
        mashSaltsLastResultJson: { calculatedAt: new Date().toISOString(), result },
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
      await saveSettings({
        mashSaltAdditionsJson: saltAdditions,
      });
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
        "You entered salts but haven’t calculated them. Click “Calculate & save salts snapshot” first so overall uses the correct ions.",
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
    setSaltsDerivation(null);
    await saveSettings({
      tapWaterVolumeLiters: tapVolumeLiters,
      dilutionWaterVolumeLiters: dilutionVolumeLiters,
      mashSaltAdditionsJson: saltAdditions,
      mashSaltsLastResultJson: { calculatedAt: nowIso, result },
    });
  };

  const calcMashEstimatedPh = async (args: {
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
    const res = await apiFetch("/api/water-calc/mash-ph-estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });
    if (!res.ok) throw new Error(JSON.stringify(res.data));
    const body = res.data as any;
    return body.result?.estimatedMashPhRoomTemp as number;
  };

  const computeOverallMash = async () => {
    if (!mixedSourceProfile) throw new Error("Set Source profile + Source volume first (Dilution optional).");

    const baseProfile: IonProfilePpm = {
      calcium: mixedSourceProfile.calcium,
      magnesium: mixedSourceProfile.magnesium,
      sodium: mixedSourceProfile.sodium,
      sulfate: mixedSourceProfile.sulfate,
      chloride: mixedSourceProfile.chloride,
      bicarbonate: mixedSourceProfile.bicarbonate,
    };

    const gristRows = gristImportedRows.map((r) => ({
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
    if (mashStrengthKind !== "solid") payload.strengthValue = mashStrengthValue;
    if (mashAcidificationMode === "manual") {
      Object.assign(payload, mashStrengthKind === "solid" ? { acidAddedGrams: mashManualAcidAdded } : { acidAddedMl: mashManualAcidAdded });
    }

    const res = await apiFetch("/api/water-calc/mash-overall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(JSON.stringify(res.data));
    const body = res.data as any;
    setOverallDerivation(body.derivation ?? null);
    return body.result as MashOverallResult;
  };

  const computeAndSaveMashSnapshots = async () => {
    if (!canCall) throw new Error("Not ready to call API.");
    if (!recipeId) throw new Error("Missing recipe id.");
    if (!sourceProfileId) throw new Error("Select a Source water profile.");

    const gristRows = gristImportedRows.map((r) => ({
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
      mashStartingPh: mashStartingPh,
      mashTargetPh: mashTargetPh,
      mashAcidType: mashAcidType,
      mashStrengthKind: mashStrengthKind,
      mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
      mashAcidificationMode: mashAcidificationMode,
      mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
      mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,

      mashSaltAdditionsJson: saltAdditions,
      ...(gristRows.length ? { grist: gristRows } : {}),
    };

    const res = await apiFetch(`/api/recipes/${recipeId}/water-settings/mash/compute-and-save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(JSON.stringify(res.data));
    return parseMashComputeAndSaveResponse(res.data);
  };

  const onCalculateOverall = async (saveAlso: boolean) => {
    setOverallError(null);
    setOverallStatus(null);
    setOverallSaveStatus(null);
    setSavingOverall(true);
    try {
      if (saveAlso) {
        const computed = await computeAndSaveMashSnapshots();
        setSaltsResult(computed.salts.result as any);
        setSaltsDerivation(computed.salts.derivation as any);
        setAcidDerivation(computed.acid.derivation as any);
        setOverallDerivation(computed.overall.derivation as any);
        setOverallResult(computed.overall.result as any);
        setOverallStatus("Calculated.");
        if (computed.acid.kind === "mash_acidification_manual") {
          setMashManualResult(computed.acid.result as any);
          setMashManualStatus("Estimated (manual mode).");
          setMashResult((computed.acid.result as any).predicted ?? null);
          setMashCalcSaveStatus("Estimated & saved snapshot.");
        } else {
          setMashManualResult(null);
          setMashManualStatus(null);
          setMashResult(computed.acid.result as any);
          setMashStatus("Calculated.");
          setMashCalcSaveStatus("Calculated & saved snapshot.");
        }
        setOverallSaveStatus("Calculated & saved overall snapshot.");
      } else {
        await ensureZeroSaltsSnapshotIfMissing();
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
      setSaltsResult(computed.salts.result as any);
      setSaltsDerivation(computed.salts.derivation as any);
      setAcidDerivation(computed.acid.derivation as any);
      setOverallDerivation(computed.overall.derivation as any);
      setOverallResult(computed.overall.result as any);
      setOverallStatus("Calculated.");

      if (computed.acid.kind === "mash_acidification_manual") {
        setMashManualResult(computed.acid.result as any);
        setMashManualStatus("Estimated (manual mode).");
        setMashResult((computed.acid.result as any).predicted ?? null);
        setMashCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        setMashManualResult(null);
        setMashManualStatus(null);
        setMashResult(computed.acid.result as any);
        setMashStatus("Calculated.");
        setMashCalcSaveStatus("Calculated & saved snapshot.");
      }
    } catch (err) {
      setMashError(String(err));
    } finally {
      setMashSubmitting(false);
    }
  };

  const onImportGristFromRecipe = async () => {
    if (!canCall || !recipeId) return;
    setGristImportError(null);
    setGristImportStatus(null);
    setImportingGrist(true);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const data = res.data as RecipeResponse;
      const ext = (data.recipe as any).recipeExtJson;
      const mashPhModel = ext && typeof ext === "object" ? (ext as any).mashPhModel : null;

      let rows: GristRow[] = [];
      if (!(data.recipe as any).beerJsonRecipeJson) {
        throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
      }
      const s = editorStateFromBeerJson((data.recipe as any).beerJsonRecipeJson);
      rows = (s.gristRows as any[]).map((r) => {
        const m = r.id && mashPhModel && typeof mashPhModel === "object" ? (mashPhModel as any)[r.id] : null;
        return {
          ...r,
          mashDiPh: typeof m?.mashDiPh === "number" ? m.mashDiPh : (r as any).mashDiPh ?? null,
          mashTaToPh57_mEqPerKg:
            typeof m?.mashTaToPh57_mEqPerKg === "number" ? m.mashTaToPh57_mEqPerKg : (r as any).mashTaToPh57_mEqPerKg ?? null,
          mashRoastDehuskedOverride:
            "roastDehuskedOverride" in (m ?? {}) ? (m as any).roastDehuskedOverride : (r as any).mashRoastDehuskedOverride ?? null,
        } as GristRow;
      });
      const nowIso = new Date().toISOString();
      await saveSettings({
        mashGristImportedJson: rows,
        mashGristImportedAt: nowIso,
        mashGristSourceRecipeUpdatedAt: data.recipe.updatedAt,
      });
      setGristImportedRows(rows);
      setGristImportedAt(nowIso);
      setGristSourceRecipeUpdatedAt(data.recipe.updatedAt);
      setGristImportStatus("Imported grist snapshot.");
    } catch (err) {
      setGristImportError(String(err));
    } finally {
      setImportingGrist(false);
    }
  };

  const admin = isAdmin(me?.role ?? null);

  const gristTotalKg = useMemo(
    () => gristImportedRows.reduce((sum, r) => sum + (Number.isFinite(r.amountKg) ? r.amountKg : 0), 0),
    [gristImportedRows],
  );

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <RecipeMetaLine recipeId={recipeId} enabled={authState.status === "ready"} />
      <SurfaceMathToggleRow
        left={
          <p style={{ margin: 0 }}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/water/sparge`}>{tWater("goToSparge")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/edit#fermentables`}>{tWater("viewEditGrist")}</Link>
          </p>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        style={{ marginTop: 0, marginBottom: 8 }}
      />

      {authState.status === "error" ? (
        <pre role="alert" className="errorBox">
          {authState.error}
        </pre>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel" aria-labelledby="adjustment-heading">
          <h2 id="adjustment-heading" style={{ marginTop: 0 }}>
            {t("adjustmentHeading")}
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Choose source/target/dilution profiles and volumes to compute a mixed starting water profile.
            Manage profiles on <Link href="/water-profiles">Water profiles</Link>.
          </p>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label htmlFor="source-profile" className="muted" style={{ display: "block", fontSize: 12 }}>
                Source water profile (starting water)
              </label>
              <select
                id="source-profile"
                value={sourceProfileId}
                onChange={(e) => setSourceProfileId(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                {waterProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.scope}/{p.verificationStatus}]
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="target-profile" className="muted" style={{ display: "block", fontSize: 12 }}>
                Target water profile
              </label>
              <select
                id="target-profile"
                value={targetProfileId}
                onChange={(e) => setTargetProfileId(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                {waterProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.scope}/{p.verificationStatus}]
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dilution-profile" className="muted" style={{ display: "block", fontSize: 12 }}>
                Dilution water profile
              </label>
              <select
                id="dilution-profile"
                value={dilutionProfileId}
                onChange={(e) => setDilutionProfileId(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                {dilutionProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.scope}/{p.verificationStatus}]
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tap-volume" className="muted" style={{ display: "block", fontSize: 12 }}>
                Source volume (L)
              </label>
              <input
                id="tap-volume"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={tapVolumeLiters}
                onChange={(e) => setTapVolumeLiters(Number(e.target.value))}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label htmlFor="dilution-volume" className="muted" style={{ display: "block", fontSize: 12 }}>
                Dilution volume (L)
              </label>
              <input
                id="dilution-volume"
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
              <span className="muted" role="status" aria-live="polite">
                {adjustmentSaveStatus}
              </span>
            ) : null}
          </div>

          {mixedSourceProfile ? (
            <details className="fieldBlock fieldBlock--readonly" style={{ marginTop: 12 }}>
              <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
                <strong>Mixed water ions</strong>
                <span className="fieldBadge">Read-only</span>
                <span className="muted">Computed from profiles + volumes</span>
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
                          <td align="right">{mixed.toFixed(2)}</td>
                          <td align="right">{target === null ? "—" : target.toFixed(2)}</td>
                          <td align="right">{delta === null ? "—" : delta.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          ) : (
            <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
              {t("adjustmentHint")}
            </p>
          )}

          {profilesError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {profilesError}
            </pre>
          ) : null}
        </section>

        <p className="muted" style={{ marginTop: -4 }}>
          {t("adjustmentHint")}
        </p>

        <section className="panel" aria-labelledby="grist-summary-heading">
          <h2 id="grist-summary-heading" style={{ marginTop: 0 }}>
            {t("gristSummaryHeading")}
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            {t("gristSummaryHelp")}
          </p>
          <ul style={{ marginTop: 0 }}>
            <li>
              Rows: <code>{gristImportedRows.length}</code> · Total: <code>{gristTotalKg.toFixed(2)}</code> kg
            </li>
            <li>
              Snapshot imported at: <code>{gristImportedAt ?? "—"}</code>
            </li>
            <li>
              Source recipe updated at: <code>{gristSourceRecipeUpdatedAt ?? "—"}</code>
            </li>
          </ul>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => void onImportGristFromRecipe()} disabled={!canCall || importingGrist}>
              {importingGrist ? "Importing…" : "Import/update grist snapshot"}
            </button>
            <Link href={`/recipes/${recipeId}/edit#fermentables`}>View/edit grist in recipe</Link>
            {gristImportStatus ? <span className="muted">{gristImportStatus}</span> : null}
          </div>
          {gristImportError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {gristImportError}
            </pre>
          ) : null}
        </section>

        <section className="panel" aria-labelledby="mash-heading">
          <h2 id="mash-heading" style={{ marginTop: 0 }}>
            {t("acidificationHeading")}
          </h2>

          <form onSubmit={onSubmitMash} aria-describedby={mashError ? "mash-error" : undefined}>
            <ModeFieldset
              legend="Mode"
              name="mash-acid-mode"
              value={mashAcidificationMode}
              onChange={(v) => setMashAcidificationMode(v)}
              options={[
                { value: "targetPh", label: "Target mash pH (compute acid required)" },
                { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
              ]}
            />

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <label htmlFor="mash-starting-alk" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Starting alkalinity (ppm as CaCO3)
                </label>
                <input
                  id="mash-starting-alk"
                  type="number"
                  inputMode="decimal"
                  value={mashStartingAlk}
                  onChange={(e) => setMashStartingAlk(Number(e.target.value))}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <div>
                <label htmlFor="mash-volume-l" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Mash water volume (L)
                </label>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  Derived from Water adjustment volumes above (Source + Dilution).
                </div>
                <input
                  id="mash-volume-l"
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  value={derivedMashWaterVolumeLiters}
                  readOnly
                  tabIndex={-1}
                  disabled
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <div>
                <label htmlFor="mash-starting-ph" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Starting pH
                </label>
                <input
                  id="mash-starting-ph"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={mashStartingPh}
                  onChange={(e) => setMashStartingPh(Number(e.target.value))}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <div>
                <label htmlFor="mash-target-ph" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Target pH
                </label>
                <input
                  id="mash-target-ph"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={mashTargetPh}
                  onChange={(e) => setMashTargetPh(Number(e.target.value))}
                  disabled={mashAcidificationMode === "manual"}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <div>
                <label htmlFor="mash-acid-type" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Acid type
                </label>
                <select
                  id="mash-acid-type"
                  value={mashAcidType}
                  onChange={(e) => setMashAcidType(e.target.value)}
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
                <label htmlFor="mash-strength-kind" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Strength kind
                </label>
                <select
                  id="mash-strength-kind"
                  value={mashStrengthKind}
                  onChange={(e) => setMashStrengthKind(e.target.value as any)}
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="percent">Percent (%)</option>
                  <option value="normality">Normality (N)</option>
                  <option value="molarity">Molarity (M)</option>
                  <option value="solid">Solid (pure)</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="mash-strength-value" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Strength value {mashStrengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
                </label>
                <input
                  id="mash-strength-value"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={mashStrengthValue}
                  onChange={(e) => setMashStrengthValue(Number(e.target.value))}
                  disabled={mashStrengthKind === "solid"}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              {mashAcidificationMode === "manual" ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="mash-manual-acid-added" className="muted" style={{ display: "block", fontSize: 12 }}>
                    Acid added ({mashStrengthKind === "solid" ? "g" : "mL"})
                  </label>
                  <input
                    id="mash-manual-acid-added"
                    type="number"
                    inputMode="decimal"
                    step={0.1}
                    value={mashManualAcidAdded}
                    onChange={(e) => setMashManualAcidAdded(Number(e.target.value))}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <button type="submit" disabled={!canCall || mashSubmitting}>
                {mashSubmitting
                  ? "Working…"
                  : mashAcidificationMode === "manual"
                    ? "Estimate & save snapshot"
                    : "Calculate & save snapshot"}
              </button>
              <button type="button" onClick={() => void onSaveMashInputs()} disabled={!canCall || savingMash}>
                {savingMash ? "Saving…" : "Save mash draft"}
              </button>
              {mashStatus ? <span className="muted" role="status" aria-live="polite">{mashStatus}</span> : null}
              {mashManualStatus ? <span className="muted" role="status" aria-live="polite">{mashManualStatus}</span> : null}
              {mashSaveStatus ? <span className="muted" role="status" aria-live="polite">{mashSaveStatus}</span> : null}
              {mashCalcSaveStatus ? <span className="muted" role="status" aria-live="polite">{mashCalcSaveStatus}</span> : null}
            </div>

            {mashError ? (
              <pre id="mash-error" className="errorBox" role="alert" style={{ marginTop: 12 }}>
                {mashError}
              </pre>
            ) : null}
          </form>

          {mashAcidificationMode === "targetPh" && mashResult ? (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ marginTop: 0 }}>{t("resultLastCalculated")}</h3>
              <ul>
                {mashResult.acidRequiredMl !== null ? (
                  <li>
                    Acid required{" "}
                    {surfaceMath ? (() => {
                      const ex = mathExplain["mash.acidRequired"];
                      const title = tMath(ex.titleKey);
                      return (
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "mash.acidRequired",
                            tMath,
                            locale,
                            ctx: {
                              acidDerivation,
                            },
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      );
                    })() : null}
                    : <code>{mashResult.acidRequiredMl.toFixed(3)}</code> mL{" "}
                    {mashResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{mashResult.acidRequiredTsp.toFixed(3)}</code> tsp)
                      </>
                    ) : null}
                  </li>
                ) : null}
                {mashResult.acidRequiredGrams !== null ? (
                  <li>
                    Acid required{" "}
                    {surfaceMath ? (() => {
                      const ex = mathExplain["mash.acidRequired"];
                      const title = tMath(ex.titleKey);
                      return (
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "mash.acidRequired",
                            tMath,
                            locale,
                            ctx: {
                              acidDerivation,
                            },
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      );
                    })() : null}
                    : <code>{mashResult.acidRequiredGrams.toFixed(3)}</code> g{" "}
                    {mashResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{mashResult.acidRequiredKg.toFixed(6)}</code> kg)
                      </>
                    ) : null}
                  </li>
                ) : null}
                <li>
                  Final alkalinity{" "}
                  {surfaceMath ? (() => {
                    const ex = mathExplain["mash.finalAlkalinity"];
                    const title = tMath(ex.titleKey);
                    return (
                      <MathHelpPopover
                        title={title}
                        body={buildWaterMathBody({
                          key: "mash.finalAlkalinity",
                          tMath,
                          locale,
                          ctx: {
                            acidDerivation,
                          },
                        })}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  })() : null}
                  : <code>{mashResult.finalAlkalinityPpmCaCO3.toFixed(3)}</code> ppm as CaCO3
                </li>
                <li>
                  Sulfate added: <code>{mashResult.sulfateAddedPpm.toFixed(3)}</code> ppm
                </li>
                <li>
                  Chloride added: <code>{mashResult.chlorideAddedPpm.toFixed(3)}</code> ppm
                </li>
              </ul>
            </div>
          ) : null}

          {mashAcidificationMode === "manual" && mashManualResult ? (
            <details className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
                <strong>Result (manual acid amount mode)</strong>
                <span className="fieldBadge">Computed</span>
                <span className="muted">Estimated from manual acid amount</span>
              </summary>
              <ul>
                <li>
                  Estimated achieved pH: <code>{mashManualResult.achievedPh.toFixed(3)}</code>
                </li>
                {Number.isFinite(mashManualResult.targetAmount) && Number.isFinite(mashManualResult.predictedAmount) ? (
                  <li>
                    Acid amount: <code>{mashManualResult.targetAmount.toFixed(3)}</code> {mashStrengthKind === "solid" ? "g" : "mL"} (solver check:{" "}
                    <code>{mashManualResult.predictedAmount.toFixed(3)}</code>)
                  </li>
                ) : null}
                <li>
                  Final alkalinity: <code>{mashManualResult.predicted.finalAlkalinityPpmCaCO3.toFixed(3)}</code> ppm as CaCO3
                </li>
                <li>
                  Sulfate added: <code>{mashManualResult.predicted.sulfateAddedPpm.toFixed(3)}</code> ppm
                </li>
                <li>
                  Chloride added: <code>{mashManualResult.predicted.chlorideAddedPpm.toFixed(3)}</code> ppm
                </li>
              </ul>
            </details>
          ) : null}

          <hr style={{ margin: "16px 0" }} />

          <h3 style={{ marginTop: 0 }}>{t("saltAdditionsManualV0")}</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Base profile is the mixed source water above. Add salts in grams; we compute resulting ions (ppm).
          </p>

          <SaltAdditionsEditor
            rows={saltAdditions}
            onChange={setSaltAdditions}
            idPrefix="mash"
            disabled={!canCall}
          />

          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => void onSaveSaltAdditions()} disabled={!canCall || savingSalts}>
              {savingSalts ? "Saving…" : "Save salts draft"}
            </button>
            <button type="button" onClick={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
              {saltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
            </button>
            {saltsStatus ? <span className="muted" role="status" aria-live="polite">{saltsStatus}</span> : null}
            {saltsSaveStatus ? <span className="muted" role="status" aria-live="polite">{saltsSaveStatus}</span> : null}
            {saltsCalcSaveStatus ? <span className="muted" role="status" aria-live="polite">{saltsCalcSaveStatus}</span> : null}
          </div>

          {saltsError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {saltsError}
            </pre>
          ) : null}

          {saltsResult ? (
            <details className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
                <strong>Resulting ions (after salts only)</strong>
                {surfaceMath ? (() => {
                  const ex = mathExplain["mash.ionsAfterSalts"];
                  const title = tMath(ex.titleKey);
                  return (
                    <MathHelpPopover
                      title={title}
                      body={buildWaterMathBody({
                        key: "mash.ionsAfterSalts",
                        tMath,
                        locale,
                        ctx: {
                          saltDerivation: saltDerivationForMath,
                        },
                      })}
                      ariaLabel={tMath("fxLabel", { topic: title })}
                    />
                  );
                })() : null}
                <span className="fieldBadge">Computed</span>
                <span className="muted">
                  Does not consider acid; see &quot;Overall mash water result&quot; for combined output
                </span>
              </summary>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="right">After salts (ppm)</th>
                      <th align="right">Target (ppm)</th>
                      <th align="right">Δ (after - target)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Ca", saltsResult.resultingProfile.calcium, selectedTarget?.calcium ?? null],
                        ["Mg", saltsResult.resultingProfile.magnesium, selectedTarget?.magnesium ?? null],
                        ["Na", saltsResult.resultingProfile.sodium, selectedTarget?.sodium ?? null],
                        ["SO4", saltsResult.resultingProfile.sulfate, selectedTarget?.sulfate ?? null],
                        ["Cl", saltsResult.resultingProfile.chloride, selectedTarget?.chloride ?? null],
                        ["HCO3", saltsResult.resultingProfile.bicarbonate, selectedTarget?.bicarbonate ?? null],
                      ] as const
                    ).map(([label, after, target]) => {
                      const delta = target === null ? null : after - target;
                      return (
                        <tr key={label}>
                          <td>{label}</td>
                          <td align="right">{after.toFixed(2)}</td>
                          <td align="right">{target === null ? "—" : target.toFixed(2)}</td>
                          <td align="right">{delta === null ? "—" : delta.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}

          <hr style={{ margin: "16px 0" }} />

          <h3 id="overall-mash-water-result" style={{ marginTop: 0 }}>
            {t("overallResultHeading")}
          </h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Click <strong>Preview overall</strong> to preview, or <strong>Calculate &amp; save overall snapshot</strong> to persist a snapshot.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => void onCalculateOverall(false)} disabled={!canCall || savingOverall}>
              {savingOverall ? "Calculating…" : "Preview overall"}
            </button>
            <button type="button" onClick={() => void onCalculateOverall(true)} disabled={!canCall || savingOverall}>
              {savingOverall ? "Calculating…" : "Calculate & save overall snapshot"}
            </button>
            {overallStatus ? <span className="muted">{overallStatus}</span> : null}
            {overallSaveStatus ? <span className="muted">{overallSaveStatus}</span> : null}
          </div>
          {overallError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {overallError}
            </pre>
          ) : null}

          {overallResult ? (
            <div className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <div className="fieldBlockHeader">
                <strong>Overall mash snapshot</strong>
                {surfaceMath ? (() => {
                  const ex = mathExplain["mash.overallSnapshot"];
                  const title = tMath(ex.titleKey);
                  return (
                    <MathHelpPopover
                      title={title}
                      body={buildWaterMathBody({
                        key: "mash.overallSnapshot",
                        tMath,
                        locale,
                        ctx: {
                          overallDerivation,
                        },
                      })}
                      ariaLabel={tMath("fxLabel", { topic: title })}
                    />
                  );
                })() : null}
                <span className="fieldBadge">Computed</span>
                <span className="muted">Uses latest inputs; persist a snapshot to debug</span>
              </div>
              <ul>
                <li>
                  pH: {overallResult.ph.kind} <code>{overallResult.ph.value.toFixed(2)}</code>
                </li>
                <li>
                  Mash water volume: <code>{derivedMashWaterVolumeLiters.toFixed(2)}</code> L
                </li>
                <li>
                  Final alkalinity{" "}
                  {surfaceMath ? (() => {
                    const ex = mathExplain["mash.finalAlkalinity"];
                    const title = tMath(ex.titleKey);
                    return (
                      <MathHelpPopover
                        title={title}
                        body={buildWaterMathBody({
                          key: "mash.finalAlkalinity",
                          tMath,
                          locale,
                          ctx: {
                            acidDerivation,
                          },
                        })}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  })() : null}
                  : <code>{overallResult.finalAlkalinityPpmCaCO3.toFixed(2)}</code> ppm as CaCO3
                </li>
              </ul>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="right">Overall (ppm)</th>
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
                        <td align="right">{v.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>

        {savingError ? (
          <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
            {savingError}
          </pre>
        ) : null}
        {settingsError ? (
          <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
            {settingsError}
          </pre>
        ) : null}

        {!admin ? (
          <p className="muted" style={{ marginTop: 0 }}>
            Only <code>owner</code> and <code>brewery_admin</code> can manage water profiles. Current role:{" "}
            <code>{me?.role ?? "—"}</code>
          </p>
        ) : null}
      </div>
    </>
  );
}

