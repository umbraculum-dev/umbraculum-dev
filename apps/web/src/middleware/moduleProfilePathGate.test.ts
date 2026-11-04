import { describe, expect, it } from "vitest";

import { isModuleOwnedPathDenied } from "./moduleProfilePathGate.js";

const locales = ["en", "it"] as const;

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
