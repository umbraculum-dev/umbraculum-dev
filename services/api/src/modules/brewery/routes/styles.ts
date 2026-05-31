import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema, StylesListResponseSchema } from "@umbraculum/contracts";

import { requireUser } from "../../../plugins/requestContext.js";

export function stylesRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

  zodApp.get(
    "/styles",
    {
      schema: {
        tags: ["brewery"],
        response: {
          200: StylesListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      requireUser(req);

      const styles = await app.prisma.beerStyle.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
        select: {
          key: true,
          name: true,
          source: true,
          version: true,
          code: true,
          category: true,
          categoryId: true,
          sortOrder: true,
        },
      });

      return StylesListResponseSchema.parse({ ok: true, styles });
    },
  );
}
