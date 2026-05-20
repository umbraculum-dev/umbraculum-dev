import { z } from "zod";

/** ISO 8601 timestamp string validated at parse time. */
export const IsoDateTimeStringSchema = z
  .string()
  .min(1, "timestamp required")
  .refine((s) => !Number.isNaN(Date.parse(s)), "must be ISO 8601");
