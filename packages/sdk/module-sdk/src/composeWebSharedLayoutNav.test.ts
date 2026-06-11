import { afterEach, describe, expect, it } from "vitest";

import {
  clearWebModuleRegistryForTests,
  composeWebSharedLayoutNavItems,
  registerBuiltinWebModulesIfAbsent,
  registerWebModule,
} from "./index.js";

describe("composeWebSharedLayoutNavItems", () => {
  afterEach(() => {
    clearWebModuleRegistryForTests();
  });

  it("orders platform entries and module nav entries by order key (reference profile)", () => {
    const prev = process.env["UMBRACULUM_MODULE_PROFILE"];
    process.env["UMBRACULUM_MODULE_PROFILE"] = "reference";
    registerBuiltinWebModulesIfAbsent();

    const items = composeWebSharedLayoutNavItems();
    expect(items.map((item) => item.href)).toEqual([
      "/",
      "/recipes",
      "/equipment",
      "/vessels",
      "/products",
      "/production-orders",
      "/capacity",
      "/ai",
      "/about",
    ]);
    expect(items[0]?.labelKey).toBe("nav.dashboard");
    expect(items.find((item) => item.href === "/recipes")?.labelKey).toBe("nav.recipes");
    if (prev === undefined) delete process.env["UMBRACULUM_MODULE_PROFILE"];
    else process.env["UMBRACULUM_MODULE_PROFILE"] = prev;
  });

  it("omits brewery nav on core installation profile", () => {
    const prev = process.env["UMBRACULUM_MODULE_PROFILE"];
    process.env["UMBRACULUM_MODULE_PROFILE"] = "platform";
    registerBuiltinWebModulesIfAbsent({ enabledCodes: new Set(["automation", "pim", "mrp", "crp"]) });

    const items = composeWebSharedLayoutNavItems();
    expect(items.map((item) => item.href)).toEqual([
      "/",
      "/vessels",
      "/products",
      "/production-orders",
      "/capacity",
      "/ai",
      "/about",
    ]);
    if (prev === undefined) delete process.env["UMBRACULUM_MODULE_PROFILE"];
    else process.env["UMBRACULUM_MODULE_PROFILE"] = prev;
  });

  it("includes third-party module nav entries once registered", () => {
    registerWebModule({
      code: "quality",
      ownedUrlSegments: ["inspections"],
      navEntries: [
        { primarySegment: "inspections", labelKey: "nav.pim", order: 15 },
      ],
    });

    const items = composeWebSharedLayoutNavItems();
    expect(items.some((item) => item.href === "/inspections")).toBe(true);
  });
});

describe("registerBuiltinWebModulesIfAbsent", () => {
  afterEach(() => {
    clearWebModuleRegistryForTests();
  });

  it("is idempotent across repeated calls", () => {
    registerBuiltinWebModulesIfAbsent();
    registerBuiltinWebModulesIfAbsent();

    const items = composeWebSharedLayoutNavItems();
    expect(items.some((item) => item.href === "/production-orders")).toBe(true);
  });
});
