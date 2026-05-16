"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useMemo } from "react";
import { IntlMessageFormat } from "intl-messageformat";

import type { SupportedLocale } from "@brewery/i18n";

export type TranslationValues = Record<string, string | number | Date>;

export type RichTranslationValue = ReactNode | ((chunks: ReactNode) => ReactNode);
export type RichTranslationValues = Record<string, RichTranslationValue | TranslationValues[string]>;

export interface Translator {
  t: (key: string, values?: TranslationValues) => string;
  rich: (key: string, values?: RichTranslationValues) => ReactNode;
}

export interface I18nRuntime {
  locale: SupportedLocale;
  messages: Record<string, unknown>;
}

const I18nContext = createContext<I18nRuntime | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: SupportedLocale;
  messages: Record<string, unknown>;
  children: ReactNode;
}) {
  const value = useMemo<I18nRuntime>(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function getMessage(messages: Record<string, unknown>, namespace: string, key: string): string {
  const path = namespace ? `${namespace}.${key}` : key;
  const parts = path.split(".").filter(Boolean);

  let cur: unknown = messages;
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      throw new Error(`Missing i18n message: ${path}`);
    }
  }

  if (typeof cur !== "string") {
    throw new Error(`Expected i18n message to be a string: ${path}`);
  }

  return cur;
}

export function useT(namespace: string): Translator {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("LocaleProvider is missing for useT()");

  const { locale, messages } = ctx;

  // Cache by raw message string; assumes messages are stable per provider instance.
  const formatCache = useMemo(() => new Map<string, IntlMessageFormat>(), []);

  const format = (message: string, values?: Record<string, unknown>) => {
    const cacheKey = `${locale}::${message}`;
    const fmt = formatCache.get(cacheKey) ?? new IntlMessageFormat(message, locale);
    if (!formatCache.has(cacheKey)) formatCache.set(cacheKey, fmt);
    return fmt.format(values);
  };

  return {
    t: (key, values) => {
      const message = getMessage(messages, namespace, key);
      const out = format(message, values);
      if (typeof out === "string") return out;
      return String(out);
    },
    rich: (key, values) => {
      const message = getMessage(messages, namespace, key);
      const out = format(message, values);
      return out as ReactNode;
    },
  };
}

