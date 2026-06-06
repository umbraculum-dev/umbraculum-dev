import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import { StylesListResponseSchema } from "@umbraculum/brewery-contracts";

import { requireUser } from "../../../plugins/requestContext.js";
import { StylesService } from "../services/stylesService.js";

export function stylesRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const styles = new StylesService(app.prisma);

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
      const styleList = await styles.listActiveStyles();
      return StylesListResponseSchema.parse({ ok: true, styles: styleList });
    },
  );
}
