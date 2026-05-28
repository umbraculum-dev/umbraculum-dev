import { describe, expect, it, beforeEach } from "vitest";
import {
  clearModuleRegistryForTests,
  composeModuleTierLimitSlices,
  InvalidTierLimitKeyError,
  InvalidTierLimitValueError,
  listRegisteredTierLimitKeys,
  registerModule,
  ReservedTierLimitKeyError,
  TierLimitKeyCollisionError,
} from "./index.js";

beforeEach(() => {
  clearModuleRegistryForTests();
});

function fakeApp() {
  return { get() {} };
}

describe("tierLimits registration", () => {
  it("indexes keys from the free-tier slice at registration time", () => {
    registerModule(fakeApp(), {
      code: "brewery",
      tierLimits: (tier) => ({
        maxRecipesPerWorkspace: tier === "free" ? 5 : 25,
        maxVersionsPerRecipe: 2,
      }),
    });

    expect(listRegisteredTierLimitKeys("brewery")).toEqual([
      "maxRecipesPerWorkspace",
      "maxVersionsPerRecipe",
    ]);
  });

  it("rejects reserved platform keys", () => {
    expect(() =>
      registerModule(fakeApp(), {
        code: "evil",
        tierLimits: () => ({ aiEnabled: true }),
      }),
    ).toThrow(ReservedTierLimitKeyError);
  });

  it("rejects invalid key shape", () => {
    expect(() =>
      registerModule(fakeApp(), {
        code: "evil",
        tierLimits: () => ({ "bad-key": 1 }),
      }),
    ).toThrow(InvalidTierLimitKeyError);
  });

  it("rejects non-number/boolean values", () => {
    expect(() =>
      registerModule(fakeApp(), {
        code: "evil",
        tierLimits: () => ({ maxItems: "many" as unknown as number }),
      }),
    ).toThrow(InvalidTierLimitValueError);
  });

  it("rejects duplicate keys across modules", () => {
    registerModule(fakeApp(), {
      code: "alpha",
      tierLimits: () => ({ sharedKey: 1 }),
    });

    expect(() =>
      registerModule(fakeApp(), {
        code: "beta",
        tierLimits: () => ({ sharedKey: 2 }),
      }),
    ).toThrow(TierLimitKeyCollisionError);
  });
});

describe("composeModuleTierLimitSlices", () => {
  it("merges slices from all contributing modules", () => {
    registerModule(fakeApp(), {
      code: "zulu",
      tierLimits: () => ({ zKey: 99 }),
    });
    registerModule(fakeApp(), {
      code: "alpha",
      tierLimits: () => ({ aKey: 1 }),
    });
    registerModule(fakeApp(), {
      code: "mike",
      tierLimits: (tier) => ({
        mKey: tier === "premium" ? 10 : 5,
      }),
    });

    expect(composeModuleTierLimitSlices("premium")).toEqual({
      aKey: 1,
      mKey: 10,
      zKey: 99,
    });
  });

  it("skips modules without tierLimits contributors", () => {
    registerModule(fakeApp(), { code: "plain" });
    registerModule(fakeApp(), {
      code: "brewery",
      tierLimits: () => ({ maxRecipesPerWorkspace: 5 }),
    });

    expect(composeModuleTierLimitSlices("free")).toEqual({
      maxRecipesPerWorkspace: 5,
    });
  });
});
