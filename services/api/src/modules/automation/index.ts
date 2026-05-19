import type { FastifyInstance } from "fastify";
import { listRegisteredModules, registerModule } from "@umbraculum/module-sdk";

import { automationVesselsRoutes } from "./routes/automationVesselsRoutes.js";

const MODULE_CODE = "automation";

/**
 * Wire the canonical `automation` module into the Fastify host app via
 * `@umbraculum/module-sdk` and register its read-path routes.
 *
 * Phase B-2 (this file's current scope):
 *   - Records module metadata (`code: "automation"`, `prismaSchema: "automation"`).
 *   - Registers read-path Fastify routes (`automationVesselsRoutes`) at the
 *     top-level app scope so they mount at `/automation/vessels` /
 *     `/automation/vessels/:code`.
 *   - AI-tool registration lives in `app.ts` next to brewery-tool
 *     registration so both tool families share the orchestrator's registry
 *     and the registry's lifetime tracks the AI plugin block (one registry
 *     per `buildApp()`).
 *   - No tier-limits contributor yet — added with the first vessel-create
 *     route in Phase C (`maxVessels`, `maxAdaptersConnected` per design §8.2).
 *   - No adapter supervisor loop yet — the mock adapter
 *     (`adapters/mockAdapter.ts`) exists for tests + Phase C development, but
 *     no background snapshot reconciliation runs.
 *
 * ## Repeat-call safety (idempotent metadata recording)
 *
 * `@umbraculum/module-sdk`'s `registerModule()` uses a process-wide singleton
 * registry that throws `ModuleCodeAlreadyRegisteredError` on duplicate
 * registration. In production, `buildApp()` is called once per process so
 * this is a no-op safety net. In test workers, multiple Fastify instances
 * are constructed (e.g. tests with cross-workspace isolation describe
 * blocks), and a process-wide singleton would collide.
 *
 * The vitest setup file clears the registry before each test file imports;
 * within a single file, repeated `buildApp()` calls re-enter this function
 * and the guard below skips the second-and-later registrations. Per-app
 * Fastify route registration happens via `app.register(...)` calls, which
 * always run regardless of the singleton metadata-record state.
 *
 * See: `docs/design/canonical-automation-module-surface.md` §8.3, §9 Phase B.
 */
export function registerAutomationModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some(
    (m) => m.code === MODULE_CODE,
  );

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      prismaSchema: "automation",
      addonCodes: ["automation_module"],
      // Routes registered via per-app `app.register(...)` below so they
      // attach on every `buildApp()` call. `registerModule` records the
      // metadata once per process; if `routes:` were passed here, the
      // guarded first-call path would register routes too, but
      // second-and-later `buildApp()` calls (test workers) would skip
      // both metadata AND routes — leaving the second app without the
      // module's routes wired.
      routes: [],
    });
  }

  app.register(automationVesselsRoutes);
}
