import { SupportedLocale } from './locales.cjs';
export { defaultLocale, isLocale, locales } from './locales.cjs';

/**
 * Shared i18n messages for web and native apps.
 * Platform + canonical namespaces live here; brewery-vertical namespaces merge
 * only when brewery is in the active installation profile.
 */

declare const en: Record<string, unknown>;
declare const it: Record<string, unknown>;

/**
 * Get shared messages for the given locale.
 * Returns the full message tree for next-intl (web) or i18next (native).
 */
declare function getSharedMessages(locale: SupportedLocale): Record<string, unknown>;

export { SupportedLocale, en, getSharedMessages, it };
