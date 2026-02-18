"use client";

import { Link } from "../../../../src/i18n/navigation";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { formatFixed } from "../../../../src/i18n/format";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../_components/SurfaceMathToggleRow";
import { mathExplain } from "./_lib/mathExplain";
import { buildWaterMathBody } from "./_lib/mathBodies";
import { RecipeMetaLine } from "./_components/RecipeMetaLine";
import { fetchRecipeWaterHubSummary, type RecipeWaterHubStreamSummary, type RecipeWaterHubSummary } from "./_lib/waterHubSummary";

export default function WaterHubPage() {
  const t = useTranslations("waterHub");
  const tsalts = useTranslations("salts");
  const tMath = useTranslations("math");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const authState = useRequireAuth({ requireActiveAccount: true });

  const [summary, setSummary] = useState<RecipeWaterHubSummary | null>(null);

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
      const res = await fetchRecipeWaterHubSummary(recipeId);
      setSummary(res.summary ?? null);
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

  const mashLast = summary?.status.mashLastCalculatedAt ? new Date(summary.status.mashLastCalculatedAt).toLocaleString() : "—";
  const spargeLast = summary?.status.spargeLastCalculatedAt ? new Date(summary.status.spargeLastCalculatedAt).toLocaleString() : "—";
  const boilLast = summary?.status.boilLastCalculatedAt ? new Date(summary.status.boilLastCalculatedAt).toLocaleString() : "—";

  const displayAlkalinityPpmCaCO3 = (v: number) => {
    // Keep consistent with boil page: tiny negatives are usually solver/float tolerances.
    if (v < 0 && v > -1) return 0;
    return v;
  };

  const displayStreams = useMemo(() => {
    const streams = summary?.streams ?? [];
    const labelOf = (k: RecipeWaterHubStreamSummary["key"]) => {
      switch (k) {
        case "mash":
          return t("mashWater");
        case "sparge":
          return t("spargeWater");
        case "boil":
          return t("additionalBoilWater");
      }
    };
    return streams.map((s) => ({ ...s, label: labelOf(s.key) }));
  }, [summary?.streams, t]);

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

  const formatAcidAmountLabel = (s: RecipeWaterHubStreamSummary): string | null => {
    const suffix =
      s.acidMode === "manual" ? tsalts("modeManualSuffix") : s.acidMode === "required" ? tsalts("modeRequiredSuffix") : "";
    const isSolid = s.acidStrengthKind === "solid";
    const v = isSolid ? s.acidAmountGrams : s.acidAmountMl;
    const unit = isSolid ? "g" : "mL";
    if (v == null) return null;
    return `${formatFixed(locale, v, 3)} ${unit}${suffix ? ` ${suffix}` : ""}`;
  };

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
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
        <pre className="errorBox" role="alert">
          {authState.error}
        </pre>
      ) : null}

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel" aria-labelledby="water-hub-links">
          <h2 id="water-hub-links" style={{ marginTop: 0 }}>
            {t("chooseArea")}
          </h2>
          <ul>
            <li>
              <Link href={`/recipes/${recipeId}/water/mash`}>{t("mashWater")}</Link>
              <span className="muted">
                {" "}
                · {t("lastCalculated")}: {mashLast}
              </span>
            </li>
            <li>
              <Link href={`/recipes/${recipeId}/water/sparge`}>{t("spargeWater")}</Link>
              <span className="muted">
                {" "}
                · {t("lastCalculated")}: {spargeLast}
              </span>
            </li>
            <li>
              <Link href={`/recipes/${recipeId}/water/boil`}>{t("additionalBoilWater")}</Link>
              <span className="muted">
                {" "}
                · {t("lastCalculated")}: {boilLast}
              </span>
            </li>
          </ul>
          <p className="muted" style={{ marginBottom: 0 }}>
            {t("manageProfilesOn")} <Link href="/water-profiles">{t("waterProfilesLink")}</Link>.
          </p>
        </section>

        <section className="panel" aria-labelledby="water-hub-status">
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
              {t("mashOverallSnapshot")}:{" "}
              {summary?.status.mashOverallSnapshot ? (
                <>
                  pH ({summary.status.mashOverallSnapshot.ph.kind}){" "}
                  <code>{formatFixed(locale, summary.status.mashOverallSnapshot.ph.value, 2)}</code> · Final alkalinity{" "}
                  <code>{formatFixed(locale, summary.status.mashOverallSnapshot.finalAlkalinityPpmCaCO3, 2)}</code>
                </>
              ) : (
                <span className="muted">—</span>
              )}
              {" · "}
              <Link href={`/recipes/${recipeId}/water/mash#overall-mash-water-result`}>{t("openMashOverall")}</Link>
            </li>
          </ul>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => void refresh()} disabled={authState.status !== "ready" || loading}>
              {loading ? t("refreshing") : t("refresh")}
            </button>
            <span className="muted" role="status" aria-live="polite">
              {summary ? t("profilesLoaded") : t("profilesNotLoaded")}
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
            {t("recap")}
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            {t("recapSubtitle")}
          </p>

          <details className="fieldBlock fieldBlock--computed">
            <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
              <strong>{t("mergedWaterRecap")}</strong>
              {surfaceMath ? (() => {
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
                        streams: displayStreams ?? [],
                        totalVolumeLiters: summary?.merged.totalVolumeLiters ?? null,
                        mergedPh: summary?.merged.ph ?? null,
                        mergedFinalAlk: summary?.merged.finalAlkalinityPpmCaCO3 ?? null,
                      },
                    })}
                    ariaLabel={tMath("fxLabel", { topic: title })}
                  />
                );
              })() : null}
              <span className="fieldBadge">{t("computed")}</span>
              <span className="muted">{t("clickToExpand")}</span>
            </summary>

            {summary ? (
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
                            {s.volumeLiters == null ? "—" : formatFixed(locale, s.volumeLiters, 2)}
                          </td>
                          <td style={{ textAlign: "left" }}>{s.ph == null ? "—" : formatFixed(locale, s.ph, 2)}</td>
                          <td style={{ textAlign: "left" }}>
                            {s.finalAlkalinityPpmCaCO3 == null
                              ? "—"
                              : formatFixed(
                                  locale,
                                  displayAlkalinityPpmCaCO3(s.finalAlkalinityPpmCaCO3),
                                  2,
                                )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 style={{ marginTop: 16 }}>{t("mergedSummary")}</h3>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    {t("totalVolume")}: <code>{formatFixed(locale, summary.merged.totalVolumeLiters, 2)}</code> L
                  </li>
                  <li>
                    {t("approxMergedPh")}:{" "}
                    <code>{summary.merged.ph == null ? "—" : formatFixed(locale, summary.merged.ph, 2)}</code>
                  </li>
                  <li>
                    {t("mergedFinalAlk")}:{" "}
                    <code>
                      {summary.merged.finalAlkalinityPpmCaCO3 == null
                        ? "—"
                        : formatFixed(locale, displayAlkalinityPpmCaCO3(summary.merged.finalAlkalinityPpmCaCO3), 2)}
                    </code>{" "}
                    ppm as CaCO3
                  </li>
                </ul>

                <h4 style={{ marginTop: 12, marginBottom: 6 }}>{t("additionsPerStream")}</h4>
                <ul style={{ marginTop: 0 }}>
                  {displayStreams.map((s) => (
                    <li key={`adds-${s.key}`}>
                      <strong>{s.label}</strong>
                      <ul style={{ marginTop: 6 }}>
                        {(s.saltsBreakdown ?? []).length ? (
                          (s.saltsBreakdown as Array<{ saltKey: string; grams: number }>).map((row) => (
                            <li key={`adds-${s.key}-salt-${row.saltKey}`}>
                              <span className="muted">{t("salt")}</span>{" "}
                              <code>
                                {formatSaltKeyLabel(row.saltKey)} {formatFixed(locale, row.grams, 3)} g
                              </code>
                            </li>
                          ))
                        ) : null}
                        {!(s.saltsBreakdown ?? []).length ? (
                          <li>
                            <span className="muted">{t("salt")}</span> <code>—</code>
                          </li>
                        ) : null}
                        <li>
                          <span className="muted">{t("acid")}</span>{" "}
                          <code>{s.acidType ?? "—"}</code>
                          {formatAcidAmountLabel(s) ? <span className="muted"> · {formatAcidAmountLabel(s)}</span> : null}
                        </li>
                      </ul>
                    </li>
                  ))}
                </ul>

                {summary.merged.ionsPpm ? (
                  <>
                    <div style={{ marginTop: 8, marginBottom: 6, display: "flex", gap: 8, alignItems: "baseline" }}>
                      <strong>{t("mergedIonsTitle")}</strong>
                      {surfaceMath ? (() => {
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
                                ions: summary?.merged.ionsPpm ?? null,
                              },
                            })}
                            ariaLabel={tMath("fxLabel", { topic: title })}
                          />
                        );
                      })() : null}
                    </div>
                    <p className="muted" style={{ marginTop: 8, marginBottom: 8 }}>
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
                            <td align="left">{formatFixed(locale, v, 2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                ) : (
                  <p className="muted" style={{ marginTop: 8 }}>
                    {t("noMergedProfile")}
                  </p>
                )}
              </>
            ) : (
              <p className="muted" style={{ marginTop: 8 }}>
                {t("noSettingsLoaded")}
              </p>
            )}
          </details>
        </section>

        <section className="panel" aria-labelledby="water-hub-final-recap">
          <h2 id="water-hub-final-recap" style={{ marginTop: 0 }}>
            {t("finalRecapTitle")}
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            {t("finalRecapSubtitle")}
          </p>

          <ul style={{ marginTop: 0 }}>
            <li>
              {t("predictedMashPh")}{" "}
              {summary?.finalRecap.predictedMashPh ? (
                <>
                  <code>{formatFixed(locale, summary.finalRecap.predictedMashPh.value, 2)}</code>{" "}
                  <span className="muted">({summary.finalRecap.predictedMashPh.kind})</span>
                </>
              ) : (
                <span className="muted">—</span>
              )}
            </li>
            <li>
              {t("residualAlkalinity")}
              <ul style={{ marginTop: 6 }}>
                <li>
                  {t("raMashOverall")}:{" "}
                  {typeof summary?.finalRecap.residualAlkalinityMashOverallPpmCaCO3 === "number" ? (
                    <code>{formatFixed(locale, summary.finalRecap.residualAlkalinityMashOverallPpmCaCO3, 2)}</code>
                  ) : (
                    <span className="muted">—</span>
                  )}{" "}
                  <span className="muted">{t("ppmAsCaCO3")}</span>
                </li>
                <li>
                  {t("raMerged")}:{" "}
                  {typeof summary?.finalRecap.residualAlkalinityMergedPpmCaCO3 === "number" ? (
                    <code>{formatFixed(locale, summary.finalRecap.residualAlkalinityMergedPpmCaCO3, 2)}</code>
                  ) : (
                    <span className="muted">—</span>
                  )}{" "}
                  <span className="muted">{t("ppmAsCaCO3")}</span>
                </li>
              </ul>
            </li>
            <li>
              {t("styleExpectedRa")}:{" "}
              {summary?.finalRecap.styleExpectedRa ? (
                <>
                  <code>
                    {formatFixed(locale, summary.finalRecap.styleExpectedRa.min, 0)}..
                    {formatFixed(locale, summary.finalRecap.styleExpectedRa.max, 0)}
                  </code>{" "}
                  <span className="muted">{t("ppmAsCaCO3")}</span>{" "}
                  <span className="muted">· {t(summary.finalRecap.styleExpectedRa.rationaleKey)}</span>
                </>
              ) : (
                <span className="muted">{t("styleExpectedRaNa")}</span>
              )}
            </li>
          </ul>

          <p className="muted" style={{ marginBottom: 0 }}>
            {t("finalRecapCaveat")}
          </p>
        </section>

        <section className="panel" aria-labelledby="water-hub-alkalinity-vs-bicarbonate">
          <h2 id="water-hub-alkalinity-vs-bicarbonate" style={{ marginTop: 0 }}>
            {t("alkVsBicarbTitle")}
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
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

