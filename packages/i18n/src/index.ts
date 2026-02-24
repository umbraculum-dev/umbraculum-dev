/**
 * Shared i18n messages for web and native apps.
 * Single source of truth: both Next.js web and React Native consume from this package.
 */

import enData from "./en.json";
import itData from "./it.json";

const en = enData as Record<string, unknown>;
const it = itData as Record<string, unknown>;

export type SupportedLocale = "en" | "it";

/**
 * Get shared messages for the given locale.
 * Returns the full message tree for next-intl (web) or i18next (native).
 */
export function getSharedMessages(locale: SupportedLocale): Record<string, unknown> {
  return locale === "it" ? (it as Record<string, unknown>) : (en as Record<string, unknown>);
}

export { en, it };
