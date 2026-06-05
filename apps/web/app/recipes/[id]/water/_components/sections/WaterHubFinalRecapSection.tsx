"use client";

import { SizableText } from "tamagui";

import { BrewAccordionSection } from "../../../../../_components/BrewAccordionSection";
import type { UseWaterHubPageModel } from "../../_hooks/useWaterHubPage";

export function WaterHubFinalRecapSection({ model }: { model: UseWaterHubPageModel }) {
  const { t, tUnits, openSections, summary, fmt } = model;

  return (
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
  );
}
