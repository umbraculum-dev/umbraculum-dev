"use client";

import { Link } from "../../../../src/i18n/navigation";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { IonProfilePpm } from "@umbraculum/contracts";

import { parseWaterProfilesResponse } from "@umbraculum/contracts";
import { Accordion, Button, H1, H3, H4, SizableText, View, XStack, YStack } from "tamagui";

import { apiFetch, type WaterProfilesResponse } from "./_lib/api";
import { fetchRecipeWaterHubSummary, type RecipeWaterHubSummaryResponse } from "./_lib/waterHubSummary";
import { formatWithHint } from "../../../../src/i18n/format";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../_components/SurfaceMathToggleRow";
import { mathExplain } from "./_lib/mathExplain";
import { buildWaterMathBody } from "./_lib/mathBodies";
import { ErrorBox, FieldBadge } from "../../../_components/recipe-edit";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@brewery/recipes-ui";
import { BrewAccordionSection } from "../../../_components/BrewAccordionSection";

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

  const authState = useRequireAuth({ requireActiveWorkspace: true });

  const loadRecipeMeta = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/recipes/${id}`);
    if (!res.ok) return null;
    return parseRecipeMetaFromGetRecipeResponse(res.data);
  }, []);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [summaryRes, setSummaryRes] = useState<RecipeWaterHubSummaryResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [surfaceMath, setSurfaceMath] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["links", "status"]);
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
     
  }, [summary, formatHints, locale, t, tUnits, tsalts]);

  return (
    <>
      <YStack width="100%" gap="$1" mb="$2">
        <H1 mt={0} mb={0}>{t("title")}</H1>
        <RecipeMetaLine
          recipeId={recipeId}
          enabled={authState.status === "ready"}
          loadRecipeMeta={loadRecipeMeta}
        />
        <SizableText size="$2" fontFamily="$body" mt={0} mb={0} display="block">
          <Link href={`/recipes/${recipeId}/edit`}>{t("backToRecipeEditor")}</Link>
        </SizableText>
      </YStack>

      <SurfaceMathToggleRow
        left={null}
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authState.status === "error" ? (
        <ErrorBox>{authState.error}</ErrorBox>
      ) : null}

      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
      >
        <BrewAccordionSection
          value="links"
          headingId="water-hub-links"
          title={t("chooseArea")}
          open={openSections.includes("links")}
        >
          <ul className="brew-recipe-edit-list-disc brew-list-mt0">
            <li>
              <SizableText size="$2" fontFamily="$body">
                <Link href={`/recipes/${recipeId}/water/mash`}>{t("mashWater")}</Link>
                <SizableText color="var(--text-muted)"> · {t("lastCalculated")}: {mashLast}</SizableText>
              </SizableText>
            </li>
            <li>
              <SizableText size="$2" fontFamily="$body">
                <Link href={`/recipes/${recipeId}/water/sparge`}>{t("spargeWater")}</Link>
                <SizableText color="var(--text-muted)"> · {t("lastCalculated")}: {spargeLast}</SizableText>
              </SizableText>
            </li>
            <li>
              <SizableText size="$2" fontFamily="$body">
                <Link href={`/recipes/${recipeId}/water/boil`}>{t("additionalBoilWater")}</Link>
                <SizableText color="var(--text-muted)"> · {t("lastCalculated")}: {boilLast}</SizableText>
              </SizableText>
            </li>
          </ul>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
            {t("manageProfilesOn")} <Link href="/water-profiles">{t("waterProfilesLink")}</Link>.
          </SizableText>
        </BrewAccordionSection>

        <BrewAccordionSection
          value="status"
          headingId="water-hub-status"
          title={t("quickStatus")}
          open={openSections.includes("status")}
          spaced
        >
          <ul className="brew-recipe-edit-list-disc brew-list-mt0">
            <li>
              <SizableText size="$2" fontFamily="$body">
                {t("mashAcidMode")}: <code>{summary?.status.mashAcidificationMode ?? "—"}</code>
              </SizableText>
            </li>
            <li>
              <SizableText size="$2" fontFamily="$body">
                {t("spargeAcidMode")}: <code>{summary?.status.spargeAcidificationMode ?? "—"}</code>
              </SizableText>
            </li>
            <li>
              <SizableText size="$2" fontFamily="$body">
                {t("mashOverallSnapshot")}:{" "}
                {summary?.status.mashOverallSnapshot ? (
                  <>
                    pH ({summary.status.mashOverallSnapshot.ph.kind}) <code>{fmt("pH", summary.status.mashOverallSnapshot.ph.value, 2)}</code> · Final alkalinity{" "}
                    <code>{fmt("ppm_as_CaCO3", summary.status.mashOverallSnapshot.finalAlkalinityPpmCaCO3, 0)}</code>
                  </>
                ) : (
                  <SizableText color="var(--text-muted)">—</SizableText>
                )}
                {" · "}
                <Link href={`/recipes/${recipeId}/water/mash#overall-mash-water-result`}>{t("openMashOverall")}</Link>
              </SizableText>
            </li>
          </ul>

          <XStack gap="$3" alignItems="center">
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void refresh()} disabled={authState.status !== "ready" || loading}>
              {loading ? t("refreshing") : t("refresh")}
            </Button>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
              {profiles ? t("profilesLoaded") : t("profilesNotLoaded")}
            </SizableText>
          </XStack>

          {error ? (
            <ErrorBox mt="$3">{error}</ErrorBox>
          ) : null}
        </BrewAccordionSection>

        <BrewAccordionSection
          value="recap"
          headingId="water-hub-recap"
          title={t("recap")}
          open={openSections.includes("recap")}
          spaced
        >
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("recapSubtitle")}
          </SizableText>

          <details className="brew-field-block brew-field-block--computed">
            <summary className="brew-field-block-header brew-details-summary">
              <SizableText size="$2" fontWeight="bold" fontFamily="$body">{t("mergedWaterRecap")}</SizableText>
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
              <FieldBadge>{t("computed")}</FieldBadge>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("clickToExpand")}</SizableText>
            </summary>

            {summary && displayStreams ? (
              <>
                <H3 mt="$3">{t("perStream")}</H3>
                <View className="brew-table-wrap" mb="$4">
                  <table className="brew-table">
                    <thead>
                      <tr>
                        <th align="left">{t("colStream")}</th>
                        <th align="right">{t("colVolumeL")}</th>
                        <th align="right">{t("colPh")}</th>
                        <th align="right">{t("colFinalAlk")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayStreams.map((s) => (
                        <tr key={`${s.key}-summary`}>
                          <td><strong>{s.label}</strong></td>
                          <td align="right">
                            {s.volumeLiters == null ? "—" : fmt("L", s.volumeLiters, 2)}
                          </td>
                          <td align="right">{s.ph == null ? "—" : fmt("pH", s.ph, 2)}</td>
                          <td align="right">
                            {s.finalAlkalinityPpmCaCO3 == null
                              ? "—"
                              : fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(s.finalAlkalinityPpmCaCO3), 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </View>

                <H3 mt="$4">{t("mergedSummary")}</H3>
                <ul className="brew-recipe-edit-list-disc brew-list-mt0">
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

                <H4 mt="$3" mb="$1.5">{t("additionsPerStream")}</H4>
                <ul className="brew-recipe-edit-list-disc brew-list-mt0">
                  {displayStreams.map((s) => (
                    <li key={`adds-${s.key}`}>
                      <SizableText size="$2" fontFamily="$body">
                        <SizableText fontWeight="bold">{s.label}</SizableText>
                      </SizableText>
                      <ul className="brew-recipe-edit-list-disc brew-list-mt1">
                        {(s.saltsAddedLabel ? s.saltsAddedLabel.split("; ") : []).length ? (
                          (s.saltsAddedLabel as string).split("; ").map((p) => (
                            <li key={`adds-${s.key}-salt-${p}`}>
                              <SizableText size="$2" fontFamily="$body">
                                <SizableText color="var(--text-muted)">{t("salt")}</SizableText> <code>{p}</code>
                              </SizableText>
                            </li>
                          ))
                        ) : (
                          <li>
                            <SizableText size="$2" fontFamily="$body">
                              <SizableText color="var(--text-muted)">{t("salt")}</SizableText> <code>—</code>
                            </SizableText>
                          </li>
                        )}
                        <li>
                          <SizableText size="$2" fontFamily="$body">
                            <SizableText color="var(--text-muted)">{t("acid")}</SizableText> <code>{s.acidType ?? "—"}</code>
                            {s.acidAmountLabel ? <SizableText color="var(--text-muted)"> · {s.acidAmountLabel}</SizableText> : null}
                          </SizableText>
                        </li>
                      </ul>
                    </li>
                  ))}
                </ul>

                {summary.merged.ionsPpm ? (
                  <>
                    <XStack mt="$2" mb="$1.5" gap="$2" alignItems="baseline">
                      <SizableText size="$2" fontWeight="bold" fontFamily="$body">{t("mergedIonsTitle")}</SizableText>
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
                    </XStack>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb="$2">
                      {t("mergedIonsDescription")}
                    </SizableText>
                    <View className="brew-table-wrap" mt="$2">
                      <table className="brew-table">
                        <thead>
                          <tr>
                            <th align="left">{t("ion")}</th>
                            <th align="right">{t("mergedPpm")}</th>
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
                              <td align="right">{fmt("ppm", v, 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </View>
                  </>
                ) : (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2">
                    {t("noMergedProfile")}
                  </SizableText>
                )}
              </>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2">
                {t("noSettingsLoaded")}
              </SizableText>
            )}
          </details>
        </BrewAccordionSection>

        <BrewAccordionSection
          value="finalRecap"
          headingId="water-hub-final-recap"
          title={t("finalRecapTitle")}
          open={openSections.includes("finalRecap")}
          spaced
        >
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("finalRecapSubtitle")}
          </SizableText>

          <ul className="brew-recipe-edit-list-disc brew-list-mt0">
            <li>
              <SizableText size="$2" fontFamily="$body">
                {t("predictedMashPh")}{" "}
                {summary?.finalRecap.predictedMashPh ? (
                  <>
                    <code>{fmt("pH", summary.finalRecap.predictedMashPh.value, 2)}</code>{" "}
                    <SizableText color="var(--text-muted)">({summary.finalRecap.predictedMashPh.kind})</SizableText>
                  </>
                ) : (
                  <SizableText color="var(--text-muted)">—</SizableText>
                )}
              </SizableText>
            </li>
            <li>
              <SizableText size="$2" fontFamily="$body">
                {t("residualAlkalinity")}
              </SizableText>
              <ul className="brew-recipe-edit-list-disc brew-list-mt1">
                <li>
                  <SizableText size="$2" fontFamily="$body">
                    {t("raMashOverall")}:{" "}
                    {summary?.finalRecap.residualAlkalinityMashOverallPpmCaCO3 != null ? (
                      <code>{fmt("ppm_as_CaCO3", summary.finalRecap.residualAlkalinityMashOverallPpmCaCO3, 0)}</code>
                    ) : (
                      <SizableText color="var(--text-muted)">—</SizableText>
                    )}{" "}
                    <SizableText color="var(--text-muted)">{tUnits("ppmAsCaCO3")}</SizableText>
                  </SizableText>
                </li>
                <li>
                  <SizableText size="$2" fontFamily="$body">
                    {t("raMerged")}:{" "}
                    {summary?.finalRecap.residualAlkalinityMergedPpmCaCO3 != null ? (
                      <code>{fmt("ppm_as_CaCO3", summary.finalRecap.residualAlkalinityMergedPpmCaCO3, 0)}</code>
                    ) : (
                      <SizableText color="var(--text-muted)">—</SizableText>
                    )}{" "}
                    <SizableText color="var(--text-muted)">{tUnits("ppmAsCaCO3")}</SizableText>
                  </SizableText>
                </li>
              </ul>
            </li>
            <li>
              <SizableText size="$2" fontFamily="$body">
                {t("styleExpectedRa")}:{" "}
                {summary?.finalRecap.styleExpectedRa ? (
                  <>
                    <code>
                      {fmt("ppm_as_CaCO3", summary.finalRecap.styleExpectedRa.min, 0)}..{fmt("ppm_as_CaCO3", summary.finalRecap.styleExpectedRa.max, 0)}
                    </code>{" "}
                    <SizableText color="var(--text-muted)">{tUnits("ppmAsCaCO3")}</SizableText>{" "}
                    <SizableText color="var(--text-muted)">· {t(summary.finalRecap.styleExpectedRa.rationaleKey)}</SizableText>
                  </>
                ) : (
                  <SizableText color="var(--text-muted)">{t("styleExpectedRaNa")}</SizableText>
                )}
              </SizableText>
            </li>
          </ul>

          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
            {t("finalRecapCaveat")}
          </SizableText>
        </BrewAccordionSection>

        <BrewAccordionSection
          value="alkVsBicarb"
          headingId="water-hub-alkalinity-vs-bicarbonate"
          title={t("alkVsBicarbTitle")}
          open={openSections.includes("alkVsBicarb")}
          spaced
        >
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("alkVsBicarbSubtitle")}
          </SizableText>
          <ul className="brew-recipe-edit-list-disc brew-list-mt0">
            <li><SizableText size="$2" fontFamily="$body">{t("alkVsBicarbPoint1")}</SizableText></li>
            <li><SizableText size="$2" fontFamily="$body">{t("alkVsBicarbPoint2")}</SizableText></li>
            <li><SizableText size="$2" fontFamily="$body">{t("alkVsBicarbPoint3")}</SizableText></li>
            <li><SizableText size="$2" fontFamily="$body">{t("alkVsBicarbPoint4")}</SizableText></li>
          </ul>
        </BrewAccordionSection>
      </Accordion>
    </>
  );
}
