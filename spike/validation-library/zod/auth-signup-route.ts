/**
 * Zod v4 equivalent of /auth/signup body parsing in
 * services/api/src/routes/auth.ts lines 86-108.
 *
 * Paper-design spike per docs/rfcs/0003-validation-library-adoption.md §15.
 * Demonstrates the framework-driven validation pattern via
 * fastify-type-provider-zod: schema declared once, req.body becomes typed
 * automatically. No hand-rolled `body.email as string` casts; no manual
 * BadRequestError throws for shape violations.
 *
 * NOTE: this is spike scaffolding. The real migration in PR 3 will wire
 * this into the actual Fastify app + integrate with the existing
 * BadRequestError vocabulary for business-rule errors (e.g. "email_in_use")
 * that aren't structural validation failures.
 */
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

const SignupBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  preferredLocale: z.enum(["en", "it"]).default("en"),
  workspaceName: z.string().trim().min(1).optional(),
  accountName: z.string().trim().min(1).optional(),
});

export async function signupRouteZod(app: FastifyInstance): Promise<void> {
  // In real migration these two lines live in services/api/src/app.ts
  // (one-time setup) not per-route; included here so the spike file is
  // self-contained and demonstrates the full integration surface.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.withTypeProvider<ZodTypeProvider>().post(
    "/auth/signup",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: { body: SignupBodySchema },
    },
    async (req, _reply) => {
      const { email, password, preferredLocale } = req.body;
      const workspaceName = (req.body.workspaceName ?? req.body.accountName ?? "").trim();
      // Business-rule validation (not structural) stays as BadRequestError
      // in the real codebase. Spike omits that to keep the LOC comparison
      // focused on validation-shape, not business logic.
      return { email, password: password.length, preferredLocale, workspaceName };
    },
  );
}
