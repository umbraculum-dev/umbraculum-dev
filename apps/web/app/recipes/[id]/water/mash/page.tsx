"use client";

import { Link } from "../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import { parseGristJson, type GristRow } from "../../../../_lib/grist";
import {
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  replaceMashInBeerJsonDocument,
  validateMashBeforeSave,
  MASH_TEMPLATES,
  newMashRowId,
  type EditorMashStep,
} from "../../../_lib/beerjsonRecipe";
import { MashStepsEditor } from "../../../_components/MashStepsEditor";
import { ErrorBox, FieldBadge, RecipeEditFieldLabel } from "../../../../_components/recipe-edit";
import { ModeFieldset } from "../_components/ModeFieldset";
import { RecipeMetaLine } from "../_components/RecipeMetaLine";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "../_components/SaltAdditionsEditor";
import { MathHelpPopover } from "../../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../../_components/SurfaceMathToggleRow";
import { apiFetch, type AuthMeResponse, type WaterProfile, type WaterProfilesResponse } from "../_lib/api";
import { parseAuthMeResponse, parseWaterProfilesResponse } from "@brewery/contracts";
import { Button, H1, H2, H3, SizableText, View, XStack, YStack } from "tamagui";
import type { IonProfilePpm } from "../_lib/waterChem";
import {
  bicarbonatePpmToAlkalinityPpmCaCO3,
  combineAfterSaltsAndAcid,
  mixIonProfilesByVolume,
} from "../_lib/waterChem";
import { mathExplain } from "../_lib/mathExplain";
import { buildWaterMathBody } from "../_lib/mathBodies";
import { parseGravityAnalysisResponseV1, parseMashComputeAndSaveResponse } from "@brewery/contracts";
import { formatFixed, formatWithHint } from "../../../../../src/i18n/format";
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
  recipe: {
    id: string;
    updatedAt: string;
    beerJsonRecipeJson?: unknown;
    recipeExtJson?: unknown;
    analysis?: unknown;
  };
};

function isAdmin(role: string | null) {
  return role === "brewery_admin";
}

