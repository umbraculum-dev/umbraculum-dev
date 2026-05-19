/**
 * Valibot equivalent of /auth/signup body parsing in
 * services/api/src/routes/auth.ts lines 86-108.
 *
 * Paper-design spike per docs/rfcs/0003-validation-library-adoption.md §15
 * — comparison axis to the Zod v4 implementation in
 * spike/validation-library/zod/auth-signup-route.ts.
 *
 * NOTE on Fastify integration: Valibot does not ship a first-class
 * fastify-type-provider yet. The integration pattern (as of 2026-05) is:
 *  1. Author the Valibot schema.
 *  2. Convert it to JSON Schema via @valibot/to-json-schema for the
 *     route declaration (so Fastify's schema introspection works).
 *  3. Register a validator compiler that calls v.safeParse() and
 *     translates ValiError into Fastify's expected shape.
 * The result is more verbose than fastify-type-provider-zod. The body
 * type is not auto-inferred from the schema declaration; it has to be
 * imported or re-declared.
 */
import type { FastifyInstance } from "fastify";
import {
  email,
  enum_,
  minLength,
  object,
  optional,
  parse,
  pipe,
  string,
  toLowerCase,
  trim,
  type InferOutput,
} from "valibot";
import { toJsonSchema } from "@valibot/to-json-schema";

const SignupBodySchema = object({
  email: pipe(string(), trim(), toLowerCase(), email()),
  password: pipe(string(), minLength(8)),
  preferredLocale: optional(
    enum_({ en: "en", it: "it" }),
    "en",
  ),
  workspaceName: optional(pipe(string(), trim(), minLength(1))),
  accountName: optional(pipe(string(), trim(), minLength(1))),
});

export type SignupBody = InferOutput<typeof SignupBodySchema>;

export async function signupRouteValibot(app: FastifyInstance): Promise<void> {
  app.post(
    "/auth/signup",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: { body: toJsonSchema(SignupBodySchema) },
    },
    async (req, _reply) => {
      const body = parse(SignupBodySchema, req.body);
      const workspaceName = (body.workspaceName ?? body.accountName ?? "").trim();
      return {
        email: body.email,
        password: body.password.length,
        preferredLocale: body.preferredLocale,
        workspaceName,
      };
    },
  );
}
