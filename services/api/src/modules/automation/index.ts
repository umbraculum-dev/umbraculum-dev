import type { FastifyInstance } from "fastify";
import { listRegisteredModules, registerModule } from "@brewery/module-sdk";

const MODULE_CODE = "automation";

/**
 * Phase B foundation — wire the canonical `automation` module into the
 * Fastify host app via `@brewery/module-sdk`.
 *
 * Phase B-1 (this file's current scope):
 *   - Records module metadata (`code: "automation"`, `prismaSchema: "automation"`).
 *   - No routes registered yet — vessel + adapter routes land in Phase B-2.
 *   - No AI tools registered yet — `automation.listVessels` /
 *     `automation.vesselState` land in Phase B-2.
 *   - No tier-limits contributor yet — added with the first vessel-create
 *     route in Phase C (`maxVessels`, `maxAdaptersConnected` per design §8.2).
 *
 * The skeleton exists in this commit so Phase B-2 PRs can focus on the
 * read path without re-litigating registration plumbing.
 *
 * ## Repeat-call safety (idempotent metadata recording)
 *
 * `@brewery/module-sdk`'s `registerModule()` uses a process-wide singleton
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
 * Phase B-2 will add below the guard.
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
      routes: [],
    });
  }

  // Phase B-2 will call `app.register(automationVesselsRoutes)` here. Per-app
  // route registration must run on every `buildApp()` call regardless of the
  // singleton metadata-record state above.
}
