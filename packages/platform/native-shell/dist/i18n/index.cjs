"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/i18n/index.ts
var i18n_exports = {};
__export(i18n_exports, {
  I18nProvider: () => I18nProvider,
  LOCALE_STORAGE_KEY: () => LOCALE_STORAGE_KEY,
  getDeviceLocale: () => getDeviceLocale,
  readString: () => readString,
  useLocaleController: () => useLocaleController,
  writeString: () => writeString
});
module.exports = __toCommonJS(i18n_exports);

// src/i18n/I18nProvider.tsx
var import_react = require("react");
var import_react_native = require("react-native");
var import_i18n2 = require("@umbraculum/i18n");
var import_i18n_react = require("@umbraculum/i18n-react");

// src/i18n/locale.ts
var import_i18n = require("@umbraculum/i18n");
var Localization = __toESM(require("expo-localization"), 1);
var LOCALE_STORAGE_KEY = "brewery.locale";
function getDeviceLocale() {
  const raw = Localization.getLocales?.()?.[0]?.languageTag ?? "";
  const normalized = raw.toLowerCase();
  const base = normalized.split("-")[0] ?? "";
  if ((0, import_i18n.isLocale)(base)) return base;
  return import_i18n.defaultLocale;
}

// src/i18n/storage.ts
var SecureStore = __toESM(require("expo-secure-store"), 1);
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
var import_jsx_runtime = require("react/jsx-runtime");
var LocaleControllerContext = (0, import_react.createContext)(null);
function useLocaleController() {
  const ctx = (0, import_react.useContext)(LocaleControllerContext);
  if (!ctx) throw new Error("I18nProvider is missing for useLocaleController()");
  return ctx;
}
function I18nProvider({ children }) {
  const [locale, setLocaleState] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    void (async () => {
      const persisted = await readString(LOCALE_STORAGE_KEY);
      const resolved = persisted && (0, import_i18n2.isLocale)(persisted) ? persisted : getDeviceLocale();
      if (!cancelled) setLocaleState(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const setLocale = (0, import_react.useCallback)((next) => {
    setLocaleState(next);
    void writeString(LOCALE_STORAGE_KEY, next);
  }, []);
  const controller = (0, import_react.useMemo)(() => {
    return {
      locale: locale ?? getDeviceLocale(),
      setLocale
    };
  }, [locale, setLocale]);
  if (!locale) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_native.View, { style: { flex: 1, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_native.ActivityIndicator, {}) });
  }
  const messages = (0, import_i18n2.getSharedMessages)(locale);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocaleControllerContext.Provider, { value: controller, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_i18n_react.LocaleProvider, { locale, messages, children }) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  I18nProvider,
  LOCALE_STORAGE_KEY,
  getDeviceLocale,
  readString,
  useLocaleController,
  writeString
});
