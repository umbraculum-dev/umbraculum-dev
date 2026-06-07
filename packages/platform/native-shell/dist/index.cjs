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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AdSlot: () => AdSlot,
  AuthProvider: () => AuthProvider,
  FIELD_COMPUTED_BG: () => FIELD_COMPUTED_BG,
  FIELD_COMPUTED_BORDER: () => FIELD_COMPUTED_BORDER,
  FIELD_READONLY_BG: () => FIELD_READONLY_BG,
  FIELD_READONLY_BORDER: () => FIELD_READONLY_BORDER,
  I18nProvider: () => I18nProvider,
  Input: () => Input,
  LOCALE_STORAGE_KEY: () => LOCALE_STORAGE_KEY,
  ReadOnlyField: () => ReadOnlyField,
  SURFACE_BACKGROUND: () => SURFACE_BACKGROUND,
  SURFACE_BACKGROUND_SEMI: () => SURFACE_BACKGROUND_SEMI,
  SURFACE_BORDER: () => SURFACE_BORDER,
  SURFACE_CARD: () => SURFACE_CARD,
  clearToken: () => clearToken,
  getApiBaseUrl: () => getApiBaseUrl,
  getDeviceLocale: () => getDeviceLocale,
  nativePlatformApiClient: () => nativePlatformApiClient,
  readString: () => readString,
  readToken: () => readToken,
  useAuth: () => useAuth,
  useLocaleController: () => useLocaleController,
  writeString: () => writeString,
  writeToken: () => writeToken
});
module.exports = __toCommonJS(index_exports);

// src/auth/AuthProvider.tsx
var import_react = require("react");
var import_api_client2 = require("@umbraculum/api-client");

// src/auth/apiBaseUrl.ts
var import_expo_constants = __toESM(require("expo-constants"), 1);
var import_react_native = require("react-native");
var DEFAULT_API_BASE_URL = "http://192.168.1.124:18080";
var ANDROID_EMULATOR_HOST = "10.0.2.2";
var LOCAL_DEV_API_PORT = "18080";
function normalizeBaseUrl(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}
function getMetroDevHost() {
  const expoConfig = import_expo_constants.default.expoConfig;
  const constantsRec = import_expo_constants.default;
  const candidate = expoConfig?.hostUri ?? constantsRec.manifest2?.extra?.expoClient?.hostUri ?? constantsRec.manifest?.hostUri ?? null;
  if (typeof candidate !== "string" || !candidate) return null;
  const host = candidate.split(":")[0]?.trim();
  if (!host) return null;
  if (/[a-z]/i.test(host) && !host.endsWith(".local")) return null;
  return host;
}
function maybeRewriteForAndroidEmulator(baseUrl) {
  if (import_react_native.Platform.OS !== "android") return baseUrl;
  if (import_expo_constants.default.isDevice) return baseUrl;
  try {
    const u = new URL(baseUrl);
    if (!u.hostname) return baseUrl;
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1" && u.hostname !== "0.0.0.0") {
      return baseUrl;
    }
    const port = u.port ? `:${u.port}` : "";
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${u.protocol}//${ANDROID_EMULATOR_HOST}${port}${path}${u.search}${u.hash}`.replace(/\/+$/, "");
  } catch {
    return baseUrl;
  }
}
function getApiBaseUrl() {
  const expoExtra = import_expo_constants.default.expoConfig?.extra;
  const fromExtra = normalizeBaseUrl(expoExtra?.EXPO_PUBLIC_API_BASE_URL);
  if (fromExtra) return maybeRewriteForAndroidEmulator(fromExtra);
  const fromEnv = normalizeBaseUrl(process.env["EXPO_PUBLIC_API_BASE_URL"]);
  if (fromEnv) return maybeRewriteForAndroidEmulator(fromEnv);
  const metroHost = getMetroDevHost();
  if (metroHost) {
    return maybeRewriteForAndroidEmulator(`http://${metroHost}:${LOCAL_DEV_API_PORT}`);
  }
  return DEFAULT_API_BASE_URL;
}

// src/auth/nativeApiClient.ts
var import_api_client = require("@umbraculum/api-client");
function nativePlatformApiClient(token, baseUrlOverride) {
  const baseUrl = baseUrlOverride ?? getApiBaseUrl();
  if (!baseUrl) throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  return (0, import_api_client.createApiClient)(baseUrl, (0, import_api_client.bearerTokenAuth)(() => token));
}

