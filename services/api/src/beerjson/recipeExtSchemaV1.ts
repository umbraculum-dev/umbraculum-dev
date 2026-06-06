import {
  recipeExtSchemaV1EquipmentProperties,
} from "./recipeExtSchemaV1EquipmentSection.js";
import {
  recipeExtSchemaV1InternalProperties,
  recipeExtSchemaV1YeastProperties,
} from "./recipeExtSchemaV1YeastSection.js";
import { recipeExtSchemaV1TargetProperties } from "./recipeExtSchemaV1TargetSection.js";

export const recipeExtSchemaV1 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://brewery-app.local/schemas/recipeExtJson.v1.json",
  type: "object",
  additionalProperties: false,
  properties: {
    version: { type: "number", enum: [1] },
    ...recipeExtSchemaV1TargetProperties,
    ...recipeExtSchemaV1EquipmentProperties,
    ...recipeExtSchemaV1YeastProperties,
    ...recipeExtSchemaV1InternalProperties,
  },
  required: ["version"],
} as const;
