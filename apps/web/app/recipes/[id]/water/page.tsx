"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "brewery_dev_headers_v1";

type DevAuth = {
  userId: string;
  activeAccountId: string;
};

type MeResponse = { ok: true; userId: string; activeAccountId: string | null; role: string | null };

type WaterProfile = {
  id: string;
  key: string;
  scope: "system" | "account" | "public";
  type: "water" | "dilution";
  accountId: string | null;
  name: string;
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

type RecipeWaterSettings = {
  id: string;
  accountId: string;
  recipeId: string;

  sourceWaterProfileId: string | null;
  targetWaterProfileId: string | null;
  dilutionWaterProfileId: string | null;

  tapWaterVolumeLiters: number | null;
  dilutionWaterVolumeLiters: number | null;

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
};

type RecipeWaterSettingsResponse = { ok: true; settings: RecipeWaterSettings | null };

function loadAuth(): DevAuth {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        userId: "00000000-0000-0000-0000-000000000001",
        activeAccountId: "00000000-0000-0000-0000-0000000000a1",
      };
    }
    const parsed = JSON.parse(raw) as Partial<DevAuth> & { accountId?: string };
    return {
      userId: parsed.userId ?? "",
      activeAccountId: parsed.activeAccountId ?? parsed.accountId ?? "",
    };
  } catch {
    return { userId: "", activeAccountId: "" };
  }
}

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

