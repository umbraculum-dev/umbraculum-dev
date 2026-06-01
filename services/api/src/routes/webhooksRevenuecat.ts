import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  WebhookOkResponseSchema,
  WebhookRevenuecatBodySchema,
} from "@umbraculum/contracts";

import { UnauthorizedError } from "../errors.js";
import { RevenueCatWebhookService } from "../services/revenueCatWebhookService.js";

function getAuthHeader(req: FastifyRequest): string | null {
  const v = req.headers?.authorization;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function requireRevenueCatAuth(req: FastifyRequest) {
  const expected = (process.env["REVENUECAT_WEBHOOK_AUTH"] ?? process.env["REVENUECAT_WEBHOOK_SECRET"] ?? "").trim();
  if (!expected) return;

  const actual = getAuthHeader(req);
  if (!actual) throw new UnauthorizedError("missing_revenuecat_auth", "Missing Authorization header");
  if (actual !== expected) throw new UnauthorizedError("invalid_revenuecat_auth", "Invalid RevenueCat webhook Authorization");
}

export function webhooksRevenuecatRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new RevenueCatWebhookService(app.prisma);

  zodApp.post(
    "/webhooks/revenuecat",
    {
      schema: {
        tags: ["webhooks"],
        body: WebhookRevenuecatBodySchema,
        response: {
          200: WebhookOkResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      requireRevenueCatAuth(req);
      await svc.handleEvent(req.body);
      return WebhookOkResponseSchema.parse({ ok: true });
    },
  );
}
