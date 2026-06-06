"use client";

import { useRouter } from "../../../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export function useRecipeEditPageI18n() {
  const t = useTranslations("recipes.edit");
  const tHops = useTranslations("recipes.edit.hops");
  const tEquip = useTranslations("recipes.edit.equipmentSection");
  const tAnalysis = useTranslations("recipes.analysis");
  const tMath = useTranslations("math");
  const tNav = useTranslations("nav");
  const tUnits = useTranslations("units");
  const tWater = useTranslations("waterHub");
  const tSparge = useTranslations("recipes.water.sparge");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  return {
    t,
    tHops,
    tEquip,
    tAnalysis,
    tMath,
    tNav,
    tUnits,
    tWater,
    tSparge,
    locale,
    router,
    recipeId,
  };
}
