import { afterEach, describe, expect, it } from "vitest";

import {
  aggregateNativeAvailableRouteIds,
  clearNativeModuleRegistryForTests,
  listRegisteredNativeModules,
  registerNativeModule,
} from "./registerNativeModule.js";

afterEach(() => {
  clearNativeModuleRegistryForTests();
});

describe("registerNativeModule", () => {
  it("registers brewery routes", () => {
    registerNativeModule({
      code: "brewery",
      availableRouteIds: ["recipes", "recipeEdit"],
    });
    expect(listRegisteredNativeModules()).toHaveLength(1);
    expect(aggregateNativeAvailableRouteIds()).toEqual(["recipeEdit", "recipes"]);
  });

  it("rejects duplicate code", () => {
    registerNativeModule({ code: "brewery", availableRouteIds: ["recipes"] });
    expect(() =>
      registerNativeModule({ code: "brewery", availableRouteIds: ["equipment"] }),
    ).toThrow(/already registered/);
  });
});
