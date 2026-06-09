import { describe, expect, it } from "vitest";

import { AttributeValueSchema } from "./attribute.js";

describe("AttributeValueSchema", () => {
  it("accepts multiselect values", () => {
    expect(
      AttributeValueSchema.parse({
        type: "multiselect",
        value: ["a", "b"],
      }),
    ).toEqual({ type: "multiselect", value: ["a", "b"] });
  });
});
