import { BadRequestError } from "../../errors.js";

export function ensureFinite(n: unknown, field: string) {
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return n;
}

const ALLOWED_MASH_SALT_KEYS = new Set([
  "gypsum",
  "calcium_chloride",
  "epsom",
  "table_salt",
  "baking_soda",
]);

export function validateSaltAdditionsJson(value: unknown, field: string) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new BadRequestError("invalid_salt_additions", `Body.${field} must be an array`);
  }

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const saltKey = o['saltKey'];
    const grams = o['grams'];
    if (typeof saltKey !== "string" || !ALLOWED_MASH_SALT_KEYS.has(saltKey)) {
      throw new BadRequestError(
        "invalid_salt_key",
        `Body.${field}[${idx}].saltKey is invalid`,
      );
    }
    if (typeof grams !== "number" || !Number.isFinite(grams) || grams < 0) {
      throw new BadRequestError(
        "invalid_salt_grams",
        `Body.${field}[${idx}].grams must be a number >= 0`,
      );
    }
    return { saltKey, grams };
  });
}
