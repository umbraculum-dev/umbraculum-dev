import { webPlatformApiClient } from "../../../_shared-layout/_lib/webApiClient";

/** Cookie-session client for brewery add-on facades (same transport as platform). */
export function webBreweryApiClient() {
  return webPlatformApiClient();
}
