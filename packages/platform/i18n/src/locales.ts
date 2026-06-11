/**
 * Locale constants — safe for Next.js edge middleware (no Node-only imports).
 */

export const locales = ["en", "it"] as const;
export type SupportedLocale = (typeof locales)[number];

export const defaultLocale: SupportedLocale = "en";

export function isLocale(value: string): value is SupportedLocale {
  return (locales as readonly string[]).includes(value);
}
