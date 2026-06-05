/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "../../../../../_lib/useRequireAuth";
import { parseGristJson, type GristRow } from "../../../../../_lib/grist";
import {
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  replaceMashInBeerJsonDocument,
  validateMashBeforeSave,
  MASH_TEMPLATES,
  newMashRowId,
  type EditorMashStep,
} from "../../../../_lib/beerjsonRecipe";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import {
  calcMashOverall,
  calcSaltAdditions,
  computeAndSaveMash,
  estimateMashPh,
  getRecipe,
  listWaterProfiles,
  patchRecipe,
} from "@umbraculum/api-client/brewery";
import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { fetchAuthMe } from "../../../../../_lib/fetchAuthMe";
import type { AuthMeResponse, WaterProfilesResponse } from "@umbraculum/contracts";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import type { IonProfilePpm } from "../../_lib/waterChem";
import {
  bicarbonatePpmToAlkalinityPpmCaCO3,
  mixIonProfilesByVolume,
} from "../../_lib/waterChem";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/contracts";
import type { WaterCalcDerivation } from "@umbraculum/contracts";
import { asRecord } from "../../../../../_lib/typeGuards";
import { DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";
import { formatFixed, formatWithHint } from "../../../../../../src/i18n/format";
import { fetchRecipeWaterSettings, saveRecipeWaterSettings } from "../../_lib/waterSettings";

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


export function useWaterMashPage() {
  const locale = useLocale();
  const tWater = useTranslations("recipes.water.common");
  const t = useTranslations("recipes.water.mash");
  const tEdit = useTranslations("recipes.edit");
  const tUnits = useTranslations("units");
  const tMath = useTranslations("math");
  const authState = useRequireAuth({ requireActiveWorkspace: true });
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

  const [me, setMe] = useState<AuthMeResponse | null>(null);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [savingError, setSavingError] = useState<string | null>(null);

  const [adjustmentSaveStatus, setAdjustmentSaveStatus] = useState<string | null>(null);
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  const [mashError, setMashError] = useState<string | null>(null);
  const [_mashStatus, setMashStatus] = useState<string | null>(null);
  const [_mashManualStatus, setMashManualStatus] = useState<string | null>(null);
  const [mashSaveStatus, setMashSaveStatus] = useState<string | null>(null);
  const [mashCalcSaveStatus, setMashCalcSaveStatus] = useState<string | null>(null);
  const [mashSubmitting, setMashSubmitting] = useState(false);
  const [savingMash, setSavingMash] = useState(false);
  const [mashResult, setMashResult] = useState<MashResult | null>(null);
  const [mashManualResult, setMashManualResult] = useState<MashManualCalcResult | null>(null);

  const [mashStartingAlk, setMashStartingAlk] = useState(0);
  const [mashStartingAlkTouched, setMashStartingAlkTouched] = useState(false);
  const [mashStartingPh, setMashStartingPh] = useState(7.0);
  const [mashTargetPh, setMashTargetPh] = useState(DEFAULT_MASH_TARGET_PH);
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
  const [saltsDerivation, setSaltsDerivation] = useState<WaterCalcDerivation | null>(null);
  const [acidDerivation, setAcidDerivation] = useState<WaterCalcDerivation | null>(null);
  const [overallDerivation, setOverallDerivation] = useState<WaterCalcDerivation | null>(null);

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
  const [openMashSections, setOpenMashSections] = useState<string[]>(["adjustment"]);
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
      const meRes = await fetchAuthMe();
      setMe(meRes.ok ? meRes.data : null);

      const profilesRes = await listWaterProfiles(webBreweryApiClient());
      setProfiles(profilesRes);
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
      const data = (await fetchRecipeWaterSettings(recipeId));
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
      setMashTargetPh(s.mashTargetPh ?? DEFAULT_MASH_TARGET_PH);
      setMashAcidType(s.mashAcidType ?? "lactic");

      const rawStrengthKind = s.mashStrengthKind;
      const savedKind: "percent" | "normality" | "molarity" | "solid" =
        rawStrengthKind === "percent" ||
        rawStrengthKind === "normality" ||
        rawStrengthKind === "molarity" ||
        rawStrengthKind === "solid"
          ? rawStrengthKind
          : "percent";
      setMashStrengthKind(savedKind);
      setMashStrengthValue(s.mashStrengthValue ?? 88);
      setMashAcidificationMode(s.mashAcidificationMode === "manual" ? "manual" : "targetPh");
      setMashManualAcidAdded(
        savedKind === "solid" ? (s.mashManualAcidAddedGrams ?? 0) : (s.mashManualAcidAddedMl ?? 0),
      );

      if (Array.isArray(s.mashSaltAdditionsJson)) {
        setSaltAdditions(s.mashSaltAdditionsJson as SaltAdditionRow[]);
      }
      const lastResult = asRecord(s.mashSaltsLastResultJson);
      if (lastResult) {
        const innerResult = asRecord(lastResult['result']);
        if (innerResult) {
          setSaltsResult(innerResult as unknown as SaltAdditionsResult);
          if (typeof lastResult['calculatedAt'] === "string") {
            setSaltsStatus(`Last calculated: ${new Date(lastResult['calculatedAt']).toLocaleString()}`);
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
      const tap = typeof s.tapWaterVolumeLiters === "number" ? s.tapWaterVolumeLiters : 0;
      const dil = typeof s.dilutionWaterVolumeLiters === "number" ? s.dilutionWaterVolumeLiters : 0;
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
    void (async () => {
      try {
        const data = await getRecipe(webBreweryApiClient(), recipeId);
        if (cancelled) return;
        setRecipe(data.recipe as RecipeResponse["recipe"]);
        setMashStepsDirty(false);
      } catch (err) {
        if (!cancelled) setMashStepsSaveError(String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
     
  }, [canCall, recipeId]);

  const waterVolumes = useMemo(() => {
    const analysis = recipe?.analysis;
    if (!analysis) return null;
    try {
      const parsed = parseGravityAnalysisResponseV1(analysis);
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
    const mashMerged = mergeMashDeduceFromExt(s.mash, r.recipeExtJson);
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
      setSaltsDerivation(data.derivation as WaterCalcDerivation);

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

  const _calcMashEstimatedPh = async (args: {
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
    const data = await estimateMashPh(webBreweryApiClient(), {
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
    });
    const resultRec = asRecord(data.result);
    return resultRec?.['estimatedMashPhRoomTemp'] as number;
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
    if (mashStrengthKind !== "solid") payload['strengthValue'] = mashStrengthValue;
    if (mashAcidificationMode === "manual") {
      Object.assign(payload, mashStrengthKind === "solid" ? { acidAddedGrams: mashManualAcidAdded } : { acidAddedMl: mashManualAcidAdded });
    }

    const data = await calcMashOverall(webBreweryApiClient(), payload);
    setOverallDerivation(data.derivation as WaterCalcDerivation);
    return data.result as MashOverallResult;
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

    return computeAndSaveMash(webBreweryApiClient(), recipeId, payload);
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
        setSaltsResult(computed.salts.result as unknown as SaltAdditionsResult);
        setSaltsDerivation(computed.salts.derivation);
        setAcidDerivation(computed.acid.derivation);
        setOverallDerivation(computed.overall.derivation);
        setOverallResult(computed.overall.result as unknown as MashOverallResult);
        setOverallStatus("Calculated.");
        if (computed.acid.kind === "mash_acidification_manual") {
          setMashManualResult(computed.acid.result);
          setMashManualStatus("Estimated (manual mode).");
          setMashResult(computed.acid.result.predicted ?? null);
          setMashCalcSaveStatus("Estimated & saved snapshot.");
        } else {
          setMashManualResult(null);
          setMashManualStatus(null);
          setMashResult(computed.acid.result);
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
      setSaltsResult(computed.salts.result as unknown as SaltAdditionsResult);
      setSaltsDerivation(computed.salts.derivation);
      setAcidDerivation(computed.acid.derivation);
      setOverallDerivation(computed.overall.derivation);
      setOverallResult(computed.overall.result as unknown as MashOverallResult);
      setOverallStatus("Calculated.");

      if (computed.acid.kind === "mash_acidification_manual") {
        setMashManualResult(computed.acid.result);
        setMashManualStatus("Estimated (manual mode).");
        setMashResult(computed.acid.result.predicted ?? null);
        setMashCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        setMashManualResult(null);
        setMashManualStatus(null);
        setMashResult(computed.acid.result);
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
    setMashRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const row = idx >= 0 ? prev[idx] : null;
      if (!row) return prev;

      let nextPatch = patch;

      // When turning off deduce, always zero the amount to avoid hidden water.
      if ("deduceFromMashIn" in nextPatch && idx > 0) {
        if (nextPatch.deduceFromMashIn !== true) {
          nextPatch = { ...nextPatch, amountL: 0 };
        } else if (row.amountL != null) {
          // When turning on deduce, clamp existing amount to remaining budget.
          const otherSum = prev
            .filter((r, i) => i !== idx && i !== 0 && r.deduceFromMashIn === true)
            .reduce((s, r) => s + (r.amountL ?? 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          nextPatch = { ...nextPatch, amountL: Math.min(row.amountL, available) };
        }
      }

      if ("amountL" in nextPatch && nextPatch.amountL != null && idx > 0) {
        // Only deduced steps can carry a non-zero Amount in the budget model.
        if ((row.deduceFromMashIn ?? false) !== true) {
          nextPatch = { ...nextPatch, amountL: 0 };
        } else {
          const otherSum = prev
            .filter((r, i) => i !== idx && i !== 0 && r.deduceFromMashIn === true)
            .reduce((s, r) => s + (r.amountL ?? 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          nextPatch = { ...nextPatch, amountL: Math.min(nextPatch.amountL, available) };
        }
      }

      return prev.map((r) => (r.id === id ? { ...r, ...nextPatch } : r));
    });
  };

  const deleteMashStep = (id: string) => {
    setMashStepsDirty(true);
    setMashRows((prev) => prev.filter((r) => r.id !== id));
  };

  const moveMashStep = (id: string, direction: "up" | "down") => {
    setMashStepsDirty(true);
    setMashRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const row = idx >= 0 ? prev[idx] : null;
      if (!row) return prev;

      const isSpargeRow = (r: EditorMashStep) => r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
      if (idx <= 0 || isSpargeRow(row)) return prev;

      const movable = prev
        .map((r, i) => ({ r, i }))
        .filter(({ r, i }) => i > 0 && !isSpargeRow(r))
        .map(({ i }) => i);
      if (!movable.length) return prev;

      const targetIdx =
        direction === "up"
          ? [...movable].reverse().find((i) => i < idx) ?? null
          : movable.find((i) => i > idx) ?? null;
      if (targetIdx == null) return prev;

      const next = prev.slice();
      const tmp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = tmp;
      return next;
    });
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
        if (idx > 0 && r.deduceFromMashIn !== true) {
          return { ...r, amountL: 0 };
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
      const extBase = asRecord(recipe.recipeExtJson) ?? { version: 1 };
      const mashStepDeduceFromMashIn = Object.fromEntries(
        mashRows
          .map((r, idx) => [String(idx), r.deduceFromMashIn === true] as const)
          .filter(([k, v]) => k !== "0" && v === true),
      );
      const recipeExtJson = { ...extBase, mashStepDeduceFromMashIn };
      await patchRecipe(webBreweryApiClient(), recipeId, { beerJsonRecipeJson: newDoc, recipeExtJson });
      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      setRecipe(reload.recipe as RecipeResponse["recipe"]);
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
      const data = await getRecipe(webBreweryApiClient(), recipeId);
      const extRec = asRecord(data.recipe.recipeExtJson);
      const mashPhModelRec = asRecord(extRec?.['mashPhModel']);

      let rows: GristRow[] = [];
      if (!data.recipe.beerJsonRecipeJson) {
        throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
      }
      const s = editorStateFromBeerJson(data.recipe.beerJsonRecipeJson);
      const mashOnlyRows = s.gristRows.filter(
        (r) => (r.timingUse ?? "add_to_mash") === "add_to_mash" && r.lateAddition !== true,
      );
      rows = mashOnlyRows.map((r) => {
        const m = r.id && mashPhModelRec ? asRecord(mashPhModelRec[r.id]) : null;
        return {
          ...r,
          mashDiPh: typeof m?.['mashDiPh'] === "number" ? m['mashDiPh'] : r.mashDiPh ?? null,
          mashTaToPh57_mEqPerKg:
            typeof m?.['mashTaToPh57_mEqPerKg'] === "number" ? m['mashTaToPh57_mEqPerKg'] : r.mashTaToPh57_mEqPerKg ?? null,
          mashRoastDehuskedOverride:
            m && "roastDehuskedOverride" in m
              ? (m['roastDehuskedOverride'] as boolean | null | undefined) ?? null
              : r.mashRoastDehuskedOverride ?? null,
        };
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
  const lateAdditionsTotalKg = useMemo(() => {
    try {
      const doc = recipe?.beerJsonRecipeJson;
      if (!doc) return 0;
      const s = editorStateFromBeerJson(doc);
      return s.gristRows.reduce((sum, r) => {
        if ((r.timingUse ?? "add_to_mash") !== "add_to_mash") return sum;
        if (r.lateAddition !== true) return sum;
        const amountKg = typeof r.amountKg === "number" && Number.isFinite(r.amountKg) ? r.amountKg : 0;
        return sum + amountKg;
      }, 0);
    } catch {
      return 0;
    }
  }, [recipe]);


  return {
    locale,
    tWater,
    t,
    tEdit,
    tUnits,
    tMath,
    authState,
    params,
    recipeId,
    loadRecipeMeta,
    me,
    setMe,
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
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
    savingAdjustment,
    setSavingAdjustment,
    mashError,
    setMashError,
    _mashStatus,
    setMashStatus,
    _mashManualStatus,
    setMashManualStatus,
    mashSaveStatus,
    setMashSaveStatus,
    mashCalcSaveStatus,
    setMashCalcSaveStatus,
    mashSubmitting,
    setMashSubmitting,
    savingMash,
    setSavingMash,
    mashResult,
    setMashResult,
    mashManualResult,
    setMashManualResult,
    mashStartingAlk,
    setMashStartingAlk,
    mashStartingAlkTouched,
    setMashStartingAlkTouched,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashManualAcidAdded,
    setMashManualAcidAdded,
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
    saltsDerivation,
    setSaltsDerivation,
    acidDerivation,
    setAcidDerivation,
    overallDerivation,
    setOverallDerivation,
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
    formatHints,
    setFormatHints,
    fmt,
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
    gristImportedRows,
    setGristImportedRows,
    gristImportedAt,
    setGristImportedAt,
    gristSourceRecipeUpdatedAt,
    setGristSourceRecipeUpdatedAt,
    gristImportStatus,
    setGristImportStatus,
    gristImportError,
    setGristImportError,
    importingGrist,
    setImportingGrist,
    recipe,
    setRecipe,
    mashProcedure,
    setMashProcedure,
    mashRows,
    setMashRows,
    mashStepsDirty,
    setMashStepsDirty,
    mashStepsSaveStatus,
    setMashStepsSaveStatus,
    mashStepsSaveError,
    setMashStepsSaveError,
    mashStepsSaving,
    setMashStepsSaving,
    canCall,
    surfaceMath,
    setSurfaceMath,
    openMashSections,
    setOpenMashSections,
    refreshProfiles,
    loadSettings,
    waterVolumes,
    allProfiles,
    waterProfiles,
    dilutionProfiles,
    selectedSource,
    selectedTarget,
    selectedDilution,
    mixedSourceProfile,
    derivedMashStartingAlkPpmCaCO3,
    derivedMashWaterVolumeLiters,
    saltDerivationForMath,
    saveSettings,
    onSaveAdjustment,
    onSaveMashInputs,
    onCalcSalts,
    onSaveSaltAdditions,
    hasNonZeroSaltAdditions,
    ensureZeroSaltsSnapshotIfMissing,
    _calcMashEstimatedPh,
    computeOverallMash,
    computeAndSaveMashSnapshots,
    onCalculateOverall,
    onSubmitMash,
    computeFirstStepAmountL,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    updateMashProcedure,
    saveMashSteps,
    onImportGristFromRecipe,
    admin,
    gristTotalKg,
    lateAdditionsTotalKg,
  };
}

export type WaterMashPageModel = ReturnType<typeof useWaterMashPage>;
