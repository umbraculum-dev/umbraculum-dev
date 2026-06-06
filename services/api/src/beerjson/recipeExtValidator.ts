import Ajv, { type ValidateFunction, type SchemaObject } from "ajv";
import { BadRequestError } from "../errors.js";
import { recipeExtSchemaV1 } from "./recipeExtSchemaV1.js";

let validateRecipeExtCached: ValidateFunction | null = null;

export function validateRecipeExtJson(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (!validateRecipeExtCached) {
    const ajv = new Ajv({
      allErrors: true,
      strict: true,
      strictSchema: true,
      validateSchema: true,
    });
    validateRecipeExtCached = ajv.compile(recipeExtSchemaV1 as SchemaObject);
  }

  const ok = validateRecipeExtCached(value);
  if (ok) return value;

  const msg = (validateRecipeExtCached.errors ?? [])
    .map((e) => `${e.instancePath || "(root)"} ${e.message ?? "is invalid"}`)
    .join("; ");
  throw new BadRequestError("invalid_recipe_ext_json", msg || "Body.recipeExtJson is invalid");
}
