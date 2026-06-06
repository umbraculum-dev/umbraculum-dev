"use client";

import { SizableText } from "tamagui";

import { MathHelpPopover } from "../../../../../_components/MathHelpPopover";
import { BrewAccordionSection } from "../../../../../_components/BrewAccordionSection";
import { FieldBadge } from "../../../../../_components/recipe-edit";
import { mathExplain } from "../../_lib/mathExplain";
import { buildWaterMathBody } from "../../_lib/mathBodies";
import type { UseWaterHubPageModel } from "../../_hooks/useWaterHubPage";
import {
  WaterHubRecapAdditionsBlock,
  WaterHubRecapMergedIonsBlock,
  WaterHubRecapMergedSummaryBlock,
} from "./WaterHubRecapMergedBlocks";
import { WaterHubRecapPerStreamTable } from "./WaterHubRecapPerStreamTable";

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
            <WaterHubRecapPerStreamTable model={model} />
            <WaterHubRecapMergedSummaryBlock model={model} />
            <WaterHubRecapAdditionsBlock model={model} />
            <WaterHubRecapMergedIonsBlock model={model} />
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
