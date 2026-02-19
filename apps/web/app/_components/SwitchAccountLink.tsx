"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../src/i18n/navigation";
import { SizableText, XStack } from "tamagui";

export function SwitchAccountLink() {
  const t = useTranslations("nav");

  return (
    <Link
      href="/select-account"
      style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
    >
      <XStack ai="center" height={28}>
        <SizableText
          size="$2"
          color="var(--text-muted)"
          fontFamily="$body"
          hoverStyle={{ textDecoration: "underline" }}
        >
          {t("switchAccount")}
        </SizableText>
      </XStack>
    </Link>
  );
}
