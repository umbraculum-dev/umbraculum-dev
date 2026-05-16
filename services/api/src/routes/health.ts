import type { FastifyInstance } from "fastify";

export function healthRoutes(app: FastifyInstance) {
  app.get("/health", () => {
    return { ok: true };
  });
}

