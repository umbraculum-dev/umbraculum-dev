import { describe, expect, it } from "vitest";
import { mashPhEstimate, type MashPhEstimateInput } from "./mashPhEstimate.js";
import { mashPhEstimateV1 } from "./mashPhEstimateV1.js";

// L1 unit tests for the canonical mash-pH estimator entrypoint (Phase 5b-5).
//
// `mashPhEstimate.ts` is a 16-line wrapper that re-exports the input/result
// types of mashPhEstimateV1 and forwards calls verbatim. The wrapper exists
// so that the API route can have a stable import path even if the v1
// algorithm is replaced with v2 in the future. These tests pin the
// contract that the wrapper is a pure forward (no input mutation, no
// result rewriting) — so a refactor that, e.g., starts coercing some
// field will fail this test.

describe("mashPhEstimate (canonical entrypoint, Phase 5b-5)", () => {
  // Pinned: the wrapper forwards the input verbatim to mashPhEstimateV1
  // and returns its result. Deep-equality across all numeric fields +
  // debug.perRow + debug.constants.
  it("forwards to mashPhEstimateV1 and returns an equivalent result", () => {
    const input: MashPhEstimateInput = {
      volumeLiters: 25,
      alkalinityPpmCaCO3: 100,
      calciumPpm: 50,
      magnesiumPpm: 10,
      grist: [
        { amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 5 },
        { amountKg: 1, mashDiPh: 5.5, mashTaToPh57_mEqPerKg: 30 },
      ],
      acidAdded_mEqPerL: 1,
    };
    const wrapped = mashPhEstimate(input);
    const direct = mashPhEstimateV1(input);
    expect(wrapped).toEqual(direct);
  });

  // Pinned: empty grist case forwards correctly (no array mutation, no
  // pre-processing, no input-shape coercion).
  it("empty grist input forwards unchanged", () => {
    const input: MashPhEstimateInput = {
      volumeLiters: 25,
      alkalinityPpmCaCO3: 50,
      grist: [],
    };
    expect(mashPhEstimate(input)).toEqual(mashPhEstimateV1(input));
  });

  // Pinned: error paths surface identically (the wrapper doesn't catch
  // or wrap exceptions). A refactor that, e.g., wraps the call in a
  // try/catch and returns null would fail this.
  it("validation errors propagate identically (no wrapping)", () => {
    expect(() => mashPhEstimate({
      volumeLiters: NaN,
      alkalinityPpmCaCO3: 0,
      grist: [],
    })).toThrow(/Invalid volumeLiters/);
  });
});
