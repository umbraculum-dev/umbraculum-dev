import type { FastifyInstance } from "fastify";
import {
  listRegisteredModules,
  registerModule,
} from "@umbraculum/module-sdk";

import { brewdaySettingsRoutes } from "./routes/brewdaySettings.js";
import { brewSessionsRoutes } from "./routes/brewSessions.js";
import { equipmentProfilesRoutes } from "./routes/equipmentProfiles.js";
import { ingredientsRoutes } from "./routes/ingredients.js";
import { inventoryRoutes } from "./routes/inventory.js";
import { recipesRoutes } from "./routes/recipes.js";
import { recipesExportRoutes } from "./routes/recipesExport.js";
import { recipesImportRoutes } from "./routes/recipesImport.js";
import { recipeWaterComputeAndSaveRoutes } from "./routes/recipeWaterComputeAndSave.js";
import { recipeWaterHubSummaryRoutes } from "./routes/recipeWaterHubSummary.js";
import { recipeWaterSettingsRoutes } from "./routes/recipeWaterSettings.js";
import { stylesRoutes } from "./routes/styles.js";
import { waterCalcRoutes } from "./routes/waterCalc.js";
import { waterProfilesRoutes } from "./routes/waterProfiles.js";
import { breweryDocumentTemplates } from "./documentTemplates.js";
import { breweryTierLimits } from "./tierLimits.js";
import { registerBreweryTools } from "../../services/ai/tools/brewery/index.js";
import {
  BREWERY_KNOWLEDGE,
  BREWERY_MODULE_OVERLAY,
  BREWERY_ROUTE_OVERLAYS,
} from "../../services/ai/prompts/brewery.js";

const MODULE_CODE = "brewery";

/**
 * Wire the `brewery` module — Week 1 audit shape (Phase B).
 *
 * ## URL contract (preserved)
 *
 * Brewery URLs are unchanged by the file-move: `/en/recipes`,
 * `/en/inventory`, `/en/equipment`, `/en/water-profiles`,
 * `/en/brewday-steps-settings`, `/en/ferm-data-integration`. The
 * `(brewery)/` route group does not contribute a path segment per
 * RFC-0002 Decision B, so moving the web slice under
 * `apps/web/app/[locale]/(brewery)/` preserves every URL. See
 * [`docs/design/web-route-group-audit.md`](../../../../../docs/design/web-route-group-audit.md)
 * §3.4 + [RFC-0006](../../../../../docs/rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md).
 *
 * ## Prisma schema scope (deferred)
 *
 * Brewery models stay in the Prisma `public` schema for now — RFC-0002
 * Decision D explicitly defers the `brewery` Prisma-schema split. The
 * Week-1 audit/RFC-0006 acceleration only moves the TypeScript files
 * (API routes, web pages, native screens); the Prisma schema-name move
 * is a separate, higher-risk migration. `prismaSchema: undefined` is
 * therefore intentional — `registerModule` accepts a missing schema for
 * modules whose models live in `public`.
 *
 * ## Repeat-call safety (idempotent metadata recording)
 *
 * Same singleton-guard pattern as `registerAutomationModule` and
 * `registerPimModule`. The vitest setup file clears the registries
 * before each test file imports; within a single file, repeated
 * `buildApp()` calls re-enter this function and the guards below skip
 * the second-and-later metadata registrations. Per-app Fastify route
 * registration happens via `app.register(...)` calls, which always run
 * regardless of the singleton metadata-record state.
 */
export function registerBreweryModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some(
    (m) => m.code === MODULE_CODE,
  );

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      addonCodes: ["brewery_module"],
      tierLimits: breweryTierLimits,
      registerAiTools(registry, instance) {
        registerBreweryTools(registry, instance.prisma);
      },
      aiPrompts: {
        module: BREWERY_MODULE_OVERLAY,
        knowledge: BREWERY_KNOWLEDGE,
        routes: { ...BREWERY_ROUTE_OVERLAYS },
      },
      documentTemplates: breweryDocumentTemplates,
      routes: [],
    });
  }

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
  app.register(brewdaySettingsRoutes);
  app.register(brewSessionsRoutes);
  app.register(inventoryRoutes);
}
