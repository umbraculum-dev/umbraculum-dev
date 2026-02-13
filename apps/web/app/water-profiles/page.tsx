"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadDevAuthFromStorage, type DevAuth } from "../_lib/devAuth";

type MeResponse = {
  ok: true;
  userId: string;
  accountId: string | null;
  role: string | null;
};

type WaterProfile = {
  id: string;
  scope: "system" | "public" | "account";
  type: "water" | "dilution";
  name: string;
  verificationStatus: "verified" | "unverified";
  ph?: number | null;
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

type WaterProfilesResponse = {
  system: WaterProfile[];
  public: WaterProfile[];
  account: WaterProfile[];
};

async function apiFetch(path: string, auth: DevAuth, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});
  headers.set("X-User-Id", auth.userId);
  if (auth.activeAccountId) headers.set("X-Account-Id", auth.activeAccountId);

  const res = await fetch(path, { ...init, headers });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) as unknown };
  } catch {
    return { ok: res.ok, status: res.status, data: text as unknown };
  }
}

function isAdmin(role: string | null) {
  return role === "owner" || role === "brewery_admin";
}

export default function WaterProfilesPage() {
  const [auth, setAuth] = useState<DevAuth | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // admin create profile
  const [createName, setCreateName] = useState("");
  const [createScope, setCreateScope] = useState<"account" | "public">("public");
  const [createType, setCreateType] = useState<"water" | "dilution">("water");
  const [createPh, setCreatePh] = useState<string>("");
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
    setAuth(loadDevAuthFromStorage());
    setAuthLoaded(true);
  }, []);

  const canCall = useMemo(() => Boolean(auth?.userId && auth?.activeAccountId), [auth]);

  const refresh = async () => {
    if (!auth?.userId) return;
    setError(null);
    setLoading(true);
    try {
      const meRes = await apiFetch("/api/me", auth);
      setMe(meRes.ok ? (meRes.data as MeResponse) : null);

      const profRes = await apiFetch("/api/water-profiles", auth);
      if (!profRes.ok) throw new Error(JSON.stringify(profRes.data));
      setProfiles(profRes.data as WaterProfilesResponse);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId, auth?.activeAccountId]);

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const acc = profiles?.account ?? [];
    return [...sys, ...pub, ...acc];
  }, [profiles]);

  const admin = isAdmin(me?.role ?? null);

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
          ph: createPh.trim() === "" ? null : Number(createPh),
          ...createIon,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      setCreateName("");
      setCreatePh("");
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

  const onDeleteProfile = async (p: WaterProfile) => {
    if (!auth?.userId || !auth.activeAccountId) return;
    if (p.scope === "system") return;
    const ok = window.confirm(`Delete water profile "${p.name}"? This cannot be undone.`);
    if (!ok) return;
    setError(null);
    try {
      const res = await apiFetch(`/api/water-profiles/${p.id}`, auth, { method: "DELETE" });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>Water profiles</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Active account: <code>{auth?.activeAccountId ? auth.activeAccountId : "—"}</code>
      </p>

      {authLoaded && !canCall ? (
        <p role="alert" className="errorBox">
          Missing dev headers. Go to the dashboard and click <strong>Save headers</strong> (User + Active
          account), then come back here.
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel" aria-labelledby="profiles-table-heading">
          <h2 id="profiles-table-heading" style={{ marginTop: 0 }}>
            View all water profiles (table)
          </h2>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => void refresh()} disabled={!canCall || loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <span className="muted" role="status" aria-live="polite">
              {profiles ? `${allProfiles.length} profiles loaded.` : "Not loaded yet."}
            </span>
          </div>

          {error ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {error}
            </pre>
          ) : null}

          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Name</th>
                  <th align="left">Scope</th>
                  <th align="left">Status</th>
                  <th align="right">pH</th>
                  <th align="right">Ca</th>
                  <th align="right">Mg</th>
                  <th align="right">Na</th>
                  <th align="right">SO4</th>
                  <th align="right">Cl</th>
                  <th align="right">HCO3</th>
                  <th align="left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map((p, idx) => (
                  <tr
                    key={p.id}
                    style={{
                      backgroundColor:
                        idx % 2 === 1
                          ? "color-mix(in srgb, var(--surface-2) 35%, var(--surface))"
                          : "transparent",
                    }}
                  >
                    <td>{p.name}</td>
                    <td className="muted">
                      {p.scope}/{p.type}
                    </td>
                    <td className="muted">{p.verificationStatus}</td>
                    <td align="right" className="muted">
                      {p.ph == null ? "—" : p.ph.toFixed(2)}
                    </td>
                    <td align="right">{p.calcium}</td>
                    <td align="right">{p.magnesium}</td>
                    <td align="right">{p.sodium}</td>
                    <td align="right">{p.sulfate}</td>
                    <td align="right">{p.chloride}</td>
                    <td align="right">{p.bicarbonate}</td>
                    <td>
                      {admin && p.scope !== "system" ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button type="button" onClick={() => void onToggleVerify(p)}>
                            {p.verificationStatus === "verified" ? "Mark unverified" : "Mark verified"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDeleteProfile(p)}
                            aria-label={`Delete water profile ${p.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!admin ? (
            <p className="muted" style={{ marginBottom: 0 }}>
              Only <code>owner</code> and <code>brewery_admin</code> can add/verify profiles.
            </p>
          ) : null}
        </section>

        {admin ? (
          <section className="panel" aria-labelledby="admin-profiles-heading">
            <h2 id="admin-profiles-heading" style={{ marginTop: 0 }}>
              Admin: add water profile
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Created profiles start as <code>unverified</code>. Use the table actions to verify/unverify.
            </p>

            <form onSubmit={onCreateProfile} aria-describedby={createError ? "create-error" : undefined}>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="create-name" className="muted" style={{ display: "block", fontSize: 12 }}>
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
                  <label htmlFor="create-scope" className="muted" style={{ display: "block", fontSize: 12 }}>
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
                  <label htmlFor="create-type" className="muted" style={{ display: "block", fontSize: 12 }}>
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
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="create-ph" className="muted" style={{ display: "block", fontSize: 12 }}>
                    pH (optional)
                  </label>
                  <input
                    id="create-ph"
                    type="number"
                    inputMode="decimal"
                    step={0.01}
                    value={createPh}
                    onChange={(e) => setCreatePh(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                    placeholder="e.g. 7.80"
                  />
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
                        onChange={(e) => setCreateIon((prev) => ({ ...prev, [k]: Number(e.target.value) }))}
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
          </section>
        ) : null}

        <section className="panel" aria-labelledby="nav-heading">
          <h2 id="nav-heading" style={{ marginTop: 0 }}>
            Navigation
          </h2>
          <ul style={{ marginBottom: 0 }}>
            <li>
              <Link href="/recipes">Back to Recipes</Link>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}

