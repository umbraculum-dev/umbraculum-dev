import { BadRequestError } from "../../../../errors.js";
import { applySaltAdditions } from "../../../../domain/waterCalc/saltAdditions.js";
import { buildSaltAdditionsDerivation } from "../../../../domain/waterCalc/derivation/saltAdditionsDerivation.js";
import {
  parseBaseProfile,
  parseSaltAdditions,
  waterCalcWithDerivationResponse,
} from "./waterCalcHelpers.js";

export function saltAdditions(body: Record<string, unknown>) {
  const volumeLiters = typeof body["volumeLiters"] === "number" ? body["volumeLiters"] : NaN;
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
  }

  const baseProfile = parseBaseProfile(body);
  const additions = parseSaltAdditions(body);

  const result = applySaltAdditions(baseProfile, volumeLiters, additions);
  return waterCalcWithDerivationResponse(
    result,
    buildSaltAdditionsDerivation({ volumeLiters, baseProfile, result }),
  );
}
