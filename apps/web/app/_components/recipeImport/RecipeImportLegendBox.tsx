"use client";

import { Link } from "../../../src/i18n/navigation";
import { SizableText, View, YStack } from "tamagui";

import type { UseRecipeImportFormModel } from "./_hooks/useRecipeImportForm";

export function RecipeImportLegendBox(props: {
  model: UseRecipeImportFormModel;
  subtitle: string;
  children?: React.ReactNode;
}) {
  const { model, subtitle, children } = props;
  const { t } = model;

  return (
    <View className="brew-field-block brew-field-block--readonly" mt="$2.5" mb="$4">
      <View className="brew-field-block-header">
        <SizableText size="$2" fontWeight="bold" fontFamily="$body">
          {t("legendTitle")}
        </SizableText>
      </View>
      <YStack gap="$2">
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}>
          {subtitle}
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}>
          {t("unitsNote")}
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}>
          {t("customImportNote")} <Link href="/contact">{t("customImportCta")}</Link>
        </SizableText>
        {children ? <View mt="$2">{children}</View> : null}
      </YStack>
    </View>
  );
}
