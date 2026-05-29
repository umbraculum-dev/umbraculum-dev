import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const HealthResponseSchema = z.object({
  ok: z.literal(true),
});

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
    () => ({ ok: true as const }),
  );
}
