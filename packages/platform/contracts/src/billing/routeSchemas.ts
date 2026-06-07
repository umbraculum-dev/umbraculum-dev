/**
 * Platform billing route contracts (OpenAPI billing tag).
 */
import { z } from "zod";

const isoDateTime = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z.string());

export const BillingWorkspaceIdParamsSchema = z.object({
  workspaceId: z.string().trim().min(1, "Params.workspaceId is required"),
});

export const BillingPurchaseProviderSchema = z.enum(["stripe", "apple", "google"]);

export const BillingPurchaseIntentModeSchema = z.enum(["purchase", "restore"]);

export const BillingIntentRequestSchema = z
  .object({
    planCode: z.string().trim().min(1, "Body.planCode is required"),
    provider: BillingPurchaseProviderSchema,
    mode: z
      .preprocess(
        (v) => (v === "restore" ? "restore" : v === "purchase" ? "purchase" : v),
        BillingPurchaseIntentModeSchema,
      )
      .optional(),
  })
  .strict();

export const BillingIntentResponseSchema = z.object({
  ok: z.literal(true),
  billingIntentId: z.string().min(1),
  workspaceId: z.string().min(1),
  planCode: z.string().min(1),
  provider: BillingPurchaseProviderSchema,
  mode: z.enum(["purchase", "restore"]),
  expiresAt: isoDateTime,
  clientReferenceId: z.string().min(1),
  stripePricingTableId: z.string().nullable(),
  stripePublishableKey: z.string().nullable(),
});

export const BillingTierSchema = z.enum(["free", "premium", "pro", "pro_plus"]);

export const TierLimitsSchema = z.object({
  aiEnabled: z.boolean(),
  maxRecipesPerWorkspace: z.number(),
  maxVersionsPerRecipe: z.number(),
  maxVessels: z.number(),
  maxAdaptersConnected: z.number(),
  automationAiToolsEnabled: z.boolean(),
});

export const WorkspaceBillingResponseSchema = z.object({
  ok: z.literal(true),
  workspaceId: z.string().min(1),
  tier: BillingTierSchema,
  expiresAt: isoDateTime.nullable(),
  limits: TierLimitsSchema,
  usage: z.object({
    recipesCount: z.number().int().nonnegative(),
  }),
});

export const BillingConfirmRequestSchema = z
  .object({
    billingIntentId: z.string().trim().min(1, "Body.billingIntentId is required"),
  })
  .strict();

export const BillingConfirmResponseSchema = z.object({
  ok: z.literal(true),
});

export type BillingIntentRequest = z.infer<typeof BillingIntentRequestSchema>;
export type BillingIntentResponse = z.infer<typeof BillingIntentResponseSchema>;
export type WorkspaceBillingResponse = z.infer<typeof WorkspaceBillingResponseSchema>;
export type BillingConfirmRequest = z.infer<typeof BillingConfirmRequestSchema>;
