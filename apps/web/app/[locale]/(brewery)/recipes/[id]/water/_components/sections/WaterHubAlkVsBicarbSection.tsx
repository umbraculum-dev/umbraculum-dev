"use client";

import { SizableText } from "tamagui";

import { BrewAccordionSection } from "../../../../../../../_components/BrewAccordionSection";
import type { UseWaterHubPageModel } from "../../_hooks/useWaterHubPage";

export function WaterHubAlkVsBicarbSection({ model }: { model: UseWaterHubPageModel }) {
  const { t, openSections } = model;

  return (
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
  );
}
