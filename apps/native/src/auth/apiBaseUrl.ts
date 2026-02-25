import Constants from "expo-constants";

export const DEFAULT_API_BASE_URL = "http://192.168.1.124:18080";

function normalizeBaseUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  // Prefer Expo config extra (works in Expo Go).
  const fromExtra = normalizeBaseUrl((Constants.expoConfig as any)?.extra?.EXPO_PUBLIC_API_BASE_URL);
  if (fromExtra) return fromExtra;

  // Fall back to environment variable (works when set via .env or shell env).
  const fromEnv = normalizeBaseUrl((process.env as Record<string, string | undefined>).EXPO_PUBLIC_API_BASE_URL);
  if (fromEnv) return fromEnv;

  return "";
}

