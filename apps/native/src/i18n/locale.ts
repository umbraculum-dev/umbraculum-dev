import { defaultLocale, isLocale, type SupportedLocale } from "@umbraculum/i18n";

import * as Localization from "expo-localization";

export const LOCALE_STORAGE_KEY = "brewery.locale";

export function getDeviceLocale(): SupportedLocale {
  const raw = Localization.getLocales?.()?.[0]?.languageTag ?? "";
  const normalized = raw.toLowerCase();

  const base = normalized.split("-")[0] ?? "";
  if (isLocale(base)) return base;
  return defaultLocale;
}

