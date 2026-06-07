/**
 * Workspace AI settings — wire shape for `GET/PUT /workspaces/:id/ai/settings`.
 *
 * Security invariant: the encrypted provider key MUST never be returned
 * to clients. The DTO exposes only `hasKey: boolean`.
 */
import { z } from "zod";

export const AiProviderSchema = z.enum(["anthropic", "openai"]);

export const AiRoleLimitsSchema = z.record(z.string(), z.number().nonnegative());

export const WorkspaceAiSettingsSchema = z.object({
  workspaceId: z.string().min(1),
  provider: AiProviderSchema,
  hasKey: z.boolean(),
  enabled: z.boolean(),
  roleLimits: AiRoleLimitsSchema,
  perUserDailyCap: z.number().int().nonnegative(),
  dataEgressAccepted: z.boolean(),
  dataEgressAcceptedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UpdateWorkspaceAiSettingsRequestSchema = z
  .object({
    provider: AiProviderSchema.optional(),
    apiKey: z.string().optional(),
    enabled: z.boolean().optional(),
    roleLimits: AiRoleLimitsSchema.optional(),
    perUserDailyCap: z.number().int().nonnegative().optional(),
    dataEgressAccepted: z.boolean().optional(),
  })
  .strict();

export const WorkspaceAiSettingsResponseSchema = z.object({
  ok: z.literal(true),
  settings: WorkspaceAiSettingsSchema,
});

export const WorkspaceAiSettingsParamsSchema = z.object({
  workspaceId: z.string().trim().min(1, "Params.workspaceId is required"),
});

export type AiProvider = z.infer<typeof AiProviderSchema>;
export type AiRoleLimits = z.infer<typeof AiRoleLimitsSchema>;
export type WorkspaceAiSettings = z.infer<typeof WorkspaceAiSettingsSchema>;
export type UpdateWorkspaceAiSettingsRequest = z.infer<typeof UpdateWorkspaceAiSettingsRequestSchema>;
