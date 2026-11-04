import { describe, expect, it } from "vitest";

import {
  getBuiltinSegmentOwnerEdge,
  isModuleOwnedPathDenied,
  resolveEnabledModuleCodesEdge,
} from "./edgeEnabledModules.js";

const locales = ["en", "it"] as const;

describe("getBuiltinSegmentOwnerEdge", () => {
  it("maps recipes to brewery", () => {
    expect(getBuiltinSegmentOwnerEdge("recipes")).toBe("brewery");
  });

  it("maps vessels to automation", () => {
    expect(getBuiltinSegmentOwnerEdge("vessels")).toBe("automation");
  });

  it("returns undefined for unknown / platform segments", () => {
    expect(getBuiltinSegmentOwnerEdge("login")).toBeUndefined();
    expect(getBuiltinSegmentOwnerEdge("about")).toBeUndefined();
    expect(getBuiltinSegmentOwnerEdge("")).toBeUndefined();
  });
});

describe("resolveEnabledModuleCodesEdge", () => {
  it("disables brewery on platform profile", () => {
    const enabled = resolveEnabledModuleCodesEdge({
      UMBRACULUM_MODULE_PROFILE: "platform",
    });
    expect(enabled.has("brewery")).toBe(false);
    expect(enabled.has("automation")).toBe(true);
    expect(enabled.has("pim")).toBe(true);
  });

  it("enables brewery on reference profile", () => {
    const enabled = resolveEnabledModuleCodesEdge({
      UMBRACULUM_MODULE_PROFILE: "reference",
    });
    expect(enabled.has("brewery")).toBe(true);
    expect(enabled.has("pim")).toBe(true);
  });

  it("treats unset profile as platform", () => {
    const enabled = resolveEnabledModuleCodesEdge({});
    expect(enabled.has("brewery")).toBe(false);
    expect(enabled.has("automation")).toBe(true);
    expect(enabled.has("pim")).toBe(true);
  });

  it("treats blank profile as platform", () => {
    const enabled = resolveEnabledModuleCodesEdge({
      UMBRACULUM_MODULE_PROFILE: "  ",
    });
    expect(enabled.has("brewery")).toBe(false);
    expect(enabled.has("pim")).toBe(true);
  });

  it("returns empty set for explicit minimal", () => {
    const enabled = resolveEnabledModuleCodesEdge({
      UMBRACULUM_MODULE_PROFILE: "minimal",
    });
    expect(enabled.size).toBe(0);
  });
});

describe("isModuleOwnedPathDenied", () => {
  it("denies brewery deep links on platform profile", () => {
    expect(
      isModuleOwnedPathDenied({
        pathname: "/en/recipes/2f323aed-19cd-4839-8ed5-c3de10262874/edit",
        locales,
        env: { UMBRACULUM_MODULE_PROFILE: "platform" },
      }),
    ).toBe(true);
  });

  it("allows brewery deep links on reference profile", () => {
    expect(
      isModuleOwnedPathDenied({
        pathname: "/en/recipes/2f323aed-19cd-4839-8ed5-c3de10262874/edit",
        locales,
        env: { UMBRACULUM_MODULE_PROFILE: "reference" },
      }),
    ).toBe(false);
  });

  it("allows platform segments on platform profile", () => {
    expect(
      isModuleOwnedPathDenied({
        pathname: "/en/login",
        locales,
        env: { UMBRACULUM_MODULE_PROFILE: "platform" },
      }),
    ).toBe(false);
  });

  it("allows pim segments on platform profile", () => {
    expect(
      isModuleOwnedPathDenied({
        pathname: "/en/products",
        locales,
        env: { UMBRACULUM_MODULE_PROFILE: "platform" },
      }),
    ).toBe(false);
  });

  it("allows locale root", () => {
    expect(
      isModuleOwnedPathDenied({
        pathname: "/en",
        locales,
        env: { UMBRACULUM_MODULE_PROFILE: "platform" },
      }),
    ).toBe(false);
  });
});