export default function WaterCalculatorPage() {
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

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

  // liters-first inputs (v0)
  const [startingAlk, setStartingAlk] = useState(0);
  const [startingPh, setStartingPh] = useState(7.0);
  const [targetPh, setTargetPh] = useState(5.6);
  const [volumeLiters, setVolumeLiters] = useState(20);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">(
    "percent",
  );
  const [strengthValue, setStrengthValue] = useState(10);

  // admin create profile
  const [createName, setCreateName] = useState("");
  const [createScope, setCreateScope] = useState<"account" | "public">("public");
  const [createType, setCreateType] = useState<"water" | "dilution">("water");
  const [createIon, setCreateIon] = useState({
    calcium: 0,
    magnesium: 0,
    sodium: 0,
    sulfate: 0,
    chloride: 0,
    bicarbonate: 0,
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  useEffect(() => {
    setAuth(loadAuth());
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
      setStartingPh(s.spargeStartingPh ?? 7.0);
      setTargetPh(s.spargeTargetPh ?? 5.6);
      setVolumeLiters(s.spargeVolumeLiters ?? 20);
      setAcidType(s.spargeAcidType ?? "phosphoric");
      setStrengthKind((s.spargeStrengthKind as any) ?? "percent");
      setStrengthValue(s.spargeStrengthValue ?? 10);

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
    } catch (err) {
      setSettingsError(String(err));
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

  const onSaveSpargeInputs = async () => {
    setSavingError(null);
    setSpargeSaveStatus(null);
    setSavingSparge(true);
    try {
      await saveSettings({
        spargeStartingAlkalinityPpmCaCO3: startingAlk,
        spargeStartingPh: startingPh,
        spargeTargetPh: targetPh,
        spargeVolumeLiters: volumeLiters,
        spargeAcidType: acidType,
        spargeStrengthKind: strengthKind,
        spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
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

  const onSubmitSparge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.userId || !auth.activeAccountId) return;
    setSpargeError(null);
    setSpargeStatus(null);
    setCalcSaveStatus(null);
    setSpargeResult(null);
    setSpargeSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        startingAlkalinityPpmCaCO3: startingAlk,
        startingPh,
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

      // Calculate + Save Result (v0): persist inputs + snapshot.
      await saveSettings({
        spargeStartingAlkalinityPpmCaCO3: startingAlk,
        spargeStartingPh: startingPh,
        spargeTargetPh: targetPh,
        spargeVolumeLiters: volumeLiters,
        spargeAcidType: acidType,
        spargeStrengthKind: strengthKind,
        spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
        spargeLastAcidRequiredMl: result.acidRequiredMl,
        spargeLastAcidRequiredTsp: result.acidRequiredTsp,
        spargeLastAcidRequiredGrams: result.acidRequiredGrams,
        spargeLastAcidRequiredKg: result.acidRequiredKg,
        spargeLastFinalAlkalinityPpmCaCO3: result.finalAlkalinityPpmCaCO3,
        spargeLastSulfateAddedPpm: result.sulfateAddedPpm,
        spargeLastChlorideAddedPpm: result.chlorideAddedPpm,
        spargeLastCalculatedAt: new Date().toISOString(),
      });
      setSpargeStatus("Calculated.");
      setCalcSaveStatus("Calculated and saved.");
    } catch (err) {
      setSpargeError(String(err));
    } finally {
      setSpargeSubmitting(false);
    }
  };

  const onCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.userId || !auth.activeAccountId) return;
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const res = await apiFetch("/api/water-profiles", auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: createScope,
          type: createType,
          name: createName,
          ...createIon,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      setCreateName("");
      setCreateIon({
        calcium: 0,
        magnesium: 0,
        sodium: 0,
        sulfate: 0,
        chloride: 0,
        bicarbonate: 0,
      });
      await refresh();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const onToggleVerify = async (p: WaterProfile) => {
    if (!auth?.userId || !auth.activeAccountId) return;
    const action = p.verificationStatus === "verified" ? "unverify" : "verify";
    await apiFetch(`/api/water-profiles/${p.id}/${action}`, auth, { method: "POST" });
    await refresh();
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

  const admin = isAdmin(me?.role ?? null);

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>Water calculator</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Recipe ID: <code>{recipeId}</code>
      </p>

      {!canCall ? (
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
                  onChange={(e) => setStartingPh(Number(e.target.value))}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
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
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <button type="submit" disabled={!canCall || spargeSubmitting}>
                {spargeSubmitting ? "Calculating…" : "Calculate + Save result"}
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

          {spargeResult ? (
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
            </div>
          ) : null}
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

          <details style={{ marginTop: 12 }}>
            <summary>View all profiles (table)</summary>
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th align="left">Name</th>
                    <th align="left">Scope</th>
                    <th align="left">Verified</th>
                    <th align="right">Ca</th>
                    <th align="right">Mg</th>
                    <th align="right">Na</th>
                    <th align="right">SO4</th>
                    <th align="right">Cl</th>
                    <th align="right">HCO3</th>
                  </tr>
                </thead>
                <tbody>
                  {allProfiles.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td className="muted">{p.scope}</td>
                      <td className="muted">{p.verificationStatus}</td>
                      <td align="right">{p.calcium}</td>
                      <td align="right">{p.magnesium}</td>
                      <td align="right">{p.sodium}</td>
                      <td align="right">{p.sulfate}</td>
                      <td align="right">{p.chloride}</td>
                      <td align="right">{p.bicarbonate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        {admin ? (
          <section className="panel" aria-labelledby="admin-profiles-heading">
            <h2 id="admin-profiles-heading" style={{ marginTop: 0 }}>
              Admin: add water profile
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Created profiles start as <code>unverified</code>. Use the verify toggle below.
            </p>

            <form onSubmit={onCreateProfile} aria-describedby={createError ? "create-error" : undefined}>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="create-name"
                    className="muted"
                    style={{ display: "block", fontSize: 12 }}
                  >
                    Profile name
                  </label>
                  <input
                    id="create-name"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-scope"
                    className="muted"
                    style={{ display: "block", fontSize: 12 }}
                  >
                    Scope
                  </label>
                  <select
                    id="create-scope"
                    value={createScope}
                    onChange={(e) => setCreateScope(e.target.value as any)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="public">Public</option>
                    <option value="account">Account</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="create-type"
                    className="muted"
                    style={{ display: "block", fontSize: 12 }}
                  >
                    Type
                  </label>
                  <select
                    id="create-type"
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as any)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="water">Water</option>
                    <option value="dilution">Dilution</option>
                  </select>
                </div>
              </div>

              <fieldset style={{ border: 0, padding: 0, marginTop: 12 }}>
                <legend className="muted" style={{ fontSize: 12 }}>
                  Ions (ppm)
                </legend>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {(
                    [
                      ["calcium", "Calcium (Ca)"],
                      ["magnesium", "Magnesium (Mg)"],
                      ["sodium", "Sodium (Na)"],
                      ["sulfate", "Sulfate (SO4)"],
                      ["chloride", "Chloride (Cl)"],
                      ["bicarbonate", "Bicarbonate (HCO3)"],
                    ] as const
                  ).map(([k, label]) => (
                    <div key={k}>
                      <label htmlFor={`ion-${k}`} className="muted" style={{ display: "block", fontSize: 12 }}>
                        {label}
                      </label>
                      <input
                        id={`ion-${k}`}
                        type="number"
                        inputMode="decimal"
                        value={(createIon as any)[k]}
                        onChange={(e) =>
                          setCreateIon((prev) => ({ ...prev, [k]: Number(e.target.value) }))
                        }
                        style={{ width: "100%", padding: 8 }}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>

              <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
                <button type="submit" disabled={!createName.trim() || createSubmitting}>
                  {createSubmitting ? "Creating…" : "Create profile"}
                </button>
                <span className="muted" role="status" aria-live="polite">
                  Profiles in this section require admin privileges.
                </span>
              </div>

              {createError ? (
                <pre id="create-error" className="errorBox" role="alert" style={{ marginTop: 12 }}>
                  {createError}
                </pre>
              ) : null}
            </form>

            <h3 style={{ marginTop: 16 }}>Verify/unverify (non-system)</h3>
            <ul>
              {allProfiles
                .filter((p) => p.scope !== "system")
                .slice(0, 30)
                .map((p) => (
                  <li key={p.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span>
                      {p.name}{" "}
                      <span className="muted">
                        [{p.scope}/{p.verificationStatus}]
                      </span>
                    </span>
                    <button type="button" onClick={() => void onToggleVerify(p)}>
                      {p.verificationStatus === "verified" ? "Mark unverified" : "Mark verified"}
                    </button>
                  </li>
                ))}
            </ul>
            <p className="muted" style={{ marginBottom: 0 }}>
              (UI is capped to 30 items for now.)
            </p>
          </section>
        ) : (
          <section className="panel" aria-labelledby="admin-note-heading">
            <h2 id="admin-note-heading" style={{ marginTop: 0 }}>
              Admin actions
            </h2>
            <p className="muted" style={{ marginTop: 0, marginBottom: 0 }}>
              Only <code>owner</code> and <code>brewery_admin</code> can add/verify profiles.
            </p>
          </section>
        )}

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
              <Link href="/recipes">Back to Recipes</Link>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}

