import { describe, expect, it } from "vitest";
import { validateRecipeExtJson } from "./recipeExtValidator.js";

describe("recipeExtValidator", () => {
  it("accepts yeastAttenuationRange", () => {
    const ext = {
      version: 1,
      yeastAttenuationRange: {
        "row-y1": { min: 78, max: 82 },
        "row-y2": { min: 75, max: 78 },
      },
    };
    const result = validateRecipeExtJson(ext);
    expect(result).toEqual(ext);
    expect((result as any).yeastAttenuationRange["row-y1"]).toEqual({ min: 78, max: 82 });
  });

  it("rejects yeastAttenuationRange with invalid min", () => {
    const ext = {
      version: 1,
      yeastAttenuationRange: {
        "row-y1": { min: -1, max: 82 },
      },
    };
    expect(() => validateRecipeExtJson(ext)).toThrow();
  });

  it("rejects yeastAttenuationRange with invalid max", () => {
    const ext = {
      version: 1,
      yeastAttenuationRange: {
        "row-y1": { min: 78, max: 101 },
      },
    };
    expect(() => validateRecipeExtJson(ext)).toThrow();
  });
});
