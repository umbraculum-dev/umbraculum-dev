import { SupportedLocale } from './locales.js';
export { defaultLocale, isLocale, locales } from './locales.js';

/**
 * Shared i18n messages for web and native apps.
 * Platform + canonical namespaces live here; brewery-vertical namespaces merge
 * only when brewery is in the active installation profile.
 */

declare const en: Record<string, unknown>;
declare const it: Record<string, unknown>;

type SharedMessagesOptions = {
    /** Override `process.env` (native: include expo.extra module profile). */
    env?: Record<string, string | undefined>;
};
/**
 * Get shared messages for the given locale.
 * Returns the full message tree for next-intl (web) or i18next (native).
 */
declare function getSharedMessages(locale: SupportedLocale, options?: SharedMessagesOptions): Record<string, unknown>;

export { type SharedMessagesOptions, SupportedLocale, en, getSharedMessages, it };
