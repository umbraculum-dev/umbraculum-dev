"use client";

import { Link } from "../../../../src/i18n/navigation";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { IonProfilePpm } from "@brewery/contracts";

import { parseWaterProfilesResponse } from "@brewery/contracts";
import { H1 } from "tamagui";

import { apiFetch, type WaterProfilesResponse } from "./_lib/api";
import { fetchRecipeWaterHubSummary, type RecipeWaterHubSummaryResponse } from "./_lib/waterHubSummary";
import { formatFixed, formatWithHint } from "../../../../src/i18n/format";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../_components/SurfaceMathToggleRow";
import { mathExplain } from "./_lib/mathExplain";
import { buildWaterMathBody } from "./_lib/mathBodies";
import { RecipeMetaLine } from "./_components/RecipeMetaLine";

type DisplayStream = {
  key: "mash" | "sparge" | "boil";
  label: string;
  volumeLiters: number | null;
  ph: number | null;
  finalAlkalinityPpmCaCO3: number | null;
  saltsAddedLabel: string | null;
  acidType: string | null;
  acidAmountLabel: string | null;
  ionsAfterAcid: IonProfilePpm | null;
};

export default function WaterHubPage() {
  const t = useTranslations("waterHub");
  const tUnits = useTranslations("units");
  const tsalts = useTranslations("salts");
  const tMath = useTranslations("math");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const authState = useRequireAuth({ requireActiveAccount: true });

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [summaryRes, setSummaryRes] = useState<RecipeWaterHubSummaryResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [surfaceMath, setSurfaceMath] = useState(false);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("brewery:surfaceMath:waterHub");
      if (v === "1") setSurfaceMath(true);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("brewery:surfaceMath:waterHub", surfaceMath ? "1" : "0");
    } catch {
      // ignore
    }
  }, [surfaceMath]);

  const refresh = async () => {
    if (!recipeId) return;
    if (authState.status !== "ready") return;
    setError(null);
    setLoading(true);
    try {
      const profRes = await apiFetch("/api/water-profiles");
      if (!profRes.ok) throw new Error(JSON.stringify(profRes.data));
      setProfiles(parseWaterProfilesResponse(profRes.data));

      const summary = await fetchRecipeWaterHubSummary(recipeId);
      setSummaryRes(summary);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, recipeId]);

  const summary = summaryRes?.summary ?? null;
  const formatHints = summaryRes?.formatHints;
  const fmt = (unitKey: string, value: unknown, fallback: number) =>
    formatWithHint(locale, value, formatHints as Record<string, { decimals?: number }> | undefined, unitKey, fallback);

  const mashLast = summary?.status.mashLastCalculatedAt ? new Date(summary.status.mashLastCalculatedAt).toLocaleString() : "—";
  const spargeLast = summary?.status.spargeLastCalculatedAt ? new Date(summary.status.spargeLastCalculatedAt).toLocaleString() : "—";
  const boilLast = summary?.status.boilLastCalculatedAt ? new Date(summary.status.boilLastCalculatedAt).toLocaleString() : "—";

  const displayAlkalinityPpmCaCO3 = (v: number) => {
    if (v < 0 && v > -1) return 0;
    return v;
  };

  const displayStreams = useMemo(() => {
    if (!summary) return null;
    const hints = formatHints as Record<string, { decimals?: number }> | undefined;

    const formatSaltKeyLabel = (saltKey: string): string => {
      switch (saltKey) {
        case "gypsum":
          return tsalts("gypsum");
        case "calcium_chloride":
          return tsalts("calciumChloride");
        case "epsom":
          return tsalts("epsom");
        case "table_salt":
          return tsalts("tableSalt");
        case "baking_soda":
          return tsalts("bakingSoda");
        default:
          return saltKey;
      }
    };

    const saltBreakdownLabel = (rows: Array<{ saltKey: string; grams: number }> | null): string | null => {
      if (!rows?.length) return null;
      return rows
        .filter((r) => r && typeof r.saltKey === "string" && typeof r.grams === "number" && Number.isFinite(r.grams) && r.grams > 0)
        .map((r) => `${formatSaltKeyLabel(r.saltKey)} ${formatWithHint(locale, r.grams, hints, "g", 0)} ${tUnits("g")}`)
        .join("; ");
    };

    const acidAmountLabel = (s: (typeof summary.streams)[number]): string | null => {
      const suffix = s.acidMode === "manual" ? tsalts("modeManualSuffix") : s.acidMode === "required" ? tsalts("modeRequiredSuffix") : "";
      if (s.acidAmountGrams != null) return `${formatWithHint(locale, s.acidAmountGrams, hints, "g", 0)} ${tUnits("g")}${suffix ? ` ${suffix}` : ""}`;
      if (s.acidAmountMl != null) return `${formatWithHint(locale, s.acidAmountMl, hints, "mL", 0)} ${tUnits("mL")}${suffix ? ` ${suffix}` : ""}`;
      return null;
    };

    const labelForKey = (k: "mash" | "sparge" | "boil"): string => {
      if (k === "mash") return t("mashWater");
      if (k === "sparge") return t("spargeWater");
      return t("additionalBoilWater");
    };

    const streams: DisplayStream[] = summary.streams.map((s) => ({
      key: s.key,
      label: labelForKey(s.key),
      volumeLiters: s.volumeLiters,
      ph: s.ph,
      finalAlkalinityPpmCaCO3: s.finalAlkalinityPpmCaCO3,
      saltsAddedLabel: saltBreakdownLabel(s.saltsBreakdown),
      acidType: s.acidType,
      acidAmountLabel: acidAmountLabel(s),
      ionsAfterAcid: s.ionsPpm,
    }));

    return streams;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, formatHints, locale, t, tUnits, tsalts]);

  return (
    <>
      <H1 mb="$2">{t("title")}</H1>
      <RecipeMetaLine recipeId={recipeId} enabled={authState.status === "ready"} />

      <SurfaceMathToggleRow
        left={
          <p style={{ margin: 0 }}>
            <Link href={`/recipes/${recipeId}/edit`}>{t("backToRecipeEditor")}</Link>
          </p>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        style={{ marginTop: 0, marginBottom: 8 }}
      />

      {authState.status === "error" ? (
        <pre className="brew-error-box" role="alert">
          {authState.error}
        </pre>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
        <section className="brew-panel" aria-labelledby="water-hub-links">
          <h2 id="water-hub-links" style={{ marginTop: 0 }}>
            {t("chooseArea")}
          </h2>
          <ul>
            <li>
              <Link href={`/recipes/${recipeId}/water/mash`}>{t("mashWater")}</Link>
              <span className="brew-muted"> · {t("lastCalculated")}: {mashLast}</span>
            </li>
            <li>
              <Link href={`/recipes/${recipeId}/water/sparge`}>{t("spargeWater")}</Link>
              <span className="brew-muted"> · {t("lastCalculated")}: {spargeLast}</span>
            </li>
            <li>
              <Link href={`/recipes/${recipeId}/water/boil`}>{t("additionalBoilWater")}</Link>
              <span className="brew-muted"> · {t("lastCalculated")}: {boilLast}</span>
            </li>
          </ul>
          <p className="brew-muted" style={{ marginBottom: 0 }}>
            {t("manageProfilesOn")} <Link href="/water-profiles">{t("waterProfilesLink")}</Link>.
          </p>
        </section>

        <section className="brew-panel" aria-labelledby="water-hub-status">
          <h2 id="water-hub-status" style={{ marginTop: 0 }}>
            {t("quickStatus")}
          </h2>
          <ul style={{ marginTop: 0 }}>
            <li>
              {t("mashAcidMode")}: <code>{summary?.status.mashAcidificationMode ?? "—"}</code>
            </li>
            <li>
              {t("spargeAcidMode")}: <code>{summary?.status.spargeAcidificationMode ?? "—"}</code>
            </li>
            <li>
              {t("mashOverallSnapshot")}: {" "}
              {summary?.status.mashOverallSnapshot ? (
                <>
                  pH ({summary.status.mashOverallSnapshot.ph.kind}) <code>{fmt("pH", summary.status.mashOverallSnapshot.ph.value, 2)}</code> · Final alkalinity {" "}
                  <code>{fmt("ppm_as_CaCO3", summary.status.mashOverallSnapshot.finalAlkalinityPpmCaCO3, 0)}</code>
                </>
              ) : (
                <span className="brew-muted">—</span>
              )}
              {" · "}
              <Link href={`/recipes/${recipeId}/water/mash#overall-mash-water-result`}>{t("openMashOverall")}</Link>
            </li>
          </ul>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => void refresh()} disabled={authState.status !== "ready" || loading}>
              {loading ? t("refreshing") : t("refresh")}
            </button>
            <span className="brew-muted" role="status" aria-live="polite">
              {profiles ? t("profilesLoaded") : t("profilesNotLoaded")}
            </span>
          </div>

          {error ? (
            <pre className="brew-error-box" role="alert" style={{ marginTop: 12 }}>
              {error}
            </pre>
          ) : null}
        </section>

        <section className="brew-panel" aria-labelledby="water-hub-recap">
          <h2 id="water-hub-recap" style={{ marginTop: 0 }}>
            {t("recap")}
          </h2>
          <p className="brew-muted" style={{ marginTop: 0 }}>
            {t("recapSubtitle")}
          </p>

          <details className="fieldBlock fieldBlock--computed">
            <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
              <strong>{t("mergedWaterRecap")}</strong>
              {surfaceMath
                ? (() => {
                    const ex = mathExplain["waterHub.mergedWaterRecap"];
                    const title = tMath(ex.titleKey);
                    return (
                      <MathHelpPopover
                        title={title}
                        body={buildWaterMathBody({
                          key: "waterHub.mergedWaterRecap",
                          tMath,
                          locale,
                          ctx: {
                            streams: (displayStreams ?? []).map((s) => ({
                              label: s.label,
                              volumeLiters: s.volumeLiters,
                              ph: s.ph,
                              finalAlkalinityPpmCaCO3: s.finalAlkalinityPpmCaCO3,
                            })),
                            totalVolumeLiters: summary?.merged.totalVolumeLiters ?? null,
                            mergedPh: summary?.merged.ph ?? null,
                            mergedFinalAlk: summary?.merged.finalAlkalinityPpmCaCO3 ?? null,
                          },
                          units: {
                            L: tUnits("L"),
                            ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                            ppm: tUnits("ppm"),
                            g: tUnits("g"),
                          },
                        })}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  })()
                : null}
              <span className="brew-field-badge">{t("computed")}</span>
              <span className="brew-muted">{t("clickToExpand")}</span>
            </summary>

            {summary && displayStreams ? (
              <>
                <h3 style={{ marginTop: 12 }}>{t("perStream")}</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" }}>{t("colStream")}</th>
                        <th style={{ textAlign: "left" }}>{t("colVolumeL")}</th>
                        <th style={{ textAlign: "left" }}>{t("colPh")}</th>
                        <th style={{ textAlign: "left" }}>{t("colFinalAlk")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayStreams.map((s) => (
                        <tr key={`${s.key}-summary`}>
                          <td style={{ textAlign: "left" }}>
                            <strong>{s.label}</strong>
                          </td>
                          <td style={{ textAlign: "left" }}>
                            {s.volumeLiters == null ? "—" : fmt("L", s.volumeLiters, 2)}
                          </td>
                          <td style={{ textAlign: "left" }}>{s.ph == null ? "—" : fmt("pH", s.ph, 2)}</td>
                          <td style={{ textAlign: "left" }}>
                            {s.finalAlkalinityPpmCaCO3 == null
                              ? "—"
                              : fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(s.finalAlkalinityPpmCaCO3), 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 style={{ marginTop: 16 }}>{t("mergedSummary")}</h3>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    {t("totalVolume")}: <code>{fmt("L", summary.merged.totalVolumeLiters, 2)}</code> {tUnits("L")}
                  </li>
                  <li>
                    {t("approxMergedPh")}: <code>{summary.merged.ph == null ? "—" : fmt("pH", summary.merged.ph, 2)}</code>
                  </li>
                  <li>
                    {t("mergedFinalAlk")}: {" "}
                    <code>
                      {summary.merged.finalAlkalinityPpmCaCO3 == null
                        ? "—"
                        : fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(summary.merged.finalAlkalinityPpmCaCO3), 0)}
                    </code>{" "}
                    {tUnits("ppmAsCaCO3")}
                  </li>
                </ul>

                <h4 style={{ marginTop: 12, marginBottom: 6 }}>{t("additionsPerStream")}</h4>
                <ul style={{ marginTop: 0 }}>
                  {displayStreams.map((s) => (
                    <li key={`adds-${s.key}`}>
                      <strong>{s.label}</strong>
                      <ul style={{ marginTop: 6 }}>
                        {(s.saltsAddedLabel ? s.saltsAddedLabel.split("; ") : []).length ? (
                          (s.saltsAddedLabel as string).split("; ").map((p) => (
                            <li key={`adds-${s.key}-salt-${p}`}>
                              <span className="brew-muted">{t("salt")}</span> <code>{p}</code>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span className="brew-muted">{t("salt")}</span> <code>—</code>
                          </li>
                        )}
                        <li>
                          <span className="brew-muted">{t("acid")}</span> <code>{s.acidType ?? "—"}</code>
                          {s.acidAmountLabel ? <span className="brew-muted"> · {s.acidAmountLabel}</span> : null}
                        </li>
                      </ul>
                    </li>
                  ))}
                </ul>

                {summary.merged.ionsPpm ? (
                  <>
                    <div style={{ marginTop: 8, marginBottom: 6, display: "flex", gap: 8, alignItems: "baseline" }}>
                      <strong>{t("mergedIonsTitle")}</strong>
                      {surfaceMath
                        ? (() => {
                            const ex = mathExplain["waterHub.mergedIons"];
                            const title = tMath(ex.titleKey);
                            return (
                              <MathHelpPopover
                                title={title}
                                body={buildWaterMathBody({
                                  key: "waterHub.mergedIons",
                                  tMath,
                                  locale,
                                  ctx: {
                                    ions: summary.merged.ionsPpm,
                                  },
                                  units: {
                                    L: tUnits("L"),
                                    ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                                    ppm: tUnits("ppm"),
                                    g: tUnits("g"),
                                  },
                        })}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  })()
                : null}
                    </div>
                    <p className="brew-muted" style={{ marginTop: 8, marginBottom: 8 }}>
                      {t("mergedIonsDescription")}
                    </p>
                    <div style={{ overflowX: "auto", marginTop: 8 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th align="left">{t("ion")}</th>
                            <th align="left">{t("mergedPpm")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            [
                              ["Ca", summary.merged.ionsPpm.calcium],
                              ["Mg", summary.merged.ionsPpm.magnesium],
                              ["Na", summary.merged.ionsPpm.sodium],
                              ["SO4", summary.merged.ionsPpm.sulfate],
                              ["Cl", summary.merged.ionsPpm.chloride],
                              ["HCO3", summary.merged.ionsPpm.bicarbonate],
                            ] as const
                          ).map(([label, v]) => (
                            <tr key={label}>
                              <td>{label}</td>
                              <td align="left">{fmt("ppm", v, 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="brew-muted" style={{ marginTop: 8 }}>
                    {t("noMergedProfile")}
                  </p>
                )}
              </>
            ) : (
              <p className="brew-muted" style={{ marginTop: 8 }}>
                {t("noSettingsLoaded")}
              </p>
            )}
          </details>
        </section>

        <section className="brew-panel" aria-labelledby="water-hub-final-recap">
          <h2 id="water-hub-final-recap" style={{ marginTop: 0 }}>
            {t("finalRecapTitle")}
          </h2>
          <p className="brew-muted" style={{ marginTop: 0 }}>
            {t("finalRecapSubtitle")}
          </p>

          <ul style={{ marginTop: 0 }}>
            <li>
              {t("predictedMashPh")} {" "}
              {summary?.finalRecap.predictedMashPh ? (
                <>
                  <code>{fmt("pH", summary.finalRecap.predictedMashPh.value, 2)}</code>{" "}
                  <span className="brew-muted">({summary.finalRecap.predictedMashPh.kind})</span>
                </>
              ) : (
                <span className="brew-muted">—</span>
              )}
            </li>
            <li>
              {t("residualAlkalinity")}
              <ul style={{ marginTop: 6 }}>
                <li>
                  {t("raMashOverall")}: {" "}
                  {summary?.finalRecap.residualAlkalinityMashOverallPpmCaCO3 != null ? (
                    <code>{fmt("ppm_as_CaCO3", summary.finalRecap.residualAlkalinityMashOverallPpmCaCO3, 0)}</code>
                  ) : (
                    <span className="brew-muted">—</span>
                  )}{" "}
                  <span className="brew-muted">{tUnits("ppmAsCaCO3")}</span>
                </li>
                <li>
                  {t("raMerged")}: {" "}
                  {summary?.finalRecap.residualAlkalinityMergedPpmCaCO3 != null ? (
                    <code>{fmt("ppm_as_CaCO3", summary.finalRecap.residualAlkalinityMergedPpmCaCO3, 0)}</code>
                  ) : (
                    <span className="brew-muted">—</span>
                  )}{" "}
                  <span className="brew-muted">{tUnits("ppmAsCaCO3")}</span>
                </li>
              </ul>
            </li>
            <li>
              {t("styleExpectedRa")}: {" "}
              {summary?.finalRecap.styleExpectedRa ? (
                <>
                  <code>
                    {fmt("ppm_as_CaCO3", summary.finalRecap.styleExpectedRa.min, 0)}..{fmt("ppm_as_CaCO3", summary.finalRecap.styleExpectedRa.max, 0)}
                  </code>{" "}
                  <span className="brew-muted">{tUnits("ppmAsCaCO3")}</span>{" "}
                  <span className="brew-muted">· {t(summary.finalRecap.styleExpectedRa.rationaleKey)}</span>
                </>
              ) : (
                <span className="brew-muted">{t("styleExpectedRaNa")}</span>
              )}
            </li>
          </ul>

          <p className="brew-muted" style={{ marginBottom: 0 }}>
            {t("finalRecapCaveat")}
          </p>
        </section>

        <section className="brew-panel" aria-labelledby="water-hub-alkalinity-vs-bicarbonate">
          <h2 id="water-hub-alkalinity-vs-bicarbonate" style={{ marginTop: 0 }}>
            {t("alkVsBicarbTitle")}
          </h2>
          <p className="brew-muted" style={{ marginTop: 0 }}>
            {t("alkVsBicarbSubtitle")}
          </p>
          <ul style={{ marginTop: 0 }}>
            <li>{t("alkVsBicarbPoint1")}</li>
            <li>{t("alkVsBicarbPoint2")}</li>
            <li>{t("alkVsBicarbPoint3")}</li>
            <li>{t("alkVsBicarbPoint4")}</li>
          </ul>
        </section>
      </div>
    </>
  );
}
