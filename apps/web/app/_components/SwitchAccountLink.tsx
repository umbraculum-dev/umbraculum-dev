"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../src/i18n/navigation";
import { SizableText, XStack } from "tamagui";

export function SwitchWorkspaceLink() {
  const t = useTranslations("nav");

  return (
    <Link
      href="/select-workspace"
      className="brew-link-inline-flex"
    >
      <XStack ai="center" height={28}>
        <SizableText
          size="$2"
          color="var(--text-muted)"
          fontFamily="$body"
          hoverStyle={{ textDecoration: "underline" }}
        >
          {t("switchWorkspace")}
        </SizableText>
      </XStack>
    </Link>
  );
}

/** Backward-compatible export (old name). */
export const SwitchAccountLink = SwitchWorkspaceLink;
