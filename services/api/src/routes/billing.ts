import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  BillingConfirmRequestSchema,
  BillingConfirmResponseSchema,
  BillingIntentRequestSchema,
  BillingIntentResponseSchema,
  BillingWorkspaceIdParamsSchema,
  ErrorResponseSchema,
  WorkspaceBillingResponseSchema,
} from "@umbraculum/contracts";

import { BadRequestError } from "../errors.js";
import { requireUser } from "../plugins/requestContext.js";
import { BillingIntentsService } from "../services/billingIntentsService.js";
import { WorkspaceBillingService } from "../services/workspaceBillingService.js";

export function billingRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const intents = new BillingIntentsService(app.prisma);
  const billing = new WorkspaceBillingService(app.prisma);

  zodApp.post(
    "/workspaces/:workspaceId/billing/intent",
    {
      schema: {
        tags: ["billing"],
        params: BillingWorkspaceIdParamsSchema,
        body: BillingIntentRequestSchema,
        response: {
          200: BillingIntentResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const { workspaceId } = req.params;
      const body = req.body;

      const created = await intents.createIntent({
        userId: ctx.userId,
        workspaceId,
        planCode: body.planCode,
        provider: body.provider,
        mode: body.mode ?? "purchase",
      });

      return BillingIntentResponseSchema.parse({
        ok: true,
        billingIntentId: created.id,
        workspaceId: created.workspaceId,
        planCode: created.planCode,
        provider: created.provider,
        mode: created.mode,
        expiresAt: created.expiresAt.toISOString(),
        clientReferenceId: created.id,
        stripePricingTableId: process.env["STRIPE_PRICING_TABLE_ID"] ?? null,
        stripePublishableKey: process.env["STRIPE_PUBLISHABLE_KEY"] ?? null,
      });
    },
  );

  zodApp.get(
    "/workspaces/:workspaceId/billing",
    {
      schema: {
        tags: ["billing"],
        params: BillingWorkspaceIdParamsSchema,
        response: {
          200: WorkspaceBillingResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const { workspaceId } = req.params;

      const summary = await billing.getWorkspaceBilling(ctx.userId, workspaceId);

      const recipeGroups = await app.prisma.recipe.groupBy({
        by: ["versionGroupId"],
        where: { workspaceId },
      });

      return WorkspaceBillingResponseSchema.parse({
        ok: true,
        workspaceId: summary.workspaceId,
        tier: summary.tier,
        expiresAt: summary.expiresAt,
        limits: summary.limits,
        usage: {
          recipesCount: recipeGroups.length,
        },
      });
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/billing/confirm",
    {
      schema: {
        tags: ["billing"],
        params: BillingWorkspaceIdParamsSchema,
        body: BillingConfirmRequestSchema,
        response: {
          200: BillingConfirmResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const { workspaceId } = req.params;
      const { billingIntentId } = req.body;

      const intent = await intents.resolveIntent(billingIntentId);
      if (intent.userId !== ctx.userId) {
        throw new BadRequestError("billing_intent_wrong_user", "Billing intent does not belong to this user");
      }
      if (intent.workspaceId !== workspaceId) {
        throw new BadRequestError("billing_intent_wrong_workspace", "Billing intent is not for this workspace");
      }

      await intents.fulfillIntent(billingIntentId, { stripeCheckoutSessionId: null, stripeSubscriptionId: null });
      await billing.bindUserToWorkspaceForBilling({ userId: ctx.userId, workspaceId, provider: intent.provider });

      return BillingConfirmResponseSchema.parse({ ok: true });
    },
  );
}
