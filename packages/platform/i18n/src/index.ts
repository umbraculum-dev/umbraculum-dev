/**
 * Shared i18n messages for web and native apps.
 * Platform + canonical namespaces live here; brewery-vertical namespaces merge
 * only when brewery is in the active installation profile.
 */

import { createRequire } from "node:module";

import { isVerticalInstalled } from "@umbraculum/module-sdk";

import enData from "./en.json";
import itData from "./it.json";
import {
  defaultLocale,
  isLocale,
  locales,
  type SupportedLocale,
} from "./locales.js";

const require = createRequire(import.meta.url);

const en = enData as Record<string, unknown>;
const it = itData as Record<string, unknown>;

export { defaultLocale, isLocale, locales, type SupportedLocale };

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

function loadBreweryMessages(locale: SupportedLocale): Record<string, unknown> {
  if (!isVerticalInstalled("brewery")) {
    return {};
  }
  const mod = require("@umbraculum/brewery-i18n") as {
    en: Record<string, unknown>;
    it: Record<string, unknown>;
  };
  return locale === "it" ? mod.it : mod.en;
}

/**
 * Get shared messages for the given locale.
 * Returns the full message tree for next-intl (web) or i18next (native).
 */
export function getSharedMessages(locale: SupportedLocale): Record<string, unknown> {
  const platform = locale === "it" ? it : en;
  const brewery = loadBreweryMessages(locale);
  return deepMerge(platform, brewery);
}

export { en, it };
