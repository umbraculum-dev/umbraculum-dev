import {Link} from "../../../../../../../../src/i18n/navigation";
import {SizableText, View} from "tamagui";

import {formatFixed} from "../../../../../../../../src/i18n/format";
import {CodeInline} from "../../../../../../../_components/CodeInline";
import {RecipeEditFieldBlock, RecipeEditList, RecipeEditSection} from "../../../../../../../_components/recipe-edit";
import {MashStepsEditor, SpargeStepReadOnlyRow} from "@umbraculum/brewery-recipes-ui";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditMashingSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    tUnits,
    locale,
    recipeId,
    openSections,
    setSectionOpen,
    mashProcedure,
    waterSettings,
    waterVolumes,
    spargeConfigured,
    mashRowsFiltered,
    spargeStepTempDisplay,
    spargeMethodLabel
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="mashing"
            headingId="mashing-heading"
            label={t("sections.mashing")}
            open={openSections['mashing']}
            onOpenChange={(open) => setSectionOpen("mashing", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("mashingHelp")}
            </SizableText>

            {waterVolumes ? (
              <RecipeEditFieldBlock
                variant="computed"
                header={t("mashingWaterVolumesTitle")}
                badge="Computed"
                source={t("mashingWaterVolumesSource")}
                mt="$3"
                mb="$3"
              >
                <RecipeEditList gap="$1" mt="$2" mb={0}>
                  <SizableText as="li" size="$2" fontFamily="$body" color="var(--text)">
                    Mash water: <CodeInline>{formatFixed(locale, waterVolumes.mashLiters, 2)}</CodeInline> {tUnits("L")}
                  </SizableText>
                  <SizableText as="li" size="$2" fontFamily="$body" color="var(--text)">
                    Sparge water: <CodeInline>{formatFixed(locale, waterVolumes.spargeLiters, 2)}</CodeInline> {tUnits("L")}
                  </SizableText>
                </RecipeEditList>
              </RecipeEditFieldBlock>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$3">
                {t("mashingWaterVolumesUnavailable")}
              </SizableText>
            )}

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2">
                  {t("mashStepsFromWaterPage")}
                </SizableText>
                <View mt="$3">
                  <MashStepsEditor
                    mashRows={mashRowsFiltered}
                    mashProcedure={mashProcedure}
                    waterVolumes={waterVolumes}
                    readOnly
                    recipeId={recipeId}
                    t={t}
                    tUnits={tUnits}
                    locale={locale}
                    formatFixed={formatFixed}
                  />
                </View>

                <SizableText size="$2" fontFamily="$body" color="var(--text)" mt="$2" mb={0}>
                  <Link href={`/recipes/${recipeId}/water/mash`}>{t("mashStepConfigureLink")}</Link>
                </SizableText>

                {spargeConfigured ? (
                  <View mt="$4">
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2">
                      {t("spargeStepFromWaterPage")}
                    </SizableText>
                    <SpargeStepReadOnlyRow
                      stepNumber={mashRowsFiltered.length + 1}
                      title="Sparge"
                      name="Sparge"
                      typeLabel={spargeMethodLabel}
                      tempDisplay={formatFixed(locale, spargeStepTempDisplay, 1)}
                      timeDisplay={String(waterSettings?.spargeStepTimeMin ?? 60)}
                      amountDisplay={`${formatFixed(locale, waterVolumes!.spargeLiters, 2)} ${tUnits("L")}`}
                      rampDisplay={String(waterSettings?.spargeStepRampMin ?? 0)}
                      labels={{
                        name: t("mashingStepName"),
                        type: t("mashingStepType"),
                        temp: t("mashingStepTemp", { unit: "°C" }),
                        time: t("mashingStepTime", { unit: "min" }),
                        amount: t("mashingStepAmount", { unit: "L" }),
                        ramp: t("mashingStepRamp", { unit: "min" }),
                      }}
                    />
                    <SizableText size="$2" fontFamily="$body" color="var(--text)" mt="$2" mb={0}>
                      <Link href={`/recipes/${recipeId}/water/sparge`}>
                        {t("spargeStepConfigureLink")}
                      </Link>
                    </SizableText>
                  </View>
                ) : null}
          </RecipeEditSection>
  );
}
