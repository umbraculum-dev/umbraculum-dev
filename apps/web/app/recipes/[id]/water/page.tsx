"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadDevAuthFromStorage, type DevAuth } from "../../../_lib/devAuth";
import { apiFetch, type WaterProfilesResponse } from "./_lib/api";
import { fetchRecipeWaterSettings, type RecipeWaterSettingsResponse } from "./_lib/waterSettings";

type MashOverallResultV0 = {
  calculatedAt: string;
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

  const overall = useMemo(() => {
    const v = settings?.mashOverallLastResultJson;
    if (!v || typeof v !== "object") return null;
    const o = v as any;
    if (!o?.ph || typeof o?.finalAlkalinityPpmCaCO3 !== "number") return null;
    return o as MashOverallResultV0;
  }, [settings?.mashOverallLastResultJson]);

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
      </div>
    </>
  );
}

