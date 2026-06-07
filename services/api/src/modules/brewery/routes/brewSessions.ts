import type { FastifyInstance } from "fastify";

import { BrewSessionsRouteService } from "../services/brewSessionsRouteService.js";
import { registerBrewSessionsCrudRoutes } from "./brewSessionsCrudRoutes.js";
import { registerBrewSessionsIntegrationRoutes } from "./brewSessionsIntegrationRoutes.js";
import { registerBrewSessionsStepsRoutes } from "./brewSessionsStepsRoutes.js";

export function brewSessionsRoutes(app: FastifyInstance) {
  const svc = new BrewSessionsRouteService(app.prisma);

  registerBrewSessionsCrudRoutes(app, svc);
  registerBrewSessionsStepsRoutes(app, svc);
  registerBrewSessionsIntegrationRoutes(app, svc);
}
