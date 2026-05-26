"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { YStack } from "tamagui";

import { BrewSelect } from "../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../_components/recipe-edit";

export function LocaleSelect({ id = "auth-locale" }: { id?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (next: string) => {
    const parts = (pathname || "/").split("/");
    if (parts.length > 1) parts[1] = next;
    const nextPath = parts.join("/") || `/${next}`;
    const qs = searchParams?.toString();
    router.push(qs ? `${nextPath}?${qs}` : nextPath);
  };

  return (
    <YStack gap="$1.5">
      <RecipeEditFieldLabel htmlFor={id}>{t("languageLabel")}</RecipeEditFieldLabel>
      <BrewSelect
        id={id}
        value={locale}
        onValueChange={handleValueChange}
        options={[
          { value: "en", label: "English" },
          { value: "it", label: "Italiano" },
        ]}
        width="full"
      />
    </YStack>
  );
}

