/**
 * Shared i18n messages for web and native apps.
 * Platform + canonical namespaces live here; brewery-vertical namespaces are
 * merged from @umbraculum/brewery-i18n (reference vertical until F-mod profile).
 */

import { en as breweryEn, it as breweryIt } from "@umbraculum/brewery-i18n";

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

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = result[key];
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else {
      result[key] = sourceValue;
    }
  }
  return result;
}

/**
 * Get shared messages for the given locale.
 * Returns the full message tree for next-intl (web) or i18next (native).
 *
 * @arch-boundary platform i18n merges reference-vertical (@umbraculum/brewery-i18n)
 * bundles so apps keep a single import. Integrators on UMBRACULUM_MODULE_PROFILE=platform
 * may omit brewery-i18n when F-mod lands.
 */
export function getSharedMessages(locale: SupportedLocale): Record<string, unknown> {
  const platform = locale === "it" ? it : en;
  const brewery = locale === "it" ? breweryIt : breweryEn;
  return deepMerge(platform, brewery);
}

export { en, it };
