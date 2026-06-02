import { bearerTokenAuth, createApiClient, type ApiClient } from "@umbraculum/api-client";

import { getApiBaseUrl } from "./apiBaseUrl";

/** Bearer-token platform API client for native screens (brewery + auth). */
export function nativePlatformApiClient(token: string): ApiClient {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  return createApiClient(baseUrl, bearerTokenAuth(() => token));
}
