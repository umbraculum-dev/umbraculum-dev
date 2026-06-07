import { z } from "zod";

/** ISO 8601 timestamp string validated at parse time. */
export const IsoDateTimeStringSchema = z
  .string()
  .min(1, "timestamp required")
  .refine((s) => !Number.isNaN(Date.parse(s)), "must be ISO 8601");

export const NonEmptyStringSchema = z.string().min(1);

export const QuantitySchema = z.number().finite().positive();

export const CrpDeleteResponseSchema = z.object({
  ok: z.literal(true),
});

export type CrpDeleteResponse = z.infer<typeof CrpDeleteResponseSchema>;

export function parseCrpDeleteResponse(payload: unknown): CrpDeleteResponse {
  return CrpDeleteResponseSchema.parse(payload);
}
