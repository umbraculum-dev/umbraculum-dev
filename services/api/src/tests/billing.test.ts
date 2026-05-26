import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

/**
 * Build a Stripe-formatted `Stripe-Signature` header for a given payload.
 *
 * Mirrors `verifyStripeSignature` in `services/api/src/routes/webhooksStripe.ts`:
 * the signed payload is `${t}.${rawBody}`, HMAC-SHA256 with the webhook secret,
 * and the v1 component is the lowercase hex digest. The CI env in `api.yml`
 * sets `STRIPE_WEBHOOK_SECRET=ci-only-not-real`, which makes the handler run
 * in strict mode — that's what we want to exercise here.
 */
function buildStripeSignature(rawBody: string, secret: string): string {
  const t = Math.floor(Date.now() / 1000);
  const signedPayload = `${t}.${rawBody}`;
  const v1 = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return `t=${t},v1=${v1}`;
}

describe("billing (intents + webhooks + enforcement)", () => {
  const app = buildApp();

  let cookie = "";
  let userId = "";
  let workspaceId = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { role: "brewery_admin", activeWorkspace: true });
    cookie = sess.cookie;
    userId = sess.userId;
    workspaceId = sess.workspaceId;
  });

  afterAll(async () => {
    // Cleanup (best-effort).
    await app.prisma.billingEvent.deleteMany({ where: { OR: [{ userId }, { workspaceId }] } }).catch(() => {});
    await app.prisma.billingPurchaseIntent.deleteMany({ where: { OR: [{ userId }, { workspaceId }] } }).catch(() => {});
    await app.prisma.billingUserWorkspaceBinding.deleteMany({ where: { userId } }).catch(() => {});
    await app.prisma.workspaceBilling.deleteMany({ where: { workspaceId } }).catch(() => {});
    await app.prisma.recipeWaterSettings.deleteMany({ where: { workspaceId } }).catch(() => {});
    await app.prisma.recipe.deleteMany({ where: { workspaceId } }).catch(() => {});
    await app.close();
  });

  it("POST /workspaces/:workspaceId/billing/intent creates an intent", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/billing/intent`,
      headers: { cookie },
      payload: { planCode: "pro", provider: "stripe", mode: "purchase" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.billingIntentId).toBe("string");
    expect(body.workspaceId).toBe(workspaceId);
    expect(body.planCode).toBe("pro");
    expect(body.provider).toBe("stripe");
    expect(body.clientReferenceId).toBe(body.billingIntentId);
  });

  it("Stripe webhook (strict mode with valid signature) fulfills intent + creates binding", async () => {
    const intentRes = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/billing/intent`,
      headers: { cookie },
      payload: { planCode: "pro_plus", provider: "stripe", mode: "purchase" },
    });
    expect(intentRes.statusCode).toBe(200);
    const intentBody = intentRes.json();
    const billingIntentId = intentBody.billingIntentId as string;

    // Send the payload as an explicit JSON string so we know the exact bytes
    // that will be signed and stored on `req.rawBody` by webhookRawBodyPlugin.
    // Falling back to "ci-only-not-real" mirrors api.yml's CI env so that the
    // test passes both locally (when the env var is unset) and on CI.
    const stripeSecret = process.env['STRIPE_WEBHOOK_SECRET']?.trim() || "ci-only-not-real";
    const rawBody = JSON.stringify({
      id: `evt_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: `cs_${Date.now()}`,
          client_reference_id: billingIntentId,
          subscription: "sub_test_123",
          customer: "cus_test_123",
        },
      },
    });
    const signature = buildStripeSignature(rawBody, stripeSecret);

    const webhookRes = await app.inject({
      method: "POST",
      url: "/webhooks/stripe",
      headers: {
        "content-type": "application/json",
        "stripe-signature": signature,
      },
      payload: rawBody,
    });
    expect(webhookRes.statusCode).toBe(200);
    expect(webhookRes.json()).toEqual({ ok: true });

    const intent = await app.prisma.billingPurchaseIntent.findUnique({ where: { id: billingIntentId } });
    expect(intent?.status).toBe("fulfilled");

    const binding = await app.prisma.billingUserWorkspaceBinding.findUnique({ where: { userId } });
    expect(binding?.workspaceId).toBe(workspaceId);
  });

  it("RevenueCat webhook applies tier to bound workspace", async () => {
    // Ensure binding exists (simulate a prior purchase/confirm).
    await app.prisma.billingUserWorkspaceBinding.upsert({
      where: { userId },
      create: { userId, workspaceId, provider: "apple" },
      update: { workspaceId, provider: "apple" },
    });

    const res = await app.inject({
      method: "POST",
      url: "/webhooks/revenuecat",
      payload: {
        id: `rc_${Date.now()}`,
        app_user_id: userId,
        entitlements: {
          tier_pro_plus: { is_active: true },
        },
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });

    const billing = await app.inject({
      method: "GET",
      url: `/workspaces/${workspaceId}/billing`,
      headers: { cookie },
    });
    expect(billing.statusCode).toBe(200);
    const body = billing.json();
    expect(body.ok).toBe(true);
    expect(body.tier).toBe("pro_plus");
  });

  it("Free tier enforces recipe limit (max 5 per workspace)", async () => {
    // Ensure workspace billing is absent or free.
    await app.prisma.workspaceBilling.deleteMany({ where: { workspaceId } });

    const beerJsonRecipeJson = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Test Recipe",
            type: "all grain",
            author: "brewery-app",
            efficiency: { brewhouse: { unit: "%", value: 75 } },
            batch_size: { unit: "l", value: 20 },
            ingredients: {
              fermentable_additions: [
                {
                  id: "row-1",
                  name: "Pale malt",
                  type: "grain",
                  yield: { potential: { unit: "sg", value: 1.037 } },
                  color: { unit: "Lovi", value: 2.0 },
                  amount: { unit: "kg", value: 4.5 },
                },
              ],
              hop_additions: [],
              culture_additions: [],
              miscellaneous_additions: [],
            },
          },
        ],
      },
    };

    for (let i = 0; i < 5; i++) {
      const create = await app.inject({
        method: "POST",
        url: "/recipes",
        headers: { cookie },
        payload: { name: `R${i}`, styleKey: "custom", beerJsonRecipeJson },
      });
      expect(create.statusCode).toBe(200);
    }

    const create6 = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie },
      payload: { name: "R5", styleKey: "custom", beerJsonRecipeJson },
    });
    expect(create6.statusCode).toBe(403);
    expect((create6.json()).error?.code).toBe("plan_limit_recipes");
  });

  it("Free tier enforces version limit (max 2 versions per recipe)", async () => {
    // Ensure workspace billing is absent or free.
    await app.prisma.workspaceBilling.deleteMany({ where: { workspaceId } });
    // Ensure we are not blocked by the recipe limit from earlier tests.
    await app.prisma.recipeWaterSettings.deleteMany({ where: { workspaceId } });
    await app.prisma.recipe.deleteMany({ where: { workspaceId } });

    const beerJsonRecipeJson = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Versioned Recipe",
            type: "all grain",
            author: "brewery-app",
            efficiency: { brewhouse: { unit: "%", value: 75 } },
            batch_size: { unit: "l", value: 20 },
            ingredients: {
              fermentable_additions: [],
              hop_additions: [],
              culture_additions: [],
              miscellaneous_additions: [],
            },
          },
        ],
      },
    };

    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie },
      payload: { name: "V0", styleKey: "custom", beerJsonRecipeJson },
    });
    expect(create.statusCode).toBe(200);
    const recipeId = (create.json()).recipe.id as string;

    const v1 = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/versions`,
      headers: { cookie },
    });
    expect(v1.statusCode).toBe(200);

    const v2 = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/versions`,
      headers: { cookie },
    });
    expect(v2.statusCode).toBe(403);
    expect((v2.json()).error?.code).toBe("plan_limit_versions");
  });
});

