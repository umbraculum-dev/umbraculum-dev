import { z } from "zod";

/** ISO 8601 timestamp string validated at parse time. */
export const IsoDateTimeStringSchema = z
  .string()
  .min(1, "timestamp required")
  .refine((s) => !Number.isNaN(Date.parse(s)), "must be ISO 8601");

export const NonEmptyStringSchema = z.string().min(1);

export const QuantitySchema = z.number().finite().positive();

export const UnitCodeSchema = z.string().min(1, "unit required");

export const MrpDeleteResponseSchema = z.object({
  ok: z.literal(true),
});

export type MrpDeleteResponse = z.infer<typeof MrpDeleteResponseSchema>;

export function parseMrpDeleteResponse(payload: unknown): MrpDeleteResponse {
  return MrpDeleteResponseSchema.parse(payload);
}
