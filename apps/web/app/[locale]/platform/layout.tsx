"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";
import { XStack, YStack } from "tamagui";

import { Link } from "../../../src/i18n/navigation";
import { useTranslations } from "next-intl";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("platform");
  const pathname = usePathname();

  const pathnameNoLocale = (() => {
    const p = typeof pathname === "string" ? pathname : "/";
    const parts = p.split("/");
    if (parts.length > 2) return "/" + parts.slice(2).join("/");
    return "/platform";
  })();

  const isActive = (href: string) =>
    pathnameNoLocale === href || pathnameNoLocale.startsWith(`${href}/`);

  return (
    <YStack gap="$4">
      <nav aria-label={t("navLabel")}>
        <XStack flexWrap="wrap" gap="$3">
          <Link
            href="/platform/ads"
            aria-current={isActive("/platform/ads") ? "page" : undefined}
            className="brew-muted"
          >
            {t("ads")}
          </Link>
          <Link
            href="/platform/recipes"
            aria-current={isActive("/platform/recipes") ? "page" : undefined}
            className="brew-muted"
          >
            {t("recipes")}
          </Link>
        </XStack>
      </nav>
      {children}
    </YStack>
  );
}
