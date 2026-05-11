import Constants from "expo-constants";
import { Platform } from "react-native";

export const DEFAULT_API_BASE_URL = "http://192.168.1.124:18080";
export const ANDROID_EMULATOR_HOST = "10.0.2.2";

function normalizeBaseUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}

function maybeRewriteForAndroidEmulator(baseUrl: string): string {
  if (Platform.OS !== "android") return baseUrl;
  if ((Constants as any).isDevice) return baseUrl;
  try {
    const u = new URL(baseUrl);
    if (!u.hostname) return baseUrl;
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1" && u.hostname !== "0.0.0.0") {
      return baseUrl;
    }
    // WHATWG URL.hostname is writable at runtime, but its TypeScript type can
    // resolve to a read-only declaration when lib.dom is not included and
    // @types/node's URL is in scope (which is the case in this app: tsconfig
    // lib is ES2022 only). Rebuild the URL string from the parsed parts so the
    // typecheck is environment-independent.
    const port = u.port ? `:${u.port}` : "";
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${u.protocol}//${ANDROID_EMULATOR_HOST}${port}${path}${u.search}${u.hash}`.replace(/\/+$/, "");
  } catch {
    return baseUrl;
  }
}

export function getApiBaseUrl(): string {
  // Prefer Expo config extra (works in Expo Go).
  const fromExtra = normalizeBaseUrl((Constants.expoConfig as any)?.extra?.EXPO_PUBLIC_API_BASE_URL);
  if (fromExtra) return maybeRewriteForAndroidEmulator(fromExtra);

  // Fall back to environment variable (works when set via .env or shell env).
  const fromEnv = normalizeBaseUrl((process.env as Record<string, string | undefined>).EXPO_PUBLIC_API_BASE_URL);
  if (fromEnv) return maybeRewriteForAndroidEmulator(fromEnv);

  return DEFAULT_API_BASE_URL;
}

