import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { getSharedMessages, isLocale, type SupportedLocale } from "@brewery/i18n";
import { LocaleProvider } from "@brewery/i18n-react";

import { getDeviceLocale, LOCALE_STORAGE_KEY } from "./locale";
import { readString, writeString } from "./storage";

export interface LocaleController {
  locale: SupportedLocale;
  setLocale: (next: SupportedLocale) => void;
}

const LocaleControllerContext = createContext<LocaleController | null>(null);

export function useLocaleController(): LocaleController {
  const ctx = useContext(LocaleControllerContext);
  if (!ctx) throw new Error("I18nProvider is missing for useLocaleController()");
  return ctx;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const persisted = await readString(LOCALE_STORAGE_KEY);
      const resolved = persisted && isLocale(persisted) ? persisted : getDeviceLocale();
      if (!cancelled) setLocaleState(resolved);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: SupportedLocale) => {
    setLocaleState(next);
    void writeString(LOCALE_STORAGE_KEY, next);
  }, []);

  const controller = useMemo<LocaleController>(() => {
    return {
      locale: locale ?? getDeviceLocale(),
      setLocale,
    };
  }, [locale, setLocale]);

  if (!locale) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  const messages = getSharedMessages(locale);

  return (
    <LocaleControllerContext.Provider value={controller}>
      <LocaleProvider locale={locale} messages={messages}>
        {children}
      </LocaleProvider>
    </LocaleControllerContext.Provider>
  );
}

