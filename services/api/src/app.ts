import Fastify from "fastify";
import { prismaPlugin } from "./plugins/prisma.js";
import { requestContextPlugin } from "./plugins/requestContext.js";
import { errorHandlerPlugin } from "./plugins/errorHandler.js";
import { healthRoutes } from "./routes/health.js";
import { accountsRoutes } from "./routes/accounts.js";
import { recipesRoutes } from "./routes/recipes.js";
import { waterProfilesRoutes } from "./routes/waterProfiles.js";
import { waterCalcRoutes } from "./routes/waterCalc.js";
import { recipeWaterSettingsRoutes } from "./routes/recipeWaterSettings.js";
import { ingredientsRoutes } from "./routes/ingredients.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(errorHandlerPlugin);
  app.register(prismaPlugin);
  app.register(requestContextPlugin);

  app.register(healthRoutes);
  app.register(accountsRoutes);
  app.register(recipesRoutes);
  app.register(waterProfilesRoutes);
  app.register(waterCalcRoutes);
  app.register(recipeWaterSettingsRoutes);
  app.register(ingredientsRoutes);

  return app;
}

