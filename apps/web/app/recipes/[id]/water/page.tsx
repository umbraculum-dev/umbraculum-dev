"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadDevAuthFromStorage, type DevAuth } from "../../../_lib/devAuth";

type MeResponse = { ok: true; userId: string; activeAccountId: string | null; role: string | null };

type WaterProfile = {
  id: string;
  key: string;
  scope: "system" | "account" | "public";
  type: "water" | "dilution";
  accountId: string | null;
  name: string;
  ph?: number | null;
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
  verificationStatus: "verified" | "unverified";
  source: string;
};

type WaterProfilesResponse = {
  ok: true;
  system: WaterProfile[];
  public: WaterProfile[];
  account: WaterProfile[];
};

type SpargeResult = {
  acidRequiredMl: number | null;
  acidRequiredTsp: number | null;
  acidRequiredGrams: number | null;
  acidRequiredKg: number | null;
  finalAlkalinityPpmCaCO3: number;
  sulfateAddedPpm: number;
  chlorideAddedPpm: number;
};

type MashResult = SpargeResult;

type MashManualCalcResult = {
  achievedPh: number;
  predicted: MashResult;
  clamped: "none" | "low" | "high";
  iterations: number;
  targetAmount: number;
  predictedAmount: number;
};

type SpargeManualCalcResult = {
  achievedPh: number;
  predicted: SpargeResult;
  clamped: "none" | "low" | "high";
  iterations: number;
  targetAmount: number;
  predictedAmount: number;
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

type GristPotentialKind = "ppg" | "yieldPercent" | "sg";
type GristPotential = { kind: GristPotentialKind; value: number } | null;
type GristMaltClass = "base" | "crystal" | "roast" | "acid";
type GristRow = {
  id: string;
  name: string;
  amountKg: number;
  colorLovibond: number | null;
  potential: GristPotential;
  maltClass: GristMaltClass;
};

type IonProfilePpm = {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

type MashSaltKey = "gypsum" | "calcium_chloride" | "epsom" | "table_salt" | "baking_soda";
type MashSaltAddition = { saltKey: MashSaltKey; grams: number };

type SaltAdditionsResult = {
  baseProfile: IonProfilePpm;
  resultingProfile: IonProfilePpm;
  deltasPpm: IonProfilePpm;
  breakdown: Array<{ saltKey: MashSaltKey; grams: number; deltasPpm: Partial<IonProfilePpm> }>;
};

type RecipeWaterSettings = {
  id: string;
  accountId: string;
  recipeId: string;

  sourceWaterProfileId: string | null;
  targetWaterProfileId: string | null;
  dilutionWaterProfileId: string | null;

  tapWaterVolumeLiters: number | null;
  dilutionWaterVolumeLiters: number | null;

  mashStartingAlkalinityPpmCaCO3: number;
  mashStartingPh: number;
  mashTargetPh: number;
  mashWaterVolumeLiters: number;
  mashAcidType: string;
  mashStrengthKind: string;
  mashStrengthValue: number | null;

  mashLastAcidRequiredMl: number | null;
  mashLastAcidRequiredTsp: number | null;
  mashLastAcidRequiredGrams: number | null;
  mashLastAcidRequiredKg: number | null;
  mashLastFinalAlkalinityPpmCaCO3: number | null;
  mashLastSulfateAddedPpm: number | null;
  mashLastChlorideAddedPpm: number | null;
  mashLastCalculatedAt: string | null;

  mashAcidificationMode: string;
  mashManualAcidAddedMl: number | null;
  mashManualAcidAddedGrams: number | null;
  mashManualLastAchievedPh: number | null;
  mashManualLastFinalAlkalinityPpmCaCO3: number | null;
  mashManualLastSulfateAddedPpm: number | null;
  mashManualLastChlorideAddedPpm: number | null;
  mashManualLastCalculatedAt: string | null;

  mashSaltAdditionsJson: unknown;
  mashSaltsLastResultJson: unknown;

  spargeWaterProfileId?: string | null;
  spargeStartingAlkalinityPpmCaCO3: number;
  spargeStartingPh: number;
  spargeTargetPh: number;
  spargeVolumeLiters: number;
  spargeAcidType: string;
  spargeStrengthKind: string;
  spargeStrengthValue: number | null;

  spargeLastAcidRequiredMl: number | null;
  spargeLastAcidRequiredTsp: number | null;
  spargeLastAcidRequiredGrams: number | null;
  spargeLastAcidRequiredKg: number | null;
  spargeLastFinalAlkalinityPpmCaCO3: number | null;
  spargeLastSulfateAddedPpm: number | null;
  spargeLastChlorideAddedPpm: number | null;
  spargeLastCalculatedAt: string | null;

  spargeAcidificationMode?: string;
  spargeManualAcidAddedMl?: number | null;
  spargeManualAcidAddedGrams?: number | null;
  spargeManualLastAchievedPh?: number | null;
  spargeManualLastFinalAlkalinityPpmCaCO3?: number | null;
  spargeManualLastSulfateAddedPpm?: number | null;
  spargeManualLastChlorideAddedPpm?: number | null;
  spargeManualLastCalculatedAt?: string | null;

  spargeSaltAdditionsJson?: unknown;
  spargeSaltsLastResultJson?: unknown;

  // v0 overall snapshot (may be absent until persisted by API)
  mashOverallLastResultJson?: unknown;
  mashOverallLastCalculatedAt?: string | null;

  mashGristImportedJson?: unknown;
  mashGristImportedAt?: string | null;
  mashGristSourceRecipeUpdatedAt?: string | null;
};

type RecipeWaterSettingsResponse = { ok: true; settings: RecipeWaterSettings | null };

type RecipeResponse = {
  ok: true;
  recipe: {
    id: string;
    updatedAt: string;
    gristJson?: unknown;
  };
};

async function apiFetch(path: string, auth: DevAuth, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "X-User-Id": auth.userId,
      ...(auth.activeAccountId ? { "X-Account-Id": auth.activeAccountId } : {}),
    },
  });
  const data = (await res.json()) as unknown;
  return { ok: res.ok, status: res.status, data };
}

function isAdmin(role: string | null) {
  return role === "owner" || role === "brewery_admin";
}

function parseGristJson(value: unknown): GristRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : "";
      const name = typeof o.name === "string" ? o.name : "";
      const amountKg = typeof o.amountKg === "number" && Number.isFinite(o.amountKg) ? o.amountKg : 0;
      const colorLovibond =
        o.colorLovibond === null
          ? null
          : typeof o.colorLovibond === "number" && Number.isFinite(o.colorLovibond)
            ? o.colorLovibond
            : null;
      const potentialRaw = o.potential;
      let potential: GristPotential = null;
      if (potentialRaw && typeof potentialRaw === "object") {
        const p = potentialRaw as Record<string, unknown>;
        const kind = p.kind;
        const v = p.value;
        if (
          (kind === "ppg" || kind === "yieldPercent" || kind === "sg") &&
          typeof v === "number" &&
          Number.isFinite(v)
        ) {
          potential = { kind, value: v };
        }
      }
      if (!id || !name) return null;
      const maltClassRaw = o.maltClass;
      const maltClass: GristMaltClass =
        maltClassRaw === "base" ||
        maltClassRaw === "crystal" ||
        maltClassRaw === "roast" ||
        maltClassRaw === "acid"
          ? maltClassRaw
          : "base";
      return { id, name, amountKg, colorLovibond, potential, maltClass } as GristRow;
    })
    .filter((r): r is GristRow => Boolean(r));
}

function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number) {
  // Convert mg/L as HCO3 to mg/L as CaCO3.
  // CaCO3 equivalent factor: 50/61.
  return bicarbPpm * (50 / 61);
}

