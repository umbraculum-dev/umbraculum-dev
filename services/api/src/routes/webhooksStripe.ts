import type { FastifyInstance } from "fastify";
import { createHmac, timingSafeEqual } from "node:crypto";
import { BadRequestError, UnauthorizedError } from "../errors.js";
import { StripeWebhookService } from "../services/stripeWebhookService.js";

const STRIPE_TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

function getHeader(req: any, name: string): string | null {
  const v = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function parseStripeSignatureHeader(header: string): { t: string; v1: string } | null {
  const parts = header.split(",").map((p) => p.trim()).filter(Boolean);
  const t = parts.find((p) => p.startsWith("t="))?.slice(2) ?? "";
  const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3) ?? "";
  if (!t || !v1) return null;
  return { t, v1 };
}

function constantTimeEqualsHex(aHex: string, bHex: string): boolean {
  try {
    const a = Buffer.from(aHex, "hex");
    const b = Buffer.from(bHex, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function verifyStripeSignature(input: { rawBody: Buffer; header: string; secret: string }) {
  const parsed = parseStripeSignatureHeader(input.header);
  if (!parsed) throw new UnauthorizedError("invalid_stripe_signature", "Invalid Stripe-Signature header");

  const tNum = Number(parsed.t);
  if (!Number.isFinite(tNum)) throw new UnauthorizedError("invalid_stripe_signature", "Invalid Stripe timestamp");

  const ageSeconds = Math.abs(Date.now() / 1000 - tNum);
  if (ageSeconds > STRIPE_TIMESTAMP_TOLERANCE_SECONDS) {
    throw new UnauthorizedError("invalid_stripe_signature", "Stripe webhook timestamp outside tolerance");
  }

  const signedPayload = `${parsed.t}.${input.rawBody.toString("utf8")}`;
  const expected = createHmac("sha256", input.secret).update(signedPayload).digest("hex");
  if (!constantTimeEqualsHex(expected, parsed.v1)) {
    throw new UnauthorizedError("invalid_stripe_signature", "Invalid Stripe webhook signature");
  }
}

export async function webhooksStripeRoutes(app: FastifyInstance) {
  const svc = new StripeWebhookService(app.prisma);

  app.post("/webhooks/stripe", async (req) => {
    const secretRaw = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
    const secret = secretRaw && secretRaw !== "..." ? secretRaw : "";

    if (secret) {
      const sig = getHeader(req, "stripe-signature") ?? getHeader(req, "Stripe-Signature");
      if (!sig) throw new UnauthorizedError("missing_stripe_signature", "Missing Stripe-Signature header");
      if (!req.rawBody) throw new BadRequestError("missing_raw_body", "Missing raw body for signature verification");
      verifyStripeSignature({ rawBody: req.rawBody, header: sig, secret });
    }

    // In strict mode, signature verification already happened. In dev mode, accept payload as-is.
    const body = (req.body ?? {}) as any;

    // Only handle checkout.session.completed for now; ignore others (still return 200).
    if (body?.type === "checkout.session.completed") {
      await svc.handleCheckoutSessionCompleted(body);
    }

    return { ok: true };
  });
}

