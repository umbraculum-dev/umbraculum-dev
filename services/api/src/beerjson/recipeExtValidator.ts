import Ajv, { type ValidateFunction } from "ajv";
import { BadRequestError } from "../errors.js";

let validateRecipeExtCached: ValidateFunction | null = null;

const recipeExtSchemaV1 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://brewery-app.local/schemas/recipeExtJson.v1.json",
  type: "object",
  additionalProperties: false,
  properties: {
    version: { type: "number", enum: [1] },
    /**
     * Best-effort links from UI row IDs -> canonical Ingredient IDs.
     * We keep these separate from BeerJSON so the canonical export stays clean.
     */
    ingredientLinks: {
      type: "object",
      additionalProperties: false,
      properties: {
        grist: { type: "object", additionalProperties: { type: "string" } },
        hops: { type: "object", additionalProperties: { type: "string" } },
        yeast: { type: "object", additionalProperties: { type: "string" } },
        misc: { type: "object", additionalProperties: { type: "string" } },
      },
    },
    /**
     * Internal-only mash pH model parameters, keyed by fermentable row ID.
     * (BeerJSON does not have a place for these today.)
     */
    mashPhModel: {
      type: "object",
      additionalProperties: {
        type: "object",
        additionalProperties: false,
        properties: {
          mashDiPh: { type: "number" },
          mashTaToPh57_mEqPerKg: { type: "number" },
          roastDehuskedOverride: { type: ["boolean", "null"] },
        },
      },
    },
  },
  required: ["version"],
} as const;

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
    validateRecipeExtCached = ajv.compile(recipeExtSchemaV1 as any);
  }

  const ok = validateRecipeExtCached(value);
  if (ok) return value;

  const msg = (validateRecipeExtCached.errors ?? [])
    .map((e) => `${e.instancePath || "(root)"} ${e.message ?? "is invalid"}`)
    .join("; ");
  throw new BadRequestError("invalid_recipe_ext_json", msg || "Body.recipeExtJson is invalid");
}

