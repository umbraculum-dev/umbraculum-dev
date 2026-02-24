// src/index.tsx
import { createContext, useContext, useMemo } from "react";
import { IntlMessageFormat } from "intl-messageformat";
import { jsx } from "react/jsx-runtime";
var I18nContext = createContext(null);
function LocaleProvider({
  locale,
  messages,
  children
}) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return /* @__PURE__ */ jsx(I18nContext.Provider, { value, children });
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
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("LocaleProvider is missing for useT()");
  const { locale, messages } = ctx;
  const formatCache = useMemo(() => /* @__PURE__ */ new Map(), []);
  const format = (message, values) => {
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
      return out;
    }
  };
}
export {
  LocaleProvider,
  useT
};
