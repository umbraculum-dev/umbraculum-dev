import Constants from "expo-constants";

import { getApiBaseUrl } from "../auth/apiBaseUrl";

function normalizeBaseUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}

export function getMediaBaseUrl(): string {
  // Prefer Expo config extra (works in Expo Go).
  const expoExtra = (Constants.expoConfig as { extra?: { EXPO_PUBLIC_MEDIA_BASE_URL?: unknown } } | null | undefined)?.extra;
  const fromExtra = normalizeBaseUrl(expoExtra?.EXPO_PUBLIC_MEDIA_BASE_URL);
  if (fromExtra) return fromExtra;

  // Fall back to environment variable (works when set via .env or shell env).
  const fromEnv = normalizeBaseUrl((process.env as Record<string, string | undefined>)['EXPO_PUBLIC_MEDIA_BASE_URL']);
  if (fromEnv) return fromEnv;

  // Safe fallback: media is served by nginx alongside API in local dev.
  return getApiBaseUrl();
}

