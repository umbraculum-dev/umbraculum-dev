import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

import { AuthService } from "../services/authService.js";
import { WorkspacesService } from "../services/workspacesService.js";
import { registerAuthCredentialRoutes } from "./authCredentialRoutes.js";
import { registerAuthSessionRoutes } from "./authSessionRoutes.js";

export async function authRoutes(app: FastifyInstance) {
  const auth = new AuthService({
    prisma: app.prisma,
    redis: app.redis ?? null,
    workspaces: new WorkspacesService(app.prisma),
  });

  await app.register(rateLimit, { global: false });

  registerAuthCredentialRoutes(app, auth);
  registerAuthSessionRoutes(app, auth);
}
