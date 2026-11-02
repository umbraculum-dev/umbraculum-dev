/**
 * Shared i18n messages for web and native apps.
 * Platform + canonical namespaces live here; brewery-vertical namespaces merge
 * only when brewery is in the active installation profile.
 */

import { en as breweryEn, it as breweryIt } from "@umbraculum/brewery-i18n";
import { resolveEnabledModuleCodesEdge } from "@umbraculum/module-sdk/edge";

import enData from "./en.json";
import itData from "./it.json";
import {
  defaultLocale,
  isLocale,
  locales,
  type SupportedLocale,
} from "./locales.js";

const en = enData as Record<string, unknown>;
const it = itData as Record<string, unknown>;

export { defaultLocale, isLocale, locales, type SupportedLocale };

/**
 * Edge/RN-safe brewery gate (no Node `fs`).
 * Native Expo may only see `EXPO_PUBLIC_UMBRACULUM_MODULE_PROFILE`; server/web
 * uses `UMBRACULUM_MODULE_PROFILE`. Prefer the public mirror when set.
 */
function isBreweryVerticalInstalled(
  env: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): boolean {
  const profile =
    env["UMBRACULUM_MODULE_PROFILE"]?.trim() ||
    env["EXPO_PUBLIC_UMBRACULUM_MODULE_PROFILE"]?.trim() ||
    undefined;
  return resolveEnabledModuleCodesEdge({
    ...env,
    ...(profile ? { UMBRACULUM_MODULE_PROFILE: profile } : {}),
  }).has("brewery");
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

function loadBreweryMessages(locale: SupportedLocale): Record<string, unknown> {
  if (!isBreweryVerticalInstalled()) {
    return {};
  }
  return locale === "it" ? breweryIt : breweryEn;
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
