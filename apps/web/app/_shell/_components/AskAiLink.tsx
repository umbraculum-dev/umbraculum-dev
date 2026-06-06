"use client";

import { useTranslations } from "next-intl";

import { Link } from "../../../src/i18n/navigation";

/** Deep-link to `/ai` with a RouteId hint for prompt route overlays. */
export function AskAiLink({ fromRoute }: { fromRoute: string }) {
  const t = useTranslations("ai");
  return (
    <Link href={`/ai?fromRoute=${encodeURIComponent(fromRoute)}`}>
      {t("askAboutThisPage")}
    </Link>
  );
}
