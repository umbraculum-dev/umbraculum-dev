/**
 * Shared i18n messages for web and native apps.
 * Single source of truth: both Next.js web and React Native consume from this package.
 */

import enData from "./en.json";
import itData from "./it.json";

const en = enData as Record<string, unknown>;
const it = itData as Record<string, unknown>;

export const locales = ["en", "it"] as const;
export type SupportedLocale = (typeof locales)[number];

export const defaultLocale: SupportedLocale = "en";

export function isLocale(value: string): value is SupportedLocale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Get shared messages for the given locale.
 * Returns the full message tree for next-intl (web) or i18next (native).
 */
export function getSharedMessages(locale: SupportedLocale): Record<string, unknown> {
  return locale === "it" ? (it) : (en);
}

export { en, it };
