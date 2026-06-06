"use client";

import { Link } from "../../../../../../../../src/i18n/navigation";
import { SizableText } from "tamagui";

import { BrewAccordionSection } from "../../../../../../../_components/BrewAccordionSection";
import type { UseWaterHubPageModel } from "../../_hooks/useWaterHubPage";

export function WaterHubLinksSection({ model }: { model: UseWaterHubPageModel }) {
  const { t, recipeId, openSections, mashLast, spargeLast, boilLast } = model;

  return (
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
  );
}
