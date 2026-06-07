/**
 * Webhook route contracts (OpenAPI webhooks tag).
 * Provider payloads are validated loosely — signature verification is route-level.
 */
import { z } from "zod";

export const WebhookOkResponseSchema = z.object({
  ok: z.literal(true),
});

export const WebhookStripeBodySchema = z.record(z.string(), z.unknown());

export const WebhookRevenuecatBodySchema = z.unknown();
