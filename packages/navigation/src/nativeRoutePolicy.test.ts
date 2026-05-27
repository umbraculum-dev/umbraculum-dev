import { afterEach, describe, expect, it } from "vitest";

import { getRouteAvailability } from "./index.js";
import { clearNativeRoutePolicyForTests, configureNativeRoutePolicy } from "./nativeRoutePolicy.js";

afterEach(() => {
  clearNativeRoutePolicyForTests();
});

describe("configureNativeRoutePolicy", () => {
  it("overrides available and fallback routes", () => {
    configureNativeRoutePolicy({
      availableRouteIds: ["recipes"],
      webFallbackRouteIds: ["inventory"],
    });
    expect(getRouteAvailability("recipes", "native")).toBe("available");
    expect(getRouteAvailability("inventory", "native")).toBe("whitelisted_web_fallback");
    expect(getRouteAvailability("productionOrders", "native")).toBe("blocked");
  });
});
