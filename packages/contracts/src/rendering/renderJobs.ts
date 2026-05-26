import { z } from "zod";

export const RenderKindSchema = z.enum([
  "pdf",
  "xlsx",
  "csv",
  "docx",
  "odt",
  "html",
  "json",
  "xml",
  "barcode",
  "qr",
]);

export const RenderStatusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
]);

export const RenderVisibilitySchema = z.enum(["workspace", "public"]);

export const RenderDeliverySchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("stream-response") }).strict(),
  z
    .object({
      mode: z.literal("persist-to-media"),
      visibility: RenderVisibilitySchema,
    })
    .strict(),
  z
    .object({
      mode: z.literal("email"),
      to: z.array(z.string().email()).min(1, "email.to required"),
      subject: z.string().min(1, "email.subject required"),
    })
    .strict(),
]);

export const RenderErrorSchema = z
  .object({
    code: z.string().min(1, "error.code required"),
    message: z.string().min(1, "error.message required"),
  })
  .strict();

export const RenderJobSubmitRequestSchema = z
  .object({
    templateRef: z.string().min(1, "templateRef required"),
    kind: RenderKindSchema.optional(),
    data: z.unknown(),
    delivery: RenderDeliverySchema.optional(),
  })
  .strict();

export const RenderJobStatusSchema = z
  .object({
    id: z.string().min(1, "job.id required"),
    templateRef: z.string().min(1, "job.templateRef required"),
    kind: RenderKindSchema,
    status: RenderStatusSchema,
    deliveryMode: z.string().min(1, "job.deliveryMode required"),
    requestedAt: z.string().min(1, "job.requestedAt required"),
    startedAt: z.string().nullable(),
    completedAt: z.string().nullable(),
    artifactId: z.string().nullable(),
    mediaAssetId: z.string().nullable(),
    error: RenderErrorSchema.nullable(),
  })
  .strict();

export const RenderJobSubmitResponseSchema = z
  .object({
    ok: z.literal(true),
    mode: z.literal("async"),
    job: RenderJobStatusSchema,
  })
  .strict();

export const RenderJobStatusResponseSchema = z
  .object({
    ok: z.literal(true),
    job: RenderJobStatusSchema,
  })
  .strict();

export const RenderJobCancelResponseSchema = z
  .object({
    ok: z.literal(true),
    job: RenderJobStatusSchema,
  })
  .strict();

export const RenderJobResultResponseSchema = z
  .object({
    ok: z.literal(true),
    job: RenderJobStatusSchema,
    signedUrl: z.string().min(1, "signedUrl required"),
    expiresAt: z.string().min(1, "expiresAt required"),
  })
  .strict();

export const ErrorResponseSchema = z
  .object({
    ok: z.literal(false),
    error: RenderErrorSchema.extend({
      details: z.record(z.string(), z.unknown()).optional(),
    }).strict(),
  })
  .strict();

export type RenderKind = z.infer<typeof RenderKindSchema>;
export type RenderStatus = z.infer<typeof RenderStatusSchema>;
export type RenderVisibility = z.infer<typeof RenderVisibilitySchema>;
export type RenderDelivery = z.infer<typeof RenderDeliverySchema>;
export type RenderError = z.infer<typeof RenderErrorSchema>;
export type RenderJobSubmitRequest = z.infer<typeof RenderJobSubmitRequestSchema>;
export type RenderJobStatus = z.infer<typeof RenderJobStatusSchema>;
export type RenderJobSubmitResponse = z.infer<typeof RenderJobSubmitResponseSchema>;
export type RenderJobStatusResponse = z.infer<typeof RenderJobStatusResponseSchema>;
export type RenderJobCancelResponse = z.infer<typeof RenderJobCancelResponseSchema>;
export type RenderJobResultResponse = z.infer<typeof RenderJobResultResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export function parseRenderJobSubmitRequest(payload: unknown): RenderJobSubmitRequest {
  return RenderJobSubmitRequestSchema.parse(payload);
}

export function parseRenderJobStatusResponse(payload: unknown): RenderJobStatusResponse {
  return RenderJobStatusResponseSchema.parse(payload);
}
