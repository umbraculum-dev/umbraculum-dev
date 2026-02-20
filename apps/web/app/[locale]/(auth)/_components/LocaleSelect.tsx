"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../_components/recipe-edit";

export function LocaleSelect({ id = "auth-locale" }: { id?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <YStack gap="$1.5">
      <RecipeEditFieldLabel htmlFor={id}>{t("languageLabel")}</RecipeEditFieldLabel>
      <select
        id={id}
        value={locale}
        onChange={(e) => {
          const next = e.target.value;
          const parts = (pathname || "/").split("/");
          if (parts.length > 1) parts[1] = next;
          const nextPath = parts.join("/") || `/${next}`;
          const qs = searchParams?.toString();
          router.push(qs ? `${nextPath}?${qs}` : nextPath);
        }}
        className="brew-recipe-edit-select brew-recipe-edit-select-full"
      >
        <option value="en">English</option>
        <option value="it">Italiano</option>
      </select>
    </YStack>
  );
}

