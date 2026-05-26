import { z } from "zod";

import { IsoDateTimeStringSchema, NonEmptyStringSchema } from "./shared.js";

export const ResourceKindSchema = z.enum([
  "work_center",
  "equipment",
  "labor",
  "external",
  "buffer",
]);

export const ResourceStatusSchema = z.enum(["active", "inactive"]);

export const ResourceSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  kind: ResourceKindSchema,
  status: ResourceStatusSchema,
  sourceModule: z.string().min(1).nullable(),
  sourceRefId: z.string().min(1).nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
});

export const ResourceRefSchema = z.object({
  resourceId: NonEmptyStringSchema,
});

export const ResourceListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(ResourceSchema),
});

export const ResourceGetResponseSchema = z.object({
  ok: z.literal(true),
  item: ResourceSchema,
});

export type ResourceKind = z.infer<typeof ResourceKindSchema>;
export type ResourceStatus = z.infer<typeof ResourceStatusSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceRef = z.infer<typeof ResourceRefSchema>;
export type ResourceListResponse = z.infer<typeof ResourceListResponseSchema>;
export type ResourceGetResponse = z.infer<typeof ResourceGetResponseSchema>;

export const CapacityResourceSchema = ResourceSchema;
export const CapacityResourceRefSchema = ResourceRefSchema;
export const CapacityResourceListResponseSchema = ResourceListResponseSchema;
export const CapacityResourceGetResponseSchema = ResourceGetResponseSchema;

export type CapacityResource = Resource;
export type CapacityResourceRef = ResourceRef;
export type CapacityResourceListResponse = ResourceListResponse;
export type CapacityResourceGetResponse = ResourceGetResponse;

export function parseResource(payload: unknown): Resource {
  return ResourceSchema.parse(payload);
}

export function parseResourceListResponse(
  payload: unknown,
): ResourceListResponse {
  return ResourceListResponseSchema.parse(payload);
}

export function parseResourceGetResponse(
  payload: unknown,
): ResourceGetResponse {
  return ResourceGetResponseSchema.parse(payload);
}

export const parseCapacityResource = parseResource;
export const parseCapacityResourceListResponse = parseResourceListResponse;
export const parseCapacityResourceGetResponse = parseResourceGetResponse;