export default function WaterCalculatorPage() {
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const [authLoaded, setAuthLoaded] = useState(false);
  const [auth, setAuth] = useState<DevAuth | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  const [settingsLoadedOnce, setSettingsLoadedOnce] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [spargeSaveStatus, setSpargeSaveStatus] = useState<string | null>(null);
  const [adjustmentSaveStatus, setAdjustmentSaveStatus] = useState<string | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [savingSparge, setSavingSparge] = useState(false);
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  const [spargeError, setSpargeError] = useState<string | null>(null);
  const [spargeStatus, setSpargeStatus] = useState<string | null>(null);
  const [spargeResult, setSpargeResult] = useState<SpargeResult | null>(null);
  const [spargeSubmitting, setSpargeSubmitting] = useState(false);
  const [spargeAcidificationMode, setSpargeAcidificationMode] = useState<"targetPh" | "manual">(
    "targetPh",
  );
  const [spargeManualAcidAdded, setSpargeManualAcidAdded] = useState(0);
  const [spargeManualResult, setSpargeManualResult] = useState<SpargeManualCalcResult | null>(null);

  // liters-first inputs (v0)
  const [spargeWaterProfileId, setSpargeWaterProfileId] = useState<string>("");
  const [startingAlk, setStartingAlk] = useState(0);
  const [startingPh, setStartingPh] = useState<string>("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [volumeLiters, setVolumeLiters] = useState(20);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">(
    "percent",
  );
  const [strengthValue, setStrengthValue] = useState(10);

  const [mashError, setMashError] = useState<string | null>(null);
  const [mashStatus, setMashStatus] = useState<string | null>(null);
  const [mashManualStatus, setMashManualStatus] = useState<string | null>(null);
  const [mashSaveStatus, setMashSaveStatus] = useState<string | null>(null);
  const [mashCalcSaveStatus, setMashCalcSaveStatus] = useState<string | null>(null);
  const [mashSubmitting, setMashSubmitting] = useState(false);
  const [savingMash, setSavingMash] = useState(false);
  const [mashResult, setMashResult] = useState<MashResult | null>(null);

  const [mashStartingAlk, setMashStartingAlk] = useState(0);
  const [mashStartingPh, setMashStartingPh] = useState(7.0);
  const [mashTargetPh, setMashTargetPh] = useState(5.4);
  const [mashWaterVolumeLiters, setMashWaterVolumeLiters] = useState(20);
  const [mashAcidType, setMashAcidType] = useState("lactic");
  const [mashStrengthKind, setMashStrengthKind] = useState<
    "percent" | "normality" | "molarity" | "solid"
  >("percent");
  const [mashStrengthValue, setMashStrengthValue] = useState(88);
  const [mashAcidificationMode, setMashAcidificationMode] = useState<"targetPh" | "manual">(
    "targetPh",
  );
  const [mashManualAcidAdded, setMashManualAcidAdded] = useState(0);
  const [mashManualResult, setMashManualResult] = useState<MashManualCalcResult | null>(null);

  const [mashNoAcidEstimatedMashPh, setMashNoAcidEstimatedMashPh] = useState<number | null>(null);
  const [mashNoAcidEstimateStatus, setMashNoAcidEstimateStatus] = useState<string | null>(null);
  const [mashNoAcidEstimateError, setMashNoAcidEstimateError] = useState<string | null>(null);
  const [mashNoAcidEstimating, setMashNoAcidEstimating] = useState(false);

  const [mashManualEstimatedMashPh, setMashManualEstimatedMashPh] = useState<number | null>(null);

  const [saltsError, setSaltsError] = useState<string | null>(null);
  const [saltsStatus, setSaltsStatus] = useState<string | null>(null);
  const [saltsSaveStatus, setSaltsSaveStatus] = useState<string | null>(null);
  const [saltsCalcSaveStatus, setSaltsCalcSaveStatus] = useState<string | null>(null);
  const [saltsSubmitting, setSaltsSubmitting] = useState(false);
  const [savingSalts, setSavingSalts] = useState(false);
  const [saltAdditions, setSaltAdditions] = useState<MashSaltAddition[]>([]);
  const [saltsResult, setSaltsResult] = useState<SaltAdditionsResult | null>(null);

  const [spargeSaltsError, setSpargeSaltsError] = useState<string | null>(null);
  const [spargeSaltsStatus, setSpargeSaltsStatus] = useState<string | null>(null);
  const [spargeSaltsSaveStatus, setSpargeSaltsSaveStatus] = useState<string | null>(null);
  const [spargeSaltsCalcSaveStatus, setSpargeSaltsCalcSaveStatus] = useState<string | null>(null);
  const [spargeSaltsSubmitting, setSpargeSaltsSubmitting] = useState(false);
  const [savingSpargeSalts, setSavingSpargeSalts] = useState(false);
  const [spargeSaltAdditions, setSpargeSaltAdditions] = useState<MashSaltAddition[]>([]);
  const [spargeSaltsResult, setSpargeSaltsResult] = useState<SaltAdditionsResult | null>(null);

  const [overallError, setOverallError] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [overallSaveStatus, setOverallSaveStatus] = useState<string | null>(null);
  const [overallSubmitting, setOverallSubmitting] = useState(false);
  const [savingOverall, setSavingOverall] = useState(false);
  const [overallResult, setOverallResult] = useState<MashOverallResultV0 | null>(null);

  const [gristImportedRows, setGristImportedRows] = useState<GristRow[]>([]);
  const [gristImportStatus, setGristImportStatus] = useState<string | null>(null);
  const [gristImportError, setGristImportError] = useState<string | null>(null);
  const [importingGrist, setImportingGrist] = useState(false);
  const [gristImportedAt, setGristImportedAt] = useState<string | null>(null);
  const [gristSourceRecipeUpdatedAt, setGristSourceRecipeUpdatedAt] = useState<string | null>(null);

  const overallDirty = useMemo(() => {
    if (!overallResult) return false;
    if (overallResult.debug.startingAlkalinityPpmCaCO3 !== mashStartingAlk) return true;
    if (overallResult.debug.mashMode !== mashAcidificationMode) return true;
    if (overallResult.debug.mashMode === "targetPh" && overallResult.ph.kind === "target") {
      if (Number(overallResult.ph.value.toFixed(2)) !== Number(mashTargetPh.toFixed(2))) return true;
    }
    if (saltAdditions.length === 0 && overallResult.debug.saltsDeltaBicarbonatePpm !== 0) return true;
    return false;
  }, [overallResult, mashStartingAlk, mashAcidificationMode, mashTargetPh, saltAdditions.length]);

  // Water profile creation/verification moved to `/water-profiles`.

  useEffect(() => {
    setAuth(loadDevAuthFromStorage());
    setAuthLoaded(true);
  }, []);

  const canCall = useMemo(() => Boolean(auth?.userId && auth?.activeAccountId), [auth]);

  const refresh = async () => {
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
      const res = await apiFetch(`/api/recipes/${recipeId}/water-settings`, auth);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const data = res.data as RecipeWaterSettingsResponse;
      const s = data.settings;
      if (!s) return;

      // Apply once on load so we don't clobber edits.
      setSourceProfileId(s.sourceWaterProfileId ?? "");
      setTargetProfileId(s.targetWaterProfileId ?? "");
      setDilutionProfileId(s.dilutionWaterProfileId ?? "");
      setTapVolumeLiters(s.tapWaterVolumeLiters ?? 0);
      setDilutionVolumeLiters(s.dilutionWaterVolumeLiters ?? 0);
      setStartingAlk(s.spargeStartingAlkalinityPpmCaCO3 ?? 0);
      setStartingPh(String(s.spargeStartingPh ?? 7.0));
      setTargetPh(s.spargeTargetPh ?? 5.6);
      setVolumeLiters(s.spargeVolumeLiters ?? 20);
      setAcidType(s.spargeAcidType ?? "phosphoric");
      const savedSpargeStrengthKind = ((s.spargeStrengthKind as any) ?? "percent") as
        | "percent"
        | "normality"
        | "molarity"
        | "solid";
      setStrengthKind(savedSpargeStrengthKind);
      setStrengthValue(s.spargeStrengthValue ?? 10);
      setSpargeWaterProfileId(s.spargeWaterProfileId ?? "");
      setSpargeAcidificationMode(s.spargeAcidificationMode === "manual" ? "manual" : "targetPh");
      setSpargeManualAcidAdded(
        savedSpargeStrengthKind === "solid"
          ? (s.spargeManualAcidAddedGrams ?? 0)
          : (s.spargeManualAcidAddedMl ?? 0),
      );

      if (Array.isArray(s.spargeSaltAdditionsJson)) {
        // tolerate partial/invalid in UI; server validates on save.
        setSpargeSaltAdditions(s.spargeSaltAdditionsJson as any);
      }
      if (s.spargeSaltsLastResultJson && typeof s.spargeSaltsLastResultJson === "object") {
        const v: any = s.spargeSaltsLastResultJson as any;
        if (v?.result && typeof v.result === "object") {
          setSpargeSaltsResult(v.result as SaltAdditionsResult);
          if (typeof v.calculatedAt === "string") {
            setSpargeSaltsStatus(`Last calculated: ${new Date(v.calculatedAt).toLocaleString()}`);
          }
        }
      }

      setMashStartingAlk(s.mashStartingAlkalinityPpmCaCO3 ?? 0);
      setMashStartingPh(s.mashStartingPh ?? 7.0);
      setMashTargetPh(s.mashTargetPh ?? 5.4);
      setMashWaterVolumeLiters(s.mashWaterVolumeLiters ?? 20);
      setMashAcidType(s.mashAcidType ?? "lactic");
      const savedMashStrengthKind = ((s.mashStrengthKind as any) ?? "percent") as
        | "percent"
        | "normality"
        | "molarity"
        | "solid";
      setMashStrengthKind(savedMashStrengthKind);
      setMashStrengthValue(s.mashStrengthValue ?? 88);
      setMashAcidificationMode(s.mashAcidificationMode === "manual" ? "manual" : "targetPh");
      setMashManualAcidAdded(
        savedMashStrengthKind === "solid"
          ? (s.mashManualAcidAddedGrams ?? 0)
          : (s.mashManualAcidAddedMl ?? 0),
      );

      if (Array.isArray(s.mashSaltAdditionsJson)) {
        // tolerate partial/invalid in UI; server validates on save.
        setSaltAdditions(s.mashSaltAdditionsJson as any);
      }
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
        setMashManualStatus(
          `Last estimated: ${new Date(s.mashManualLastCalculatedAt).toLocaleString()}`,
        );
      }

      if (
        s.mashOverallLastResultJson &&
        typeof s.mashOverallLastResultJson === "object" &&
        typeof s.mashOverallLastCalculatedAt === "string"
      ) {
        setOverallResult(s.mashOverallLastResultJson as any);
        setOverallStatus(`Last calculated: ${new Date(s.mashOverallLastCalculatedAt).toLocaleString()}`);
      }

      if (Array.isArray(s.mashGristImportedJson)) {
        setGristImportedRows(parseGristJson(s.mashGristImportedJson));
      }
      if (typeof s.mashGristImportedAt === "string") {
        setGristImportedAt(s.mashGristImportedAt);
        setGristImportStatus(`Imported: ${new Date(s.mashGristImportedAt).toLocaleString()}`);
      }
      if (typeof s.mashGristSourceRecipeUpdatedAt === "string") {
        setGristSourceRecipeUpdatedAt(s.mashGristSourceRecipeUpdatedAt);
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

  const onImportGristFromRecipe = async () => {
    if (!auth?.userId || !auth.activeAccountId || !recipeId) return;
    setGristImportError(null);
    setGristImportStatus(null);
    setImportingGrist(true);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}`, auth);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const data = res.data as RecipeResponse;
      const recipe = (data as any).recipe as { updatedAt?: unknown; gristJson?: unknown };
      const updatedAt = typeof recipe.updatedAt === "string" ? recipe.updatedAt : "";
      const rows = parseGristJson(recipe.gristJson);

      const nowIso = new Date().toISOString();
      await saveSettings({
        mashGristImportedJson: rows,
        mashGristImportedAt: nowIso,
        mashGristSourceRecipeUpdatedAt: updatedAt || null,
      });

      setGristImportedRows(rows);
      setGristImportedAt(nowIso);
      setGristSourceRecipeUpdatedAt(updatedAt || null);
      setGristImportStatus(`Imported: ${new Date(nowIso).toLocaleString()}`);
    } catch (err) {
      setGristImportError(String(err));
    } finally {
      setImportingGrist(false);
    }
  };

  useEffect(() => {
    if (!auth) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId, auth?.activeAccountId]);

  useEffect(() => {
    if (!canCall || !recipeId) return;
    if (settingsLoadedOnce) return;
    setSettingsLoadedOnce(true);
    void loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, recipeId, settingsLoadedOnce]);

  const saveSettings = async (patch: Record<string, unknown>) => {
    if (!auth?.userId || !auth.activeAccountId || !recipeId) return;
    const res = await apiFetch(`/api/recipes/${recipeId}/water-settings`, auth, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(JSON.stringify(res.data));
  };

  const calcMashEstimatedPhNoAcid = async (alkalinityPpmCaCO3: number, acidAdded_mEqPerL?: number) => {
    if (!auth?.userId || !auth.activeAccountId) throw new Error("Missing auth headers.");
    if (!gristImportedRows.length) throw new Error("Import grist to enable mash pH estimation.");

    const res = await apiFetch("/api/water-calc/mash-ph-estimate", auth, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mashWaterVolumeLiters,
        alkalinityPpmCaCO3,
        acidAdded_mEqPerL: typeof acidAdded_mEqPerL === "number" ? acidAdded_mEqPerL : undefined,
        grist: gristImportedRows.map((r) => ({
          amountKg: r.amountKg,
          colorLovibond: r.colorLovibond,
          maltClass: r.maltClass,
        })),
      }),
    });
    if (!res.ok) throw new Error(JSON.stringify(res.data));
    return (res.data as any).result as { estimatedMashPhRoomTemp: number };
  };

  const computeOverallMash = async () => {
    if (!auth?.userId || !auth.activeAccountId) throw new Error("Missing auth headers.");
    if (!mixedSourceProfile) throw new Error("Mix source + dilution first (volumes must be > 0).");

    // Always recompute salts for an up-to-date overall preview.
    const saltsRes = await apiFetch("/api/water-calc/salt-additions", auth, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        volumeLiters: mashWaterVolumeLiters,
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
    if (!saltsRes.ok) throw new Error(JSON.stringify(saltsRes.data));
    const salts = (saltsRes.data as any).result as SaltAdditionsResult;

    const saltsDeltaBicarb = salts.deltasPpm.bicarbonate;
    const startingAlkAfterSalts =
      mashStartingAlk + bicarbonatePpmToAlkalinityPpmCaCO3(saltsDeltaBicarb);

    const strengthPayload: Record<string, unknown> = {
      acidType: mashAcidType,
      strengthKind: mashStrengthKind,
      mashStartingAlkalinityPpmCaCO3: startingAlkAfterSalts,
      mashStartingPh,
      mashWaterVolumeLiters,
    };
    if (mashStrengthKind !== "solid") strengthPayload.strengthValue = mashStrengthValue;

    let acidFinal: MashResult;
    let ph: { kind: "target" | "estimated"; value: number };
    let mashMode: "targetPh" | "manual" = mashAcidificationMode;

    if (mashAcidificationMode === "manual") {
      const manualPayload = {
        ...strengthPayload,
        ...(mashStrengthKind === "solid"
          ? { acidAddedGrams: mashManualAcidAdded }
          : { acidAddedMl: mashManualAcidAdded }),
      };
      const acidRes = await apiFetch("/api/water-calc/mash-acidification-manual", auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualPayload),
      });
      if (!acidRes.ok) throw new Error(JSON.stringify(acidRes.data));
      const result = (acidRes.data as any).result as MashManualCalcResult;
      acidFinal = result.predicted;
      if (gristImportedRows.length) {
        const acidAdded_mEqPerL = (result.predicted as any)?.debug?.acidRequired_mEqPerL;
        const est = await calcMashEstimatedPhNoAcid(startingAlkAfterSalts, acidAdded_mEqPerL);
        ph = { kind: "estimated", value: est.estimatedMashPhRoomTemp };
      } else {
        ph = { kind: "estimated", value: result.achievedPh };
      }
    } else {
      const acidRes = await apiFetch(
        gristImportedRows.length
          ? "/api/water-calc/mash-acidification-target-mash-ph"
          : "/api/water-calc/mash-acidification",
        auth,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            gristImportedRows.length
              ? {
                  ...strengthPayload,
                  targetMashPh: mashTargetPh,
                  grist: gristImportedRows.map((r) => ({
                    amountKg: r.amountKg,
                    colorLovibond: r.colorLovibond,
                    maltClass: r.maltClass,
                  })),
                }
              : { ...strengthPayload, mashTargetPh },
          ),
        },
      );
      if (!acidRes.ok) throw new Error(JSON.stringify(acidRes.data));
      acidFinal = (acidRes.data as any).result as MashResult;
      ph = { kind: "target", value: mashTargetPh };
    }

    const ionsPpm: IonProfilePpm = {
      ...salts.resultingProfile,
      sulfate: salts.resultingProfile.sulfate + acidFinal.sulfateAddedPpm,
      chloride: salts.resultingProfile.chloride + acidFinal.chlorideAddedPpm,
    };

    const calculatedAt = new Date().toISOString();
    const overall: MashOverallResultV0 = {
      calculatedAt,
      ionsPpm,
      finalAlkalinityPpmCaCO3: acidFinal.finalAlkalinityPpmCaCO3,
      ph,
      debug: {
        startingAlkalinityPpmCaCO3: mashStartingAlk,
        startingAlkalinityAfterSaltsPpmCaCO3: startingAlkAfterSalts,
        saltsDeltaBicarbonatePpm: saltsDeltaBicarb,
        acidSulfateAddedPpm: acidFinal.sulfateAddedPpm,
        acidChlorideAddedPpm: acidFinal.chlorideAddedPpm,
        mashMode,
      },
    };

    return overall;
  };

  const onCalcOverall = async () => {
    setOverallError(null);
    setOverallStatus(null);
    setOverallSaveStatus(null);
    setOverallResult(null);
    setOverallSubmitting(true);
    try {
      const overall = await computeOverallMash();
      setOverallResult(overall);
      setOverallStatus("Calculated.");
    } catch (err) {
      setOverallError(String(err));
    } finally {
      setOverallSubmitting(false);
    }
  };

  const onCalcAndSaveOverall = async () => {
    setOverallError(null);
    setOverallStatus(null);
    setOverallSaveStatus(null);
    setOverallResult(null);
    setSavingOverall(true);
    try {
      const overall = await computeOverallMash();
      setOverallResult(overall);
      await saveSettings({
        mashOverallLastResultJson: overall,
        mashOverallLastCalculatedAt: overall.calculatedAt,
      });
      setOverallStatus("Calculated.");
      setOverallSaveStatus("Calculated and saved.");
    } catch (err) {
      setOverallError(String(err));
    } finally {
      setSavingOverall(false);
    }
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
      setSpargeSaveStatus("Saved sparge inputs.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSparge(false);
    }
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

  const onEstimateMashPhNoAcid = async () => {
    setMashNoAcidEstimateError(null);
    setMashNoAcidEstimateStatus(null);
    setMashNoAcidEstimatedMashPh(null);
    setMashNoAcidEstimating(true);
    try {
      const est = await calcMashEstimatedPhNoAcid(mashStartingAlk);
      setMashNoAcidEstimatedMashPh(est.estimatedMashPhRoomTemp);
      setMashNoAcidEstimateStatus("Estimated mash pH calculated.");
    } catch (err) {
      setMashNoAcidEstimateError(String(err));
    } finally {
      setMashNoAcidEstimating(false);
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
    setMashManualEstimatedMashPh(null);
    setMashSubmitting(true);
    try {
      if (mashAcidificationMode === "manual") {
        const payload: Record<string, unknown> = {
          acidType: mashAcidType,
          strengthKind: mashStrengthKind,
          mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
          mashStartingPh,
          mashWaterVolumeLiters,
        };
        if (mashStrengthKind !== "solid") payload.strengthValue = mashStrengthValue;
        if (mashStrengthKind === "solid") payload.acidAddedGrams = mashManualAcidAdded;
        else payload.acidAddedMl = mashManualAcidAdded;

        const res = await apiFetch("/api/water-calc/mash-acidification-manual", auth, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const result = (res.data as any).result as MashManualCalcResult;
        setMashManualResult(result);

        if (gristImportedRows.length) {
          try {
            const acidAdded_mEqPerL = (result.predicted as any)?.debug?.acidRequired_mEqPerL;
            const est = await calcMashEstimatedPhNoAcid(mashStartingAlk, acidAdded_mEqPerL);
            setMashManualEstimatedMashPh(est.estimatedMashPhRoomTemp);
          } catch {
            // non-fatal; manual water-only estimate still displayed.
          }
        }

        await saveSettings({
          mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
          mashStartingPh,
          mashTargetPh,
          mashWaterVolumeLiters,
          mashAcidType: mashAcidType,
          mashStrengthKind: mashStrengthKind,
          mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
          mashAcidificationMode: "manual",
          mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
          mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
          mashManualLastAchievedPh: result.achievedPh,
          mashManualLastFinalAlkalinityPpmCaCO3: result.predicted.finalAlkalinityPpmCaCO3,
          mashManualLastSulfateAddedPpm: result.predicted.sulfateAddedPpm,
          mashManualLastChlorideAddedPpm: result.predicted.chlorideAddedPpm,
          mashManualLastCalculatedAt: new Date().toISOString(),
        });
        setMashManualStatus("Estimated.");
        setMashCalcSaveStatus("Estimated and saved.");
      } else {
        const payload: Record<string, unknown> = {
          acidType: mashAcidType,
          strengthKind: mashStrengthKind,
          mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
          mashStartingPh,
          mashWaterVolumeLiters,
        };
        if (mashStrengthKind !== "solid") payload.strengthValue = mashStrengthValue;

        const url = gristImportedRows.length
          ? "/api/water-calc/mash-acidification-target-mash-ph"
          : "/api/water-calc/mash-acidification";
        if (gristImportedRows.length) {
          payload.targetMashPh = mashTargetPh;
          payload.grist = gristImportedRows.map((r) => ({
            amountKg: r.amountKg,
            colorLovibond: r.colorLovibond,
            maltClass: r.maltClass,
          }));
        } else {
          payload.mashTargetPh = mashTargetPh;
        }

        const res = await apiFetch(url, auth, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const result = (res.data as any).result as MashResult;
        setMashResult(result);

        await saveSettings({
          mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
          mashStartingPh,
          mashTargetPh,
          mashWaterVolumeLiters,
          mashAcidType: mashAcidType,
          mashStrengthKind: mashStrengthKind,
          mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
          mashAcidificationMode: "targetPh",
          mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
          mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
          mashLastAcidRequiredMl: result.acidRequiredMl,
          mashLastAcidRequiredTsp: result.acidRequiredTsp,
          mashLastAcidRequiredGrams: result.acidRequiredGrams,
          mashLastAcidRequiredKg: result.acidRequiredKg,
          mashLastFinalAlkalinityPpmCaCO3: result.finalAlkalinityPpmCaCO3,
          mashLastSulfateAddedPpm: result.sulfateAddedPpm,
          mashLastChlorideAddedPpm: result.chlorideAddedPpm,
          mashLastCalculatedAt: new Date().toISOString(),
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

  const onCalcSalts = async () => {
    if (!auth?.userId || !auth.activeAccountId) return;
    setSaltsError(null);
    setSaltsStatus(null);
    setSaltsCalcSaveStatus(null);
    setSaltsResult(null);
    setSaltsSubmitting(true);
    try {
      if (!mixedSourceProfile) throw new Error("Mix source + dilution first (volumes must be > 0).");
      const res = await apiFetch("/api/water-calc/salt-additions", auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volumeLiters: mashWaterVolumeLiters,
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

  const addSaltRow = () => {
    setSaltAdditions((prev) => [...prev, { saltKey: "gypsum", grams: 0 }]);
  };

  const updateSaltRow = (idx: number, next: Partial<MashSaltAddition>) => {
    setSaltAdditions((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...next } : row)),
    );
  };

  const removeSaltRow = (idx: number) => {
    setSaltAdditions((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSaveSpargeSaltsInputs = async () => {
    setSavingError(null);
    setSpargeSaltsSaveStatus(null);
    setSavingSpargeSalts(true);
    try {
      await saveSettings({
        spargeSaltAdditionsJson: spargeSaltAdditions,
      });
      setSpargeSaltsSaveStatus("Saved sparge salts inputs.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSpargeSalts(false);
    }
  };

  const onCalculateSpargeSalts = async () => {
    if (!auth?.userId || !auth.activeAccountId) return;
    setSpargeSaltsError(null);
    setSpargeSaltsStatus(null);
    setSpargeSaltsCalcSaveStatus(null);
    setSpargeSaltsResult(null);
    setSpargeSaltsSubmitting(true);
    try {
      if (!selectedSpargeProfile) {
        throw new Error("Select a sparge water profile first (it provides the base ion profile).");
      }
      if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
        throw new Error("Water volume must be > 0.");
      }

      const res = await apiFetch("/api/water-calc/salt-additions", auth, {
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

      await saveSettings({
        spargeSaltAdditionsJson: spargeSaltAdditions,
        spargeSaltsLastResultJson: { calculatedAt: new Date().toISOString(), result },
      });
      setSpargeSaltsStatus("Calculated.");
      setSpargeSaltsCalcSaveStatus("Calculated and saved.");
    } catch (err) {
      setSpargeSaltsError(String(err));
    } finally {
      setSpargeSaltsSubmitting(false);
    }
  };

  const addSpargeSaltRow = () => {
    setSpargeSaltAdditions((prev) => [...prev, { saltKey: "gypsum", grams: 0 }]);
  };

  const updateSpargeSaltRow = (idx: number, next: Partial<MashSaltAddition>) => {
    setSpargeSaltAdditions((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...next } : row)),
    );
  };

  const removeSpargeSaltRow = (idx: number) => {
    setSpargeSaltAdditions((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmitSparge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.userId || !auth.activeAccountId) return;
    if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) {
      setSpargeError("Starting pH is required (select a profile with pH or enter it manually).");
      return;
    }
    setSpargeError(null);
    setSpargeStatus(null);
    setCalcSaveStatus(null);
    setSpargeResult(null);
    setSpargeManualResult(null);
    setSpargeSubmitting(true);
    try {
      if (spargeAcidificationMode === "manual") {
        const acidAdded =
          typeof spargeManualAcidAdded === "number" && Number.isFinite(spargeManualAcidAdded)
            ? spargeManualAcidAdded
            : NaN;
        if (!Number.isFinite(acidAdded) || acidAdded < 0) {
          setSpargeError("Manual acid amount must be a number ≥ 0.");
          return;
        }

        const payload: Record<string, unknown> = {
          startingAlkalinityPpmCaCO3: startingAlk,
          startingPh: Number(startingPh),
          volumeLiters,
          acidType,
          strengthKind,
          ...(strengthKind === "solid" ? { acidAddedGrams: acidAdded } : { acidAddedMl: acidAdded }),
        };
        if (strengthKind !== "solid") payload.strengthValue = strengthValue;

        const res = await apiFetch("/api/water-calc/sparge-acidification-manual", auth, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const manual = (res.data as any).result as SpargeManualCalcResult;
        setSpargeManualResult(manual);
        setSpargeResult(manual.predicted);

        const nowIso = new Date().toISOString();
        await saveSettings({
          spargeWaterProfileId: spargeWaterProfileId || null,
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

          // Keep generic sparge snapshot filled (useful for “last calculated” indicators).
          spargeLastAcidRequiredMl: manual.predicted.acidRequiredMl,
          spargeLastAcidRequiredTsp: manual.predicted.acidRequiredTsp,
          spargeLastAcidRequiredGrams: manual.predicted.acidRequiredGrams,
          spargeLastAcidRequiredKg: manual.predicted.acidRequiredKg,
          spargeLastFinalAlkalinityPpmCaCO3: manual.predicted.finalAlkalinityPpmCaCO3,
          spargeLastSulfateAddedPpm: manual.predicted.sulfateAddedPpm,
          spargeLastChlorideAddedPpm: manual.predicted.chlorideAddedPpm,
          spargeLastCalculatedAt: nowIso,

          // Manual-mode snapshot.
          spargeManualLastAchievedPh: manual.achievedPh,
          spargeManualLastFinalAlkalinityPpmCaCO3: manual.predicted.finalAlkalinityPpmCaCO3,
          spargeManualLastSulfateAddedPpm: manual.predicted.sulfateAddedPpm,
          spargeManualLastChlorideAddedPpm: manual.predicted.chlorideAddedPpm,
          spargeManualLastCalculatedAt: nowIso,
        });

        setSpargeStatus("Estimated (manual mode).");
        setCalcSaveStatus("Estimated and saved.");
      } else {
        const payload: Record<string, unknown> = {
          startingAlkalinityPpmCaCO3: startingAlk,
          startingPh: Number(startingPh),
          targetPh,
          volumeLiters,
          acidType,
          strengthKind,
        };
        if (strengthKind !== "solid") payload.strengthValue = strengthValue;

        const res = await apiFetch("/api/water-calc/sparge-acidification", auth, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const result = (res.data as any).result as SpargeResult;
        setSpargeResult(result);

        const nowIso = new Date().toISOString();
        await saveSettings({
          spargeWaterProfileId: spargeWaterProfileId || null,
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

          spargeLastAcidRequiredMl: result.acidRequiredMl,
          spargeLastAcidRequiredTsp: result.acidRequiredTsp,
          spargeLastAcidRequiredGrams: result.acidRequiredGrams,
          spargeLastAcidRequiredKg: result.acidRequiredKg,
          spargeLastFinalAlkalinityPpmCaCO3: result.finalAlkalinityPpmCaCO3,
          spargeLastSulfateAddedPpm: result.sulfateAddedPpm,
          spargeLastChlorideAddedPpm: result.chlorideAddedPpm,
          spargeLastCalculatedAt: nowIso,
        });
        setSpargeStatus("Calculated.");
        setCalcSaveStatus("Calculated and saved.");
      }
    } catch (err) {
      setSpargeError(String(err));
    } finally {
      setSpargeSubmitting(false);
    }
  };

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const acc = profiles?.account ?? [];
    return [...sys, ...pub, ...acc];
  }, [profiles]);

  const waterProfiles = useMemo(() => allProfiles.filter((p) => p.type === "water"), [allProfiles]);
  const dilutionProfiles = useMemo(
    () => allProfiles.filter((p) => p.type === "dilution"),
    [allProfiles],
  );

  const [sourceProfileId, setSourceProfileId] = useState<string>("");
  const [targetProfileId, setTargetProfileId] = useState<string>("");
  const [dilutionProfileId, setDilutionProfileId] = useState<string>("");
  const [tapVolumeLiters, setTapVolumeLiters] = useState<number>(0);
  const [dilutionVolumeLiters, setDilutionVolumeLiters] = useState<number>(0);
  const [mixStatus, setMixStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!waterProfiles.length) return;
    setSourceProfileId((prev) => prev || waterProfiles[0]?.id || "");
    setTargetProfileId((prev) => prev || waterProfiles[0]?.id || "");
  }, [waterProfiles]);

  useEffect(() => {
    if (!dilutionProfiles.length) return;
    setDilutionProfileId((prev) => prev || dilutionProfiles[0]?.id || "");
  }, [dilutionProfiles]);

  const selectedTarget = useMemo(
    () => waterProfiles.find((p) => p.id === targetProfileId) ?? null,
    [targetProfileId, waterProfiles],
  );
  const selectedSource = useMemo(
    () => waterProfiles.find((p) => p.id === sourceProfileId) ?? null,
    [sourceProfileId, waterProfiles],
  );
  const selectedDilution = useMemo(
    () => dilutionProfiles.find((p) => p.id === dilutionProfileId) ?? null,
    [dilutionProfileId, dilutionProfiles],
  );
  const selectedSpargeProfile = useMemo(
    () => waterProfiles.find((p) => p.id === spargeWaterProfileId) ?? null,
    [spargeWaterProfileId, waterProfiles],
  );

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

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>Water calculator</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Recipe ID: <code>{recipeId}</code>
      </p>

      <div
        className="panel"
        style={{
          marginTop: 12,
          border: "1px solid color-mix(in srgb, var(--border) 85%, transparent)",
          background: "color-mix(in srgb, var(--surface-2) 55%, var(--surface))",
        }}
        aria-label="Overall mash snapshot summary"
      >
        <a href="#overall-mash-water-result" style={{ color: "inherit", textDecoration: "none" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
            <strong>Overall mash snapshot</strong>
            <span className="muted">
              pH:{" "}
              {overallResult ? (
                <>
                  {overallResult.ph.kind} <code>{overallResult.ph.value.toFixed(2)}</code>
                </>
              ) : (
                <span className="muted">—</span>
              )}
              {" · "}
              Final alkalinity:{" "}
              {overallResult ? (
                <>
                  <code>{overallResult.finalAlkalinityPpmCaCO3.toFixed(2)}</code> ppm as CaCO3
                </>
              ) : (
                <span className="muted">—</span>
              )}
            </span>
            <span className="muted" style={{ marginLeft: "auto" }}>
              Jump to details ↓
            </span>
          </div>
        </a>
      </div>

      {authLoaded && !canCall ? (
        <p role="alert" className="errorBox">
          Missing dev headers. Go to the dashboard and click <strong>Save headers</strong> (User +
          Active account), then come back here.
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel" aria-labelledby="water-report-heading">
          <h2 id="water-report-heading" style={{ marginTop: 0 }}>
            Water report (v0)
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Liters-first UI. This section will be expanded to full Sheet 1 inputs later.
          </p>
          <p className="muted" style={{ marginTop: 0, marginBottom: 0 }}>
            For now, Sparge Acidification uses: alkalinity (ppm as CaCO3), starting pH, target pH, and
            volume (L).
          </p>
        </section>

        <section className="panel" aria-labelledby="sparge-heading">
          <h2 id="sparge-heading" style={{ marginTop: 0 }}>
            Sparge acidification (Sheet 2)
          </h2>

          <form onSubmit={onSubmitSparge} aria-describedby={spargeError ? "sparge-error" : undefined}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="sparge-profile" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Sparge water profile
                </label>
                <select
                  id="sparge-profile"
                  value={spargeWaterProfileId}
                  onChange={(e) => setSpargeWaterProfileId(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="">(none)</option>
                  {waterProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.scope}/{p.verificationStatus}]
                    </option>
                  ))}
                </select>
                {selectedSpargeProfile ? (
                  <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="muted">
                      Bicarbonate: <code>{selectedSpargeProfile.bicarbonate.toFixed(2)}</code> ppm{" "}
                      {" · "}Estimated alkalinity:{" "}
                      <code>
                        {bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate).toFixed(2)}
                      </code>{" "}
                      ppm as CaCO3
                      {" · "}pH:{" "}
                      {selectedSpargeProfile.ph == null ? (
                        <span className="muted">—</span>
                      ) : (
                        <code>{selectedSpargeProfile.ph.toFixed(2)}</code>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStartingAlk(
                          bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate),
                        );
                        setStartingPh(selectedSpargeProfile.ph == null ? "" : String(selectedSpargeProfile.ph));
                      }}
                      disabled={!canCall}
                    >
                      Use profile alkalinity + pH
                    </button>
                    <span className="muted">
                      If profile pH is missing, we clear Starting pH so you can enter it.
                    </span>
                  </div>
                ) : (
                  <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                    (Optional) Select a sparge water profile; you can then apply its alkalinity to the input.
                  </p>
                )}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <fieldset
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 0,
                  }}
                >
                  <legend className="muted" style={{ fontSize: 12, padding: "0 6px" }}>
                    Mode
                  </legend>
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="radio"
                        name="sparge-mode"
                        value="targetPh"
                        checked={spargeAcidificationMode === "targetPh"}
                        onChange={() => setSpargeAcidificationMode("targetPh")}
                      />
                      <span>Target pH (solve acid required)</span>
                    </label>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="radio"
                        name="sparge-mode"
                        value="manual"
                        checked={spargeAcidificationMode === "manual"}
                        onChange={() => setSpargeAcidificationMode("manual")}
                      />
                      <span>Manual acid amount (estimate achieved pH)</span>
                    </label>
                  </div>
                </fieldset>
              </div>
              <div>
                <label htmlFor="starting-alk" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Starting alkalinity (ppm as CaCO3)
                </label>
                <input
                  id="starting-alk"
                  type="number"
                  inputMode="decimal"
                  value={startingAlk}
                  onChange={(e) => setStartingAlk(Number(e.target.value))}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <div>
                <label htmlFor="volume-l" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Water volume (L)
                </label>
                <input
                  id="volume-l"
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  value={volumeLiters}
                  onChange={(e) => setVolumeLiters(Number(e.target.value))}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <div>
                <label htmlFor="starting-ph" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Starting pH
                </label>
                <input
                  id="starting-ph"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={startingPh}
                  onChange={(e) => setStartingPh(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              {spargeAcidificationMode === "targetPh" ? (
                <div>
                  <label htmlFor="target-ph" className="muted" style={{ display: "block", fontSize: 12 }}>
                    Target pH
                  </label>
                  <input
                    id="target-ph"
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
                <label htmlFor="acid-type" className="muted" style={{ display: "block", fontSize: 12 }}>
                  Acid type
                </label>
                <select
                  id="acid-type"
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
                <label
                  htmlFor="strength-kind"
                  className="muted"
                  style={{ display: "block", fontSize: 12 }}
                >
                  Strength kind
                </label>
                <select
                  id="strength-kind"
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
                <label
                  htmlFor="strength-value"
                  className="muted"
                  style={{ display: "block", fontSize: 12 }}
                >
                  Strength value {strengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
                </label>
                <input
                  id="strength-value"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={strengthValue}
                  onChange={(e) => setStrengthValue(Number(e.target.value))}
                  disabled={strengthKind === "solid"}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              {spargeAcidificationMode === "manual" ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="sparge-manual-acid-added"
                    className="muted"
                    style={{ display: "block", fontSize: 12 }}
                  >
                    Acid added ({strengthKind === "solid" ? "g" : "mL"})
                  </label>
                  <input
                    id="sparge-manual-acid-added"
                    type="number"
                    inputMode="decimal"
                    step={0.1}
                    value={spargeManualAcidAdded}
                    onChange={(e) => setSpargeManualAcidAdded(Number(e.target.value))}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <button type="submit" disabled={!canCall || spargeSubmitting}>
                {spargeSubmitting
                  ? "Working…"
                  : spargeAcidificationMode === "manual"
                    ? "Estimate + Save result"
                    : "Calculate + Save result"}
              </button>
              <button type="button" onClick={() => void onSaveSpargeInputs()} disabled={!canCall || savingSparge}>
                {savingSparge ? "Saving…" : "Save sparge inputs"}
              </button>
              {spargeStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {spargeStatus}
                </span>
              ) : null}
              {spargeSaveStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {spargeSaveStatus}
                </span>
              ) : null}
              {calcSaveStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {calcSaveStatus}
                </span>
              ) : null}
            </div>

            {spargeError ? (
              <pre id="sparge-error" className="errorBox" role="alert" style={{ marginTop: 12 }}>
                {spargeError}
              </pre>
            ) : null}
          </form>

          {spargeAcidificationMode === "targetPh" && spargeResult ? (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ marginTop: 0 }}>Result (last calculated)</h3>
              <ul>
                {spargeResult.acidRequiredMl !== null ? (
                  <li>
                    Acid required: <code>{spargeResult.acidRequiredMl.toFixed(3)}</code> mL{" "}
                    {spargeResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{spargeResult.acidRequiredTsp.toFixed(3)}</code> tsp)
                      </>
                    ) : null}
                  </li>
                ) : null}
                {spargeResult.acidRequiredGrams !== null ? (
                  <li>
                    Acid required: <code>{spargeResult.acidRequiredGrams.toFixed(3)}</code> g{" "}
                    {spargeResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{spargeResult.acidRequiredKg.toFixed(6)}</code> kg)
                      </>
                    ) : null}
                  </li>
                ) : null}
                <li>
                  Final alkalinity: <code>{spargeResult.finalAlkalinityPpmCaCO3.toFixed(3)}</code> ppm as
                  CaCO3
                </li>
                <li>
                  Sulfate added: <code>{spargeResult.sulfateAddedPpm.toFixed(3)}</code> ppm
                </li>
                <li>
                  Chloride added: <code>{spargeResult.chlorideAddedPpm.toFixed(3)}</code> ppm
                </li>
              </ul>
              {selectedSpargeProfile?.ph == null ? (
                <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                  Note: this profile has no pH. The calculation uses only the manually entered{" "}
                  <strong>Starting pH</strong>.
                </p>
              ) : null}
            </div>
          ) : null}

          {spargeAcidificationMode === "manual" && spargeManualResult ? (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ marginTop: 0 }}>Result (manual acid amount mode)</h3>
              <ul>
                <li>
                  Estimated achieved pH: <code>{spargeManualResult.achievedPh.toFixed(3)}</code>
                </li>
                {Number.isFinite(spargeManualResult.targetAmount) &&
                Number.isFinite(spargeManualResult.predictedAmount) ? (
                  <li>
                    Acid amount: <code>{spargeManualResult.targetAmount.toFixed(3)}</code>{" "}
                    {strengthKind === "solid" ? "g" : "mL"} (solver check:{" "}
                    <code>{spargeManualResult.predictedAmount.toFixed(3)}</code>)
                  </li>
                ) : null}
                <li>
                  Final alkalinity:{" "}
                  <code>{spargeManualResult.predicted.finalAlkalinityPpmCaCO3.toFixed(3)}</code> ppm as
                  CaCO3
                </li>
                <li>
                  Sulfate added: <code>{spargeManualResult.predicted.sulfateAddedPpm.toFixed(3)}</code> ppm
                </li>
                <li>
                  Chloride added: <code>{spargeManualResult.predicted.chlorideAddedPpm.toFixed(3)}</code> ppm
                </li>
              </ul>
              {selectedSpargeProfile?.ph == null ? (
                <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                  Note: this profile has no pH. The calculation uses only the manually entered{" "}
                  <strong>Starting pH</strong>.
                </p>
              ) : null}
            </div>
          ) : null}

          <hr style={{ margin: "16px 0" }} />

          <h3 style={{ marginTop: 0 }}>Sparge salt additions (manual, v0)</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Base profile is the selected sparge water profile above. Add salts in grams; we compute resulting ions
            (ppm) for the sparge water volume.
          </p>

          <div style={{ display: "grid", gap: 12 }}>
            {spargeSaltAdditions.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {spargeSaltAdditions.map((row, idx) => (
                  <div key={idx} style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr auto" }}>
                    <div>
                      <label
                        htmlFor={`sparge-salt-key-${idx}`}
                        className="muted"
                        style={{ display: "block", fontSize: 12 }}
                      >
                        Salt
                      </label>
                      <select
                        id={`sparge-salt-key-${idx}`}
                        value={row.saltKey}
                        onChange={(e) => updateSpargeSaltRow(idx, { saltKey: e.target.value as MashSaltKey })}
                        style={{ width: "100%", padding: 8 }}
                      >
                        <option value="gypsum">Gypsum (CaSO4·2H2O)</option>
                        <option value="calcium_chloride">Calcium chloride (CaCl2·2H2O)</option>
                        <option value="epsom">Epsom (MgSO4·7H2O)</option>
                        <option value="table_salt">Table salt (NaCl)</option>
                        <option value="baking_soda">Baking soda (NaHCO3)</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={`sparge-salt-grams-${idx}`}
                        className="muted"
                        style={{ display: "block", fontSize: 12 }}
                      >
                        Amount (g)
                      </label>
                      <input
                        id={`sparge-salt-grams-${idx}`}
                        type="number"
                        inputMode="decimal"
                        step={0.1}
                        value={row.grams}
                        onChange={(e) => updateSpargeSaltRow(idx, { grams: Number(e.target.value) })}
                        style={{ width: "100%", padding: 8 }}
                      />
                    </div>
                    <div style={{ alignSelf: "end" }}>
                      <button type="button" onClick={() => removeSpargeSaltRow(idx)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                No sparge salts added yet.
              </p>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button type="button" onClick={addSpargeSaltRow} disabled={!canCall}>
                Add salt
              </button>
              <button
                type="button"
                onClick={() => void onSaveSpargeSaltsInputs()}
                disabled={!canCall || savingSpargeSalts}
              >
                {savingSpargeSalts ? "Saving…" : "Save sparge salt additions"}
              </button>
              <button
                type="button"
                onClick={() => void onCalculateSpargeSalts()}
                disabled={!canCall || spargeSaltsSubmitting || !selectedSpargeProfile}
              >
                {spargeSaltsSubmitting ? "Calculating…" : "Calculate + Save sparge salts result"}
              </button>
              {spargeSaltsStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {spargeSaltsStatus}
                </span>
              ) : null}
              {spargeSaltsSaveStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {spargeSaltsSaveStatus}
                </span>
              ) : null}
              {spargeSaltsCalcSaveStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {spargeSaltsCalcSaveStatus}
                </span>
              ) : null}
            </div>

            {spargeSaltsError ? (
              <pre className="errorBox" role="alert">
                {spargeSaltsError}
              </pre>
            ) : null}

            {spargeSaltsResult ? (
              <details>
                <summary>Resulting ions (after sparge salts only, v0)</summary>
                <div style={{ overflowX: "auto", marginTop: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th align="left">Ion</th>
                        <th align="right">After salts (ppm)</th>
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
                          <td align="right">{after.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null}

            {spargeSaltsResult && spargeResult ? (
              <details>
                <summary>Resulting ions (after sparge salts + acid SO4/Cl only, v0)</summary>
                <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                  v0 note: acids only contribute modeled sulfate/chloride; salts do not affect the acid required
                  calculation in v0.
                </p>
                <div style={{ overflowX: "auto", marginTop: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th align="left">Ion</th>
                        <th align="right">After salts + acid (ppm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const after = spargeSaltsResult.resultingProfile;
                        const combined = {
                          ...after,
                          sulfate: after.sulfate + spargeResult.sulfateAddedPpm,
                          chloride: after.chloride + spargeResult.chlorideAddedPpm,
                        };
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
                            <td align="right">{v.toFixed(2)}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null}
          </div>
        </section>

        <section className="panel" aria-labelledby="adjustment-heading">
          <h2 id="adjustment-heading" style={{ marginTop: 0 }}>
            Water adjustment (Sheet 4, v0)
          </h2>

          <p className="muted" style={{ marginTop: 0 }}>
            Profiles are seeded from BrunWater 1.25. Admins can add profiles and mark them
            verified/unverified.
          </p>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label
                htmlFor="source-profile"
                className="muted"
                style={{ display: "block", fontSize: 12 }}
              >
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
              <label
                htmlFor="target-profile"
                className="muted"
                style={{ display: "block", fontSize: 12 }}
              >
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
              <label
                htmlFor="dilution-profile"
                className="muted"
                style={{ display: "block", fontSize: 12 }}
              >
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
              <label htmlFor="tap-vol" className="muted" style={{ display: "block", fontSize: 12 }}>
                Source water volume (L)
              </label>
              <input
                id="tap-vol"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={tapVolumeLiters}
                onChange={(e) => setTapVolumeLiters(Number(e.target.value))}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label
                htmlFor="dilution-vol"
                className="muted"
                style={{ display: "block", fontSize: 12 }}
              >
                Dilution water volume (L)
              </label>
              <input
                id="dilution-vol"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={dilutionVolumeLiters}
                onChange={(e) => setDilutionVolumeLiters(Number(e.target.value))}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={refresh} disabled={!canCall || loadingProfiles}>
              {loadingProfiles ? "Refreshing…" : "Refresh profiles"}
            </button>
            <button
              onClick={() => void onSaveAdjustment()}
              disabled={!canCall || savingAdjustment}
              style={{ marginLeft: 12 }}
            >
              {savingAdjustment ? "Saving…" : "Save Water Adjustment"}
            </button>
            <button
              type="button"
              onClick={() =>
                setMixStatus(mixedSourceProfile ? "Mixed preview updated." : "Enter volumes to preview mixing.")
              }
              disabled={!canCall}
              style={{ marginLeft: 12 }}
            >
              Mix (preview)
            </button>
            {adjustmentSaveStatus ? (
              <span className="muted" role="status" aria-live="polite" style={{ marginLeft: 12 }}>
                {adjustmentSaveStatus}
              </span>
            ) : null}
            {mixStatus ? (
              <span className="muted" role="status" aria-live="polite" style={{ marginLeft: 12 }}>
                {mixStatus}
              </span>
            ) : null}
          </div>

          <hr style={{ margin: "16px 0" }} />

          <h3 style={{ marginTop: 0 }}>Mash water acidification (Sheet 4, v0)</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            This is a <strong>calculator</strong> with two modes:
            <strong> Target pH</strong> (compute acid required) and <strong>Manual acid amount</strong> (estimate the
            achieved pH from what you added). When grist is imported, Target pH targets the{" "}
            <strong>estimated mash pH</strong> (room temperature, BrunWater-style). We save a snapshot when you click{" "}
            <strong>Calculate + Save</strong>.
          </p>

          {gristImportedRows.length ? (
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
              aria-live="polite"
            >
              <p className="muted" style={{ marginTop: 0 }}>
                Grist is imported: mash pH estimation is enabled.
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button type="button" onClick={() => void onEstimateMashPhNoAcid()} disabled={!canCall || mashNoAcidEstimating}>
                  {mashNoAcidEstimating ? "Estimating…" : "Estimate mash pH (no mash acid)"}
                </button>
                {mashNoAcidEstimatedMashPh !== null ? (
                  <span className="muted">
                    Estimated mash pH: <code>{mashNoAcidEstimatedMashPh.toFixed(3)}</code>
                  </span>
                ) : null}
                {mashNoAcidEstimateStatus ? <span className="muted">{mashNoAcidEstimateStatus}</span> : null}
              </div>
              {mashNoAcidEstimateError ? (
                <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
                  {mashNoAcidEstimateError}
                </pre>
              ) : null}
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 0 }}>
              No grist imported yet. Import grist to enable mash pH estimation; otherwise Target pH uses a water-only
              (legacy) calculation.
            </p>
          )}

          <form onSubmit={onSubmitMash} aria-describedby={mashError ? "mash-error" : undefined}>
            <fieldset
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <legend className="muted" style={{ fontSize: 12, padding: "0 6px" }}>
                Mode
              </legend>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="radio"
                    name="mash-acid-mode"
                    value="targetPh"
                    checked={mashAcidificationMode === "targetPh"}
                    onChange={() => setMashAcidificationMode("targetPh")}
                  />
                  <span>Target mash pH (compute acid required)</span>
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="radio"
                    name="mash-acid-mode"
                    value="manual"
                    checked={mashAcidificationMode === "manual"}
                    onChange={() => setMashAcidificationMode("manual")}
                  />
                  <span>Manual acid amount (estimate achieved pH)</span>
                </label>
              </div>
            </fieldset>

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
                  <label htmlFor="mash-acid-added" className="muted" style={{ display: "block", fontSize: 12 }}>
                    Acid added ({mashStrengthKind === "solid" ? "g" : "mL"})
                  </label>
                  <input
                    id="mash-acid-added"
                    type="number"
                    inputMode="decimal"
                    step={0.01}
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
                  ? "Calculating…"
                  : mashAcidificationMode === "manual"
                    ? "Estimate + Save mash result"
                    : "Calculate + Save mash result"}
              </button>
              <button type="button" onClick={() => void onSaveMashInputs()} disabled={!canCall || savingMash}>
                {savingMash ? "Saving…" : "Save mash inputs"}
              </button>
              {mashStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {mashStatus}
                </span>
              ) : null}
              {mashManualStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {mashManualStatus}
                </span>
              ) : null}
              {mashSaveStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {mashSaveStatus}
                </span>
              ) : null}
              {mashCalcSaveStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {mashCalcSaveStatus}
                </span>
              ) : null}
            </div>

            {mashError ? (
              <pre id="mash-error" className="errorBox" role="alert" style={{ marginTop: 12 }}>
                {mashError}
              </pre>
            ) : null}
          </form>

          {mashResult ? (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginTop: 0 }}>Result (Target pH mode)</h4>
              <ul>
                {"estimatedMashPhRoomTemp" in (mashResult as any) ? (
                  <li>
                    Estimated mash pH:{" "}
                    <code>{Number((mashResult as any).estimatedMashPhRoomTemp).toFixed(3)}</code>
                  </li>
                ) : null}
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
          {mashManualResult ? (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginTop: 0 }}>Result (Manual acid amount mode)</h4>
              <ul>
                <li>
                  Estimated achieved pH: <code>{mashManualResult.achievedPh.toFixed(3)}</code>
                </li>
                {mashManualEstimatedMashPh !== null ? (
                  <li>
                    Estimated mash pH (from grist): <code>{mashManualEstimatedMashPh.toFixed(3)}</code>
                  </li>
                ) : null}
                {Number.isFinite(mashManualResult.targetAmount) && Number.isFinite(mashManualResult.predictedAmount) ? (
                  <li>
                    Acid amount: <code>{mashManualResult.targetAmount.toFixed(3)}</code>{" "}
                    {mashStrengthKind === "solid" ? "g" : "mL"} (solver check:{" "}
                    <code>{mashManualResult.predictedAmount.toFixed(3)}</code>)
                  </li>
                ) : null}
                <li>
                  Final alkalinity: <code>{mashManualResult.predicted.finalAlkalinityPpmCaCO3.toFixed(3)}</code> ppm as
                  CaCO3
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

          <div style={{ display: "grid", gap: 12 }}>
            {saltAdditions.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {saltAdditions.map((row, idx) => (
                  <div key={idx} style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr auto" }}>
                    <div>
                      <label
                        htmlFor={`salt-key-${idx}`}
                        className="muted"
                        style={{ display: "block", fontSize: 12 }}
                      >
                        Salt
                      </label>
                      <select
                        id={`salt-key-${idx}`}
                        value={row.saltKey}
                        onChange={(e) => updateSaltRow(idx, { saltKey: e.target.value as MashSaltKey })}
                        style={{ width: "100%", padding: 8 }}
                      >
                        <option value="gypsum">Gypsum (CaSO4·2H2O)</option>
                        <option value="calcium_chloride">Calcium chloride (CaCl2·2H2O)</option>
                        <option value="epsom">Epsom (MgSO4·7H2O)</option>
                        <option value="table_salt">Table salt (NaCl)</option>
                        <option value="baking_soda">Baking soda (NaHCO3)</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={`salt-grams-${idx}`}
                        className="muted"
                        style={{ display: "block", fontSize: 12 }}
                      >
                        Amount (g)
                      </label>
                      <input
                        id={`salt-grams-${idx}`}
                        type="number"
                        inputMode="decimal"
                        step={0.1}
                        value={row.grams}
                        onChange={(e) => updateSaltRow(idx, { grams: Number(e.target.value) })}
                        style={{ width: "100%", padding: 8 }}
                      />
                    </div>
                    <div style={{ alignSelf: "end" }}>
                      <button type="button" onClick={() => removeSaltRow(idx)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                No salts added yet.
              </p>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button type="button" onClick={addSaltRow} disabled={!canCall}>
                Add salt
              </button>
              <button type="button" onClick={() => void onSaveSaltAdditions()} disabled={!canCall || savingSalts}>
                {savingSalts ? "Saving…" : "Save salt additions"}
              </button>
              <button type="button" onClick={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
                {saltsSubmitting ? "Calculating…" : "Calculate + Save salts result"}
              </button>
              {saltsStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {saltsStatus}
                </span>
              ) : null}
              {saltsSaveStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {saltsSaveStatus}
                </span>
              ) : null}
              {saltsCalcSaveStatus ? (
                <span className="muted" role="status" aria-live="polite">
                  {saltsCalcSaveStatus}
                </span>
              ) : null}
            </div>

            {saltsError ? (
              <pre className="errorBox" role="alert">
                {saltsError}
              </pre>
            ) : null}

            {saltsResult ? (
              <details>
                <summary>
                  Resulting ions (after salts only; this does not consider acid — see mash summary for overall result)
                </summary>
                <div style={{ overflowX: "auto", marginTop: 8 }}>
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
          </div>

          {profilesError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {profilesError}
            </pre>
          ) : null}

          {settingsError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {settingsError}
            </pre>
          ) : null}
          {savingError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {savingError}
            </pre>
          ) : null}

          <p className="muted" style={{ marginTop: 12 }}>
            Need to view/manage all profiles? Use <Link href="/water-profiles">Water profiles</Link>.
          </p>
        </section>

        <section className="panel" aria-labelledby="grist-heading">
          <h2 id="grist-heading" style={{ marginTop: 0 }}>
            Grist (imported from recipe)
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            This section is read-only. Use the button to import/update the grist snapshot from the recipe’s
            Fermentables section.
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => void onImportGristFromRecipe()} disabled={!canCall || importingGrist}>
              {importingGrist ? "Importing…" : "Import/update grist from recipe"}
            </button>
            {gristImportStatus ? (
              <span className="muted" role="status" aria-live="polite">
                {gristImportStatus}
              </span>
            ) : null}
          </div>

          {gristImportError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {gristImportError}
            </pre>
          ) : null}

          {gristImportedRows.length ? (
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th align="left">Name</th>
                    <th align="right">kg</th>
                    <th align="right">°L</th>
                    <th align="left">Potential</th>
                  </tr>
                </thead>
                <tbody>
                  {gristImportedRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td align="right">{r.amountKg.toFixed(3)}</td>
                      <td align="right">{r.colorLovibond === null ? "—" : r.colorLovibond.toFixed(1)}</td>
                      <td className="muted">
                        {r.potential
                          ? `${r.potential.kind} ${r.potential.value}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
              No imported grist yet.
            </p>
          )}

          {gristSourceRecipeUpdatedAt && gristImportedAt ? (
            new Date(gristSourceRecipeUpdatedAt).getTime() > new Date(gristImportedAt).getTime() ? (
              <p className="errorBox" role="alert" style={{ marginTop: 12 }}>
                The recipe was updated after the last grist import. Click <strong>Import/update grist from recipe</strong> to refresh.
              </p>
            ) : null
          ) : null}
        </section>

        <section className="panel" aria-labelledby="summary-heading">
          <h2 id="summary-heading" style={{ marginTop: 0 }}>
            Adjustment summary (Sheet 5, scaffold)
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            This will summarize mash/sparge volumes and additions once we implement full Sheet 4
            adjustment math.
          </p>
          <ul style={{ marginBottom: 0 }}>
            <li>
              Selected target profile:{" "}
              {selectedTarget ? (
                <>
                  <code>{selectedTarget.name}</code>{" "}
                  <span className="muted">
                    [{selectedTarget.scope}/{selectedTarget.verificationStatus}]
                  </span>
                </>
              ) : (
                <span className="muted">(none)</span>
              )}
            </li>
            <li>
              Selected dilution profile:{" "}
              {selectedDilution ? (
                <>
                  <code>{selectedDilution.name}</code>{" "}
                  <span className="muted">
                    [{selectedDilution.scope}/{selectedDilution.verificationStatus}]
                  </span>
                </>
              ) : (
                <span className="muted">(none)</span>
              )}
            </li>
            <li>
              Mixed source water (from Sheet 4 mixing):{" "}
              {mixedSourceProfile ? (
                <>
                  <code>{mixedSourceProfile.name}</code>{" "}
                  <span className="muted">
                    (total <code>{mixedSourceProfile.totalVolumeLiters.toFixed(2)}</code> L)
                  </span>
                </>
              ) : (
                <span className="muted">(not mixed)</span>
              )}
            </li>
            <li>
              Sparge acidification result:{" "}
              <span className="muted">{spargeResult ? "available" : "not calculated"}</span>
            </li>
          </ul>

          {mixedSourceProfile ? (
            <details style={{ marginTop: 12 }}>
              <summary>Mixed water ions (and delta vs target)</summary>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
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
          ) : null}

          <hr style={{ margin: "16px 0" }} />

          <h3 id="overall-mash-water-result" style={{ marginTop: 0 }}>
            Overall mash water result (v0)
          </h3>
          <p className="muted" style={{ marginTop: 0 }}>
            v0 assumptions: salts impact alkalinity via bicarbonate (ΔHCO₃) conversion; acids only
            contribute modeled ions (SO4/Cl). Click <strong>Calculate overall</strong> to preview, or{" "}
            <strong>Calculate + Save</strong> to persist a snapshot for debugging.
          </p>

          <ul style={{ marginBottom: 0 }}>
            <li>
              Mixed base water:{" "}
              <span className="muted">{mixedSourceProfile ? "ready" : "not mixed"}</span>
            </li>
            <li>
              Salt additions: <span className="muted">{saltAdditions.length ? "present" : "none"}</span>
            </li>
            <li>
              Mash acidification mode: <span className="muted">{mashAcidificationMode}</span>
            </li>
          </ul>

          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => void onCalcOverall()} disabled={!canCall || overallSubmitting}>
              {overallSubmitting ? "Calculating…" : "Calculate overall (preview)"}
            </button>
            <button type="button" onClick={() => void onCalcAndSaveOverall()} disabled={!canCall || savingOverall}>
              {savingOverall ? "Saving…" : "Calculate + Save overall snapshot"}
            </button>
            {overallStatus ? (
              <span className="muted" role="status" aria-live="polite">
                {overallStatus}
              </span>
            ) : null}
            {overallSaveStatus ? (
              <span className="muted" role="status" aria-live="polite">
                {overallSaveStatus}
              </span>
            ) : null}
          </div>

          {overallError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {overallError}
            </pre>
          ) : null}

          {overallResult ? (
            <div style={{ marginTop: 12 }}>
              <p className="muted" style={{ marginTop: 0 }}>
                Snapshot: <code>{new Date(overallResult.calculatedAt).toLocaleString()}</code>
              </p>
              <p className="muted" style={{ marginTop: 0 }}>
                Computed from:{" "}
                <span>
                  mash vol <code>{mashWaterVolumeLiters.toFixed(2)}</code> L · start alk{" "}
                  <code>{mashStartingAlk.toFixed(2)}</code> ppm as CaCO3 · start pH{" "}
                  <code>{mashStartingPh.toFixed(2)}</code> · salts rows{" "}
                  <code>{saltAdditions.length}</code> · acid{" "}
                  <code>{mashAcidType}</code> ({mashStrengthKind}
                  {mashStrengthKind === "solid" ? "" : ` ${mashStrengthValue}`}) · grist import{" "}
                  {gristImportedAt ? (
                    <code>{new Date(gristImportedAt).toLocaleString()}</code>
                  ) : (
                    <span className="muted">none</span>
                  )}
                </span>
              </p>
              {overallDirty ? (
                <p className="errorBox" role="alert" style={{ marginTop: 12 }}>
                  Inputs have changed since this overall snapshot was calculated. Recalculate to refresh.
                </p>
              ) : null}
              <p className="muted" style={{ marginTop: 0 }}>
                pH:{" "}
                {overallResult.ph.kind === "target" ? (
                  <>
                    target <code>{overallResult.ph.value.toFixed(2)}</code>
                  </>
                ) : (
                  <>
                    estimated <code>{overallResult.ph.value.toFixed(2)}</code>
                  </>
                )}
                {" · "}
                Final alkalinity:{" "}
                <code>{overallResult.finalAlkalinityPpmCaCO3.toFixed(2)}</code> ppm as CaCO3
              </p>

              <details>
                <summary>Resulting ions (after salts + acid, v0)</summary>
                <div style={{ overflowX: "auto", marginTop: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th align="left">Ion</th>
                        <th align="right">Overall (ppm)</th>
                        <th align="right">Target (ppm)</th>
                        <th align="right">Δ (overall - target)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ["Ca", overallResult.ionsPpm.calcium, selectedTarget?.calcium ?? null],
                          ["Mg", overallResult.ionsPpm.magnesium, selectedTarget?.magnesium ?? null],
                          ["Na", overallResult.ionsPpm.sodium, selectedTarget?.sodium ?? null],
                          ["SO4", overallResult.ionsPpm.sulfate, selectedTarget?.sulfate ?? null],
                          ["Cl", overallResult.ionsPpm.chloride, selectedTarget?.chloride ?? null],
                          ["HCO3", overallResult.ionsPpm.bicarbonate, selectedTarget?.bicarbonate ?? null],
                        ] as const
                      ).map(([label, overall, target]) => {
                        const delta = target === null ? null : overall - target;
                        return (
                          <tr key={label}>
                            <td>{label}</td>
                            <td align="right">{overall.toFixed(2)}</td>
                            <td align="right">{target === null ? "—" : target.toFixed(2)}</td>
                            <td align="right">{delta === null ? "—" : delta.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          ) : null}
        </section>

        <section className="panel" aria-labelledby="profiles-admin-note-heading">
          <h2 id="profiles-admin-note-heading" style={{ marginTop: 0 }}>
            Water profiles
          </h2>
          <p className="muted" style={{ marginTop: 0, marginBottom: 0 }}>
            Adding/verifying profiles is now on <Link href="/water-profiles">Manage water profiles</Link>.
          </p>
        </section>

        <section className="panel" aria-labelledby="nav-heading">
          <h2 id="nav-heading" style={{ marginTop: 0 }}>
            Navigation
          </h2>
          <ul style={{ marginBottom: 0 }}>
            <li>
              <Link href={`/recipes/${recipeId}/edit`}>Back to recipe editor</Link>
            </li>
            <li>
              <Link href="/water-profiles">Manage water profiles</Link>
            </li>
            <li>
              <Link href="/recipes">Back to Recipes</Link>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}

