"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function LocaleSelect({ id }: { id?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="brew-muted" style={{ display: "block", fontSize: 12 }}>
      {t("languageLabel")}
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
        style={{ width: "100%", padding: 8, marginTop: 4 }}
      >
        <option value="en">English</option>
        <option value="it">Italiano</option>
      </select>
    </label>
  );
}

