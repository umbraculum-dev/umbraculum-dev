/**
 * Shared i18n messages for web and native apps.
 * Platform + canonical namespaces live here; brewery-vertical namespaces are
 * merged from @umbraculum/brewery-i18n (reference vertical until F-mod profile).
 */
declare const en: Record<string, unknown>;
declare const it: Record<string, unknown>;
declare const locales: readonly ["en", "it"];
type SupportedLocale = (typeof locales)[number];
declare const defaultLocale: SupportedLocale;
declare function isLocale(value: string): value is SupportedLocale;
/**
 * Get shared messages for the given locale.
 * Returns the full message tree for next-intl (web) or i18next (native).
 *
 * @arch-boundary platform i18n merges reference-vertical (@umbraculum/brewery-i18n)
 * bundles so apps keep a single import. Integrators on UMBRACULUM_MODULE_PROFILE=platform
 * may omit brewery-i18n when F-mod lands.
 */
declare function getSharedMessages(locale: SupportedLocale): Record<string, unknown>;

export { type SupportedLocale, defaultLocale, en, getSharedMessages, isLocale, it, locales };
