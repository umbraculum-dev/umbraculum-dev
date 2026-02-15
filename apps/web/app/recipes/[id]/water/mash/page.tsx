"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadDevAuthFromStorage, type DevAuth } from "../../../../_lib/devAuth";
import { parseGristJson, type GristMaltClass, type GristRow } from "../../../../_lib/grist";
import { ModeFieldset } from "../_components/ModeFieldset";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "../_components/SaltAdditionsEditor";
import { apiFetch, type MeResponse, type WaterProfile, type WaterProfilesResponse } from "../_lib/api";
import type { IonProfilePpm } from "../_lib/waterChem";
import { bicarbonatePpmToAlkalinityPpmCaCO3 } from "../_lib/waterChem";
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

type MashOverallResultV0 = {
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
    gristJson?: unknown;
  };
};

function isAdmin(role: string | null) {
  return role === "owner" || role === "brewery_admin";
}

export default function MashWaterPage() {
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const [authLoaded, setAuthLoaded] = useState(false);
  const [auth, setAuth] = useState<DevAuth | null>(null);
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
  const [mashWaterVolumeLiters, setMashWaterVolumeLiters] = useState(20);
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

  const [overallError, setOverallError] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [overallSaveStatus, setOverallSaveStatus] = useState<string | null>(null);
  const [savingOverall, setSavingOverall] = useState(false);
  const [overallResult, setOverallResult] = useState<MashOverallResultV0 | null>(null);

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

  useEffect(() => {
    setAuth(loadDevAuthFromStorage());
    setAuthLoaded(true);
  }, []);

  const canCall = useMemo(() => Boolean(auth?.userId && auth?.activeAccountId), [auth]);

  const refreshProfiles = async () => {
    if (!auth?.userId) return;
    setProfilesError(null);
    setLoadingProfiles(true);
    try {
      const meRes = await apiFetch("/api/me", auth);
      setMe(meRes.ok ? (meRes.data as MeResponse) : null);

      const profRes = await apiFetch("/api/water-profiles", auth);
      if (!profRes.ok) throw new Error(JSON.stringify(profRes.data));
      setProfiles(profRes.data as WaterProfilesResponse);
    } catch (err) {
      setProfilesError(String(err));
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadSettings = async () => {
    if (!auth?.userId || !auth.activeAccountId || !recipeId) return;
    setSettingsError(null);
    try {
      const data = (await fetchRecipeWaterSettings(recipeId, auth)) as RecipeWaterSettingsResponse;
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
      setMashWaterVolumeLiters(s.mashWaterVolumeLiters ?? 20);
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
        setOverallResult(s.mashOverallLastResultJson as MashOverallResultV0);
      }
      if (s.mashOverallLastCalculatedAt) {
        setOverallStatus(`Last calculated: ${new Date(s.mashOverallLastCalculatedAt).toLocaleString()}`);
      }

      // Grist snapshot
      if (s.mashGristImportedJson !== undefined) setGristImportedRows(parseGristJson(s.mashGristImportedJson));
      if (s.mashGristImportedAt) setGristImportedAt(s.mashGristImportedAt);
      if (s.mashGristSourceRecipeUpdatedAt) setGristSourceRecipeUpdatedAt(s.mashGristSourceRecipeUpdatedAt);
    } catch (err) {
      setSettingsError(String(err));
    }
  };

  useEffect(() => {
    void refreshProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId, auth?.activeAccountId]);

  useEffect(() => {
    void loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId, auth?.activeAccountId, recipeId]);

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
    if (!selectedSource || !selectedDilution) return null;
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    const total = tap + dil;
    if (total <= 0) return null;
    const mix = (a: number, b: number) => (a * tap + b * dil) / total;
    return {
      name: `Mixed (${selectedSource.name} + ${selectedDilution.name})`,
      totalVolumeLiters: total,
      calcium: mix(selectedSource.calcium, selectedDilution.calcium),
      magnesium: mix(selectedSource.magnesium, selectedDilution.magnesium),
      sodium: mix(selectedSource.sodium, selectedDilution.sodium),
      sulfate: mix(selectedSource.sulfate, selectedDilution.sulfate),
      chloride: mix(selectedSource.chloride, selectedDilution.chloride),
      bicarbonate: mix(selectedSource.bicarbonate, selectedDilution.bicarbonate),
    };
  }, [selectedSource, selectedDilution, tapVolumeLiters, dilutionVolumeLiters]);

  const saveSettings = async (patch: Record<string, unknown>) => {
    if (!auth?.userId || !auth.activeAccountId) return;
    await saveRecipeWaterSettings(recipeId, auth, patch);
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
      setAdjustmentSaveStatus("Saved profile selections.");
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
        mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
        mashStartingPh,
        mashTargetPh,
        mashWaterVolumeLiters,
        mashAcidType,
        mashStrengthKind,
        mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
        mashAcidificationMode,
        mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
        mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
      });
      setMashSaveStatus("Saved mash inputs.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingMash(false);
    }
  };

  const onCalcSalts = async () => {
    if (!auth?.userId || !auth.activeAccountId) return;
    if (!mixedSourceProfile) {
      setSaltsError("Select source + dilution profiles and set volumes first (to compute mixed water).");
      return;
    }
    setSaltsError(null);
    setSaltsStatus(null);
    setSaltsCalcSaveStatus(null);
    setSaltsResult(null);
    setSaltsSubmitting(true);
    try {
      const res = await apiFetch("/api/water-calc/salt-additions", auth, {
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

      await saveSettings({
        mashSaltAdditionsJson: saltAdditions,
        mashSaltsLastResultJson: { calculatedAt: new Date().toISOString(), result },
      });
      setSaltsStatus("Calculated.");
      setSaltsCalcSaveStatus("Calculated and saved.");
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
      setSaltsSaveStatus("Saved salt additions.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSalts(false);
    }
  };

  const calcMashEstimatedPh = async (args: {
    volumeLiters: number;
    alkalinityPpmCaCO3: number;
    grist: Array<{
      amountKg: number;
      colorLovibond: number | null;
      maltClass: GristMaltClass;
      mashDiPh?: number | null;
      mashTaToPh57_mEqPerKg?: number | null;
    }>;
    acidAdded_mEqPerL?: number;
  }) => {
    if (!auth?.userId || !auth.activeAccountId) return null;
    const hasV1 = args.grist.some(
      (r) =>
        typeof r.mashDiPh === "number" ||
        typeof r.mashTaToPh57_mEqPerKg === "number",
    );
    const res = await apiFetch(hasV1 ? "/api/water-calc/mash-ph-estimate-v1" : "/api/water-calc/mash-ph-estimate", auth, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        volumeLiters: args.volumeLiters,
        alkalinityPpmCaCO3: args.alkalinityPpmCaCO3,
        grist: hasV1
          ? args.grist.map((r) => ({
              amountKg: r.amountKg,
              mashDiPh: r.mashDiPh ?? null,
              mashTaToPh57_mEqPerKg: r.mashTaToPh57_mEqPerKg ?? null,
            }))
          : args.grist,
        acidAdded_mEqPerL: args.acidAdded_mEqPerL,
      }),
    });
    if (!res.ok) throw new Error(JSON.stringify(res.data));
    const body = res.data as any;
    return body.result?.estimatedMashPhRoomTemp as number;
  };

  const computeOverallMash = async () => {
    // This preserves the existing “overall mash” approach from the monolithic page:
    // - Start from mixed water (if present), then apply salts result, then apply acid result (SO4/Cl only) into ions.
    // - Use the latest saved “acidification mode” result snapshot where possible.
    if (!mixedSourceProfile) throw new Error("Compute mixed water first (Water adjustment section).");

    const base: IonProfilePpm = {
      calcium: mixedSourceProfile.calcium,
      magnesium: mixedSourceProfile.magnesium,
      sodium: mixedSourceProfile.sodium,
      sulfate: mixedSourceProfile.sulfate,
      chloride: mixedSourceProfile.chloride,
      bicarbonate: mixedSourceProfile.bicarbonate,
    };

    const salts = saltsResult ?? {
      baseProfile: base,
      resultingProfile: base,
      deltasPpm: { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
      breakdown: [],
    };

    // Use the same API endpoints as before: if grist present, use target-mash-ph solver; otherwise legacy mash-acidification.
    const gristRows = gristImportedRows.map((r) => ({
      amountKg: r.amountKg,
      colorLovibond: r.colorLovibond,
      maltClass: r.maltClass,
      mashDiPh: (r as any).mashDiPh ?? null,
      mashTaToPh57_mEqPerKg: (r as any).mashTaToPh57_mEqPerKg ?? null,
    }));

    let mashMode: "targetPh" | "manual" = mashAcidificationMode;
    let phKind: "target" | "estimated" = mashMode === "manual" ? "estimated" : gristRows.length ? "estimated" : "target";
    let phValue = mashMode === "manual" ? mashStartingPh : mashTargetPh;

    // First, compute an acidification result (targetPh or manual).
    let acid: MashResult | null = null;
    let estimatedMashPhRoomTemp: number | null = null;
    if (mashMode === "manual") {
      const payload: Record<string, unknown> = {
        mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
        mashStartingPh,
        mashWaterVolumeLiters: mashWaterVolumeLiters,
        acidType: mashAcidType,
        strengthKind: mashStrengthKind,
        ...(mashStrengthKind === "solid"
          ? { acidAddedGrams: mashManualAcidAdded }
          : { acidAddedMl: mashManualAcidAdded }),
      };
      if (mashStrengthKind !== "solid") payload.strengthValue = mashStrengthValue;

      const res = await apiFetch("/api/water-calc/mash-acidification-manual", auth as DevAuth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const manual = (res.data as any).result as MashManualCalcResult;
      acid = manual.predicted;
      phValue = manual.achievedPh;
      phKind = gristRows.length ? "estimated" : "target";
      if (gristRows.length) {
        // Manual mode: estimate mash pH given acid contribution if possible.
        estimatedMashPhRoomTemp = await calcMashEstimatedPh({
          volumeLiters: mashWaterVolumeLiters,
          alkalinityPpmCaCO3: mashStartingAlk,
          grist: gristRows,
          acidAdded_mEqPerL: (manual as any).predicted?.debug?.acidRequired_mEqPerL ?? undefined,
        }).catch(() => null);
        if (typeof estimatedMashPhRoomTemp === "number") phValue = estimatedMashPhRoomTemp;
      }
    } else {
      const endpoint =
        gristRows.length > 0 ? "/api/water-calc/mash-acidification-target-mash-ph" : "/api/water-calc/mash-acidification";
      const payload: Record<string, unknown> = {
        mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
        mashStartingPh,
        mashTargetPh,
        mashWaterVolumeLiters,
        acidType: mashAcidType,
        strengthKind: mashStrengthKind,
        ...(gristRows.length ? { grist: gristRows } : {}),
      };
      if (mashStrengthKind !== "solid") payload.strengthValue = mashStrengthValue;

      const res = await apiFetch(endpoint, auth as DevAuth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const result = (res.data as any).result as any;
      acid = {
        acidRequiredMl: result.acidRequiredMl,
        acidRequiredTsp: result.acidRequiredTsp,
        acidRequiredGrams: result.acidRequiredGrams,
        acidRequiredKg: result.acidRequiredKg,
        finalAlkalinityPpmCaCO3: result.finalAlkalinityPpmCaCO3,
        sulfateAddedPpm: result.sulfateAddedPpm,
        chlorideAddedPpm: result.chlorideAddedPpm,
      };
      if (typeof result.estimatedMashPhRoomTemp === "number") {
        estimatedMashPhRoomTemp = result.estimatedMashPhRoomTemp;
        phKind = "estimated";
        phValue = result.estimatedMashPhRoomTemp;
      } else {
        phKind = "target";
        phValue = mashTargetPh;
      }
    }

    if (!acid) throw new Error("No acid result available.");

    const ionsPpm: IonProfilePpm = {
      calcium: salts.resultingProfile.calcium,
      magnesium: salts.resultingProfile.magnesium,
      sodium: salts.resultingProfile.sodium,
      sulfate: salts.resultingProfile.sulfate + acid.sulfateAddedPpm,
      chloride: salts.resultingProfile.chloride + acid.chlorideAddedPpm,
      bicarbonate: salts.resultingProfile.bicarbonate,
    };

    const nowIso = new Date().toISOString();
    const overall: MashOverallResultV0 = {
      calculatedAt: nowIso,
      ionsPpm,
      finalAlkalinityPpmCaCO3: acid.finalAlkalinityPpmCaCO3,
      ph: { kind: phKind, value: phValue },
      debug: {
        startingAlkalinityPpmCaCO3: mashStartingAlk,
        startingAlkalinityAfterSaltsPpmCaCO3: bicarbonatePpmToAlkalinityPpmCaCO3(ionsPpm.bicarbonate),
        saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
        acidSulfateAddedPpm: acid.sulfateAddedPpm,
        acidChlorideAddedPpm: acid.chlorideAddedPpm,
        mashMode,
      },
    };
    return overall;
  };

  const onCalculateOverall = async (saveAlso: boolean) => {
    setOverallError(null);
    setOverallStatus(null);
    setOverallSaveStatus(null);
    setSavingOverall(true);
    try {
      const overall = await computeOverallMash();
      setOverallResult(overall);
      setOverallStatus("Calculated.");
      if (saveAlso) {
        await saveSettings({
          mashOverallLastResultJson: overall,
          mashOverallLastCalculatedAt: overall.calculatedAt,
        });
        setOverallSaveStatus("Calculated and saved.");
      }
    } catch (err) {
      setOverallError(String(err));
    } finally {
      setSavingOverall(false);
    }
  };

  const onSubmitMash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.userId || !auth.activeAccountId) return;
    setMashError(null);
    setMashStatus(null);
    setMashManualStatus(null);
    setMashCalcSaveStatus(null);
    setMashResult(null);
    setMashManualResult(null);
    setMashSubmitting(true);
    try {
      if (mashAcidificationMode === "manual") {
        const payload: Record<string, unknown> = {
          mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
          mashStartingPh,
          mashWaterVolumeLiters,
          acidType: mashAcidType,
          strengthKind: mashStrengthKind,
          ...(mashStrengthKind === "solid"
            ? { acidAddedGrams: mashManualAcidAdded }
            : { acidAddedMl: mashManualAcidAdded }),
        };
        if (mashStrengthKind !== "solid") payload.strengthValue = mashStrengthValue;
        const res = await apiFetch("/api/water-calc/mash-acidification-manual", auth, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const manual = (res.data as any).result as MashManualCalcResult;
        setMashManualResult(manual);
        setMashManualStatus("Estimated (manual mode).");
        setMashResult(manual.predicted);

        const nowIso = new Date().toISOString();
        await saveSettings({
          mashAcidificationMode,
          mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
          mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
          mashManualLastAchievedPh: manual.achievedPh,
          mashManualLastFinalAlkalinityPpmCaCO3: manual.predicted.finalAlkalinityPpmCaCO3,
          mashManualLastSulfateAddedPpm: manual.predicted.sulfateAddedPpm,
          mashManualLastChlorideAddedPpm: manual.predicted.chlorideAddedPpm,
          mashManualLastCalculatedAt: nowIso,
          mashLastFinalAlkalinityPpmCaCO3: manual.predicted.finalAlkalinityPpmCaCO3,
          mashLastSulfateAddedPpm: manual.predicted.sulfateAddedPpm,
          mashLastChlorideAddedPpm: manual.predicted.chlorideAddedPpm,
          mashLastCalculatedAt: nowIso,
        });
        setMashCalcSaveStatus("Estimated and saved.");
      } else {
        const gristRows = gristImportedRows.map((r) => ({
          amountKg: r.amountKg,
          colorLovibond: r.colorLovibond,
          maltClass: r.maltClass,
        }));
        const endpoint =
          gristRows.length > 0 ? "/api/water-calc/mash-acidification-target-mash-ph" : "/api/water-calc/mash-acidification";
        const payload: Record<string, unknown> = {
          mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
          mashStartingPh,
          mashTargetPh,
          mashWaterVolumeLiters,
          acidType: mashAcidType,
          strengthKind: mashStrengthKind,
          ...(gristRows.length ? { grist: gristRows } : {}),
        };
        if (mashStrengthKind !== "solid") payload.strengthValue = mashStrengthValue;
        const res = await apiFetch(endpoint, auth, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const result = (res.data as any).result as any;
        const r: MashResult = {
          acidRequiredMl: result.acidRequiredMl,
          acidRequiredTsp: result.acidRequiredTsp,
          acidRequiredGrams: result.acidRequiredGrams,
          acidRequiredKg: result.acidRequiredKg,
          finalAlkalinityPpmCaCO3: result.finalAlkalinityPpmCaCO3,
          sulfateAddedPpm: result.sulfateAddedPpm,
          chlorideAddedPpm: result.chlorideAddedPpm,
        };
        setMashResult(r);

        const nowIso = new Date().toISOString();
        await saveSettings({
          mashAcidificationMode,
          mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
          mashStartingPh,
          mashTargetPh,
          mashWaterVolumeLiters,
          mashAcidType,
          mashStrengthKind,
          mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
          mashLastAcidRequiredMl: r.acidRequiredMl,
          mashLastAcidRequiredTsp: r.acidRequiredTsp,
          mashLastAcidRequiredGrams: r.acidRequiredGrams,
          mashLastAcidRequiredKg: r.acidRequiredKg,
          mashLastFinalAlkalinityPpmCaCO3: r.finalAlkalinityPpmCaCO3,
          mashLastSulfateAddedPpm: r.sulfateAddedPpm,
          mashLastChlorideAddedPpm: r.chlorideAddedPpm,
          mashLastCalculatedAt: nowIso,
        });
        setMashStatus("Calculated.");
        setMashCalcSaveStatus("Calculated and saved.");
      }
    } catch (err) {
      setMashError(String(err));
    } finally {
      setMashSubmitting(false);
    }
  };

  const onImportGristFromRecipe = async () => {
    if (!auth?.userId || !auth.activeAccountId || !recipeId) return;
    setGristImportError(null);
    setGristImportStatus(null);
    setImportingGrist(true);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}`, auth);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const data = res.data as RecipeResponse;
      const rows = parseGristJson(data.recipe.gristJson);
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
      <h1 style={{ marginBottom: 8 }}>Mash water</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Recipe ID: <code>{recipeId}</code>
      </p>
      <p style={{ marginTop: 0 }}>
        <Link href={`/recipes/${recipeId}/water`}>Back to water hub</Link> {" · "}
        <Link href={`/recipes/${recipeId}/water/sparge`}>Go to sparge</Link> {" · "}
        <Link href={`/recipes/${recipeId}/edit#fermentables`}>View/edit grist in recipe</Link>
      </p>

      {authLoaded && !canCall ? (
        <p role="alert" className="errorBox">
          Missing dev headers. Go to the dashboard and click <strong>Save headers</strong> (User + Active account),
          then come back here.
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel" aria-labelledby="adjustment-heading">
          <h2 id="adjustment-heading" style={{ marginTop: 0 }}>
            Water adjustment (Sheet 4, v0)
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
              {loadingProfiles ? "Refreshing…" : "Refresh profiles"}
            </button>
            <button type="button" onClick={() => void onSaveAdjustment()} disabled={!canCall || savingAdjustment}>
              {savingAdjustment ? "Saving…" : "Save profile selections"}
            </button>
            {adjustmentSaveStatus ? (
              <span className="muted" role="status" aria-live="polite">
                {adjustmentSaveStatus}
              </span>
            ) : null}
          </div>

          {mixedSourceProfile ? (
            <div className="fieldBlock fieldBlock--readonly" style={{ marginTop: 12 }}>
              <div className="fieldBlockHeader">
                <strong>Mixed water ions</strong>
                <span className="fieldBadge">Read-only</span>
                <span className="muted">Computed from profiles + volumes</span>
              </div>
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
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
              Select a source + dilution profile and set volumes to see mixed ions.
            </p>
          )}

          {profilesError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {profilesError}
            </pre>
          ) : null}
        </section>

        <section className="panel" aria-labelledby="grist-summary-heading">
          <h2 id="grist-summary-heading" style={{ marginTop: 0 }}>
            Grist (summary)
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            We avoid duplicating the full grist table here. Use the recipe editor for details; this page only keeps a
            snapshot for calculations.
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
            Mash water acidification (Sheet 4, v0)
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
                <input
                  id="mash-volume-l"
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  value={mashWaterVolumeLiters}
                  onChange={(e) => setMashWaterVolumeLiters(Number(e.target.value))}
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
                {mashSubmitting ? "Working…" : mashAcidificationMode === "manual" ? "Estimate + Save result" : "Calculate + Save result"}
              </button>
              <button type="button" onClick={() => void onSaveMashInputs()} disabled={!canCall || savingMash}>
                {savingMash ? "Saving…" : "Save mash inputs"}
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
              <h3 style={{ marginTop: 0 }}>Result (last calculated)</h3>
              <ul>
                {mashResult.acidRequiredMl !== null ? (
                  <li>
                    Acid required: <code>{mashResult.acidRequiredMl.toFixed(3)}</code> mL{" "}
                    {mashResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{mashResult.acidRequiredTsp.toFixed(3)}</code> tsp)
                      </>
                    ) : null}
                  </li>
                ) : null}
                {mashResult.acidRequiredGrams !== null ? (
                  <li>
                    Acid required: <code>{mashResult.acidRequiredGrams.toFixed(3)}</code> g{" "}
                    {mashResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{mashResult.acidRequiredKg.toFixed(6)}</code> kg)
                      </>
                    ) : null}
                  </li>
                ) : null}
                <li>
                  Final alkalinity: <code>{mashResult.finalAlkalinityPpmCaCO3.toFixed(3)}</code> ppm as CaCO3
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
            <div style={{ marginTop: 12 }}>
              <h3 style={{ marginTop: 0 }}>Result (manual acid amount mode)</h3>
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
            </div>
          ) : null}

          <hr style={{ margin: "16px 0" }} />

          <h3 style={{ marginTop: 0 }}>Salt additions (manual, v0)</h3>
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
              {savingSalts ? "Saving…" : "Save salt additions"}
            </button>
            <button type="button" onClick={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
              {saltsSubmitting ? "Calculating…" : "Calculate + Save salts result"}
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
            <div className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <div className="fieldBlockHeader">
                <strong>Resulting ions (after salts only)</strong>
                <span className="fieldBadge">Computed</span>
                <span className="muted">Does not consider acid; see overall mash result for combined output</span>
              </div>
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
            </div>
          ) : null}

          <hr style={{ margin: "16px 0" }} />

          <h3 id="overall-mash-water-result" style={{ marginTop: 0 }}>
            Overall mash water result (v0)
          </h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Click <strong>Calculate overall</strong> to preview, or <strong>Calculate + Save</strong> to persist a snapshot.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => void onCalculateOverall(false)} disabled={!canCall || savingOverall}>
              {savingOverall ? "Calculating…" : "Calculate overall"}
            </button>
            <button type="button" onClick={() => void onCalculateOverall(true)} disabled={!canCall || savingOverall}>
              {savingOverall ? "Calculating…" : "Calculate + Save overall"}
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
                <span className="fieldBadge">Computed</span>
                <span className="muted">Uses latest inputs; persist a snapshot to debug</span>
              </div>
              <ul>
                <li>
                  pH: {overallResult.ph.kind} <code>{overallResult.ph.value.toFixed(2)}</code>
                </li>
                <li>
                  Final alkalinity: <code>{overallResult.finalAlkalinityPpmCaCO3.toFixed(2)}</code> ppm as CaCO3
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

