import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { SupportedLocale } from '@umbraculum/i18n';

interface LocaleController {
    locale: SupportedLocale;
    setLocale: (next: SupportedLocale) => void;
}
declare function useLocaleController(): LocaleController;
declare function I18nProvider({ children }: {
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;

declare const LOCALE_STORAGE_KEY = "brewery.locale";
declare function getDeviceLocale(): SupportedLocale;

declare function readString(key: string): Promise<string | null>;
declare function writeString(key: string, value: string): Promise<void>;

export { I18nProvider, LOCALE_STORAGE_KEY, getDeviceLocale, readString, useLocaleController, writeString };
