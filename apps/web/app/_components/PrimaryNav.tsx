"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Link } from "../../src/i18n/navigation";
import { DevAuthStatus } from "./DevAuthStatus";

export function PrimaryNav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav aria-label="Primary">
      <ul className="navList">
        <li>
          <Link href="/">{t("dashboard")}</Link>
        </li>
        <li>
          <Link href="/recipes">{t("recipes")}</Link>
        </li>
        <li>
          <Link href="/water-profiles">{t("waterProfiles")}</Link>
        </li>
        <li>
          <Link href="/about">{t("about")}</Link>
        </li>
        <li>
          <label className="muted" style={{ fontSize: 12 }}>
            {t("language")}{" "}
            <select
              value={locale}
              onChange={(e) => {
                const next = e.target.value;
                const parts = (pathname || "/").split("/");
                // pathname includes locale prefix: /en/...
                if (parts.length > 1) parts[1] = next;
                const nextPath = parts.join("/") || `/${next}`;
                const qs = searchParams?.toString();
                router.push(qs ? `${nextPath}?${qs}` : nextPath);
              }}
              style={{ marginLeft: 6 }}
            >
              <option value="en">EN</option>
              <option value="it">IT</option>
            </select>
          </label>
        </li>
        <li style={{ marginLeft: "auto" }}>
          <DevAuthStatus />
        </li>
      </ul>
    </nav>
  );
}

