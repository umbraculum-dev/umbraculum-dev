"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { H1, H2, SizableText, View, XStack, YStack } from "tamagui";

import { Link } from "../../../src/i18n/navigation";

import type { AuthMeResponse, WaterProfile, WaterProfilesResponse } from "@brewery/contracts";
import { parseAuthMeResponse, parseWaterProfilesResponse } from "@brewery/contracts";

import { apiFetch } from "../../_lib/apiClient";
import { RecipeEditFieldLabel } from "../../_components/recipe-edit";

function isAdmin(role: string | null) {
  return role === "brewery_admin";
}

export default function WaterProfilesPage() {
  const t = useTranslations("waterProfiles");
  const tUnits = useTranslations("units");
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const canCall = true;

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const meRes = await apiFetch("/api/auth/me");
      if (meRes.ok && meRes.data) {
        const parsed = parseAuthMeResponse(meRes.data);
        setMe(parsed);
      } else {
        setMe(null);
      }

      const profRes = await apiFetch("/api/water-profiles");
      if (!profRes.ok) throw new Error(JSON.stringify(profRes.data));
      setProfiles(parseWaterProfilesResponse(profRes.data));
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const acc = profiles?.account ?? [];
    return [...sys, ...pub, ...acc];
  }, [profiles]);

  const admin = isAdmin(me?.role ?? null);

  const onCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const res = await apiFetch("/api/water-profiles", {
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
    const action = p.verificationStatus === "verified" ? "unverify" : "verify";
    await apiFetch(`/api/water-profiles/${p.id}/${action}`, { method: "POST" });
    await refresh();
  };

  const onDeleteProfile = async (p: WaterProfile) => {
    if (p.scope === "system") return;
    const ok = window.confirm(`Delete water profile "${p.name}"? This cannot be undone.`);
    if (!ok) return;
    setError(null);
    try {
      const res = await apiFetch(`/api/water-profiles/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <>
      <H1 mb="$2">{t("title")}</H1>

      <YStack gap="$4">
        <View className="brew-panel" aria-labelledby="profiles-table-heading">
          <H2 id="profiles-table-heading" mt={0}>
            {t("viewAllTableTitle")}
          </H2>

          <XStack gap="$3" alignItems="center">
            <button type="button" onClick={() => void refresh()} disabled={!canCall || loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
              {profiles ? `${allProfiles.length} profiles loaded.` : "Not loaded yet."}
            </SizableText>
          </XStack>

          {error ? (
            <View mt="$3">
              <pre className="brew-error-box" role="alert">
                {error}
              </pre>
            </View>
          ) : null}

          <View className="brew-table-wrap" mt="$3">
            <table className="brew-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Scope</th>
                  <th>Status</th>
                  <th align="right">pH</th>
                  <th align="right">Ca</th>
                  <th align="right">Mg</th>
                  <th align="right">Na</th>
                  <th align="right">SO4</th>
                  <th align="right">Cl</th>
                  <th align="right">HCO3</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 1 ? "brew-table-row-alt" : undefined}>
                    <td>{p.name}</td>
                    <td>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {p.scope}/{p.type}
                      </SizableText>
                    </td>
                    <td>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {p.verificationStatus}
                      </SizableText>
                    </td>
                    <td align="right">
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {p.ph == null ? "—" : p.ph.toFixed(2)}
                      </SizableText>
                    </td>
                    <td align="right">{p.calcium}</td>
                    <td align="right">{p.magnesium}</td>
                    <td align="right">{p.sodium}</td>
                    <td align="right">{p.sulfate}</td>
                    <td align="right">{p.chloride}</td>
                    <td align="right">{p.bicarbonate}</td>
                    <td>
                      {admin && p.scope !== "system" ? (
                        <XStack gap="$2" alignItems="center">
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
                        </XStack>
                      ) : (
                        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                          —
                        </SizableText>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </View>

          {!admin ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
              Only <code>owner</code> and <code>brewery_admin</code> can add/verify profiles.
            </SizableText>
          ) : null}
        </View>

        {admin ? (
          <View className="brew-panel" aria-labelledby="admin-profiles-heading">
            <H2 id="admin-profiles-heading" mt={0}>
              {t("adminAddTitle")}
            </H2>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("createdProfilesStartUnverified")}
            </SizableText>

            <form onSubmit={onCreateProfile} aria-describedby={createError ? "create-error" : undefined}>
              <div className="brew-grid-2col">
                <div className="brew-grid-full">
                  <YStack gap="$1.5">
                    <RecipeEditFieldLabel htmlFor="create-name">Profile name</RecipeEditFieldLabel>
                    <input
                      id="create-name"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      className="brew-recipe-edit-select brew-recipe-edit-select-full"
                      required
                    />
                  </YStack>
                </div>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="create-scope">Scope</RecipeEditFieldLabel>
                  <select
                    id="create-scope"
                    value={createScope}
                    onChange={(e) => setCreateScope(e.target.value as "account" | "public")}
                    className="brew-recipe-edit-select brew-recipe-edit-select-full"
                  >
                    <option value="public">Public</option>
                    <option value="account">Account</option>
                  </select>
                </YStack>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="create-type">Type</RecipeEditFieldLabel>
                  <select
                    id="create-type"
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as "water" | "dilution")}
                    className="brew-recipe-edit-select brew-recipe-edit-select-full"
                  >
                    <option value="water">Water</option>
                    <option value="dilution">Dilution</option>
                  </select>
                </YStack>
                <div className="brew-grid-full">
                  <YStack gap="$1.5">
                    <RecipeEditFieldLabel htmlFor="create-ph">pH (optional)</RecipeEditFieldLabel>
                    <input
                      id="create-ph"
                      type="number"
                      inputMode="decimal"
                      step={0.01}
                      value={createPh}
                      onChange={(e) => setCreatePh(e.target.value)}
                      className="brew-recipe-edit-select brew-recipe-edit-select-full"
                      placeholder={t("phPlaceholder")}
                    />
                  </YStack>
                </div>
              </div>

              <fieldset className="brew-fieldset-noborder">
                <legend className="brew-muted brew-fieldset-legend">
                  {t("ionsLegend", { unit: tUnits("ppm") })}
                </legend>
                <div className="brew-grid-3col">
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
                    <YStack key={k} gap="$1.5">
                      <RecipeEditFieldLabel htmlFor={`ion-${k}`}>{label}</RecipeEditFieldLabel>
                      <input
                        id={`ion-${k}`}
                        type="number"
                        inputMode="decimal"
                        value={(createIon as Record<string, number>)[k]}
                        onChange={(e) => setCreateIon((prev) => ({ ...prev, [k]: Number(e.target.value) }))}
                        className="brew-recipe-edit-select brew-recipe-edit-select-full"
                      />
                    </YStack>
                  ))}
                </div>
              </fieldset>

              <XStack gap="$3" mt="$3" alignItems="center">
                <button type="submit" disabled={!createName.trim() || createSubmitting}>
                  {createSubmitting ? "Creating…" : "Create profile"}
                </button>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
                  Profiles in this section require admin privileges.
                </SizableText>
              </XStack>

              {createError ? (
                <View mt="$3">
                  <pre id="create-error" className="brew-error-box" role="alert">
                    {createError}
                  </pre>
                </View>
              ) : null}
            </form>
          </View>
        ) : null}

        <View className="brew-panel" aria-labelledby="nav-heading">
          <H2 id="nav-heading" mt={0}>
            {t("navigationTitle")}
          </H2>
          <ul className="brew-recipe-edit-list-disc brew-list-mb0">
            <li>
              <SizableText size="$2" fontFamily="$body">
                <Link href="/recipes">Back to Recipes</Link>
              </SizableText>
            </li>
            <li className="brew-list-mt2">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                {t("rawMaterialsCtaPrefix")} <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
              </SizableText>
            </li>
          </ul>
        </View>
      </YStack>
    </>
  );
}