// src/auth/tokenStorage.ts
var SecureStore = __toESM(require("expo-secure-store"), 1);
var AUTH_TOKEN_KEY = "brewery.auth.token";
async function readToken() {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return token ?? null;
  } catch {
    return null;
  }
}
async function writeToken(token) {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch {
  }
}
async function clearToken() {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch {
  }
}

// src/auth/AuthProvider.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var AuthContext = (0, import_react.createContext)(null);
function useAuth() {
  const ctx = (0, import_react.useContext)(AuthContext);
  if (!ctx) throw new Error("AuthProvider is missing for useAuth()");
  return ctx;
}
function parseToken(data) {
  const token = data.token;
  if (typeof token === "string" && token.trim()) return token.trim();
  return null;
}
function AuthProvider({ children }) {
  const [state, setState] = (0, import_react.useState)({ status: "loading" });
  const baseUrl = getApiBaseUrl();
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    void (async () => {
      const token = await readToken();
      if (cancelled) return;
      if (!token) {
        setState({ status: "logged_out" });
        return;
      }
      try {
        if (!baseUrl) throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
        await (0, import_api_client2.getAuthMe)(nativePlatformApiClient(token));
        setState({ status: "logged_in", token });
      } catch {
        await clearToken();
        setState({ status: "logged_out" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);
  const login = (0, import_react.useCallback)(
    async (input) => {
      try {
        if (!baseUrl) return { ok: false, error: "Missing EXPO_PUBLIC_API_BASE_URL" };
        const res = await (0, import_api_client2.loginNative)(nativePlatformApiClient(null, baseUrl), input);
        const token = parseToken(res);
        if (!token) return { ok: false, error: "Login response missing token" };
        await writeToken(token);
        setState({ status: "logged_in", token });
        return { ok: true };
      } catch (err) {
        if (err instanceof import_api_client2.ApiClientError) {
          return { ok: false, error: err.message };
        }
        return { ok: false, error: String(err) };
      }
    },
    [baseUrl]
  );
  const logout = (0, import_react.useCallback)(async () => {
    const token = state.status === "logged_in" ? state.token : null;
    try {
      if (token && baseUrl) {
        await (0, import_api_client2.logout)(nativePlatformApiClient(token));
      }
    } finally {
      await clearToken();
      setState({ status: "logged_out" });
    }
  }, [baseUrl, state]);
  const value = (0, import_react.useMemo)(() => ({ state, login, logout }), [state, login, logout]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, { value, children });
}

// src/i18n/I18nProvider.tsx
var import_react2 = require("react");
var import_react_native2 = require("react-native");
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
var SecureStore2 = __toESM(require("expo-secure-store"), 1);
async function readString(key) {
  try {
    const value = await SecureStore2.getItemAsync(key);
    return value ?? null;
  } catch {
    return null;
  }
}
async function writeString(key, value) {
  try {
    await SecureStore2.setItemAsync(key, value);
  } catch {
  }
}

// src/i18n/I18nProvider.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var LocaleControllerContext = (0, import_react2.createContext)(null);
function useLocaleController() {
  const ctx = (0, import_react2.useContext)(LocaleControllerContext);
  if (!ctx) throw new Error("I18nProvider is missing for useLocaleController()");
  return ctx;
}
function I18nProvider({ children }) {
  const [locale, setLocaleState] = (0, import_react2.useState)(null);
  (0, import_react2.useEffect)(() => {
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
  const setLocale = (0, import_react2.useCallback)((next) => {
    setLocaleState(next);
    void writeString(LOCALE_STORAGE_KEY, next);
  }, []);
  const controller = (0, import_react2.useMemo)(() => {
    return {
      locale: locale ?? getDeviceLocale(),
      setLocale
    };
  }, [locale, setLocale]);
  if (!locale) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native2.View, { style: { flex: 1, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native2.ActivityIndicator, {}) });
  }
  const messages = (0, import_i18n2.getSharedMessages)(locale);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LocaleControllerContext.Provider, { value: controller, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_i18n_react.LocaleProvider, { locale, messages, children }) });
}

// src/theme/colors.ts
var import_ui = require("@umbraculum/ui");
var SURFACE_BACKGROUND = "#1a1d22";
var SURFACE_BORDER = "#2a2f3a";
var SURFACE_BACKGROUND_SEMI = "rgba(26, 29, 34, 0.45)";
var FIELD_COMPUTED_BG = "#1e2e22";
var FIELD_COMPUTED_BORDER = "#2d5a3d";
var SURFACE_CARD = "#222734";
var FIELD_READONLY_BG = import_ui.FIELD_READONLY_BG;
var FIELD_READONLY_BORDER = import_ui.FIELD_READONLY_BORDER;

// src/components/AdSlot.tsx
var import_react3 = require("react");
var import_react_native3 = require("react-native");
var import_expo_image = require("expo-image");
var import_api_client3 = require("@umbraculum/api-client");
var import_i18n_react2 = require("@umbraculum/i18n-react");
var import_ui2 = require("@umbraculum/ui");
var import_jsx_runtime3 = require("react/jsx-runtime");
function AdSlot({ placement }) {
  const { t } = (0, import_i18n_react2.useT)("ads");
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;
  const [disabled, setDisabled] = (0, import_react3.useState)(false);
  const [ad, setAd] = (0, import_react3.useState)(null);
  const mediaHeightPx = placement === "global_top" ? 120 : 160;
  (0, import_react3.useEffect)(() => {
    if (!baseUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await (0, import_api_client3.getAdSlot)(nativePlatformApiClient(token, baseUrl), placement);
        if (!cancelled) {
          setDisabled(data.disabled);
          setAd(data.ad);
        }
      } catch {
      }
    })().catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [baseUrl, placement, token]);
  if (disabled) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    import_ui2.AdSlotCard,
    {
      ariaLabel: t("ariaLabel"),
      mediaHeightPx,
      media: ad ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        import_react_native3.Pressable,
        {
          onPress: () => {
            if (ad.linkUrl) void import_react_native3.Linking.openURL(ad.linkUrl);
          },
          style: { flex: 1 },
          accessibilityRole: "link",
          accessibilityLabel: ad.altText,
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_expo_image.Image,
            {
              source: { uri: ad.imageUrl },
              style: {
                width: "100%",
                height: "100%",
                resizeMode: "cover"
              },
              contentFit: "cover"
            }
          )
        }
      ) : null,
      contactLine: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        import_react_native3.Pressable,
        {
          onPress: () => {
            const base = baseUrl.replace(/\/+$/, "");
            void import_react_native3.Linking.openURL(`${base}/contact`);
          },
          accessibilityRole: "link",
          accessibilityLabel: t("contactLine"),
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_ui2.Text, { fontSize: 12, opacity: 0.8, children: t("contactLine") })
        }
      ),
      upgradeLine: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_ui2.Text, { fontSize: 12, opacity: 0.8, children: t("upgradeLine") })
    }
  );
}

