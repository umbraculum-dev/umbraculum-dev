import type { FastifyInstance } from "fastify";

import { WaterCalcRouteService } from "./waterCalcRouteService.js";

export function waterCalcRoutes(app: FastifyInstance) {
  new WaterCalcRouteService().registerRoutes(app);
}
