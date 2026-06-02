import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getAuthMe, loginNative, logout as logoutApi, ApiClientError } from "@umbraculum/api-client";
import type { SupportedLocale } from "@umbraculum/i18n";

import { getApiBaseUrl } from "./apiBaseUrl";
import { nativePlatformApiClient } from "./nativeApiClient";
import { clearToken, readToken, writeToken } from "./tokenStorage";

export type AuthState =
  | { status: "loading" }
  | { status: "logged_out" }
  | { status: "logged_in"; token: string };

export interface AuthContextValue {
  state: AuthState;

  login(input: { email: string; password: string; preferredLocale: SupportedLocale }): Promise<{ ok: boolean; error?: string }>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider is missing for useAuth()");
  return ctx;
}

function parseToken(data: { token?: string }): string | null {
  const token = data.token;
  if (typeof token === "string" && token.trim()) return token.trim();
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

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

      // Optional quick validation: if token is invalid, drop it.
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
    async (input: { email: string; password: string; preferredLocale: SupportedLocale }) => {
      try {
        if (!baseUrl) return { ok: false, error: "Missing EXPO_PUBLIC_API_BASE_URL" };

        const api = createApiClient(baseUrl, bearerTokenAuth(() => null));
        const res = await loginNative(api, input);
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
    [baseUrl],
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

  const value = useMemo<AuthContextValue>(() => ({ state, login, logout }), [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