// src/components/AppInput.tsx
var import_react4 = require("react");
var import_react_native4 = require("react-native");
var import_tamagui = require("tamagui");
var import_jsx_runtime4 = require("react/jsx-runtime");
function Input(props) {
  const isAndroid = import_react_native4.Platform.OS === "android";
  const androidSingleLineFixStyle = isAndroid && !props.multiline ? {
    textAlignVertical: "center",
    paddingTop: 2,
    paddingBottom: 0
  } : null;
  const passthrough = props;
  const includeFontPadding = passthrough.includeFontPadding ?? (isAndroid ? false : void 0);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    import_tamagui.Input,
    {
      ...props,
      ...{ includeFontPadding },
      style: androidSingleLineFixStyle ? [androidSingleLineFixStyle, props.style] : props.style
    }
  );
}

// src/components/ReadOnlyField.tsx
var import_react5 = require("react");
var import_react_native5 = require("react-native");
var import_ui3 = require("@umbraculum/ui");
var import_jsx_runtime5 = require("react/jsx-runtime");
function ReadOnlyField({ value, placeholder = "\u2014", textAlign }) {
  const display = (value ?? "").trim() || placeholder;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    import_react_native5.View,
    {
      style: {
        padding: 8,
        backgroundColor: FIELD_READONLY_BG,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: FIELD_READONLY_BORDER
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        import_ui3.Text,
        {
          fontSize: 14,
          color: "$gray11",
          fontFamily: "$body",
          style: textAlign ? { textAlign } : void 0,
          children: display
        }
      )
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AdSlot,
  AuthProvider,
  FIELD_COMPUTED_BG,
  FIELD_COMPUTED_BORDER,
  FIELD_READONLY_BG,
  FIELD_READONLY_BORDER,
  I18nProvider,
  Input,
  LOCALE_STORAGE_KEY,
  ReadOnlyField,
  SURFACE_BACKGROUND,
  SURFACE_BACKGROUND_SEMI,
  SURFACE_BORDER,
  SURFACE_CARD,
  clearToken,
  getApiBaseUrl,
  getDeviceLocale,
  nativePlatformApiClient,
  readString,
  readToken,
  useAuth,
  useLocaleController,
  writeString,
  writeToken
});
