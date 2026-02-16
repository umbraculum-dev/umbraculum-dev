"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadDevAuthFromStorage, type DevAuth } from "../../../../_lib/devAuth";
import { ModeFieldset } from "../_components/ModeFieldset";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "../_components/SaltAdditionsEditor";
import { apiFetch, type WaterProfilesResponse } from "../_lib/api";
import type { IonProfilePpm } from "../_lib/waterChem";
import { bicarbonatePpmToAlkalinityPpmCaCO3, combineAfterSaltsAndAcid } from "../_lib/waterChem";
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
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const [authLoaded, setAuthLoaded] = useState(false);
  const [auth, setAuth] = useState<DevAuth | null>(null);

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
    if (!auth?.userId || !auth.activeAccountId) return;
    await saveRecipeWaterSettings(recipeId, auth, patch);
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
          calciumPpm: spargeCalciumPpm,
          magnesiumPpm: spargeMagnesiumPpm,
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

          spargeLastAcidRequiredMl: manual.predicted.acidRequiredMl,
          spargeLastAcidRequiredTsp: manual.predicted.acidRequiredTsp,
          spargeLastAcidRequiredGrams: manual.predicted.acidRequiredGrams,
          spargeLastAcidRequiredKg: manual.predicted.acidRequiredKg,
          spargeLastFinalAlkalinityPpmCaCO3: manual.predicted.finalAlkalinityPpmCaCO3,
          spargeLastSulfateAddedPpm: manual.predicted.sulfateAddedPpm,
          spargeLastChlorideAddedPpm: manual.predicted.chlorideAddedPpm,
          spargeLastCalculatedAt: nowIso,

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
          calciumPpm: spargeCalciumPpm,
          magnesiumPpm: spargeMagnesiumPpm,
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

  const onSaveSpargeSaltsInputs = async () => {
    setSavingError(null);
    setSpargeSaltsSaveStatus(null);
    setSavingSpargeSalts(true);
    try {
      await saveSettings({ spargeSaltAdditionsJson: spargeSaltAdditions });
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
      if (!selectedSpargeProfile) throw new Error("Select a sparge water profile first (base ion profile).");
      if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) throw new Error("Water volume must be > 0.");

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
      <h1 style={{ marginBottom: 8 }}>Sparge water</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Recipe ID: <code>{recipeId}</code>
      </p>
      <p style={{ marginTop: 0 }}>
        <Link href={`/recipes/${recipeId}/water`}>Back to water hub</Link> {" · "}
        <Link href={`/recipes/${recipeId}/water/mash`}>Go to mash</Link>
      </p>

      {authLoaded && !canCall ? (
        <p role="alert" className="errorBox">
          Missing dev headers. Go to the dashboard and click <strong>Save headers</strong> (User + Active account),
          then come back here.
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
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
                {spargeSubmitting ? "Working…" : spargeAcidificationMode === "manual" ? "Estimate + Save result" : "Calculate + Save result"}
              </button>
              <button type="button" onClick={() => void onSaveSpargeInputs()} disabled={!canCall || savingSparge}>
                {savingSparge ? "Saving…" : "Save sparge inputs"}
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
                  Final alkalinity: <code>{spargeResult.finalAlkalinityPpmCaCO3.toFixed(3)}</code> ppm as CaCO3
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

          <h3 style={{ marginTop: 0 }}>Sparge salt additions (manual, v0)</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Base profile is the selected sparge water profile above. Add salts in grams; we compute resulting ions (ppm) for the sparge water volume.
          </p>

          <SaltAdditionsEditor
            rows={spargeSaltAdditions}
            onChange={setSpargeSaltAdditions}
            idPrefix="sparge"
            disabled={!canCall}
          />

          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => void onSaveSpargeSaltsInputs()} disabled={!canCall || savingSpargeSalts}>
              {savingSpargeSalts ? "Saving…" : "Save sparge salt additions"}
            </button>
            <button type="button" onClick={() => void onCalculateSpargeSalts()} disabled={!canCall || spargeSaltsSubmitting || !selectedSpargeProfile}>
              {spargeSaltsSubmitting ? "Calculating…" : "Calculate + Save sparge salts result"}
            </button>
            {spargeSaltsStatus ? <span className="muted" role="status" aria-live="polite">{spargeSaltsStatus}</span> : null}
            {spargeSaltsSaveStatus ? <span className="muted" role="status" aria-live="polite">{spargeSaltsSaveStatus}</span> : null}
            {spargeSaltsCalcSaveStatus ? <span className="muted" role="status" aria-live="polite">{spargeSaltsCalcSaveStatus}</span> : null}
          </div>

          {spargeSaltsError ? <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>{spargeSaltsError}</pre> : null}

          {spargeSaltsResult ? (
            <details className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
                <strong>Resulting ions (after sparge salts only, v0)</strong>
                <span className="fieldBadge">Computed</span>
              </summary>
              <div style={{ overflowX: "auto" }}>
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
            <div className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
              <div className="fieldBlockHeader">
                <strong>Resulting ions (after sparge salts + acid, v0, HCO3 derived from alkalinity)</strong>
                <span className="fieldBadge">Computed</span>
                <span className="muted">
                  Heuristic: Ca/Mg from salts reduce effective alkalinity, so salts can modestly change acid required.
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="right">After salts + acid (ppm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const combined = combineAfterSaltsAndAcid({
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
                          <td align="right">{v.toFixed(2)}</td>
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

