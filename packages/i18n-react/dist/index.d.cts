import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { SupportedLocale } from '@brewery/i18n';

type TranslationValues = Record<string, string | number | Date>;
type RichTranslationValue = ReactNode | ((chunks: ReactNode) => ReactNode);
type RichTranslationValues = Record<string, RichTranslationValue | TranslationValues[string]>;
interface Translator {
    t: (key: string, values?: TranslationValues) => string;
    rich: (key: string, values?: RichTranslationValues) => ReactNode;
}
interface I18nRuntime {
    locale: SupportedLocale;
    messages: Record<string, unknown>;
}
declare function LocaleProvider({ locale, messages, children, }: {
    locale: SupportedLocale;
    messages: Record<string, unknown>;
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function useT(namespace: string): Translator;

export { type I18nRuntime, LocaleProvider, type RichTranslationValue, type RichTranslationValues, type TranslationValues, type Translator, useT };