export default function MashWaterPage() {
  const locale = useLocale();
  const tWater = useTranslations("recipes.water.common");
  const t = useTranslations("recipes.water.mash");
  const tEdit = useTranslations("recipes.edit");
  const tUnits = useTranslations("units");
  const tMath = useTranslations("math");
  const authState = useRequireAuth({ requireActiveAccount: true });
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const [me, setMe] = useState<AuthMeResponse | null>(null);

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
  const [mashStartingAlkTouched, setMashStartingAlkTouched] = useState(false);
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
  const [formatHints, setFormatHints] = useState<Record<string, { decimals?: number }> | undefined>(undefined);

  const fmt = (unitKey: string, value: unknown, fallback: number) =>
    formatWithHint(locale, value, formatHints, unitKey, fallback);

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

  const [recipe, setRecipe] = useState<RecipeResponse["recipe"] | null>(null);
  const [mashProcedure, setMashProcedure] = useState<{ name: string; grainTemperatureC: number } | null>(null);
  const [mashRows, setMashRows] = useState<EditorMashStep[]>([]);
  const [mashStepsDirty, setMashStepsDirty] = useState(false);
  const [mashStepsSaveStatus, setMashStepsSaveStatus] = useState<string | null>(null);
  const [mashStepsSaveError, setMashStepsSaveError] = useState<string | null>(null);
  const [mashStepsSaving, setMashStepsSaving] = useState(false);

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
      setMe(meRes.ok ? parseAuthMeResponse(meRes.data) : null);

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
    if (authState.status !== "ready" || !recipeId) return;
    setSettingsError(null);
    try {
      const data = (await fetchRecipeWaterSettings(recipeId)) as RecipeWaterSettingsResponse;
      const s = data.settings;
      if (!s) return;

      // Adjustment selections
      setSourceProfileId(s.sourceWaterProfileId ?? "");
      // UX default: if no explicit target profile is saved yet, seed it from the saved source profile.
      // This avoids empty Target/Δ columns in the Mixed water ions table.
      setTargetProfileId(s.targetWaterProfileId ?? s.sourceWaterProfileId ?? "");
      setDilutionProfileId(s.dilutionWaterProfileId ?? "");
      setTapVolumeLiters(s.tapWaterVolumeLiters ?? 0);
      setDilutionVolumeLiters(s.dilutionWaterVolumeLiters ?? 0);

      // Mash
      const savedStartingAlk = s.mashStartingAlkalinityPpmCaCO3;
      if (typeof savedStartingAlk === "number" && Number.isFinite(savedStartingAlk)) {
        setMashStartingAlk(savedStartingAlk);
        // Treat a saved 0 as "likely unset" so we can derive from the mixed water profile.
        setMashStartingAlkTouched(savedStartingAlk !== 0);
      } else {
        setMashStartingAlk(0);
        setMashStartingAlkTouched(false);
      }
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

  useEffect(() => {
    if (!canCall || !recipeId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/recipes/${recipeId}`);
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const data = res.data as { recipe: RecipeResponse["recipe"] };
        if (cancelled) return;
        setRecipe(data.recipe);
        setMashStepsDirty(false);
      } catch (err) {
        if (!cancelled) setMashStepsSaveError(String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, recipeId]);

  const waterVolumes = useMemo(() => {
    const analysis = recipe?.analysis;
    if (!analysis) return null;
    try {
      const parsed = parseGravityAnalysisResponseV1(analysis as any);
      const preBoil = parsed?.derivations?.["analysis.pre_boil_volume"];
      if (!preBoil?.inputs) return null;
      const mashIn = preBoil.inputs.find((i: { id: string }) => i.id === "mashWaterVolumeLiters")?.value;
      const spargeIn = preBoil.inputs.find((i: { id: string }) => i.id === "spargeVolumeLiters")?.value;
      const mashL = mashIn?.kind === "number" ? mashIn.value : null;
      const spargeL = spargeIn?.kind === "number" ? spargeIn.value : null;
      return mashL != null && spargeL != null ? { mashLiters: mashL, spargeLiters: spargeL } : null;
    } catch {
      return null;
    }
  }, [recipe?.analysis]);

  useEffect(() => {
    // UX default: if the user picks a source profile but no target is selected yet,
    // default target to source so the Mixed water ions table can show Target/Δ numbers.
    if (!targetProfileId && sourceProfileId) {
      setTargetProfileId(sourceProfileId);
    }
  }, [sourceProfileId, targetProfileId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace(/^#/, "") || "";
    if (hash !== "mash-steps") return;
    const scrollToEl = () => {
      const el = document.getElementById("mash-steps");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToEl);
    });
    return () => cancelAnimationFrame(t);
  }, [recipe]);

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

  const derivedMashStartingAlkPpmCaCO3 = useMemo(() => {
    if (!mixedSourceProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(mixedSourceProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [mixedSourceProfile]);

  useEffect(() => {
    if (mashStartingAlkTouched) return;
    if (derivedMashStartingAlkPpmCaCO3 === null) return;
    // Keep it stable for display + payloads.
    const rounded = Math.round(derivedMashStartingAlkPpmCaCO3 * 100) / 100;
    setMashStartingAlk(rounded);
  }, [derivedMashStartingAlkPpmCaCO3, mashStartingAlkTouched]);

  const derivedMashWaterVolumeLiters = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    return tap + dil;
  }, [tapVolumeLiters, dilutionVolumeLiters]);

  useEffect(() => {
    if (!recipe) return;
    const r = recipe;
    if (!r?.beerJsonRecipeJson) {
      if (!mashStepsDirty) {
        setMashProcedure(null);
        setMashRows([]);
      }
      return;
    }
    const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
    const mashMerged = mergeMashDeduceFromExt(s.mash, (r as any).recipeExtJson);
    if (mashMerged && mashMerged.steps.length > 0) {
      if (!mashStepsDirty) {
        setMashProcedure({ name: mashMerged.name, grainTemperatureC: mashMerged.grainTemperatureC });
        setMashRows(mashMerged.steps);
      }
      return;
    }
    if (mashStepsDirty || mashRows.length > 0) return;
    const budget = derivedMashWaterVolumeLiters;
    if (budget > 0) {
      const step = {
        id: newMashRowId(),
        name: "Mash In",
        type: "infusion" as const,
        stepTemperatureC: 67,
        stepTimeMin: 60,
        amountL: budget,
      };
      setMashProcedure({ name: "Mash", grainTemperatureC: 20 });
      setMashRows([step]);
    } else {
      setMashProcedure(null);
      setMashRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, derivedMashWaterVolumeLiters, mashRows.length, mashStepsDirty]);

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
        setFormatHints(computed.formatHints as Record<string, { decimals?: number }> | undefined);
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
      setFormatHints(computed.formatHints as Record<string, { decimals?: number }> | undefined);
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

  const computeFirstStepAmountL = useMemo(() => {
    const otherInfusionSum = mashRows
      .slice(1)
      .filter((r) => r.deduceFromMashIn === true)
      .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
    return Math.max(0, derivedMashWaterVolumeLiters - otherInfusionSum);
  }, [mashRows, derivedMashWaterVolumeLiters]);

  const addMashStep = () => {
    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      {
        id: newMashRowId(),
        name: "",
        type: "infusion",
        stepTemperatureC: 67,
        stepTimeMin: 60,
        amountL: 0,
        deduceFromMashIn: false,
      },
    ]);
  };

  const updateMashStep = (id: string, patch: Partial<EditorMashStep>) => {
    setMashStepsDirty(true);
    if ("amountL" in patch && patch.amountL != null) {
      const idx = mashRows.findIndex((r) => r.id === id);
      const row = mashRows[idx];
      if (idx > 0) {
        if (row?.deduceFromMashIn !== true) {
          patch = { ...patch, amountL: 0 };
        } else {
          const otherSum = mashRows
            .filter((r, i) => i !== idx && i !== 0)
            .reduce((s, r) => s + (r.amountL ?? 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          patch = { ...patch, amountL: Math.min(patch.amountL as number, available) };
        }
      }
    }
    setMashRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const deleteMashStep = (id: string) => {
    setMashStepsDirty(true);
    setMashRows((prev) => prev.filter((r) => r.id !== id));
  };

  const addMashFromTemplate = (templateId: string) => {
    const tpl = MASH_TEMPLATES.find((x) => x.id === templateId);
    if (!tpl) return;
    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      ...tpl.steps.map((s) => ({
        ...s,
        id: newMashRowId(),
        deduceFromMashIn: false,
      })),
    ]);
  };

  const updateMashProcedure = (patch: { name?: string; grainTemperatureC?: number }) => {
    setMashStepsDirty(true);
    setMashProcedure((prev) => {
      const base = prev ?? { name: "Mash", grainTemperatureC: 20 };
      return { ...base, ...patch };
    });
  };

  const saveMashSteps = async () => {
    if (!canCall || !recipeId || !recipe?.beerJsonRecipeJson) return;
    setMashStepsSaveError(null);
    setMashStepsSaveStatus(null);
    setMashStepsSaving(true);
    try {
      const stepsForSave = mashRows.map((r, idx) => {
        if (r.type === "sparge" && r.name.trim().toLowerCase() === "sparge" && waterVolumes) {
          return { ...r, amountL: waterVolumes.spargeLiters };
        }
        if (idx === 0 && r.type === "infusion" && derivedMashWaterVolumeLiters > 0) {
          return { ...r, amountL: computeFirstStepAmountL };
        }
        return r;
      });
      const mash =
        mashRows.length > 0 && mashProcedure
          ? {
              name: mashProcedure.name || "Mash",
              grainTemperatureC: mashProcedure.grainTemperatureC,
              steps: stepsForSave,
            }
          : mashRows.length > 0
            ? { name: "Mash", grainTemperatureC: 20, steps: stepsForSave }
            : null;
      const mashValidation = validateMashBeforeSave(mash);
      if (!mashValidation.ok) {
        setMashStepsSaveError(mashValidation.errors);
        return;
      }
      const newDoc = replaceMashInBeerJsonDocument(recipe.beerJsonRecipeJson, mash);
      const extBase = (recipe as any).recipeExtJson && typeof (recipe as any).recipeExtJson === "object"
        ? (recipe as any).recipeExtJson
        : { version: 1 };
      const mashStepDeduceFromMashIn = Object.fromEntries(
        mashRows
          .filter((r, i) => i > 0 && r.deduceFromMashIn === true)
          .map((r) => [r.id, true] as const),
      );
      const recipeExtJson = { ...extBase, mashStepDeduceFromMashIn };
      const patchRes = await apiFetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beerJsonRecipeJson: newDoc, recipeExtJson }),
      });
      if (!patchRes.ok) throw new Error(JSON.stringify(patchRes.data));
      const reload = await apiFetch(`/api/recipes/${recipeId}`);
      if (!reload.ok) throw new Error(JSON.stringify(reload.data));
      const reloadData = reload.data as { recipe: RecipeResponse["recipe"] };
      setRecipe(reloadData.recipe);
      setMashStepsDirty(false);
      setMashStepsSaveStatus("Saved.");
    } catch (err) {
      setMashStepsSaveError(String(err));
    } finally {
      setMashStepsSaving(false);
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
      const mashOnlyRows = (s.gristRows as any[]).filter(
        (r) => (r.timingUse ?? "add_to_mash") === "add_to_mash",
      );
      rows = mashOnlyRows.map((r) => {
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
      <H1 mb="$2">{t("title")}</H1>
      <RecipeMetaLine recipeId={recipeId} enabled={authState.status === "ready"} />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/water/sparge`}>{tWater("goToSparge")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/edit#fermentables`}>{tWater("viewEditGrist")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authState.status === "error" ? (
        <ErrorBox>{authState.error}</ErrorBox>
      ) : null}

      <YStack gap="$4">
        <View className="brew-panel" aria-labelledby="adjustment-heading">
          <H2 id="adjustment-heading" mt={0}>
            {t("adjustmentHeading")}
          </H2>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Choose source/target/dilution profiles and volumes to compute a mixed starting water profile.
            Manage profiles on <Link href="/water-profiles">Water profiles</Link>.
          </SizableText>

          <XStack gap="$3" flexWrap="wrap">
            <View flex={1} minWidth={200}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="source-profile">
                Source water profile (starting water)
              </RecipeEditFieldLabel>
              <select
                id="source-profile"
                value={sourceProfileId}
                onChange={(e) => setSourceProfileId(e.target.value)}
                className="brew-recipe-edit-select brew-recipe-edit-select-full"
              >
                {waterProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.scope}/{p.verificationStatus}]
                  </option>
                ))}
              </select>
              </YStack>
            </View>
            <View flex={1} minWidth={200}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="target-profile">
                Target water profile
              </RecipeEditFieldLabel>
              <select
                id="target-profile"
                value={targetProfileId}
                onChange={(e) => setTargetProfileId(e.target.value)}
                className="brew-recipe-edit-select brew-recipe-edit-select-full"
              >
                {waterProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.scope}/{p.verificationStatus}]
                  </option>
                ))}
              </select>
              </YStack>
            </View>
            <View flex={1} minWidth={200}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="dilution-profile">
                Dilution water profile
              </RecipeEditFieldLabel>
              <select
                id="dilution-profile"
                value={dilutionProfileId}
                onChange={(e) => setDilutionProfileId(e.target.value)}
                className="brew-recipe-edit-select brew-recipe-edit-select-full"
              >
                {dilutionProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.scope}/{p.verificationStatus}]
                  </option>
                ))}
              </select>
              </YStack>
            </View>
            <View flex={1} minWidth={200}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="tap-volume">
                {t("sourceVolumeLabel", { unit: tUnits("L") })}
              </RecipeEditFieldLabel>
              <input
                id="tap-volume"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={tapVolumeLiters}
                onChange={(e) => setTapVolumeLiters(Number(e.target.value))}
                className="brew-recipe-edit-select brew-recipe-edit-select-full"
              />
              </YStack>
            </View>
            <View flex={1} minWidth={200}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="dilution-volume">
                {t("dilutionVolumeLabel", { unit: tUnits("L") })}
              </RecipeEditFieldLabel>
              <input
                id="dilution-volume"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={dilutionVolumeLiters}
                onChange={(e) => setDilutionVolumeLiters(Number(e.target.value))}
                className="brew-recipe-edit-select brew-recipe-edit-select-full"
              />
              </YStack>
            </View>
          </XStack>

          <XStack gap="$3" mt="$3" alignItems="center">
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void refreshProfiles()} disabled={!canCall || loadingProfiles}>
              {loadingProfiles ? "Reloading…" : "Reload water profiles"}
            </Button>
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveAdjustment()} disabled={!canCall || savingAdjustment}>
              {savingAdjustment ? "Saving…" : "Save profile and volumes"}
            </Button>
            {adjustmentSaveStatus ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
                {adjustmentSaveStatus}
              </SizableText>
            ) : null}
          </XStack>

          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
            {t("adjustmentHint")}
          </SizableText>

          {mixedSourceProfile ? (
            <details className="brew-field-block brew-field-block--readonly brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <strong>Mixed water ions</strong>
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
          ) : null}

          {profilesError ? (
            <ErrorBox mt="$3">{profilesError}</ErrorBox>
          ) : null}
        </View>

        <View className="brew-panel" aria-labelledby="grist-summary-heading">
          <H2 id="grist-summary-heading" mt={0}>
            {t("gristSummaryHeading")}
          </H2>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("gristSummaryHelp")}
          </SizableText>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
            {t("lateExtractExcludedNote")}
          </SizableText>
          <ul className="brew-list-mt0">
            <li>
              Rows: <code>{gristImportedRows.length}</code> · Total: <code>{fmt("kg", gristTotalKg, 2)}</code> {tUnits("kg")}
            </li>
            <li>
              Snapshot imported at: <code>{gristImportedAt ?? "—"}</code>
            </li>
            <li>
              Source recipe updated at: <code>{gristSourceRecipeUpdatedAt ?? "—"}</code>
            </li>
          </ul>
          <XStack gap="$3" alignItems="center">
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onImportGristFromRecipe()} disabled={!canCall || importingGrist}>
              {importingGrist ? "Importing…" : "Import/update grist snapshot"}
            </Button>
            <Link href={`/recipes/${recipeId}/edit#fermentables`}>View/edit grist in recipe</Link>
            {gristImportStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{gristImportStatus}</SizableText> : null}
          </XStack>
          {gristImportError ? (
            <ErrorBox mt="$3">{gristImportError}</ErrorBox>
          ) : null}
        </View>

        <View className="brew-panel" aria-labelledby="mash-heading">
          <H2 id="mash-heading" mt={0}>
            {t("acidificationHeading")}
          </H2>

          <form onSubmit={onSubmitMash} aria-describedby={mashError ? "mash-error" : undefined}>
            <ModeFieldset
              legend="Mode"
              name="mash-acid-mode"
              value={mashAcidificationMode}
              onChange={(v) => setMashAcidificationMode(v)}
              options={[
                { value: "targetPh", label: "Target mash pH (compute required acid)" },
                { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
              ]}
            />

            <XStack gap="$3" flexWrap="wrap">
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-starting-alk">
                  {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
                </RecipeEditFieldLabel>
                <input
                  id="mash-starting-alk"
                  type="number"
                  inputMode="decimal"
                  value={mashStartingAlk}
                  onChange={(e) => {
                    setMashStartingAlkTouched(true);
                    const n = Number(e.target.value);
                    setMashStartingAlk(Number.isFinite(n) ? n : 0);
                  }}
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
                />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-volume-l">
                  {t("mashWaterVolumeLabel", { unit: tUnits("L") })}
                </RecipeEditFieldLabel>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
                  Derived from Water adjustment volumes above (Source + Dilution).
                </SizableText>
                <input
                  id="mash-volume-l"
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  value={derivedMashWaterVolumeLiters}
                  readOnly
                  tabIndex={-1}
                  disabled
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
                />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-starting-ph">
                  Starting pH
                </RecipeEditFieldLabel>
                <input
                  id="mash-starting-ph"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={mashStartingPh}
                  onChange={(e) => setMashStartingPh(Number(e.target.value))}
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
                />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-target-ph">
                  Target pH
                </RecipeEditFieldLabel>
                <input
                  id="mash-target-ph"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={mashTargetPh}
                  onChange={(e) => setMashTargetPh(Number(e.target.value))}
                  disabled={mashAcidificationMode === "manual"}
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
                />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-acid-type">
                  Acid type
                </RecipeEditFieldLabel>
                <select
                  id="mash-acid-type"
                  value={mashAcidType}
                  onChange={(e) => setMashAcidType(e.target.value)}
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
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
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-strength-kind">
                  Strength kind
                </RecipeEditFieldLabel>
                <select
                  id="mash-strength-kind"
                  value={mashStrengthKind}
                  onChange={(e) => setMashStrengthKind(e.target.value as any)}
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
                >
                  <option value="percent">Percent (%)</option>
                  <option value="normality">Normality (N)</option>
                  <option value="molarity">Molarity (M)</option>
                  <option value="solid">Solid (pure)</option>
                </select>
                </YStack>
              </View>
              <View width="100%" flexBasis="100%">
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-strength-value">
                  Strength value {mashStrengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
                </RecipeEditFieldLabel>
                <input
                  id="mash-strength-value"
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  value={mashStrengthValue}
                  onChange={(e) => setMashStrengthValue(Number(e.target.value))}
                  disabled={mashStrengthKind === "solid"}
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
                />
                </YStack>
              </View>
              {mashAcidificationMode === "manual" ? (
                <View width="100%" flexBasis="100%">
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-manual-acid-added">
                    Acid added ({mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                  </RecipeEditFieldLabel>
                  <input
                    id="mash-manual-acid-added"
                    type="number"
                    inputMode="decimal"
                    step={0.1}
                    value={mashManualAcidAdded}
                    onChange={(e) => setMashManualAcidAdded(Number(e.target.value))}
                    className="brew-recipe-edit-select brew-recipe-edit-select-full"
                  />
                  </YStack>
                </View>
              ) : null}
            </XStack>

            <XStack gap="$3" mt="$3" alignItems="center">
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveMashInputs()} disabled={!canCall || savingMash}>
                {savingMash ? "Saving…" : "Save mash draft"}
              </Button>
              <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={!canCall || mashSubmitting}>
                {mashSubmitting
                  ? "Working…"
                  : mashAcidificationMode === "manual"
                    ? "Estimate & save snapshot"
                    : "Calculate & save snapshot"}
              </Button>
            </XStack>

            {mashError ? (
              <ErrorBox id="mash-error" mt="$3">{mashError}</ErrorBox>
            ) : null}
          </form>

          {mashAcidificationMode === "targetPh" && mashResult ? (
            <div mt="$3">
              <H3 mt={0}>{t("resultLastCalculated")}</H3>
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
                    : <code>{fmt("mL", mashResult.acidRequiredMl, 0)}</code> {tUnits("mL")}{" "}
                    {mashResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{fmt("mL", mashResult.acidRequiredTsp, 0)}</code> {tUnits("tsp")})
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
                    : <code>{fmt("g", mashResult.acidRequiredGrams, 0)}</code> {tUnits("g")}{" "}
                    {mashResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{fmt("kg", mashResult.acidRequiredKg, 2)}</code> {tUnits("kg")})
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
                            overallDerivation,
                            acidDerivation,
                          },
                          units: {
                            L: tUnits("L"),
                            ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                            ppm: tUnits("ppm"),
                            LPerKg: tUnits("LPerKg"),
                          },
                        })}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  })() : null}
                  : <code>{fmt("ppm_as_CaCO3", mashResult.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
                <li>
                  Sulfate added: <code>{fmt("ppm", mashResult.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
                <li>
                  Chloride added: <code>{fmt("ppm", mashResult.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
              </ul>
            </div>
          ) : null}

          {mashAcidificationMode === "manual" && mashManualResult ? (
            <details className="brew-field-block brew-field-block--computed" mt="$3">
              <summary className="brew-field-block-header brew-details-summary">
                <strong>Result (manual acid amount mode)</strong>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Estimated from manual acid amount</SizableText>
              </summary>
              <ul>
                <li>
                  Estimated achieved pH: <code>{fmt("pH", mashManualResult.achievedPh, 2)}</code>
                </li>
                {Number.isFinite(mashManualResult.targetAmount) && Number.isFinite(mashManualResult.predictedAmount) ? (
                  <li>
                    Acid amount: <code>{fmt(mashStrengthKind === "solid" ? "g" : "mL", mashManualResult.targetAmount, 0)}</code> {mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")} (solver check:{" "}
                    <code>{fmt(mashStrengthKind === "solid" ? "g" : "mL", mashManualResult.predictedAmount, 0)}</code>)
                  </li>
                ) : null}
                <li>
                  Final alkalinity: <code>{fmt("ppm_as_CaCO3", mashManualResult.predicted.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
                <li>
                  Sulfate added: <code>{fmt("ppm", mashManualResult.predicted.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
                <li>
                  Chloride added: <code>{fmt("ppm", mashManualResult.predicted.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
              </ul>
            </details>
          ) : null}

          <View height={1} bg="var(--border)" my="$4" />

          <H3 mt={0}>{t("saltAdditionsManualV0")}</H3>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Base profile is the mixed source water above. Add salts in grams; we compute resulting ions (ppm).
          </SizableText>

          <SaltAdditionsEditor
            rows={saltAdditions}
            onChange={setSaltAdditions}
            idPrefix="mash"
            disabled={!canCall}
          />

          <XStack gap="$3" mt="$3" alignItems="center">
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSaltAdditions()} disabled={!canCall || savingSalts}>
              {savingSalts ? "Saving…" : "Save salts draft"}
            </Button>
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
              {saltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
            </Button>
            {saltsStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{saltsStatus}</SizableText> : null}
            {saltsSaveStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{saltsSaveStatus}</SizableText> : null}
            {saltsCalcSaveStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{saltsCalcSaveStatus}</SizableText> : null}
          </XStack>

          {saltsError ? (
            <ErrorBox mt="$3">{saltsError}</ErrorBox>
          ) : null}

          {saltsResult ? (
            <details className="brew-field-block brew-field-block--computed" mt="$3">
              <summary className="brew-field-block-header brew-details-summary">
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
                  Does not consider acid; see &quot;Overall mash water result&quot; for combined output
                </SizableText>
              </summary>
              <View className="brew-table-wrap">
                <table className="brew-table">
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
                          <td align="right">{fmt("ppm", after, 0)}</td>
                          <td align="right">{target === null ? "—" : fmt("ppm", target, 0)}</td>
                          <td align="right">{delta === null ? "—" : fmt("ppm", delta, 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </View>
            </details>
          ) : null}

          <View height={1} bg="var(--border)" my="$4" />

<H3 id="overall-mash-water-result" mt={0}>
                {t("overallResultHeading")}
              </H3>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Click <strong>Preview overall</strong> to preview, or <strong>Calculate &amp; save overall snapshot</strong> to persist a snapshot.
          </SizableText>
          <XStack gap="$3" alignItems="center" flexWrap="wrap">
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateOverall(false)} disabled={!canCall || savingOverall}>
              {savingOverall ? "Calculating…" : "Preview overall"}
            </Button>
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateOverall(true)} disabled={!canCall || savingOverall}>
              {savingOverall ? "Calculating…" : "Calculate & save overall snapshot"}
            </Button>
            {overallStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{overallStatus}</SizableText> : null}
            {overallSaveStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{overallSaveStatus}</SizableText> : null}
          </XStack>
          {overallError ? (
            <ErrorBox mt="$3">{overallError}</ErrorBox>
          ) : null}

          {overallResult ? (
            <View className="brew-field-block brew-field-block--computed brew-mt3">
              <View className="brew-field-block-header">
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
                  Mash water volume: <code>{fmt("L", derivedMashWaterVolumeLiters, 2)}</code> {tUnits("L")}
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
                            overallDerivation,
                            acidDerivation,
                          },
                          units: {
                            L: tUnits("L"),
                            ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                            ppm: tUnits("ppm"),
                            LPerKg: tUnits("LPerKg"),
                          },
                        })}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  })() : null}
                  : <code>{fmt("ppm_as_CaCO3", overallResult.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
              </ul>
              <View className="brew-table-wrap-mt">
                <table className="brew-table">
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
                        <td align="right">{fmt("ppm", v, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </View>
            </View>
          ) : null}
        </View>

        <View id="mash-steps" className="brew-panel" aria-labelledby="mash-steps-heading">
          <H2 id="mash-steps-heading" mt={0}>
            {t("mashStepsHeading")}
          </H2>
          {mashStepsSaveError ? (
            <ErrorBox mb="$3">{mashStepsSaveError}</ErrorBox>
          ) : null}
          <MashStepsEditor
            mashRows={mashRows}
            mashProcedure={mashProcedure}
            waterVolumes={waterVolumes}
            mashWaterBudgetLiters={derivedMashWaterVolumeLiters > 0 ? derivedMashWaterVolumeLiters : null}
            firstStepAmountComputed={
              derivedMashWaterVolumeLiters > 0 && mashRows[0]?.type === "infusion"
                ? computeFirstStepAmountL
                : null
            }
            hideSpargeFromTypeOptions
            recipeId={recipeId}
            readOnly={false}
            onUpdateProcedure={updateMashProcedure}
            onUpdateStep={updateMashStep}
            onAddStep={addMashStep}
            onDeleteStep={deleteMashStep}
            onAddFromTemplate={addMashFromTemplate}
            onSave={saveMashSteps}
            canSave={canCall && !!recipe?.beerJsonRecipeJson}
            saving={mashStepsSaving}
            saveStatus={mashStepsSaveStatus}
            t={tEdit}
            tUnits={tUnits}
            locale={locale}
            formatFixed={formatFixed}
          />
        </View>

        {savingError ? (
          <ErrorBox mt="$3">{savingError}</ErrorBox>
        ) : null}
        {settingsError ? (
          <ErrorBox mt="$3">{settingsError}</ErrorBox>
        ) : null}

        {!admin ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Only <code>owner</code> and <code>brewery_admin</code> can manage water profiles. Current role:{" "}
            <code>{me?.role ?? "—"}</code>
          </SizableText>
        ) : null}
      </YStack>
    </>
  );
}

