import { bearerTokenAuth, createApiClient, type ApiClient } from "@umbraculum/api-client";

import { getApiBaseUrl } from "./apiBaseUrl";

/** Bearer-token platform API client for native screens (brewery + auth). */
export function nativePlatformApiClient(token: string | null, baseUrlOverride?: string): ApiClient {
  const baseUrl = baseUrlOverride ?? getApiBaseUrl();
  if (!baseUrl) throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  return createApiClient(baseUrl, bearerTokenAuth(() => token));
}
