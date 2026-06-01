import { cookieAuth, createApiClient } from "@umbraculum/api-client";

export function webBreweryApiClient() {
  return createApiClient("", cookieAuth());
}
