"use client";

import { Link } from "../../../../src/i18n/navigation";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { apiFetch, type WaterProfilesResponse } from "./_lib/api";
import { fetchRecipeWaterSettings, type RecipeWaterSettingsResponse } from "./_lib/waterSettings";
import type { IonProfilePpm } from "./_lib/waterChem";
import { combineAfterSaltsAndAcid } from "./_lib/waterChem";
import { formatFixed } from "../../../../src/i18n/format";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../_components/SurfaceMathToggleRow";
import { mathExplain } from "./_lib/mathExplain";
import { RecipeMetaLine } from "./_components/RecipeMetaLine";

type MashOverallResult = {
  calculatedAt: string;
  ionsPpm: IonProfilePpm;
  finalAlkalinityPpmCaCO3: number;
  ph: { kind: "target" | "estimated"; value: number };
};

export default function WaterHubPage() {
  const t = useTranslations("waterHub");
  const tsalts = useTranslations("salts");
  const tMath = useTranslations("math");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const authState = useRequireAuth({ requireActiveAccount: true });

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [settings, setSettings] = useState<RecipeWaterSettingsResponse["settings"] | null>(null);
  const [recipeStyleKey, setRecipeStyleKey] = useState<string | null>(null);
  const [beerStyles, setBeerStyles] = useState<
    null | {
      styles: Array<{
        key: string;
        name: string;
        category: string | null;
        categoryId: string | null;
        code: string;
      }>;
    }
  >(null);

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
      setProfiles(profRes.data as WaterProfilesResponse);

      const s = (await fetchRecipeWaterSettings(recipeId)) as RecipeWaterSettingsResponse;
      setSettings(s.settings ?? null);

      const recipeRes = await apiFetch(`/api/recipes/${recipeId}`);
      if (!recipeRes.ok) throw new Error(JSON.stringify(recipeRes.data));
      setRecipeStyleKey(extractRecipeStyleKey(recipeRes.data));

      const stylesRes = await apiFetch("/api/styles");
      if (!stylesRes.ok) throw new Error(JSON.stringify(stylesRes.data));
      setBeerStyles(extractBeerStyles(stylesRes.data));
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
    return o as MashOverallResult;
  }, [settings?.mashOverallLastResultJson]);

  const displayAlkalinityPpmCaCO3 = (v: number) => {
    // Keep consistent with boil page: tiny negatives are usually solver/float tolerances.
    if (v < 0 && v > -1) return 0;
    return v;
  };

  const calcResidualAlkalinityPpmCaCO3 = (args: {
    alkalinityPpmCaCO3: number;
    calciumPpm: number;
    magnesiumPpm: number;
  }) => {
    return args.alkalinityPpmCaCO3 - 0.713 * args.calciumPpm - 0.588 * args.magnesiumPpm;
  };

  const expectedRa = useMemo(() => {
    if (!recipeStyleKey || recipeStyleKey === "custom") return null;
    const style = beerStyles?.styles?.find((s) => s.key === recipeStyleKey) ?? null;
    if (!style) return null;

    const text = `${style.category ?? ""} ${style.name}`.trim().toLowerCase();
    const includes = (needle: string) => text.includes(needle);

    if (
      includes("stout") ||
      includes("porter") ||
      includes("schwarz") ||
      includes("dunkel") ||
      includes("dark") ||
      includes("black")
    ) {
      return { min: 50, max: 200, rationaleKey: "styleExpectedRaDark" as const };
    }
    if (
      includes("ipa") ||
      includes("pale") ||
      includes("pils") ||
      includes("lager") ||
      includes("blonde") ||
      includes("kölsch") ||
      includes("kolsch") ||
      includes("saison")
    ) {
      return { min: -50, max: 50, rationaleKey: "styleExpectedRaPale" as const };
    }
    if (
      includes("amber") ||
      includes("red") ||
      includes("brown") ||
      includes("bock") ||
      includes("vienna") ||
      includes("märzen") ||
      includes("marzen")
    ) {
      return { min: 0, max: 100, rationaleKey: "styleExpectedRaAmber" as const };
    }

    return null;
  }, [beerStyles?.styles, recipeStyleKey]);

  type StreamSummary = {
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

  const recap = useMemo(() => {
    if (!settings) return null;

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

    const parseSaltsBreakdownLabel = (v: unknown): string | null => {
      if (!v || typeof v !== "object") return null;
      const o = v as any;
      const b = o?.result?.breakdown;
      if (!Array.isArray(b)) return null;

      const parts: string[] = [];
      for (const row of b) {
        if (!row || typeof row !== "object") continue;
        const r = row as any;
        const saltKey = typeof r.saltKey === "string" ? r.saltKey : null;
        const grams = typeof r.grams === "number" && Number.isFinite(r.grams) ? r.grams : null;
        if (!saltKey || grams == null || !(grams > 0)) continue;
        parts.push(`${formatSaltKeyLabel(saltKey)} ${formatFixed(locale, grams, 3)} g`);
      }

      return parts.length ? parts.join("; ") : null;
    };

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
    const mashSaltsAddedLabel = parseSaltsBreakdownLabel(settings.mashSaltsLastResultJson);
    const mashAcidAmountLabel =
      settings.mashAcidificationMode === "manual"
        ? settings.mashStrengthKind === "solid"
          ? settings.mashManualAcidAddedGrams != null
            ? `${formatFixed(locale, settings.mashManualAcidAddedGrams, 3)} g ${tsalts("modeManualSuffix")}`
            : null
          : settings.mashManualAcidAddedMl != null
            ? `${formatFixed(locale, settings.mashManualAcidAddedMl, 3)} mL ${tsalts("modeManualSuffix")}`
            : null
        : settings.mashStrengthKind === "solid"
          ? settings.mashLastAcidRequiredGrams != null
            ? `${formatFixed(locale, settings.mashLastAcidRequiredGrams, 3)} g ${tsalts("modeRequiredSuffix")}`
            : null
          : settings.mashLastAcidRequiredMl != null
            ? `${formatFixed(locale, settings.mashLastAcidRequiredMl, 3)} mL ${tsalts("modeRequiredSuffix")}`
            : null;

    const spargeVolumeLiters = typeof settings.spargeVolumeLiters === "number" ? settings.spargeVolumeLiters : null;
    const spargePh =
      settings.spargeAcidificationMode === "manual"
        ? settings.spargeManualLastAchievedPh ?? null
        : typeof settings.spargeTargetPh === "number"
          ? settings.spargeTargetPh
          : null;
    const spargeFinalAlk = settings.spargeLastFinalAlkalinityPpmCaCO3 ?? null;
    const spargeSaltsAddedLabel = parseSaltsBreakdownLabel(settings.spargeSaltsLastResultJson);
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
            ? `${formatFixed(locale, settings.spargeManualAcidAddedGrams, 3)} g ${tsalts("modeManualSuffix")}`
            : null
          : settings.spargeManualAcidAddedMl != null
            ? `${formatFixed(locale, settings.spargeManualAcidAddedMl, 3)} mL ${tsalts("modeManualSuffix")}`
            : null
        : settings.spargeStrengthKind === "solid"
          ? settings.spargeLastAcidRequiredGrams != null
            ? `${formatFixed(locale, settings.spargeLastAcidRequiredGrams, 3)} g ${tsalts("modeRequiredSuffix")}`
            : null
          : settings.spargeLastAcidRequiredMl != null
            ? `${formatFixed(locale, settings.spargeLastAcidRequiredMl, 3)} mL ${tsalts("modeRequiredSuffix")}`
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
    const boilSaltsAddedLabel = parseSaltsBreakdownLabel(settings.boilSaltsLastResultJson);
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
            ? `${formatFixed(locale, settings.boilManualAcidAddedGrams, 3)} g ${tsalts("modeManualSuffix")}`
            : null
          : settings.boilManualAcidAddedMl != null
            ? `${formatFixed(locale, settings.boilManualAcidAddedMl, 3)} mL ${tsalts("modeManualSuffix")}`
            : null
        : settings.boilStrengthKind === "solid"
          ? settings.boilLastAcidRequiredGrams != null
            ? `${formatFixed(locale, settings.boilLastAcidRequiredGrams, 3)} g ${tsalts("modeRequiredSuffix")}`
            : null
          : settings.boilLastAcidRequiredMl != null
            ? `${formatFixed(locale, settings.boilLastAcidRequiredMl, 3)} mL ${tsalts("modeRequiredSuffix")}`
            : null;

    const streams: StreamSummary[] = [
      {
        key: "mash",
        label: t("mashWater"),
        volumeLiters: mashVolumeLiters,
        ph: mashPh,
        finalAlkalinityPpmCaCO3: mashFinalAlk,
        saltsAddedLabel: mashSaltsAddedLabel,
        acidType: settings.mashAcidType ?? null,
        acidAmountLabel: mashAcidAmountLabel,
        ionsAfterAcid: mashIonsAfterAcid,
      },
      {
        key: "sparge",
        label: t("spargeWater"),
        volumeLiters: spargeVolumeLiters,
        ph: spargePh,
        finalAlkalinityPpmCaCO3: spargeFinalAlk,
        saltsAddedLabel: spargeSaltsAddedLabel,
        acidType: settings.spargeAcidType ?? null,
        acidAmountLabel: spargeAcidAmountLabel,
        ionsAfterAcid: spargeIonsAfterAcid,
      },
      {
        key: "boil",
        label: t("additionalBoilWater"),
        volumeLiters: boilVolumeLiters,
        ph: boilPh,
        finalAlkalinityPpmCaCO3: boilFinalAlk,
        saltsAddedLabel: boilSaltsAddedLabel,
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
  }, [settings, overall, t, tsalts]);

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
              {t("mashAcidMode")}: <code>{settings?.mashAcidificationMode ?? "—"}</code>
            </li>
            <li>
              {t("spargeAcidMode")}: <code>{settings?.spargeAcidificationMode ?? "—"}</code>
            </li>
            <li>
              {t("mashOverallSnapshot")}:{" "}
              {overall ? (
                <>
                  pH ({overall.ph.kind}) <code>{formatFixed(locale, overall.ph.value, 2)}</code> · Final alkalinity{" "}
                  <code>{formatFixed(locale, overall.finalAlkalinityPpmCaCO3, 2)}</code>
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
              {profiles ? t("profilesLoaded") : t("profilesNotLoaded")}
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
                    body={tMath(ex.bodyKey)}
                    ariaLabel={tMath("fxLabel", { topic: title })}
                  />
                );
              })() : null}
              <span className="fieldBadge">{t("computed")}</span>
              <span className="muted">{t("clickToExpand")}</span>
            </summary>

            {recap ? (
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
                      {recap.streams.map((s) => (
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
                    {t("totalVolume")}: <code>{formatFixed(locale, recap.totalVolumeLiters, 2)}</code> L
                  </li>
                  <li>
                    {t("approxMergedPh")}:{" "}
                    <code>{recap.mergedPh == null ? "—" : formatFixed(locale, recap.mergedPh, 2)}</code>
                  </li>
                  <li>
                    {t("mergedFinalAlk")}:{" "}
                    <code>
                      {recap.mergedFinalAlk == null
                        ? "—"
                        : formatFixed(locale, displayAlkalinityPpmCaCO3(recap.mergedFinalAlk), 2)}
                    </code>{" "}
                    ppm as CaCO3
                  </li>
                </ul>

                <h4 style={{ marginTop: 12, marginBottom: 6 }}>{t("additionsPerStream")}</h4>
                <ul style={{ marginTop: 0 }}>
                  {recap.streams.map((s) => (
                    <li key={`adds-${s.key}`}>
                      <strong>{s.label}</strong>
                      <ul style={{ marginTop: 6 }}>
                        {(s.saltsAddedLabel ? s.saltsAddedLabel.split("; ") : []).length ? (
                          (s.saltsAddedLabel as string).split("; ").map((p) => (
                            <li key={`adds-${s.key}-salt-${p}`}>
                              <span className="muted">{t("salt")}</span> <code>{p}</code>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span className="muted">{t("salt")}</span> <code>—</code>
                          </li>
                        )}
                        <li>
                          <span className="muted">{t("acid")}</span>{" "}
                          <code>{s.acidType ?? "—"}</code>
                          {s.acidAmountLabel ? <span className="muted"> · {s.acidAmountLabel}</span> : null}
                        </li>
                      </ul>
                    </li>
                  ))}
                </ul>

                {recap.mergedIons ? (
                  <>
                    <div style={{ marginTop: 8, marginBottom: 6, display: "flex", gap: 8, alignItems: "baseline" }}>
                      <strong>{t("mergedIonsTitle")}</strong>
                      {surfaceMath ? (() => {
                        const ex = mathExplain["waterHub.mergedIons"];
                        const title = tMath(ex.titleKey);
                        return (
                          <MathHelpPopover
                            title={title}
                            body={tMath(ex.bodyKey)}
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
              {overall ? (
                <>
                  <code>{formatFixed(locale, overall.ph.value, 2)}</code>{" "}
                  <span className="muted">({overall.ph.kind})</span>
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
                  {overall ? (
                    <code>
                      {formatFixed(
                        locale,
                        calcResidualAlkalinityPpmCaCO3({
                          alkalinityPpmCaCO3: displayAlkalinityPpmCaCO3(overall.finalAlkalinityPpmCaCO3),
                          calciumPpm: overall.ionsPpm.calcium,
                          magnesiumPpm: overall.ionsPpm.magnesium,
                        }),
                        2,
                      )}
                    </code>
                  ) : (
                    <span className="muted">—</span>
                  )}{" "}
                  <span className="muted">{t("ppmAsCaCO3")}</span>
                </li>
                <li>
                  {t("raMerged")}:{" "}
                  {recap?.mergedIons && typeof recap.mergedFinalAlk === "number" ? (
                    <code>
                      {formatFixed(
                        locale,
                        calcResidualAlkalinityPpmCaCO3({
                          alkalinityPpmCaCO3: displayAlkalinityPpmCaCO3(recap.mergedFinalAlk),
                          calciumPpm: recap.mergedIons.calcium,
                          magnesiumPpm: recap.mergedIons.magnesium,
                        }),
                        2,
                      )}
                    </code>
                  ) : (
                    <span className="muted">—</span>
                  )}{" "}
                  <span className="muted">{t("ppmAsCaCO3")}</span>
                </li>
              </ul>
            </li>
            <li>
              {t("styleExpectedRa")}:{" "}
              {expectedRa ? (
                <>
                  <code>
                    {formatFixed(locale, expectedRa.min, 0)}..{formatFixed(locale, expectedRa.max, 0)}
                  </code>{" "}
                  <span className="muted">{t("ppmAsCaCO3")}</span>{" "}
                  <span className="muted">· {t(expectedRa.rationaleKey)}</span>
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
      </div>
    </>
  );
}

function extractRecipeStyleKey(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as any;
  const recipe = d?.recipe;
  if (!recipe || typeof recipe !== "object") return null;
  const styleKey = (recipe as any).styleKey;
  if (typeof styleKey !== "string") return null;
  const trimmed = styleKey.trim();
  return trimmed ? trimmed : null;
}

function extractBeerStyles(data: unknown): { styles: Array<{ key: string; name: string; category: string | null; categoryId: string | null; code: string }> } | null {
  if (!data || typeof data !== "object") return null;
  const d = data as any;
  const styles = d?.styles;
  if (!Array.isArray(styles)) return null;

  const out: Array<{ key: string; name: string; category: string | null; categoryId: string | null; code: string }> = [];
  for (const s of styles) {
    if (!s || typeof s !== "object") continue;
    const key = typeof (s as any).key === "string" ? (s as any).key : null;
    const name = typeof (s as any).name === "string" ? (s as any).name : null;
    const code = typeof (s as any).code === "string" ? (s as any).code : null;
    if (!key || !name || !code) continue;
    const category = typeof (s as any).category === "string" ? (s as any).category : null;
    const categoryId = typeof (s as any).categoryId === "string" ? (s as any).categoryId : null;
    out.push({ key, name, category, categoryId, code });
  }

  return { styles: out };
}

