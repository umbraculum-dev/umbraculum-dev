"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SizableText, XStack } from "tamagui";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  it: "IT",
};

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    const parts = (pathname || "/").split("/");
    if (parts.length > 1) parts[1] = value;
    const nextPath = parts.join("/") || `/${value}`;
    const qs = searchParams?.toString();
    router.push(qs ? `${nextPath}?${qs}` : nextPath);
  };

  return (
    <XStack ai="center" gap="$2" height={28} flexShrink={0}>
      <XStack ai="center" height={28}>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("language")}
        </SizableText>
      </XStack>
      <Select
        value={locale}
        onValueChange={handleValueChange}
        size="$2"
        renderValue={(value) => LOCALE_LABELS[value] ?? value}
        lazyMount
      >
        <Select.Trigger
          iconAfter={null}
          size="$2"
          width="auto"
          minWidth={52}
          flexGrow={0}
          flexShrink={0}
          jc="center"
          px="$2"
          height={28}
          color="var(--text)"
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="var(--border)"
          borderRadius="$2"
          fontFamily="$body"
        >
          <Select.Value placeholder={t("language")} />
        </Select.Trigger>
        <Select.Content>
          <Select.Viewport elevate={false} elevation={0}>
            <Select.Group>
              <Select.Item index={0} value="en">
                <Select.ItemText>EN</Select.ItemText>
              </Select.Item>
              <Select.Item index={1} value="it">
                <Select.ItemText>IT</Select.ItemText>
              </Select.Item>
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select>
    </XStack>
  );
}
