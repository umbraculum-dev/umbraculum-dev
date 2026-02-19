"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

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
    <div style={{ display: "grid", gap: 16 }}>
      <nav aria-label={t("navLabel")} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/platform/ads"
          aria-current={isActive("/platform/ads") ? "page" : undefined}
          className="muted"
        >
          {t("ads")}
        </Link>
        <Link
          href="/platform/recipes"
          aria-current={isActive("/platform/recipes") ? "page" : undefined}
          className="muted"
        >
          {t("recipes")}
        </Link>
      </nav>
      {children}
    </div>
  );
}
