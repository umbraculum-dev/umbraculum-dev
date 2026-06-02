import { webPlatformApiClient } from "./webApiClient";

/** Cookie-session client for brewery add-on facades (same transport as platform). */
export function webBreweryApiClient() {
  return webPlatformApiClient();
}
