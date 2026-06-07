"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../../src/i18n/navigation";
import { SizableText, XStack } from "tamagui";

export function AccessibilityLink() {
  const t = useTranslations("nav");

  return (
    <Link
      href="/accessibility"
      className="brew-link-inline-flex-shrink-0"
    >
      <XStack
        ai="center"
        jc="center"
        px="$2"
        borderRadius="$2"
        borderWidth={1}
        borderColor="color-mix(in srgb, var(--focus-ring) 25%, var(--border))"
        backgroundColor="color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))"
        height={28}
        hoverStyle={{
          borderColor: "color-mix(in srgb, var(--focus-ring) 25%, var(--border))",
          backgroundColor: "color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))",
        }}
        focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
      >
        <SizableText size="$2" color="var(--text)" fontFamily="$body">
          {t("accessibility")}
        </SizableText>
      </XStack>
    </Link>
  );
}
