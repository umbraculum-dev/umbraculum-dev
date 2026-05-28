import { afterEach, describe, expect, it } from "vitest";

import {
  clearWebModuleRegistryForTests,
  composeWebShellNavItems,
  registerBuiltinWebModulesIfAbsent,
  registerWebModule,
} from "./index.js";

describe("composeWebShellNavItems", () => {
  afterEach(() => {
    clearWebModuleRegistryForTests();
  });

  it("orders platform entries and module nav entries by order key", () => {
    registerBuiltinWebModulesIfAbsent();

    const items = composeWebShellNavItems();
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
  });

  it("includes third-party module nav entries once registered", () => {
    registerWebModule({
      code: "quality",
      ownedUrlSegments: ["inspections"],
      navEntries: [
        { primarySegment: "inspections", labelKey: "nav.pim", order: 15 },
      ],
    });

    const items = composeWebShellNavItems();
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

    const items = composeWebShellNavItems();
    expect(items.some((item) => item.href === "/production-orders")).toBe(true);
  });
});
