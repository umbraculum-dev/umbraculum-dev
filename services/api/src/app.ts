import Fastify from "fastify";
import cors from "@fastify/cors";
import { prismaPlugin } from "./plugins/prisma.js";
import { redisClientPlugin } from "./plugins/redisClient.js";
import { requestContextPlugin } from "./plugins/requestContext.js";
import { sessionAuthPlugin } from "./plugins/sessionAuth.js";
import { errorHandlerPlugin } from "./plugins/errorHandler.js";
import { webhookRawBodyPlugin } from "./plugins/webhookRawBody.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { workspacesRoutes } from "./routes/workspaces.js";
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
import { platformRecipesRoutes } from "./routes/platformRecipes.js";
import { brewdaySettingsRoutes } from "./routes/brewdaySettings.js";
import { brewSessionsRoutes } from "./routes/brewSessions.js";
import { inventoryRoutes } from "./routes/inventory.js";
import { billingRoutes } from "./routes/billing.js";
import { integrationsTiltIngestRoutes } from "./routes/integrationsTiltIngest.js";
import { integrationsTiltRoutes } from "./routes/integrationsTilt.js";
import { integrationsRevealRoutes } from "./routes/integrationsReveal.js";
import { webhooksStripeRoutes } from "./routes/webhooksStripe.js";
import { webhooksRevenuecatRoutes } from "./routes/webhooksRevenuecat.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(errorHandlerPlugin);
  app.register(webhookRawBodyPlugin);
  // Dev-only CORS to allow Expo web preview (Metro) to call the API directly.
  // Native requests don't use browser CORS, but `expo start --web` does.
  if (process.env.NODE_ENV !== "production") {
    app.register(cors, {
      credentials: true,
      origin: (origin, cb) => {
        // Allow non-browser tools (curl, server-to-server).
        if (!origin) return cb(null, true);

        // Allow the Expo/Metro dev server origin (typically :8081).
        if (origin.startsWith("http://") && origin.endsWith(":8081")) return cb(null, true);
        if (origin.startsWith("https://") && origin.endsWith(":8081")) return cb(null, true);

        // Deny by default.
        return cb(null, false);
      },
    });
  }
  app.register(prismaPlugin);
  app.register(redisClientPlugin);
  app.register(sessionAuthPlugin);
  app.register(requestContextPlugin);

  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(workspacesRoutes);
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
  app.register(platformRecipesRoutes);
  app.register(brewdaySettingsRoutes);
  app.register(brewSessionsRoutes);
  app.register(inventoryRoutes);
  app.register(billingRoutes);
  app.register(integrationsTiltIngestRoutes);
  app.register(integrationsTiltRoutes);
  app.register(integrationsRevealRoutes);
  app.register(webhooksStripeRoutes);
  app.register(webhooksRevenuecatRoutes);

  return app;
}

