// src/auth/apiBaseUrl.ts
import Constants from "expo-constants";
import { Platform } from "react-native";
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
  const expoConfig = Constants.expoConfig;
  const constantsRec = Constants;
  const candidate = expoConfig?.hostUri ?? constantsRec.manifest2?.extra?.expoClient?.hostUri ?? constantsRec.manifest?.hostUri ?? null;
  if (typeof candidate !== "string" || !candidate) return null;
  const host = candidate.split(":")[0]?.trim();
  if (!host) return null;
  if (/[a-z]/i.test(host) && !host.endsWith(".local")) return null;
  return host;
}
function maybeRewriteForAndroidEmulator(baseUrl) {
  if (Platform.OS !== "android") return baseUrl;
  if (Constants.isDevice) return baseUrl;
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
  const expoExtra = Constants.expoConfig?.extra;
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
import { bearerTokenAuth, createApiClient } from "@umbraculum/api-client";
function nativePlatformApiClient(token, baseUrlOverride) {
  const baseUrl = baseUrlOverride ?? getApiBaseUrl();
  if (!baseUrl) throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  return createApiClient(baseUrl, bearerTokenAuth(() => token));
}

// src/auth/tokenStorage.ts
import * as SecureStore from "expo-secure-store";
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
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getAuthMe, loginNative, logout as logoutApi, ApiClientError } from "@umbraculum/api-client";
import { jsx } from "react/jsx-runtime";
var AuthContext = createContext(null);
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider is missing for useAuth()");
  return ctx;
}
function parseToken(data) {
  const token = data.token;
  if (typeof token === "string" && token.trim()) return token.trim();
  return null;
}
function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading" });
  const baseUrl = getApiBaseUrl();
  useEffect(() => {
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
        await getAuthMe(nativePlatformApiClient(token));
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
  const login = useCallback(
    async (input) => {
      try {
        if (!baseUrl) return { ok: false, error: "Missing EXPO_PUBLIC_API_BASE_URL" };
        const res = await loginNative(nativePlatformApiClient(null, baseUrl), input);
        const token = parseToken(res);
        if (!token) return { ok: false, error: "Login response missing token" };
        await writeToken(token);
        setState({ status: "logged_in", token });
        return { ok: true };
      } catch (err) {
        if (err instanceof ApiClientError) {
          return { ok: false, error: err.message };
        }
        return { ok: false, error: String(err) };
      }
    },
    [baseUrl]
  );
  const logout = useCallback(async () => {
    const token = state.status === "logged_in" ? state.token : null;
    try {
      if (token && baseUrl) {
        await logoutApi(nativePlatformApiClient(token));
      }
    } finally {
      await clearToken();
      setState({ status: "logged_out" });
    }
  }, [baseUrl, state]);
  const value = useMemo(() => ({ state, login, logout }), [state, login, logout]);
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}

export {
  getApiBaseUrl,
  nativePlatformApiClient,
  readToken,
  writeToken,
  clearToken,
  useAuth,
  AuthProvider
};
