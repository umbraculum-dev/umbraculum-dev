import { describe, expect, it } from "vitest";

import {
  assertValidModuleMessageRoot,
  composeModuleMessageKey,
  defaultModuleNavLabelKey,
  InvalidMessageSubkeySegmentError,
  InvalidModuleMessageRootError,
  isModuleNavLabelKey,
  isReservedPlatformMessageRoot,
  moduleMessageRoot,
  ReservedPlatformMessageRootError,
} from "./messageKeys.js";

describe("moduleMessageRoot", () => {
  it("returns the code when valid and not reserved", () => {
    expect(moduleMessageRoot("pim")).toBe("pim");
    expect(moduleMessageRoot("automation")).toBe("automation");
  });

  it("rejects invalid roots", () => {
    expect(() => moduleMessageRoot("PIM")).toThrow(InvalidModuleMessageRootError);
    expect(() => moduleMessageRoot("1bad")).toThrow(InvalidModuleMessageRootError);
  });

  it("rejects reserved platform roots", () => {
    expect(() => moduleMessageRoot("nav")).toThrow(ReservedPlatformMessageRootError);
    expect(() => moduleMessageRoot("common")).toThrow(ReservedPlatformMessageRootError);
    expect(isReservedPlatformMessageRoot("nav")).toBe(true);
    expect(isReservedPlatformMessageRoot("pim")).toBe(false);
  });
});

describe("defaultModuleNavLabelKey", () => {
  it("returns nav.<code> for canonical modules", () => {
    expect(defaultModuleNavLabelKey("pim")).toBe("nav.pim");
    expect(defaultModuleNavLabelKey("automation")).toBe("nav.automation");
  });

  it("allows brewery-style exceptions when built manually", () => {
    const breweryNav = "nav.recipes" as const;
    expect(isModuleNavLabelKey(breweryNav)).toBe(true);
    expect(defaultModuleNavLabelKey("brewery")).toBe("nav.brewery");
  });
});

describe("composeModuleMessageKey", () => {
  it("joins root and camelCase segments", () => {
    expect(composeModuleMessageKey("pim", "products", "title")).toBe("pim.products.title");
    expect(composeModuleMessageKey("pim")).toBe("pim");
  });

  it("rejects invalid sub-key segments", () => {
    expect(() => composeModuleMessageKey("pim", "Products")).toThrow(
      InvalidMessageSubkeySegmentError,
    );
    expect(() => composeModuleMessageKey("pim", "bad-segment")).toThrow(
      InvalidMessageSubkeySegmentError,
    );
  });
});

describe("assertValidModuleMessageRoot", () => {
  it("accepts module codes that match production namespaces", () => {
    expect(() => assertValidModuleMessageRoot("mrp")).not.toThrow();
    expect(() => assertValidModuleMessageRoot("crp")).not.toThrow();
  });
});
