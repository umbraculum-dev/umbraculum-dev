import { z } from "zod";

import { IsoDateTimeStringSchema } from "./shared.js";

export const AttributeTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "date",
  "select",
  "multiselect",
  "media_ref",
  "reference",
]);

export const AttributeSchema = z.object({
  id: z.string().min(1, "id required"),
  workspaceId: z.string().min(1, "workspaceId required"),
  code: z.string().min(1, "code required"),
  type: AttributeTypeSchema,
  label: z.string().min(1, "label required"),
  required: z.boolean(),
  defaultValue: z.unknown().nullable(),
  selectOptions: z.array(z.string().min(1)).nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
});

export const AttributeValueSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("string"), value: z.string() }),
  z.object({ type: z.literal("number"), value: z.number().finite() }),
  z.object({ type: z.literal("boolean"), value: z.boolean() }),
  z.object({
    type: z.literal("date"),
    value: z
      .string()
      .min(1)
      .refine((s) => !Number.isNaN(Date.parse(s)), "date value must be ISO 8601"),
  }),
  z.object({ type: z.literal("select"), value: z.string().min(1) }),
  z.object({ type: z.literal("multiselect"), value: z.array(z.string().min(1)) }),
  z.object({ type: z.literal("media_ref"), value: z.string().min(1) }),
  z.object({ type: z.literal("reference"), value: z.string().min(1) }),
]);

export const AttributeCreateRequestSchema = z
  .object({
    code: z.string().min(1, "code required"),
    type: AttributeTypeSchema,
    label: z.string().min(1, "label required"),
    required: z.boolean().optional(),
    defaultValue: z.unknown().nullable().optional(),
    selectOptions: z.array(z.string().min(1)).nullable().optional(),
  })
  .strict();

export const AttributeUpdateRequestSchema = z
  .object({
    code: z.string().min(1, "code required").optional(),
    type: AttributeTypeSchema.optional(),
    label: z.string().min(1, "label required").optional(),
    required: z.boolean().optional(),
    defaultValue: z.unknown().nullable().optional(),
    selectOptions: z.array(z.string().min(1)).nullable().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.values(value).every((v) => v === undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "at least one field required",
      });
    }
  });

export const AttributeListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(AttributeSchema),
});

export const AttributeGetResponseSchema = z.object({
  ok: z.literal(true),
  item: AttributeSchema,
});

export type AttributeType = z.infer<typeof AttributeTypeSchema>;
export type Attribute = z.infer<typeof AttributeSchema>;
export type AttributeValue = z.infer<typeof AttributeValueSchema>;
export type AttributeCreateRequest = z.infer<typeof AttributeCreateRequestSchema>;
export type AttributeUpdateRequest = z.infer<typeof AttributeUpdateRequestSchema>;
export type AttributeListResponse = z.infer<typeof AttributeListResponseSchema>;
export type AttributeGetResponse = z.infer<typeof AttributeGetResponseSchema>;
