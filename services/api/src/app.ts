import Fastify from "fastify";
import { prismaPlugin } from "./plugins/prisma.js";
import { requestContextPlugin } from "./plugins/requestContext.js";
import { sessionAuthPlugin } from "./plugins/sessionAuth.js";
import { errorHandlerPlugin } from "./plugins/errorHandler.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { accountsRoutes } from "./routes/accounts.js";
import { recipesRoutes } from "./routes/recipes.js";
import { recipesImportRoutes } from "./routes/recipesImport.js";
import { recipesExportRoutes } from "./routes/recipesExport.js";
import { stylesRoutes } from "./routes/styles.js";
import { waterProfilesRoutes } from "./routes/waterProfiles.js";
import { equipmentProfilesRoutes } from "./routes/equipmentProfiles.js";
import { waterCalcRoutes } from "./routes/waterCalc.js";
import { recipeWaterSettingsRoutes } from "./routes/recipeWaterSettings.js";
import { recipeWaterHubSummaryRoutes } from "./routes/recipeWaterHubSummary.js";
import { recipeWaterComputeAndSaveRoutes } from "./routes/recipeWaterComputeAndSave.js";
import { ingredientsRoutes } from "./routes/ingredients.js";
import { adsRoutes } from "./routes/ads.js";
import { platformAdsRoutes } from "./routes/platformAds.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(errorHandlerPlugin);
  app.register(prismaPlugin);
  app.register(sessionAuthPlugin);
  app.register(requestContextPlugin);

  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(accountsRoutes);
  app.register(recipesRoutes);
  app.register(recipesImportRoutes);
  app.register(recipesExportRoutes);
  app.register(stylesRoutes);
  app.register(waterProfilesRoutes);
  app.register(equipmentProfilesRoutes);
  app.register(waterCalcRoutes);
  app.register(recipeWaterSettingsRoutes);
  app.register(recipeWaterHubSummaryRoutes);
  app.register(recipeWaterComputeAndSaveRoutes);
  app.register(ingredientsRoutes);
  app.register(adsRoutes);
  app.register(platformAdsRoutes);

  return app;
}

