import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { HealthResponseSchema } from "@umbraculum/contracts";

export function healthRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

  zodApp.get(
    "/health",
    {
      schema: {
        tags: ["platform"],
        response: {
          200: HealthResponseSchema,
        },
      },
    },
    () => HealthResponseSchema.parse({ ok: true as const }),
  );
}
