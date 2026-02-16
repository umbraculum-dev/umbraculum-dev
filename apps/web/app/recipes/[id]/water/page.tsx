"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadDevAuthFromStorage, type DevAuth } from "../../../_lib/devAuth";
import { apiFetch, type WaterProfilesResponse } from "./_lib/api";
import { fetchRecipeWaterSettings, type RecipeWaterSettingsResponse } from "./_lib/waterSettings";
import type { IonProfilePpm } from "./_lib/waterChem";
import { combineAfterSaltsAndAcid } from "./_lib/waterChem";

type MashOverallResultV0 = {
  calculatedAt: string;
  ionsPpm: IonProfilePpm;
  finalAlkalinityPpmCaCO3: number;
  ph: { kind: "target" | "estimated"; value: number };
};

export default function WaterHubPage() {
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const [authLoaded, setAuthLoaded] = useState(false);
  const [auth, setAuth] = useState<DevAuth | null>(null);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [settings, setSettings] = useState<RecipeWaterSettingsResponse["settings"] | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAuth(loadDevAuthFromStorage());
    setAuthLoaded(true);
  }, []);

  const canCall = useMemo(() => Boolean(auth?.userId && auth?.activeAccountId), [auth]);

  const refresh = async () => {
    if (!auth?.userId || !auth.activeAccountId || !recipeId) return;
    setError(null);
    setLoading(true);
    try {
      const profRes = await apiFetch("/api/water-profiles", auth);
      if (!profRes.ok) throw new Error(JSON.stringify(profRes.data));
      setProfiles(profRes.data as WaterProfilesResponse);

      const s = (await fetchRecipeWaterSettings(recipeId, auth)) as RecipeWaterSettingsResponse;
      setSettings(s.settings ?? null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId, auth?.activeAccountId, recipeId]);

  const mashLast = settings?.mashLastCalculatedAt ? new Date(settings.mashLastCalculatedAt).toLocaleString() : "—";
  const spargeLast = settings?.spargeLastCalculatedAt
    ? new Date(settings.spargeLastCalculatedAt).toLocaleString()
    : "—";
  const boilLast = settings?.boilLastCalculatedAt ? new Date(settings.boilLastCalculatedAt).toLocaleString() : "—";

  const overall = useMemo(() => {
    const v = settings?.mashOverallLastResultJson;
    if (!v || typeof v !== "object") return null;
    const o = v as any;
    if (!o?.ph || typeof o?.finalAlkalinityPpmCaCO3 !== "number" || !o?.ionsPpm) return null;
    return o as MashOverallResultV0;
  }, [settings?.mashOverallLastResultJson]);

  type StreamSummary = {
    key: "mash" | "sparge" | "boil";
    label: string;
    volumeLiters: number | null;
    ph: number | null;
    finalAlkalinityPpmCaCO3: number | null;
    acidType: string | null;
    acidAmountLabel: string | null;
    ionsAfterAcid: IonProfilePpm | null;
  };

  const recap = useMemo(() => {
    if (!settings) return null;

    const parseSaltsResultingProfile = (v: unknown): IonProfilePpm | null => {
      if (!v || typeof v !== "object") return null;
      const o = v as any;
      const r = o?.result?.resultingProfile;
      if (!r || typeof r !== "object") return null;
      const p = r as any;
      const keys: Array<keyof IonProfilePpm> = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
      for (const k of keys) if (typeof p[k] !== "number") return null;
      return {
        calcium: p.calcium,
        magnesium: p.magnesium,
        sodium: p.sodium,
        sulfate: p.sulfate,
        chloride: p.chloride,
        bicarbonate: p.bicarbonate,
      };
    };

    // Mash volume: prefer the single source of truth (mixing volumes) when available.
    // Fall back to legacy `mashWaterVolumeLiters` for older records where mixing volumes were never set.
    const mashTap = typeof settings.tapWaterVolumeLiters === "number" ? settings.tapWaterVolumeLiters : 0;
    const mashDil = typeof settings.dilutionWaterVolumeLiters === "number" ? settings.dilutionWaterVolumeLiters : 0;
    const mashMixTotal = Math.max(0, mashTap) + Math.max(0, mashDil);
    const mashLegacy = typeof settings.mashWaterVolumeLiters === "number" ? settings.mashWaterVolumeLiters : null;
    const mashVolumeLiters = mashMixTotal > 0 ? mashMixTotal : mashLegacy;
    const mashPh = overall?.ph?.value ?? null;
    const mashFinalAlk = overall?.finalAlkalinityPpmCaCO3 ?? null;
    const mashIonsAfterAcid = overall?.ionsPpm ?? null;
    const mashAcidAmountLabel =
      settings.mashAcidificationMode === "manual"
        ? settings.mashStrengthKind === "solid"
          ? settings.mashManualAcidAddedGrams != null
            ? `${settings.mashManualAcidAddedGrams.toFixed(3)} g (manual)`
            : null
          : settings.mashManualAcidAddedMl != null
            ? `${settings.mashManualAcidAddedMl.toFixed(3)} mL (manual)`
            : null
        : settings.mashStrengthKind === "solid"
          ? settings.mashLastAcidRequiredGrams != null
            ? `${settings.mashLastAcidRequiredGrams.toFixed(3)} g (required)`
            : null
          : settings.mashLastAcidRequiredMl != null
            ? `${settings.mashLastAcidRequiredMl.toFixed(3)} mL (required)`
            : null;

    const spargeVolumeLiters = typeof settings.spargeVolumeLiters === "number" ? settings.spargeVolumeLiters : null;
    const spargePh =
      settings.spargeAcidificationMode === "manual"
        ? settings.spargeManualLastAchievedPh ?? null
        : typeof settings.spargeTargetPh === "number"
          ? settings.spargeTargetPh
          : null;
    const spargeFinalAlk = settings.spargeLastFinalAlkalinityPpmCaCO3 ?? null;
    const spargeAfterSalts = parseSaltsResultingProfile(settings.spargeSaltsLastResultJson);
    const spargeIonsAfterAcid =
      spargeAfterSalts && spargeFinalAlk != null
        ? combineAfterSaltsAndAcid({
            afterSalts: spargeAfterSalts,
            acidResult: {
              finalAlkalinityPpmCaCO3: spargeFinalAlk,
              sulfateAddedPpm: settings.spargeLastSulfateAddedPpm ?? 0,
              chlorideAddedPpm: settings.spargeLastChlorideAddedPpm ?? 0,
            },
          })
        : null;
    const spargeAcidAmountLabel =
      settings.spargeAcidificationMode === "manual"
        ? settings.spargeStrengthKind === "solid"
          ? settings.spargeManualAcidAddedGrams != null
            ? `${settings.spargeManualAcidAddedGrams.toFixed(3)} g (manual)`
            : null
          : settings.spargeManualAcidAddedMl != null
            ? `${settings.spargeManualAcidAddedMl.toFixed(3)} mL (manual)`
            : null
        : settings.spargeStrengthKind === "solid"
          ? settings.spargeLastAcidRequiredGrams != null
            ? `${settings.spargeLastAcidRequiredGrams.toFixed(3)} g (required)`
            : null
          : settings.spargeLastAcidRequiredMl != null
            ? `${settings.spargeLastAcidRequiredMl.toFixed(3)} mL (required)`
            : null;

    const boilVolumeLiters =
      typeof settings.boilWaterVolumeLiters === "number" ? settings.boilWaterVolumeLiters : null;
    const boilPh =
      settings.boilAcidificationMode === "manual"
        ? settings.boilManualLastAchievedPh ?? null
        : typeof settings.boilTargetPh === "number"
          ? settings.boilTargetPh
          : null;
    const boilFinalAlk = settings.boilLastFinalAlkalinityPpmCaCO3 ?? null;
    const boilAfterSalts = parseSaltsResultingProfile(settings.boilSaltsLastResultJson);
    const boilIonsAfterAcid =
      boilAfterSalts && boilFinalAlk != null
        ? combineAfterSaltsAndAcid({
            afterSalts: boilAfterSalts,
            acidResult: {
              finalAlkalinityPpmCaCO3: boilFinalAlk,
              sulfateAddedPpm: settings.boilLastSulfateAddedPpm ?? 0,
              chlorideAddedPpm: settings.boilLastChlorideAddedPpm ?? 0,
            },
          })
        : null;
    const boilAcidAmountLabel =
      settings.boilAcidificationMode === "manual"
        ? settings.boilStrengthKind === "solid"
          ? settings.boilManualAcidAddedGrams != null
            ? `${settings.boilManualAcidAddedGrams.toFixed(3)} g (manual)`
            : null
          : settings.boilManualAcidAddedMl != null
            ? `${settings.boilManualAcidAddedMl.toFixed(3)} mL (manual)`
            : null
        : settings.boilStrengthKind === "solid"
          ? settings.boilLastAcidRequiredGrams != null
            ? `${settings.boilLastAcidRequiredGrams.toFixed(3)} g (required)`
            : null
          : settings.boilLastAcidRequiredMl != null
            ? `${settings.boilLastAcidRequiredMl.toFixed(3)} mL (required)`
            : null;

    const streams: StreamSummary[] = [
      {
        key: "mash",
        label: "Mash",
        volumeLiters: mashVolumeLiters,
        ph: mashPh,
        finalAlkalinityPpmCaCO3: mashFinalAlk,
        acidType: settings.mashAcidType ?? null,
        acidAmountLabel: mashAcidAmountLabel,
        ionsAfterAcid: mashIonsAfterAcid,
      },
      {
        key: "sparge",
        label: "Sparge",
        volumeLiters: spargeVolumeLiters,
        ph: spargePh,
        finalAlkalinityPpmCaCO3: spargeFinalAlk,
        acidType: settings.spargeAcidType ?? null,
        acidAmountLabel: spargeAcidAmountLabel,
        ionsAfterAcid: spargeIonsAfterAcid,
      },
      {
        key: "boil",
        label: "Additional boil",
        volumeLiters: boilVolumeLiters,
        ph: boilPh,
        finalAlkalinityPpmCaCO3: boilFinalAlk,
        acidType: settings.boilAcidType ?? null,
        acidAmountLabel: boilAcidAmountLabel,
        ionsAfterAcid: boilIonsAfterAcid,
      },
    ];

    const validForMerge = streams.filter((s) => s.volumeLiters && s.volumeLiters > 0 && s.ionsAfterAcid);
    const totalV = validForMerge.reduce((acc, s) => acc + (s.volumeLiters as number), 0);
    const mergedIons: IonProfilePpm | null =
      totalV > 0
        ? (["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"] as const).reduce((acc, k) => {
            const sum = validForMerge.reduce(
              (a, s) => a + ((s.ionsAfterAcid as IonProfilePpm)[k] * (s.volumeLiters as number)),
              0,
            );
            (acc as any)[k] = sum / totalV;
            return acc;
          }, {} as any as IonProfilePpm)
        : null;

    const mergedFinalAlk =
      totalV > 0
        ? validForMerge.reduce((a, s) => a + ((s.finalAlkalinityPpmCaCO3 ?? 0) * (s.volumeLiters as number)), 0) /
          totalV
        : null;

    // Approximate merged pH by volume-weighting [H+]. This is a rough summary, not full equilibrium mixing.
    const validPh = streams.filter((s) => s.volumeLiters && s.volumeLiters > 0 && typeof s.ph === "number");
    const totalPhV = validPh.reduce((a, s) => a + (s.volumeLiters as number), 0);
    const mergedPh =
      totalPhV > 0
        ? (() => {
            const h = validPh.reduce((a, s) => a + (10 ** (-(s.ph as number)) * (s.volumeLiters as number)), 0) / totalPhV;
            return -Math.log10(h);
          })()
        : null;

    return { streams, mergedIons, mergedFinalAlk, mergedPh, totalVolumeLiters: totalV };
  }, [settings, overall]);

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>Water management</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Recipe ID: <code>{recipeId}</code>
      </p>

      <p style={{ marginTop: 0 }}>
        <Link href={`/recipes/${recipeId}/edit`}>Back to recipe editor</Link>
      </p>

      {authLoaded && !canCall ? (
        <p role="alert" className="errorBox">
          Missing dev headers. Go to the dashboard and click <strong>Save headers</strong> (User + Active account),
          then come back here.
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel" aria-labelledby="water-hub-links">
          <h2 id="water-hub-links" style={{ marginTop: 0 }}>
            Choose an area
          </h2>
          <ul>
            <li>
              <Link href={`/recipes/${recipeId}/water/mash`}>Mash water</Link>
              <span className="muted"> · last calculated: {mashLast}</span>
            </li>
            <li>
              <Link href={`/recipes/${recipeId}/water/sparge`}>Sparge water</Link>
              <span className="muted"> · last calculated: {spargeLast}</span>
            </li>
            <li>
              <Link href={`/recipes/${recipeId}/water/boil`}>Additional boil water</Link>
              <span className="muted"> · last calculated: {boilLast}</span>
            </li>
          </ul>
          <p className="muted" style={{ marginBottom: 0 }}>
            Manage profiles on <Link href="/water-profiles">Water profiles</Link>.
          </p>
        </section>

        <section className="panel" aria-labelledby="water-hub-status">
          <h2 id="water-hub-status" style={{ marginTop: 0 }}>
            Quick status (read-only)
          </h2>
          <ul style={{ marginTop: 0 }}>
            <li>
              Mash acid mode: <code>{settings?.mashAcidificationMode ?? "—"}</code>
            </li>
            <li>
              Sparge acid mode: <code>{settings?.spargeAcidificationMode ?? "—"}</code>
            </li>
            <li>
              Mash overall snapshot:{" "}
              {overall ? (
                <>
                  pH ({overall.ph.kind}) <code>{overall.ph.value.toFixed(2)}</code> · Final alkalinity{" "}
                  <code>{overall.finalAlkalinityPpmCaCO3.toFixed(2)}</code>
                </>
              ) : (
                <span className="muted">—</span>
              )}
              {" · "}
              <Link href={`/recipes/${recipeId}/water/mash#overall-mash-water-result`}>Open mash overall</Link>
            </li>
          </ul>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => void refresh()} disabled={!canCall || loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <span className="muted" role="status" aria-live="polite">
              {profiles ? "Profiles loaded." : "Profiles not loaded."}
            </span>
          </div>

          {error ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {error}
            </pre>
          ) : null}
        </section>

        <section className="panel" aria-labelledby="water-hub-recap">
          <h2 id="water-hub-recap" style={{ marginTop: 0 }}>
            Recap (read-only)
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Uses saved snapshots where available; merged pH is an approximation using volume-weighted [H+].
          </p>

          <details className="fieldBlock fieldBlock--computed">
            <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
              <strong>Merged water recap</strong>
              <span className="fieldBadge">Computed</span>
              <span className="muted">Click to expand</span>
            </summary>

            {recap ? (
              <>
                <h3 style={{ marginTop: 12 }}>Per stream</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th align="left">Stream</th>
                        <th align="right">Volume (L)</th>
                        <th align="right">pH</th>
                        <th align="right">Final alkalinity (ppm as CaCO3)</th>
                        <th align="left">Acid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recap.streams.map((s) => (
                        <tr key={s.key}>
                          <td>{s.label}</td>
                          <td align="right">{s.volumeLiters == null ? "—" : s.volumeLiters.toFixed(2)}</td>
                          <td align="right">{s.ph == null ? "—" : s.ph.toFixed(2)}</td>
                          <td align="right">
                            {s.finalAlkalinityPpmCaCO3 == null ? "—" : s.finalAlkalinityPpmCaCO3.toFixed(2)}
                          </td>
                          <td>
                            {s.acidType ? <code>{s.acidType}</code> : "—"}{" "}
                            {s.acidAmountLabel ? <span className="muted">· {s.acidAmountLabel}</span> : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 style={{ marginTop: 16 }}>Merged summary</h3>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    Total volume: <code>{recap.totalVolumeLiters.toFixed(2)}</code> L
                  </li>
                  <li>
                    Approx merged pH: <code>{recap.mergedPh == null ? "—" : recap.mergedPh.toFixed(2)}</code>
                  </li>
                  <li>
                    Merged final alkalinity:{" "}
                    <code>{recap.mergedFinalAlk == null ? "—" : recap.mergedFinalAlk.toFixed(2)}</code> ppm as CaCO3
                  </li>
                </ul>

                {recap.mergedIons ? (
                  <div style={{ overflowX: "auto", marginTop: 8 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th align="left">Ion</th>
                          <th align="right">Merged (ppm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(
                          [
                            ["Ca", recap.mergedIons.calcium],
                            ["Mg", recap.mergedIons.magnesium],
                            ["Na", recap.mergedIons.sodium],
                            ["SO4", recap.mergedIons.sulfate],
                            ["Cl", recap.mergedIons.chloride],
                            ["HCO3", recap.mergedIons.bicarbonate],
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
                ) : (
                  <p className="muted" style={{ marginTop: 8 }}>
                    No merged profile available yet (need saved salts + acid snapshots for at least one stream).
                  </p>
                )}
              </>
            ) : (
              <p className="muted" style={{ marginTop: 8 }}>
                No settings loaded yet.
              </p>
            )}
          </details>
        </section>
      </div>
    </>
  );
}

