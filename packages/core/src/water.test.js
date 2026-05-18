import { describe, expect, it } from "vitest";
import { DEFAULT_MASH_TARGET_PH } from "./water.js";

describe("DEFAULT_MASH_TARGET_PH (Phase 5a)", () => {
  // Pinned because this constant is documented as coupled to the Prisma
  // column default on `recipe_water_settings.mash_target_ph`. Changing the
  // value here without also updating the Prisma migration creates silent
  // drift between the @brewery/core default and the database default.
  // If you intend to change the value, also update:
  //   - prisma/schema.prisma (mash_target_ph default)
  //   - prisma/migrations/*  (new migration with the new default)
  // then update this test in the same PR.
  it("is exactly 5.6 at room temperature", () => {
    expect(DEFAULT_MASH_TARGET_PH).toBe(5.6);
  });

  it("is a finite number in the brewing-sensible window (5.0–5.8)", () => {
    expect(typeof DEFAULT_MASH_TARGET_PH).toBe("number");
    expect(Number.isFinite(DEFAULT_MASH_TARGET_PH)).toBe(true);
    expect(DEFAULT_MASH_TARGET_PH).toBeGreaterThanOrEqual(5.0);
    expect(DEFAULT_MASH_TARGET_PH).toBeLessThanOrEqual(5.8);
  });
});
