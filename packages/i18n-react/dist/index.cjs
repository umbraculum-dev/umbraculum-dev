"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  LocaleProvider: () => LocaleProvider,
  useT: () => useT
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");
var import_intl_messageformat = require("intl-messageformat");
var import_jsx_runtime = require("react/jsx-runtime");
var I18nContext = (0, import_react.createContext)(null);
function LocaleProvider({
  locale,
  messages,
  children
}) {
  const value = (0, import_react.useMemo)(() => ({ locale, messages }), [locale, messages]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(I18nContext.Provider, { value, children });
}
function getMessage(messages, namespace, key) {
  const path = namespace ? `${namespace}.${key}` : key;
  const parts = path.split(".").filter(Boolean);
  let cur = messages;
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in cur) {
      cur = cur[part];
    } else {
      throw new Error(`Missing i18n message: ${path}`);
    }
  }
  if (typeof cur !== "string") {
    throw new Error(`Expected i18n message to be a string: ${path}`);
  }
  return cur;
}
function useT(namespace) {
  const ctx = (0, import_react.useContext)(I18nContext);
  if (!ctx) throw new Error("LocaleProvider is missing for useT()");
  const { locale, messages } = ctx;
  const formatCache = (0, import_react.useMemo)(() => /* @__PURE__ */ new Map(), []);
  const format = (message, values) => {
    const cacheKey = `${locale}::${message}`;
    const fmt = formatCache.get(cacheKey) ?? new import_intl_messageformat.IntlMessageFormat(message, locale);
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
      return out;
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LocaleProvider,
  useT
});
