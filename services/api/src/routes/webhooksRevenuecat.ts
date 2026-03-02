import type { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../errors.js";
import { RevenueCatWebhookService } from "../services/revenueCatWebhookService.js";

function getAuthHeader(req: any): string | null {
  const v = req.headers?.authorization;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function requireRevenueCatAuth(req: any) {
  // RevenueCat webhook security uses a configurable Authorization header value (not an HMAC signature).
  const expected = (process.env.REVENUECAT_WEBHOOK_AUTH ?? process.env.REVENUECAT_WEBHOOK_SECRET ?? "").trim();
  if (!expected) return; // dev/stub mode

  const actual = getAuthHeader(req);
  if (!actual) throw new UnauthorizedError("missing_revenuecat_auth", "Missing Authorization header");
  if (actual !== expected) throw new UnauthorizedError("invalid_revenuecat_auth", "Invalid RevenueCat webhook Authorization");
}

export async function webhooksRevenuecatRoutes(app: FastifyInstance) {
  const svc = new RevenueCatWebhookService(app.prisma);

  app.post("/webhooks/revenuecat", async (req) => {
    requireRevenueCatAuth(req);
    await svc.handleEvent(req.body);
    return { ok: true };
  });
}

