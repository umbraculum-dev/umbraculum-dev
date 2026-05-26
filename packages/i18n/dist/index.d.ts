/**
 * Shared i18n messages for web and native apps.
 * Single source of truth: both Next.js web and React Native consume from this package.
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
 */
declare function getSharedMessages(locale: SupportedLocale): Record<string, unknown>;

export { type SupportedLocale, defaultLocale, en, getSharedMessages, isLocale, it, locales };
