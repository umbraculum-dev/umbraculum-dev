import { z } from "zod";

import { IsoDateTimeStringSchema } from "./shared.js";

export const AttributeSetSchema = z.object({
  id: z.string().min(1, "id required"),
  workspaceId: z.string().min(1, "workspaceId required"),
  code: z.string().min(1, "code required"),
  label: z.string().min(1, "label required"),
  attributeIds: z.array(z.string().min(1)),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
});

export const AttributeSetRefSchema = z.object({
  attributeSetId: z.string().min(1, "attributeSetId required"),
});

export const AttributeSetListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(AttributeSetSchema),
});

export const AttributeSetGetResponseSchema = z.object({
  ok: z.literal(true),
  item: AttributeSetSchema,
});

export type AttributeSet = z.infer<typeof AttributeSetSchema>;
export type AttributeSetRef = z.infer<typeof AttributeSetRefSchema>;
export type AttributeSetListResponse = z.infer<typeof AttributeSetListResponseSchema>;
export type AttributeSetGetResponse = z.infer<typeof AttributeSetGetResponseSchema>;
