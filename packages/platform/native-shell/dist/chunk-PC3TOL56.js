// src/i18n/I18nProvider.tsx
import Constants from "expo-constants";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getSharedMessages, isLocale as isLocale2 } from "@umbraculum/i18n";
import { LocaleProvider } from "@umbraculum/i18n-react";

// src/i18n/locale.ts
import { defaultLocale, isLocale } from "@umbraculum/i18n";
import * as Localization from "expo-localization";
var LOCALE_STORAGE_KEY = "brewery.locale";
function getDeviceLocale() {
  const raw = Localization.getLocales?.()?.[0]?.languageTag ?? "";
  const normalized = raw.toLowerCase();
  const base = normalized.split("-")[0] ?? "";
  if (isLocale(base)) return base;
  return defaultLocale;
}

// src/i18n/storage.ts
import * as SecureStore from "expo-secure-store";
async function readString(key) {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ?? null;
  } catch {
    return null;
  }
}
async function writeString(key, value) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
  }
}

// src/i18n/I18nProvider.tsx
import { jsx } from "react/jsx-runtime";
function envWithExpoModuleProfile() {
  const base = process.env;
  const expoExtra = Constants.expoConfig?.extra;
  const fromExtra = expoExtra?.EXPO_PUBLIC_UMBRACULUM_MODULE_PROFILE;
  const profile = typeof fromExtra === "string" && fromExtra.trim() || base["EXPO_PUBLIC_UMBRACULUM_MODULE_PROFILE"]?.trim() || base["UMBRACULUM_MODULE_PROFILE"]?.trim() || void 0;
  if (!profile) return base;
  return {
    ...base,
    EXPO_PUBLIC_UMBRACULUM_MODULE_PROFILE: profile,
    UMBRACULUM_MODULE_PROFILE: profile
  };
}
var LocaleControllerContext = createContext(null);
function useLocaleController() {
  const ctx = useContext(LocaleControllerContext);
  if (!ctx) throw new Error("I18nProvider is missing for useLocaleController()");
  return ctx;
}
function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const persisted = await readString(LOCALE_STORAGE_KEY);
      const resolved = persisted && isLocale2(persisted) ? persisted : getDeviceLocale();
      if (!cancelled) setLocaleState(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const setLocale = useCallback((next) => {
    setLocaleState(next);
    void writeString(LOCALE_STORAGE_KEY, next);
  }, []);
  const controller = useMemo(() => {
    return {
      locale: locale ?? getDeviceLocale(),
      setLocale
    };
  }, [locale, setLocale]);
  if (!locale) {
    return /* @__PURE__ */ jsx(View, { style: { flex: 1, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx(ActivityIndicator, {}) });
  }
  const messages = getSharedMessages(locale, { env: envWithExpoModuleProfile() });
  return /* @__PURE__ */ jsx(LocaleControllerContext.Provider, { value: controller, children: /* @__PURE__ */ jsx(LocaleProvider, { locale, messages, children }) });
}

export {
  LOCALE_STORAGE_KEY,
  getDeviceLocale,
  readString,
  writeString,
  useLocaleController,
  I18nProvider
};
