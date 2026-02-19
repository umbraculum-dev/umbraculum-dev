"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { RecipeImportForm } from "../../../_components/RecipeImportForm";

export default function RecipesImportPage() {
  const t = useTranslations("recipes.import");
  const locale = useLocale();
  const router = useRouter();

  const authState = useRequireAuth({ requireActiveAccount: true });
  const canCall = authState.status === "ready";

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      {authState.status === "loading" ? <p className="muted">{t("loading")}</p> : null}
      {authState.status === "error" ? (
        <p className="errorBox" role="alert">
          {authState.error}
        </p>
      ) : null}

      <RecipeImportForm
        apiBasePath="/api/recipes"
        canCall={canCall}
        onSingleImportSuccess={(recipeId) => router.push(`/${locale}/recipes/${recipeId}/edit`)}
        showImportExportPanel={true}
      />
    </>
  );
}
