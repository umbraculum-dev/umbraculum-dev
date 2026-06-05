"use client";

import { H3, H4, SizableText, View, XStack } from "tamagui";

import { MathHelpPopover } from "../../../../../_components/MathHelpPopover";
import { BrewAccordionSection } from "../../../../../_components/BrewAccordionSection";
import { FieldBadge } from "../../../../../_components/recipe-edit";
import { mathExplain } from "../../_lib/mathExplain";
import { buildWaterMathBody } from "../../_lib/mathBodies";
import type { UseWaterHubPageModel } from "../../_hooks/useWaterHubPage";

export function WaterHubRecapSection({ model }: { model: UseWaterHubPageModel }) {
  const {
    t,
    tUnits,
    tMath,
    locale,
    openSections,
    summary,
    surfaceMath,
    displayStreams,
    fmt,
    displayAlkalinityPpmCaCO3,
  } = model;

  return (
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
                {t("mergedFinalAlk")}:{" "}
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
  );
}
