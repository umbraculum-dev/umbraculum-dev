import { z } from "zod";

import { IsoDateTimeStringSchema, NonEmptyStringSchema } from "./shared.js";

export const CapacityBucketSchema = z.object({
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

export const CapacityLoadQuerySchema = z
  .object({
    resourceId: z.string().min(1).optional(),
  })
  .strict();

export const CapacityLoadSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  buckets: z.array(CapacityBucketSchema),
});

export const CapacityLoadResponseSchema = z.object({
  ok: z.literal(true),
  item: CapacityLoadSchema,
});

export const CapacityLoadBucketSchema = CapacityBucketSchema;

export type CapacityBucket = z.infer<typeof CapacityBucketSchema>;
export type CapacityLoad = z.infer<typeof CapacityLoadSchema>;
export type CapacityLoadQuery = z.infer<typeof CapacityLoadQuerySchema>;
export type CapacityLoadResponse = z.infer<typeof CapacityLoadResponseSchema>;
export type CapacityLoadBucket = CapacityBucket;

export function parseCapacityBucket(payload: unknown): CapacityBucket {
  return CapacityBucketSchema.parse(payload);
}

export function parseCapacityLoad(payload: unknown): CapacityLoad {
  return CapacityLoadSchema.parse(payload);
}

export function parseCapacityLoadResponse(payload: unknown): CapacityLoadResponse {
  return CapacityLoadResponseSchema.parse(payload);
}

export const parseCapacityLoadBucket = parseCapacityBucket;
