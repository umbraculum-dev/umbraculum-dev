import { z } from "zod";

import { IsoDateTimeStringSchema, NonEmptyStringSchema } from "./shared.js";

export const CapacityLoadBucketSchema = z.object({
  resourceId: NonEmptyStringSchema,
  resourceCode: NonEmptyStringSchema,
  bucketStartAt: IsoDateTimeStringSchema,
  bucketEndAt: IsoDateTimeStringSchema,
  availableMinutes: z.number().int().nonnegative(),
  plannedMinutes: z.number().int().nonnegative(),
  overloadMinutes: z.number().int().nonnegative(),
}).superRefine((value, ctx) => {
  if (Date.parse(value.bucketEndAt) <= Date.parse(value.bucketStartAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["bucketEndAt"],
      message: "bucketEndAt must be after bucketStartAt",
    });
  }
});

export const CapacityLoadResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(CapacityLoadBucketSchema),
});

export type CapacityLoadBucket = z.infer<typeof CapacityLoadBucketSchema>;
export type CapacityLoadResponse = z.infer<typeof CapacityLoadResponseSchema>;

export function parseCapacityLoadBucket(payload: unknown): CapacityLoadBucket {
  return CapacityLoadBucketSchema.parse(payload);
}

export function parseCapacityLoadResponse(payload: unknown): CapacityLoadResponse {
  return CapacityLoadResponseSchema.parse(payload);
}
