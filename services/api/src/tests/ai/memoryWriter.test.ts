import { describe, expect, it } from "vitest";

import { parsePatchSafe } from "../../services/ai/memoryWriter.js";

describe("memoryWriter.parsePatchSafe", () => {
  it("returns an empty patch for blank/non-JSON input", () => {
    expect(parsePatchSafe("")).toEqual({});
    expect(parsePatchSafe("not json")).toEqual({});
    expect(parsePatchSafe("123")).toEqual({});
  });

  it("parses a clean JSON patch with allowed keys", () => {
    const raw = JSON.stringify({
      addFacts: ["FV-3 has offset -0.6C"],
      addRecurringIssues: ["mash pH spikes when using crystal-90"],
      removeFacts: ["wrong fact"],
    });
    const patch = parsePatchSafe(raw);
    expect(patch.addFacts).toEqual(["FV-3 has offset -0.6C"]);
    expect(patch.addRecurringIssues).toEqual(["mash pH spikes when using crystal-90"]);
    expect(patch.removeFacts).toEqual(["wrong fact"]);
  });

  it("strips surrounding code fences / prose", () => {
    const raw = "Sure, here you go:\n```json\n{\"addFacts\":[\"x\"]}\n```";
    const patch = parsePatchSafe(raw);
    expect(patch.addFacts).toEqual(["x"]);
  });

  it("drops non-string entries in array fields", () => {
    const raw = JSON.stringify({
      addFacts: ["valid", 42, null, "another"],
    });
    const patch = parsePatchSafe(raw);
    expect(patch.addFacts).toEqual(["valid", "another"]);
  });

  it("ignores unknown keys", () => {
    const raw = JSON.stringify({ addFacts: ["x"], unknownKey: ["nope"] });
    const patch = parsePatchSafe(raw);
    expect(patch.addFacts).toEqual(["x"]);
    expect(Object.keys(patch)).toEqual(["addFacts"]);
  });
});
