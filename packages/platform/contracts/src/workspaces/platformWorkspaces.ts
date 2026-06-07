/**
 * Platform workspace route contracts (PR3 / OpenAPI platform tag).
 */
import { z } from "zod";

import { AuthMeResponseWorkspaceSchema } from "../auth/meResponse.js";

export const ContextMeResponseSchema = z.object({
  ok: z.literal(true),
  userId: z.string().min(1),
  activeWorkspaceId: z.string().nullable(),
  role: z.string().nullable(),
});

export const WorkspacesListResponseSchema = z.object({
  ok: z.literal(true),
  workspaces: z.array(AuthMeResponseWorkspaceSchema),
});

export const WorkspaceCreateRequestSchema = z.object({
  name: z.string().trim().min(1, "Body.name is required"),
});

const isoDateTime = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z.string());

export const WorkspaceRowSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  brandKey: z.string(),
  adsDisabled: z.boolean(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const WorkspaceCreateResponseSchema = z.object({
  ok: z.literal(true),
  workspace: WorkspaceRowSchema,
});

export const WorkspaceIdParamsSchema = z.object({
  id: z.string().min(1, "Params.id is required"),
});

export const WorkspaceBrandPatchRequestSchema = z.object({
  brandKey: z
    .unknown()
    .transform((v): "default" | "acme" | "forest" => {
      if (v === "default" || v === "acme" || v === "forest") return v;
      return "default";
    }),
});

export const WorkspaceBrandPatchResponseSchema = z.object({
  ok: z.literal(true),
  workspace: z.object({
    id: z.string().min(1),
    name: z.string(),
    brandKey: z.string(),
  }),
});

export const ActiveWorkspaceContextResponseSchema = z.object({
  ok: z.literal(true),
  activeWorkspaceId: z.string().min(1),
  role: z.string(),
});

export type WorkspaceCreateRequest = z.infer<typeof WorkspaceCreateRequestSchema>;
