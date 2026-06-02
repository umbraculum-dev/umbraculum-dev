import { cookieAuth, createApiClient } from "@umbraculum/api-client";

export function webPlatformApiClient() {
  return createApiClient("", cookieAuth());
}
