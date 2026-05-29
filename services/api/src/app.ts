import type { IncomingMessage, ServerResponse } from "node:http";
import Fastify, {
  type FastifyBaseLogger,
  type FastifyInstance,
  type FastifyTypeProviderDefault,
  type RawServerDefault,
} from "fastify";
import cors, { type OriginFunction } from "@fastify/cors";
import { registerRegisteredModuleAiTools, registerBuiltinWebModulesIfAbsent } from "@umbraculum/module-sdk";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { openapiPlugin } from "./plugins/openapiPlugin.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { redisClientPlugin } from "./plugins/redisClient.js";
import { requestContextPlugin } from "./plugins/requestContext.js";
import { sessionAuthPlugin } from "./plugins/sessionAuth.js";
import { errorHandlerPlugin } from "./plugins/errorHandler.js";
import { webhookRawBodyPlugin } from "./plugins/webhookRawBody.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { workspacesRoutes } from "./routes/workspaces.js";
import { adsRoutes } from "./routes/ads.js";
import { platformAdsRoutes } from "./routes/platformAds.js";
import { platformRecipesRoutes } from "./routes/platformRecipes.js";
import { billingRoutes } from "./routes/billing.js";
import { integrationsTiltIngestRoutes } from "./routes/integrationsTiltIngest.js";
import { integrationsTiltRoutes } from "./routes/integrationsTilt.js";
import { integrationsGenericRoutes } from "./routes/integrationsGeneric.js";
import { integrationsRevealRoutes } from "./routes/integrationsReveal.js";
import { webhooksStripeRoutes } from "./routes/webhooksStripe.js";
import { webhooksRevenuecatRoutes } from "./routes/webhooksRevenuecat.js";
import { aiRoutes } from "./routes/ai.js";
import { renderingRoutes } from "./routes/rendering.js";
import { InMemoryAiToolRegistry } from "./services/ai/toolRegistry.js";
import { registerRenderingTools } from "./services/ai/tools/rendering/index.js";
import { registerPlatformAiTools } from "./services/ai/tools/platform/index.js";
import { renderingRuntimePlugin } from "./services/rendering/index.js";
import { registerAutomationModule } from "./modules/automation/index.js";
import { registerBreweryModule } from "./modules/brewery/index.js";
import { registerCrpModule } from "./modules/crp/index.js";
import { registerMrpModule } from "./modules/mrp/index.js";
import { registerPimModule } from "./modules/pim/index.js";
import { ingestPublicDocs } from "./services/ai/rag/ingestPublicDocs.js";

type AppInstance = FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  FastifyTypeProviderDefault
>;

function installZodCompilers(app: AppInstance): void {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
}

export function buildApp() {
  const app = Fastify({ logger: true }) as AppInstance;

  installZodCompilers(app);

  app.register(errorHandlerPlugin);
  app.register(webhookRawBodyPlugin);
  // Dev-only CORS to allow Expo web preview (Metro) to call the API directly.
  // Native requests don't use browser CORS, but `expo start --web` does.
  if (process.env['NODE_ENV'] !== "production") {
    const corsOriginFn: OriginFunction = (origin, cb) => {
      if (!origin) return cb(null, true);

      if (origin.startsWith("http://") && origin.endsWith(":8081")) return cb(null, true);
      if (origin.startsWith("https://") && origin.endsWith(":8081")) return cb(null, true);

      return cb(null, false);
    };
    // @fastify/cors v10 uses `export = fastifyCors` with a merged
    // function+namespace declaration; type-aware ESLint can't fully
    // narrow the resulting "function-or-namespace" type at the
    // FastifyPluginCallback parameter slot, even though `tsc`
    // accepts the call cleanly. Fastify itself, the cors plugin
    // contract, and the inferred options object are all correct.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    app.register(cors, {
      credentials: true,
      origin: corsOriginFn,
    });
  }
  app.register(prismaPlugin);
  app.register(redisClientPlugin);
  app.register(renderingRuntimePlugin);
  app.register(sessionAuthPlugin);
  app.register(requestContextPlugin);

  app.register(openapiPlugin);

  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(workspacesRoutes);
  app.register(adsRoutes);
  app.register(platformAdsRoutes);
  app.register(platformRecipesRoutes);
  app.register(billingRoutes);
  app.register(integrationsTiltIngestRoutes);
  app.register(integrationsTiltRoutes);
  app.register(integrationsGenericRoutes);
  app.register(integrationsRevealRoutes);
  app.register(webhooksStripeRoutes);
  app.register(webhooksRevenuecatRoutes);
  app.register(renderingRoutes);

  // Canonical-module bootstraps — Week 1 audit (RFC-0006).
  // Built-in web URL segments + nav metadata are centralized in
  // `@umbraculum/module-sdk` (`registerBuiltinWebModulesIfAbsent`) so
  // `apps/web` and `services/api` share one source of truth.
  registerBuiltinWebModulesIfAbsent();
  // Each `register<Code>Module` records API module metadata with
  // `@umbraculum/module-sdk` and registers its API route registrars +
  // owned web URL segments. The order is alphabetical for stability of
  // any registry-snapshot debug dumps; runtime order doesn't matter
  // because Fastify route registration is order-independent for
  // non-colliding paths and `registerWebModule` segment-ownership is
  // also order-independent (it's a Set-keyed lookup).
  // See: docs/design/web-route-group-audit.md §3.4 +
  //      docs/rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md.
  registerAutomationModule(app);
  registerBreweryModule(app);
  registerCrpModule(app);
  registerMrpModule(app);
  registerPimModule(app);

  app.register((instance, _opts, done) => {
    const registry = new InMemoryAiToolRegistry();
    registerRegisteredModuleAiTools(registry, instance);
    registerRenderingTools(registry, instance.renderingJobs);
    registerPlatformAiTools(registry, instance.prisma);
    aiRoutes(registry)(instance);
    done();
  });

  app.addHook("onReady", async () => {
    if (process.env["AI_RAG_INGEST_ON_BOOT"] !== "1") return;
    const repoRoot = process.env["UMBRACULUM_REPO_ROOT"] ?? "/umbraculum";
    try {
      const { ingested } = await ingestPublicDocs(app.prisma, repoRoot);
      app.log.info({ ingested, repoRoot }, "RAG public docs ingest on boot");
    } catch (err: unknown) {
      app.log.error({ err, repoRoot }, "RAG public docs ingest on boot failed");
    }
  });

  return app;
}

