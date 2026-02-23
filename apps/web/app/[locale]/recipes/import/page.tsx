"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { H1, SizableText, View, YStack } from "tamagui";

import { ErrorBox } from "../../../_components/recipe-edit";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { RecipeImportForm } from "../../../_components/RecipeImportForm";

export default function RecipesImportPage() {
  const t = useTranslations("recipes.import");
  const locale = useLocale();
  const router = useRouter();

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      {authState.status === "loading" ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}
      {authState.status === "error" ? (
        <ErrorBox>{authState.error}</ErrorBox>
      ) : null}

      <RecipeImportForm
        apiBasePath="/api/recipes"
        canCall={canCall}
        onSingleImportSuccess={(recipeId) => router.push(`/${locale}/recipes/${recipeId}/edit`)}
        showImportExportPanel={true}
      />
    </YStack>
  );
}
