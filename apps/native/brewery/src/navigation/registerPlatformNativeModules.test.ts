import { afterEach, describe, expect, it } from "vitest";

import { getRouteAvailability } from "@umbraculum/navigation";

import {
  registerPlatformNativeModules,
  resetPlatformNativeModulesForTests,
} from "./registerPlatformNativeModules";

afterEach(() => {
  resetPlatformNativeModulesForTests();
});

describe("registerPlatformNativeModules", () => {
  it("promotes brewery routes on native", () => {
    registerPlatformNativeModules();
    expect(getRouteAvailability("recipes", "native")).toBe("available");
    expect(getRouteAvailability("productionOrders", "native")).toBe("whitelisted_web_fallback");
  });
});
