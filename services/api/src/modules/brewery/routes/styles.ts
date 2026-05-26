import type { FastifyInstance } from "fastify";
import { requireUser } from "../../../plugins/requestContext.js";

export function stylesRoutes(app: FastifyInstance) {
  app.get("/styles", async (req) => {
    // Styles are system-scoped; require auth but not an active account.
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

    return { ok: true, styles };
  });
}

