import { describe, expect, it } from "vitest";

import {
  AddonCodeAlreadyRegisteredError,
  clearAddonCodeRegistryForTests,
  InvalidAddonCodeError,
  listRegisteredAddonCodes,
  snapshotAddonCodeOwnership,
  validateAndIndexAddonCodes,
} from "./addonCodes.js";

describe("addonCodes registry", () => {
  it("indexes unique addon codes per module", () => {
    clearAddonCodeRegistryForTests();
    validateAndIndexAddonCodes("automation", ["automation_module"]);
    validateAndIndexAddonCodes("pim", ["pim_module"]);

    expect(listRegisteredAddonCodes("automation")).toEqual(["automation_module"]);
    expect(snapshotAddonCodeOwnership().get("pim_module")).toBe("pim");
  });

  it("rejects duplicate addon codes across modules", () => {
    clearAddonCodeRegistryForTests();
    validateAndIndexAddonCodes("mrp", ["mrp_module"]);

    expect(() => validateAndIndexAddonCodes("crp", ["mrp_module"])).toThrow(
      AddonCodeAlreadyRegisteredError,
    );
  });

  it("rejects platform-reserved managed_ai_credits prefix on modules", () => {
    clearAddonCodeRegistryForTests();
    expect(() => validateAndIndexAddonCodes("brewery", ["managed_ai_credits_5k"])).toThrow(
      InvalidAddonCodeError,
    );
  });

  it("rejects duplicate codes within one module registration", () => {
    clearAddonCodeRegistryForTests();
    expect(() =>
      validateAndIndexAddonCodes("brewery", ["brewery_module", "brewery_module"]),
    ).toThrow(AddonCodeAlreadyRegisteredError);
  });
});
