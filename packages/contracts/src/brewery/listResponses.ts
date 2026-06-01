/**
 * Brewery list API responses consumed by web and native clients.
 */
import { z } from "zod";

const RecipeListItemSchema = z.object({
  id: z.string(),
  accountId: z.string().optional(),
  name: z.string(),
  styleKey: z.string().optional(),
  style: z.string().nullable().optional(),
  version: z.number().optional(),
});

export type RecipeListItem = z.infer<typeof RecipeListItemSchema>;

export const RecipesListResponseSchema = z.object({
  ok: z.literal(true),
  recipes: z.array(RecipeListItemSchema),
});

export type RecipesListResponse = z.infer<typeof RecipesListResponseSchema>;

export function parseRecipesListResponse(payload: unknown): RecipesListResponse {
  return RecipesListResponseSchema.parse(payload);
}

const isoDateTime = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z.string());

const BrewSessionListItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  status: z.string(),
  createdAt: isoDateTime,
  startedAt: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string().nullable()).optional(),
  stoppedAt: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string().nullable()).optional(),
});

export type BrewSessionListItem = z.infer<typeof BrewSessionListItemSchema>;

export const BrewSessionsListResponseSchema = z.object({
  ok: z.literal(true),
  brewSessions: z.array(BrewSessionListItemSchema),
});

export type BrewSessionsListResponse = z.infer<typeof BrewSessionsListResponseSchema>;

export function parseBrewSessionsListResponse(payload: unknown): BrewSessionsListResponse {
  return BrewSessionsListResponseSchema.parse(payload);
}

export const BrewSessionPayloadSchema = z.record(z.string(), z.unknown());

export const BrewSessionStepSchema = z.record(z.string(), z.unknown());

export const BrewSessionDetailResponseSchema = z.object({
  ok: z.literal(true),
  brewSession: BrewSessionPayloadSchema,
});

export const BrewSessionCreateResponseSchema = z.object({
  ok: z.literal(true),
  brewSession: BrewSessionPayloadSchema,
  steps: z.array(BrewSessionStepSchema),
});

export const BrewSessionStepResponseSchema = z.object({
  ok: z.literal(true),
  step: BrewSessionStepSchema,
});

export const BrewSessionStepsResponseSchema = z.object({
  ok: z.literal(true),
  steps: z.array(BrewSessionStepSchema),
});

export const BrewSessionPatchRequestSchema = z.object({
  scheduledDate: z.string().nullable().optional(),
});

export const BrewSessionStepsPatchRequestSchema = z.object({
  steps: z.array(z.record(z.string(), z.unknown())),
});

export const BrewSessionStepTimerPatchRequestSchema = z.object({
  customTimerEnabled: z.boolean(),
});

export const BrewSessionStopRequestSchema = z.object({
  reason: z.enum(["auto", "manual"]).optional(),
});

export const BrewSessionStepLogRequestSchema = z.object({
  status: z.enum(["pending", "in_progress", "done", "skipped", "not_applicable"]),
  note: z.string().nullable().optional(),
  name: z.string().optional(),
  isDisabled: z.boolean().optional(),
});

export const IntegrationAttachmentDeviceSchema = z.record(z.string(), z.unknown());

export const IntegrationAttachmentSchema = z.object({
  id: z.string(),
  attachedAt: isoDateTime,
  device: IntegrationAttachmentDeviceSchema,
});

export const IntegrationAttachmentsResponseSchema = z.object({
  ok: z.literal(true),
  attachments: z.array(IntegrationAttachmentSchema),
});

export const IntegrationAttachRequestSchema = z.object({
  kind: z.enum(["tilt", "ispindel", "rapt"]),
  deviceId: z.string().min(1),
});

export const IntegrationAttachResponseSchema = z.object({
  ok: z.literal(true),
  attachment: z.record(z.string(), z.unknown()),
});

export const IntegrationDetachRequestSchema = z.object({
  deviceId: z.string().min(1),
});

export const IntegrationDetachResponseSchema = z.object({
  ok: z.literal(true),
  detachedCount: z.number(),
});

export const IntegrationReadingSchema = z.record(z.string(), z.unknown());

export const IntegrationReadingsResponseSchema = z.object({
  ok: z.literal(true),
  readings: z.array(IntegrationReadingSchema),
});

export function parseBrewSessionCreateResponse(payload: unknown): { brewSession: { id: string } } {
  const parsed = BrewSessionCreateResponseSchema.parse(payload);
  const brewSession = parsed.brewSession as { id?: string };
  return { brewSession: { id: typeof brewSession.id === "string" ? brewSession.id : "" } };
}
