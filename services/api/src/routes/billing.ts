import type { FastifyInstance } from "fastify";
import type { BillingPurchaseIntentMode, BillingPurchaseProvider } from "@prisma/client";
import { BadRequestError } from "../errors.js";
import { requireUser } from "../plugins/requestContext.js";
import { BillingIntentsService } from "../services/billingIntentsService.js";
import { WorkspaceBillingService } from "../services/workspaceBillingService.js";

function assertWorkspaceId(v: unknown): string {
  const id = typeof v === "string" ? v.trim() : "";
  if (!id) throw new BadRequestError("invalid_workspace_id", "Params.workspaceId is required");
  return id;
}

function assertPlanCode(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) throw new BadRequestError("invalid_plan_code", "Body.planCode is required");
  return s;
}

function assertProvider(v: unknown): BillingPurchaseProvider {
  if (v === "stripe" || v === "apple" || v === "google") return v;
  throw new BadRequestError("invalid_provider", "Body.provider must be one of: stripe, apple, google");
}

function assertMode(v: unknown): BillingPurchaseIntentMode {
  if (v === "restore") return "restore";
  return "purchase";
}

export function billingRoutes(app: FastifyInstance) {
  const intents = new BillingIntentsService(app.prisma);
  const billing = new WorkspaceBillingService(app.prisma);

  app.post("/workspaces/:workspaceId/billing/intent", async (req) => {
    const ctx = requireUser(req);
    const params = (req.params ?? {}) as { workspaceId?: unknown };
    const workspaceId = assertWorkspaceId(params.workspaceId);
    const body = (req.body ?? {}) as { planCode?: unknown; provider?: unknown; mode?: unknown };

    const created = await intents.createIntent({
      userId: ctx.userId,
      workspaceId,
      planCode: assertPlanCode(body.planCode),
      provider: assertProvider(body.provider),
      mode: assertMode(body.mode),
    });

    return {
      ok: true,
      billingIntentId: created.id,
      workspaceId: created.workspaceId,
      planCode: created.planCode,
      provider: created.provider,
      mode: created.mode,
      expiresAt: created.expiresAt.toISOString(),
      clientReferenceId: created.id,
      // Optional: wire these when Stripe is configured.
      stripePricingTableId: process.env['STRIPE_PRICING_TABLE_ID'] ?? null,
      stripePublishableKey: process.env['STRIPE_PUBLISHABLE_KEY'] ?? null,
    };
  });

  app.get("/workspaces/:workspaceId/billing", async (req) => {
    const ctx = requireUser(req);
    const params = (req.params ?? {}) as { workspaceId?: unknown };
    const workspaceId = assertWorkspaceId(params.workspaceId);

    const summary = await billing.getWorkspaceBilling(ctx.userId, workspaceId);

    // Usage is optional; keep it cheap and stable. A “recipe” = one versionGroupId.
    const recipeGroups = await app.prisma.recipe.groupBy({
      by: ["versionGroupId"],
      where: { workspaceId },
    });

    return {
      ok: true,
      workspaceId: summary.workspaceId,
      tier: summary.tier,
      expiresAt: summary.expiresAt,
      limits: summary.limits,
      usage: {
        recipesCount: recipeGroups.length,
      },
    };
  });

  app.post("/workspaces/:workspaceId/billing/confirm", async (req) => {
    const ctx = requireUser(req);
    const params = (req.params ?? {}) as { workspaceId?: unknown };
    const workspaceId = assertWorkspaceId(params.workspaceId);
    const body = (req.body ?? {}) as { billingIntentId?: unknown };
    const billingIntentId = typeof body.billingIntentId === "string" ? body.billingIntentId.trim() : "";
    if (!billingIntentId) throw new BadRequestError("invalid_billing_intent_id", "Body.billingIntentId is required");

    const intent = await intents.resolveIntent(billingIntentId);
    if (intent.userId !== ctx.userId) {
      throw new BadRequestError("billing_intent_wrong_user", "Billing intent does not belong to this user");
    }
    if (intent.workspaceId !== workspaceId) {
      throw new BadRequestError("billing_intent_wrong_workspace", "Billing intent is not for this workspace");
    }

    await intents.fulfillIntent(billingIntentId, { stripeCheckoutSessionId: null, stripeSubscriptionId: null });
    await billing.bindUserToWorkspaceForBilling({ userId: ctx.userId, workspaceId, provider: intent.provider });

    return { ok: true };
  });
}

