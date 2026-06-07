/**
 * Water route Zod schemas (brewery OpenAPI tag).
 * Complex nested shapes reuse L1 parse helpers where available.
 */
import { z } from "zod";

import { OkResponseSchema } from "../brewery/routeSchemas.js";
import {
  parseBoilComputeAndSaveResponse,
  parseMashComputeAndSaveResponse,
  parseSpargeComputeAndSaveResponse,
} from "./parseComputeAndSave.js";
import { parseRecipeWaterHubSummaryResponse } from "./parseHubSummary.js";
import { parseWaterProfileItem, parseWaterProfilesResponse } from "./waterProfile.js";

export { OkResponseSchema };

const recordBody = z.record(z.string(), z.unknown());
const recordResult = z.record(z.string(), z.unknown());

export const RecipeWaterHubSummaryResponseSchema = z.custom<ReturnType<typeof parseRecipeWaterHubSummaryResponse>>(
  (data) => {
    try {
      parseRecipeWaterHubSummaryResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid recipe water hub summary response" },
);

export const WaterProfilesListResponseSchema = z.custom<ReturnType<typeof parseWaterProfilesResponse>>(
  (data) => {
    try {
      parseWaterProfilesResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid water profiles list response" },
);

export const WaterProfileItemSchema = z.custom<ReturnType<typeof parseWaterProfileItem>>(
  (data) => {
    try {
      parseWaterProfileItem(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid water profile" },
);

export const WaterProfileResponseSchema = z.object({
  ok: z.literal(true),
  profile: WaterProfileItemSchema,
});

const ionField = z.union([z.number(), z.string(), z.null()]).optional();

export const WaterProfileCreateRequestSchema = z.object({
  scope: z.enum(["system", "account", "public"]).optional(),
  type: z.enum(["water", "dilution"]).optional(),
  name: z.string().optional(),
  ph: ionField,
  calcium: ionField,
  magnesium: ionField,
  sodium: ionField,
  sulfate: ionField,
  chloride: ionField,
  bicarbonate: ionField,
});

export const WaterProfilePatchRequestSchema = WaterProfileCreateRequestSchema.extend({
  verificationStatus: z.enum(["verified", "unverified"]).optional(),
});

export const RecipeWaterSettingsPayloadSchema = z.record(z.string(), z.unknown());

export const RecipeWaterSettingsGetResponseSchema = z.object({
  ok: z.literal(true),
  settings: RecipeWaterSettingsPayloadSchema.nullable(),
});

export const RecipeWaterSettingsPutRequestSchema = z.record(z.string(), z.unknown());

export const RecipeWaterSettingsPutResponseSchema = z.object({
  ok: z.literal(true),
  settings: RecipeWaterSettingsPayloadSchema,
});

const emptyObjectBody = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((raw) => (raw === null || raw === undefined ? {} : raw), schema);

export const MashComputeAndSaveRequestSchema = emptyObjectBody(z.record(z.string(), z.unknown()));

export const MashComputeAndSaveResponseSchema = z.custom<ReturnType<typeof parseMashComputeAndSaveResponse>>(
  (data) => {
    try {
      parseMashComputeAndSaveResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid mash compute-and-save response" },
);

export const SpargeComputeAndSaveRequestSchema = emptyObjectBody(z.record(z.string(), z.unknown()));

export const SpargeComputeAndSaveResponseSchema = z.custom<ReturnType<typeof parseSpargeComputeAndSaveResponse>>(
  (data) => {
    try {
      parseSpargeComputeAndSaveResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid sparge compute-and-save response" },
);

export const BoilComputeAndSaveRequestSchema = emptyObjectBody(z.record(z.string(), z.unknown()));

export const BoilComputeAndSaveResponseSchema = z.custom<ReturnType<typeof parseBoilComputeAndSaveResponse>>(
  (data) => {
    try {
      parseBoilComputeAndSaveResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid boil compute-and-save response" },
);

export const WaterCalcRequestSchema = recordBody;

export const WaterCalcWithDerivationResponseSchema = z.object({
  ok: z.literal(true),
  result: recordResult,
  derivation: recordResult,
});

export const WaterCalcResultOnlyResponseSchema = z.object({
  ok: z.literal(true),
  result: recordResult,
});
