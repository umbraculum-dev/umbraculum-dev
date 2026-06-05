"use client";

import { Link } from "../../../../src/i18n/navigation";
import { SizableText, View, XStack, YStack } from "tamagui";

import {
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditReadOnlyValue,
  RecipeEditSummary,
} from "../../../_components/recipe-edit";
import { YEAST_PITCH_RATE_OPTIONS } from "../../_lib/beerjsonRecipe";
import { roundTo, type YeastEditorReadOnlyProps } from "./yeastEditorTypes";

export function YeastEditorReadOnly({
  yeastRows,
  yeastAttenuationOverrides,
  recipeId,
  t,
  tAnalysis,
  tUnits,
  formatAmount,
}: YeastEditorReadOnlyProps) {
  return (
    <View>
      {yeastRows.length > 0 ? (
        <YStack gap="$3">
          {yeastRows.map((r, idx) => (
            <RecipeEditIngredientCard key={r.id}>
              <XStack gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row">
                <View alignSelf="center">
                  <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                    {idx + 1}
                  </SizableText>
                </View>
                <YStack gap="$1" flex={1} minW={200}>
                  <RecipeEditFieldLabel>{t("yeastNameLabel")}</RecipeEditFieldLabel>
                  <RecipeEditReadOnlyValue>{r.name}</RecipeEditReadOnlyValue>
                </YStack>
                {(r.lab ?? "") ? (
                  <YStack gap="$1" minW={120}>
                    <RecipeEditFieldLabel>{t("yeastLabLabel")}</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>{r.lab}</RecipeEditReadOnlyValue>
                  </YStack>
                ) : null}
                {(r.productId ?? "") ? (
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>{t("yeastProductIdLabel")}</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>{r.productId}</RecipeEditReadOnlyValue>
                  </YStack>
                ) : null}
                <YStack gap="$1" minW={100}>
                  <RecipeEditFieldLabel>{t("yeastAttenMinLabel")}</RecipeEditFieldLabel>
                  <RecipeEditReadOnlyValue>
                    {typeof r.attenuationMin === "number" ? roundTo(r.attenuationMin, 3) : ""}
                  </RecipeEditReadOnlyValue>
                </YStack>
                <YStack gap="$1" minW={100}>
                  <RecipeEditFieldLabel>{t("yeastAttenMaxLabel")}</RecipeEditFieldLabel>
                  <RecipeEditReadOnlyValue>
                    {typeof r.attenuationMax === "number" ? roundTo(r.attenuationMax, 3) : ""}
                  </RecipeEditReadOnlyValue>
                </YStack>
                {yeastAttenuationOverrides[r.id]?.trim() ? (
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>{tAnalysis("customAttenuationPercentLabel")}</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>{yeastAttenuationOverrides[r.id]}</RecipeEditReadOnlyValue>
                  </YStack>
                ) : null}
                <YStack gap="$1" minW={100}>
                  <RecipeEditFieldLabel>{t("yeastFermentationTempLabel", { unit: tUnits("C") })}</RecipeEditFieldLabel>
                  <RecipeEditReadOnlyValue>
                    {r.fermentationTempC != null && Number.isFinite(r.fermentationTempC)
                      ? roundTo(r.fermentationTempC, 1)
                      : "—"}
                  </RecipeEditReadOnlyValue>
                </YStack>
                <YStack gap="$1" minW={100}>
                  <RecipeEditFieldLabel>{t("yeastDiacetylRestLabel")}</RecipeEditFieldLabel>
                  <RecipeEditReadOnlyValue>
                    {r.diacetylRest === "yes" ? t("yeastDiacetylRestYes") : r.diacetylRest === "no" ? t("yeastDiacetylRestNo") : "—"}
                  </RecipeEditReadOnlyValue>
                </YStack>
                <YStack gap="$1" minW={100}>
                  <RecipeEditFieldLabel>
                    {t("yeastAmountLabel", { unit: r.format === "dry" ? tUnits("kg") : tUnits("L") })}
                  </RecipeEditFieldLabel>
                  <RecipeEditReadOnlyValue>
                    {r.format === "dry"
                      ? r.amountKg != null && Number.isFinite(r.amountKg)
                        ? formatAmount(r.amountKg, 3)
                        : "—"
                      : r.amountL != null && Number.isFinite(r.amountL)
                        ? formatAmount(r.amountL, 2)
                        : "—"}
                  </RecipeEditReadOnlyValue>
                </YStack>
                <YStack gap="$1" minW={100}>
                  <RecipeEditFieldLabel>{t("yeastOxygenationLabel")}</RecipeEditFieldLabel>
                  <RecipeEditReadOnlyValue>
                    {r.oxygenation === "yes" ? t("yeastOxygenationYes") : r.oxygenation === "no" ? t("yeastOxygenationNo") : "—"}
                  </RecipeEditReadOnlyValue>
                </YStack>
              </XStack>

              <View flexBasis="100%" w="100%" mt="$2">
                <details>
                  <RecipeEditSummary>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      {t("yeastAdvancedSubsectionHeading")}
                    </SizableText>
                  </RecipeEditSummary>
                  <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                    <YStack gap="$1" minW={220}>
                      <RecipeEditFieldLabel>{t("yeastPitchRateLabel")}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>
                        {r.pitchRate && YEAST_PITCH_RATE_OPTIONS.find((o) => o.value === r.pitchRate)?.labelKey
                          ? t(YEAST_PITCH_RATE_OPTIONS.find((o) => o.value === r.pitchRate)!.labelKey)
                          : r.pitchRate
                            ? String(r.pitchRate)
                            : "—"}
                      </RecipeEditReadOnlyValue>
                    </YStack>
                    <YStack gap="$1" minW={140}>
                      <RecipeEditFieldLabel>{t("yeastFormatLabel")}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>
                        {r.format === "dry" ? t("yeastFormatDry") : r.format === "liquid" ? t("yeastFormatLiquid") : r.format === "slurry" ? t("yeastFormatSlurry") : "—"}
                      </RecipeEditReadOnlyValue>
                    </YStack>
                    <YStack gap="$1" minW={180}>
                      <RecipeEditFieldLabel>{t("yeastSpeciesLabel")}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>
                        {r.species === "saccharomyces_cerevisiae"
                          ? t("yeastSpeciesSaccharomycesCerevisiae")
                          : r.species === "saccharomyces_pastorianus"
                            ? t("yeastSpeciesSaccharomycesPastorianus")
                            : r.species === "brettanomyces"
                              ? t("yeastSpeciesBrettanomyces")
                              : r.species === "diastaticus"
                                ? t("yeastSpeciesDiastaticus")
                                : r.species === "other"
                                  ? t("yeastSpeciesOther")
                                  : "—"}
                      </RecipeEditReadOnlyValue>
                    </YStack>
                    <YStack gap="$1" minW={140}>
                      <RecipeEditFieldLabel>{t("yeastNeedsPropagationLabel")}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>
                        {r.needsPropagation === "yes" ? t("yeastNeedsPropagationYes") : r.needsPropagation === "no" ? t("yeastNeedsPropagationNo") : "—"}
                      </RecipeEditReadOnlyValue>
                    </YStack>
                  </XStack>
                </details>
              </View>
            </RecipeEditIngredientCard>
          ))}
          {recipeId ? (
            <SizableText size="$2" mt="$3" mb={0}>
              <Link href={`/recipes/${recipeId}/yeast`}>
                {t("yeastEditInYeastPage")}
              </Link>
            </SizableText>
          ) : null}
        </YStack>
      ) : (
        <SizableText size="$2" color="$gray10">
          {t("yeastEmpty")}
          {recipeId ? (
            <>
              {" · "}
              <Link href={`/recipes/${recipeId}/yeast`}>
                {t("yeastEditInYeastPage")}
              </Link>
            </>
          ) : null}
        </SizableText>
      )}
    </View>
  );
}
