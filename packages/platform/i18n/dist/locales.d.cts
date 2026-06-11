/**
 * Locale constants — safe for Next.js edge middleware (no Node-only imports).
 */
declare const locales: readonly ["en", "it"];
type SupportedLocale = (typeof locales)[number];
declare const defaultLocale: SupportedLocale;
declare function isLocale(value: string): value is SupportedLocale;

export { type SupportedLocale, defaultLocale, isLocale, locales };
