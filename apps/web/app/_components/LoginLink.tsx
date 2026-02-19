"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../src/i18n/navigation";
import { SizableText, XStack } from "tamagui";

export function LoginLink() {
  const t = useTranslations("nav");

  return (
    <Link
      href="/login"
      style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
    >
      <XStack ai="center" height={28}>
        <SizableText
          size="$2"
          color="var(--info)"
          fontFamily="$body"
          hoverStyle={{ textDecoration: "underline" }}
        >
          {t("login")}
        </SizableText>
      </XStack>
    </Link>
  );
}
