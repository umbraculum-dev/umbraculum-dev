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
import { apiFetch, type WaterProfilesResponse } from "../_lib/api";
import type { IonProfilePpm } from "../_lib/waterChem";
import { bicarbonatePpmToAlkalinityPpmCaCO3, combineAfterSaltsAndAcid } from "../_lib/waterChem";
import { mathExplain } from "../_lib/mathExplain";
import { buildWaterMathBody } from "../_lib/mathBodies";
import { parseSpargeComputeAndSaveResponse } from "../_lib/parseWaterComputeAndSave";
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
      setProfiles(profRes.data as WaterProfilesResponse);
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

      setStartingAlk(s.spargeStartingAlkalinityPpmCaCO3 ?? 0);
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
    <div className="fieldBlock fieldBlock--readonly" style={{ marginTop: 12 }}>
      <div className="fieldBlockHeader">
        <strong>Selected profile info</strong>
        <span className="fieldBadge">Read-only</span>
        <span className="muted">From selected profile</span>
      </div>
      <span className="muted">
        Bicarbonate: <code>{selectedSpargeProfile.bicarbonate.toFixed(2)}</code> ppm {" · "}Estimated alkalinity:{" "}
        <code>{bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate).toFixed(2)}</code> ppm as CaCO3{" "}
        {" · "}pH: {selectedSpargeProfile.ph == null ? <span className="muted">—</span> : <code>{selectedSpargeProfile.ph.toFixed(2)}</code>}
      </span>
      <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            setStartingAlk(bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate));
            setStartingPh(selectedSpargeProfile.ph == null ? "" : String(selectedSpargeProfile.ph));
          }}
          disabled={!canCall}
        >
          Use profile alkalinity + pH
        </button>
        <span className="muted">If profile pH is missing, we clear Starting pH so you can enter it.</span>
      </div>
    </div>
  ) : (
    <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
      (Optional) Select a sparge water profile; you can then apply its alkalinity to the input.
    </p>
  );

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <RecipeMetaLine recipeId={recipeId} enabled={authed} />
      <SurfaceMathToggleRow
        left={
          <p style={{ margin: 0 }}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/water/mash`}>{tWater("goToMash")}</Link>
          </p>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        style={{ marginTop: 0, marginBottom: 8 }}
      />

      {authChecked && !canCall ? (
        <p role="alert" className="errorBox">
          {tWater.rich("notAuthenticated", {
            signIn: (chunks) => <Link href={`/login?next=/${locale}/recipes/${recipeId}/water/sparge`}>{chunks}</Link>,
          })}
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel" aria-labelledby="sparge-heading">
          <h2 id="sparge-heading" style={{ marginTop: 0 }}>
            {t("acidificationHeading")}
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
                {selectedSpargeProfileInfo}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
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
                <label htmlFor="strength-kind" className="muted" style={{ display: "block", fontSize: 12 }}>
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
                <label htmlFor="strength-value" className="muted" style={{ display: "block", fontSize: 12 }}>
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
                  <label htmlFor="sparge-manual-acid-added" className="muted" style={{ display: "block", fontSize: 12 }}>
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
                    ? "Estimate & save snapshot"
                    : "Calculate & save snapshot"}
              </button>
              <button type="button" onClick={() => void onSaveSpargeInputs()} disabled={!canCall || savingSparge}>
                {savingSparge ? "Saving…" : "Save sparge draft"}
              </button>
              {spargeStatus ? <span className="muted" role="status" aria-live="polite">{spargeStatus}</span> : null}
              {spargeSaveStatus ? <span className="muted" role="status" aria-live="polite">{spargeSaveStatus}</span> : null}
              {calcSaveStatus ? <span className="muted" role="status" aria-live="polite">{calcSaveStatus}</span> : null}
            </div>

            {spargeError ? (
              <pre id="sparge-error" className="errorBox" role="alert" style={{ marginTop: 12 }}>
                {spargeError}
              </pre>
            ) : null}
          </form>

          {spargeAcidificationMode === "targetPh" && spargeResult ? (
            <div className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <div className="fieldBlockHeader">
                <strong>Result</strong>
                <span className="fieldBadge">Computed</span>
                <span className="muted">From current inputs</span>
              </div>
              <h3 style={{ marginTop: 0 }}>{t("resultLastCalculated")}</h3>
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
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      );
                    })() : null}
                    : <code>{spargeResult.acidRequiredMl.toFixed(3)}</code> mL{" "}
                    {spargeResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{spargeResult.acidRequiredTsp.toFixed(3)}</code> tsp)
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
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      );
                    })() : null}
                    : <code>{spargeResult.acidRequiredGrams.toFixed(3)}</code> g{" "}
                    {spargeResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{spargeResult.acidRequiredKg.toFixed(6)}</code> kg)
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
                        })}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  })() : null}
                  : <code>{spargeResult.finalAlkalinityPpmCaCO3.toFixed(3)}</code> ppm as CaCO3
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
            <details className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
                <strong>Result (manual acid amount mode)</strong>
                <span className="fieldBadge">Computed</span>
                <span className="muted">Estimated from manual acid amount</span>
              </summary>
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
                  Final alkalinity: <code>{spargeManualResult.predicted.finalAlkalinityPpmCaCO3.toFixed(3)}</code> ppm as CaCO3
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
            </details>
          ) : null}

          <hr style={{ margin: "16px 0" }} />

          <h3 style={{ marginTop: 0 }}>{t("saltAdditionsManualV0")}</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            {t("saltAdditionsHelp")}
          </p>

          <SaltAdditionsEditor
            rows={spargeSaltAdditions}
            onChange={setSpargeSaltAdditions}
            idPrefix="sparge"
            disabled={!canCall}
          />

          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => void onSaveSpargeSaltsInputs()} disabled={!canCall || savingSpargeSalts}>
              {savingSpargeSalts ? "Saving…" : "Save salts draft"}
            </button>
            <button type="button" onClick={() => void onCalculateSpargeSalts()} disabled={!canCall || spargeSaltsSubmitting || !selectedSpargeProfile}>
              {spargeSaltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
            </button>
            {spargeSaltsStatus ? <span className="muted" role="status" aria-live="polite">{spargeSaltsStatus}</span> : null}
            {spargeSaltsSaveStatus ? <span className="muted" role="status" aria-live="polite">{spargeSaltsSaveStatus}</span> : null}
            {spargeSaltsCalcSaveStatus ? <span className="muted" role="status" aria-live="polite">{spargeSaltsCalcSaveStatus}</span> : null}
          </div>

          {spargeSaltsError ? <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>{spargeSaltsError}</pre> : null}

          {spargeSaltsResult ? (
            <details className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
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
                      })}
                      ariaLabel={tMath("fxLabel", { topic: title })}
                    />
                  );
                })() : null}
                <span className="fieldBadge">Computed</span>
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
                        <td align="left">{after.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}

          {spargeSaltsResult && spargeResult ? (
            <div className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <div className="fieldBlockHeader">
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
                      })}
                      ariaLabel={tMath("fxLabel", { topic: title })}
                    />
                  );
                })() : null}
                <span className="fieldBadge">Computed</span>
                <span className="muted">
                  Heuristic: Ca/Mg from salts reduce effective alkalinity, so salts can modestly change acid required.
                  {surfaceMath ? (() => {
                    const ex = mathExplain["sparge.alkalinityHeuristic"];
                    const title = tMath(ex.titleKey);
                    return (
                      <span style={{ marginLeft: 6 }}>
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "sparge.alkalinityHeuristic",
                            tMath,
                            locale,
                            ctx: { acidDerivation },
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      </span>
                    );
                  })() : null}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                          <td align="left">{v.toFixed(2)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>

        {profilesError ? <pre className="errorBox" role="alert">{profilesError}</pre> : null}
        {settingsError ? <pre className="errorBox" role="alert">{settingsError}</pre> : null}
        {savingError ? <pre className="errorBox" role="alert">{savingError}</pre> : null}
      </div>
    </>
  );
}

