import { mashPhEstimateV1, type MashPhEstimateV1Input, type MashPhEstimateV1Result } from "./mashPhEstimateV1.js";

/**
 * Canonical mash pH estimator.
 *
 * Implementation note:
 * - v1 is now the only supported estimator; callers should treat this as the stable entrypoint.
 * - The API route may still accept older input shapes and normalize them before calling this function.
 */
export type MashPhEstimateInput = MashPhEstimateV1Input;
export type MashPhEstimateResult = MashPhEstimateV1Result;

export function mashPhEstimate(input: MashPhEstimateInput): MashPhEstimateResult {
  return mashPhEstimateV1(input);
}

