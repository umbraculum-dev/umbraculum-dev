/**
 * Shared i18n messages for native apps.
 * Web continues to use apps/web/messages; native should consume from this package.
 */

import enData from "./en.json";
import itData from "./it.json";

const en = enData as Record<string, unknown>;
const it = itData as Record<string, unknown>;

export type SupportedLocale = "en" | "it";

/**
 * Get shared messages for the given locale.
 * Contains math.derivation (labels, formulas, etc.) and auth.errors.
 */
export function getSharedMessages(locale: SupportedLocale): Record<string, unknown> {
  return locale === "it" ? (it as Record<string, unknown>) : (en as Record<string, unknown>);
}

export { en, it };
