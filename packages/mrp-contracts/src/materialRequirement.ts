import { z } from "zod";

import { NonEmptyStringSchema, QuantitySchema, UnitCodeSchema } from "./shared.js";

export const MaterialRequirementStatusSchema = z.enum([
  "planned",
  "available_assumed",
  "shortage_assumed",
  "reserved",
]);

export const MaterialRequirementSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  bomLineId: z.string().min(1).nullable(),
  materialRefModule: z.string().min(1).nullable(),
  materialRefId: z.string().min(1).nullable(),
  description: NonEmptyStringSchema,
  requiredQuantity: QuantitySchema,
  unit: UnitCodeSchema,
  availabilityStatus: MaterialRequirementStatusSchema,
  availabilityNote: z.string().min(1).nullable(),
});

export const MaterialRequirementListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(MaterialRequirementSchema),
});

export type MaterialRequirementStatus = z.infer<typeof MaterialRequirementStatusSchema>;
export type MaterialRequirement = z.infer<typeof MaterialRequirementSchema>;
export type MaterialRequirementListResponse = z.infer<
  typeof MaterialRequirementListResponseSchema
>;

export function parseMaterialRequirement(payload: unknown): MaterialRequirement {
  return MaterialRequirementSchema.parse(payload);
}

export function parseMaterialRequirementListResponse(
  payload: unknown,
): MaterialRequirementListResponse {
  return MaterialRequirementListResponseSchema.parse(payload);
}
