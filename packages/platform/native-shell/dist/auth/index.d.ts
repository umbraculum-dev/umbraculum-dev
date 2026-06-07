import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { SupportedLocale } from '@umbraculum/i18n';
import { ApiClient } from '@umbraculum/api-client';

type AuthState = {
    status: "loading";
} | {
    status: "logged_out";
} | {
    status: "logged_in";
    token: string;
};
interface AuthContextValue {
    state: AuthState;
    login(input: {
        email: string;
        password: string;
        preferredLocale: SupportedLocale;
    }): Promise<{
        ok: boolean;
        error?: string;
    }>;
    logout(): Promise<void>;
}
declare function useAuth(): AuthContextValue;
declare function AuthProvider({ children }: {
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function getApiBaseUrl(): string;

/** Bearer-token platform API client for native screens (brewery + auth). */
declare function nativePlatformApiClient(token: string | null, baseUrlOverride?: string): ApiClient;

declare function readToken(): Promise<string | null>;
declare function writeToken(token: string): Promise<void>;
declare function clearToken(): Promise<void>;

export { type AuthContextValue, AuthProvider, type AuthState, clearToken, getApiBaseUrl, nativePlatformApiClient, readToken, useAuth, writeToken };
