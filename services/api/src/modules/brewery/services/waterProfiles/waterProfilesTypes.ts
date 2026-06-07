import { BadRequestError } from "../../../../errors.js";

export const SCOPE_VALUES = ["system", "account", "public"] as const;
export type WaterProfileScope = (typeof SCOPE_VALUES)[number];

export const TYPE_VALUES = ["water", "dilution"] as const;
export type WaterProfileType = (typeof TYPE_VALUES)[number];

export const VERIFICATION_STATUS_VALUES = ["unverified", "verified"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS_VALUES)[number];

/**
 * Numeric and enum fields are typed as `unknown`/`string | undefined` because
 * they cross the trust boundary directly from request bodies; the service
 * validates each one (`toNumber`, `toScope`, …) at the entry point. Promoting
 * them to their narrow types would force routes to either re-introduce `as
 * any` casts or duplicate the same coercion logic. See also
 * `equipmentProfilesService.ts` for the matching pattern.
 */
export type CreateWaterProfileInput = {
  scope?: string | undefined;
  type?: string | undefined;
  name: string;
  ph?: unknown;
  calcium?: unknown;
  magnesium?: unknown;
  sodium?: unknown;
  sulfate?: unknown;
  chloride?: unknown;
  bicarbonate?: unknown;
};

export type UpdateWaterProfileInput = {
  scope?: string | undefined;
  type?: string | undefined;
  name?: string | undefined;
  ph?: unknown;
  calcium?: unknown;
  magnesium?: unknown;
  sodium?: unknown;
  sulfate?: unknown;
  chloride?: unknown;
  bicarbonate?: unknown;
  verificationStatus?: string | undefined;
};

export function isAdminRole(role: string) {
  return role === "brewery_admin";
}

export function toNumber(val: unknown, field: string) {
  if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return val;
}

export function toOptionalPh(val: unknown) {
  if (val === undefined) return undefined;
  if (val === null) return null;
  const n = toNumber(val, "ph");
  if (n < 0 || n > 14) {
    throw new BadRequestError("invalid_ph", "Body.ph must be between 0 and 14");
  }
  return n;
}

export function toScope(val: unknown): WaterProfileScope | undefined {
  if (val === undefined) return undefined;
  if (typeof val === "string" && (SCOPE_VALUES as readonly string[]).includes(val)) {
    return val as WaterProfileScope;
  }
  throw new BadRequestError("invalid_scope", `Body.scope must be one of ${SCOPE_VALUES.join(", ")}`);
}

export function toType(val: unknown): WaterProfileType | undefined {
  if (val === undefined) return undefined;
  if (typeof val === "string" && (TYPE_VALUES as readonly string[]).includes(val)) {
    return val as WaterProfileType;
  }
  throw new BadRequestError("invalid_type", `Body.type must be one of ${TYPE_VALUES.join(", ")}`);
}

export function toVerificationStatus(val: unknown): VerificationStatus | undefined {
  if (val === undefined) return undefined;
  if (typeof val === "string" && (VERIFICATION_STATUS_VALUES as readonly string[]).includes(val)) {
    return val as VerificationStatus;
  }
  throw new BadRequestError(
    "invalid_verification_status",
    `Body.verificationStatus must be one of ${VERIFICATION_STATUS_VALUES.join(", ")}`,
  );
}
