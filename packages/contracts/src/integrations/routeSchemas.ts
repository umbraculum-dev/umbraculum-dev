/**
 * Platform integrations route contracts (OpenAPI integrations tag).
 */
import { z } from "zod";

const isoDateTime = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z.string());

export const IntegrationKindSchema = z.enum(["tilt", "ispindel", "rapt"]);

export const IntegrationWorkspaceIdParamsSchema = z.object({
  workspaceId: z.string().trim().min(1, "Params.workspaceId is required"),
});

export const IntegrationWorkspaceKindParamsSchema = z.object({
  workspaceId: z.string().trim().min(1, "Params.workspaceId is required"),
  kind: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    IntegrationKindSchema,
  ),
});

export const IntegrationTokenParamsSchema = z.object({
  token: z.string().trim().min(1, "Params.token is required"),
});

export const IntegrationSummarySchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  kind: IntegrationKindSchema,
  revokedAt: isoDateTime.nullable(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const IntegrationRevealResponseSchema = z.object({
  ok: z.literal(true),
  integrationId: z.string().min(1),
  kind: IntegrationKindSchema,
  token: z.string().min(1),
  publicPath: z.string().min(1),
});

export const IntegrationGetResponseSchema = z.object({
  ok: z.literal(true),
  integration: IntegrationSummarySchema.nullable(),
});

export const IntegrationCreateResponseSchema = z.object({
  ok: z.literal(true),
  integrationId: z.string().min(1),
  token: z.string().min(1),
  publicPath: z.string().min(1),
});

export const IntegrationOkResponseSchema = z.object({
  ok: z.literal(true),
});

/** Tilt webhook ingest — body keys vary by firmware; validate structure loosely. */
export const TiltIngestBodySchema = z.record(z.string(), z.unknown());

export const TiltIngestResponseSchema = z.object({
  ok: z.literal(true),
  integrationId: z.string().min(1),
  deviceId: z.string().min(1),
  readingId: z.string().min(1),
  brewSessionId: z.string().nullable(),
});

export const IntegrationDevicesQuerySchema = z.object({
  includeReadings: z
    .unknown()
    .optional()
    .transform((v) => v === true || v === "true" || v === "1"),
  readingsLimit: z
    .unknown()
    .optional()
    .transform((v) => {
      const raw = typeof v === "string" ? v.trim() : "";
      const n = raw ? Number.parseInt(raw, 10) : 20;
      if (!Number.isFinite(n) || Number.isNaN(n)) return 20;
      return Math.max(1, Math.min(200, n));
    }),
});

export const IntegrationDeviceReadingSchema = z.object({
  id: z.string().min(1),
  brewSessionId: z.string().nullable(),
  recordedAt: isoDateTime.nullable(),
  receivedAt: isoDateTime,
  temperatureC: z.number().nullable(),
  gravitySg: z.number().nullable(),
  rawJson: z.unknown().optional(),
});

export const IntegrationBrewSessionRefSchema = z.object({
  id: z.string().min(1),
  code: z.string().nullable(),
  status: z.string(),
  createdAt: isoDateTime,
  startedAt: isoDateTime.nullable(),
  recipe: z.object({
    id: z.string().min(1),
    name: z.string(),
    version: z.number().int(),
  }),
});

export const IntegrationDeviceAttachmentSchema = z.object({
  id: z.string().min(1),
  attachedAt: isoDateTime,
  brewSession: IntegrationBrewSessionRefSchema,
});

export const IntegrationDeviceSchema = z.object({
  id: z.string().min(1),
  deviceKey: z.string().min(1),
  displayName: z.string().nullable(),
  metadataJson: z.unknown().nullable(),
  lastSeenAt: isoDateTime.nullable(),
  createdAt: isoDateTime,
  activeAttachment: IntegrationDeviceAttachmentSchema.nullable(),
  lastReading: IntegrationDeviceReadingSchema.nullable(),
  recentReadings: z.array(IntegrationDeviceReadingSchema).nullable().optional(),
});

export const IntegrationDevicesListResponseSchema = z.object({
  ok: z.literal(true),
  devices: z.array(IntegrationDeviceSchema),
});

export const IntegrationDeviceIdParamsSchema = z.object({
  workspaceId: z.string().trim().min(1, "Params.workspaceId is required"),
  deviceId: z.string().trim().min(1, "Params.deviceId is required"),
});

export const IntegrationDeviceAttachRequestSchema = z.object({
  brewSessionId: z.string().trim().min(1, "Body.brewSessionId is required"),
});

export const IntegrationDeviceAttachResponseSchema = z.object({
  ok: z.literal(true),
  attachment: z.object({
    id: z.string().min(1),
    attachedAt: isoDateTime,
    brewSessionId: z.string().min(1),
  }),
});

export const IntegrationDeviceDetachResponseSchema = z.object({
  ok: z.literal(true),
  detachedCount: z.number().int().nonnegative(),
});

export const BrewSessionsRecentQuerySchema = z.object({
  limit: z
    .unknown()
    .optional()
    .transform((v) => {
      const raw = typeof v === "string" ? v.trim() : "";
      const n = raw ? Number.parseInt(raw, 10) : 20;
      if (!Number.isFinite(n) || Number.isNaN(n)) return 20;
      return Math.max(1, Math.min(100, n));
    }),
});

export const BrewSessionSummarySchema = z.object({
  id: z.string().min(1),
  recipeId: z.string().min(1),
  code: z.string().nullable(),
  status: z.string(),
  startedAt: isoDateTime.nullable(),
  pausedAt: isoDateTime.nullable(),
  stoppedAt: isoDateTime.nullable(),
  scheduledDate: isoDateTime.nullable(),
  createdAt: isoDateTime,
  recipe: z.object({
    id: z.string().min(1),
    name: z.string(),
    version: z.number().int(),
  }),
});

export const BrewSessionsRecentResponseSchema = z.object({
  ok: z.literal(true),
  brewSessions: z.array(BrewSessionSummarySchema),
});

export type IntegrationKind = z.infer<typeof IntegrationKindSchema>;
export type IntegrationRevealResponse = z.infer<typeof IntegrationRevealResponseSchema>;
