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

// src/auth/index.ts
var auth_exports = {};
__export(auth_exports, {
  AuthProvider: () => AuthProvider,
  clearToken: () => clearToken,
  getApiBaseUrl: () => getApiBaseUrl,
  nativePlatformApiClient: () => nativePlatformApiClient,
  readToken: () => readToken,
  useAuth: () => useAuth,
  writeToken: () => writeToken
});
module.exports = __toCommonJS(auth_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthProvider,
  clearToken,
  getApiBaseUrl,
  nativePlatformApiClient,
  readToken,
  useAuth,
  writeToken
});
