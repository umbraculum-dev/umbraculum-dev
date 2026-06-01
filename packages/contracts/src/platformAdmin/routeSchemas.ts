/**
 * Platform-admin recipe route contracts (OpenAPI platform-admin tag).
 * BeerJSON bodies use z.unknown() — strict validation happens in import services.
 */
import { z } from "zod";

const isoDateTime = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z.string());

export const PlatformWorkspaceRowSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
});

export const PlatformWorkspacesListResponseSchema = z.object({
  ok: z.literal(true),
  workspaces: z.array(PlatformWorkspaceRowSchema),
});

export const PlatformRecipesListQuerySchema = z.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object") return raw;
    const r = raw as Record<string, unknown>;
    return { workspaceId: r["workspaceId"] ?? r["accountId"] };
  },
  z.object({
    workspaceId: z.string().trim().min(1, "Query.workspaceId is required"),
  }),
);

export const PlatformRecipeSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  version: z.number().int(),
  styleKey: z.string().nullable().optional(),
  style: z.unknown().nullable().optional(),
  createdAt: isoDateTime.optional(),
  updatedAt: isoDateTime.optional(),
});

export const PlatformRecipesListResponseSchema = z.object({
  ok: z.literal(true),
  recipes: z.array(z.unknown()),
});

export const PlatformRecipeIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Params.id is required"),
});

export const PlatformRecipeExportQuerySchema = PlatformRecipesListQuerySchema;

/** Loose BeerJSON export — edge validation in beerjson/strictExport. */
export const BeerJsonLooseSchema = z.unknown();

export const PlatformImportFormatSchema = z.enum(["beerjson", "beerxml"]);

const workspaceIdPreprocess = z.preprocess(
  (raw) => {
    if (raw === null || raw === undefined) return {};
    if (typeof raw !== "object") return raw;
    const r = raw as Record<string, unknown>;
    return { ...r, workspaceId: r["workspaceId"] ?? r["accountId"] };
  },
  z.object({
    format: PlatformImportFormatSchema,
    content: z.string().min(1, "Body.content is required"),
    workspaceId: z.string().trim().min(1, "Body.workspaceId is required"),
  }),
);

export const PlatformRecipeImportPreviewRequestSchema = workspaceIdPreprocess;

export const PlatformRecipeImportPreviewResponseSchema = z.object({
  ok: z.literal(true),
  format: PlatformImportFormatSchema,
  preview: z.object({
    name: z.string(),
    notes: z.string().nullable(),
    beerJsonRecipeJson: z.unknown(),
    warnings: z.array(z.string()),
  }),
  workspaceId: z.string().min(1),
});

export const PlatformRecipeImportRequestSchema = z.preprocess(
  (raw) => {
    if (raw === null || raw === undefined) return {};
    if (typeof raw !== "object") return raw;
    const r = raw as Record<string, unknown>;
    return { ...r, workspaceId: r["workspaceId"] ?? r["accountId"] };
  },
  z.object({
    format: PlatformImportFormatSchema,
    content: z.string().min(1, "Body.content is required"),
    styleKey: z.string().optional(),
    workspaceId: z.string().trim().min(1, "Body.workspaceId is required"),
    recipeExtJson: z.unknown().optional(),
  }),
);

export const PlatformRecipeImportResponseSchema = z.object({
  ok: z.literal(true),
  recipe: z.unknown(),
  warnings: z.array(z.string()),
});

export const PlatformRecipeBulkImportPreviewRequestSchema = workspaceIdPreprocess;

export const PlatformRecipeBulkImportPreviewItemSchema = z.object({
  index: z.number().int(),
  name: z.string(),
  notes: z.string().nullable(),
  resolvedStyleKey: z.string(),
  resolvedStyleName: z.string().nullable(),
  resolvedStyleCode: z.string().nullable(),
  warnings: z.array(z.string()),
});

export const PlatformRecipeBulkImportPreviewResponseSchema = z.object({
  ok: z.literal(true),
  format: PlatformImportFormatSchema,
  previewItems: z.array(PlatformRecipeBulkImportPreviewItemSchema),
  workspaceId: z.string().min(1),
});

export const PlatformRecipeBulkImportRequestSchema = workspaceIdPreprocess;

export const PlatformRecipeBulkImportResponseSchema = z.object({
  ok: z.literal(true),
  created: z.array(
    z.object({
      index: z.number().int(),
      recipeId: z.string().min(1),
      name: z.string(),
      styleKey: z.string(),
      style: z.unknown().nullable(),
      warnings: z.array(z.string()),
    }),
  ),
  failed: z.array(
    z.object({
      index: z.number().int(),
      name: z.string(),
      error: z.string(),
    }),
  ),
});

export const PlatformAdminOkResponseSchema = z.object({
  ok: z.literal(true),
});
