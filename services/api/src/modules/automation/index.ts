import type { FastifyInstance } from "fastify";
import {
  listRegisteredModules,
  listRegisteredWebModules,
  registerModule,
  registerWebModule,
} from "@umbraculum/module-sdk";

import { automationVesselsRoutes } from "./routes/automationVesselsRoutes.js";
import { registerAutomationTools } from "../../services/ai/tools/automation/index.js";
import {
  AUTOMATION_MODULE_OVERLAY,
  AUTOMATION_ROUTE_OVERLAYS,
} from "../../services/ai/prompts/automation.js";

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
 *   - Registers the module's owned web URL segment (`vessels`) and its
 *     primary nav entry via `registerWebModule()` — drives the build-time
 *     CI collision check (`scripts/check-web-url-segments.ts`) and is the
 *     source-of-truth for any nav-from-registry refactor.
 *   - AI-tool registration is declared on the module metadata and invoked
 *     by the platform's single AI registry during the AI plugin boot block.
 *   - No tier-limits contributor yet — added with the first vessel-create
 *     route in Phase C (`maxVessels`, `maxAdaptersConnected` per design §8.2).
 *   - No adapter supervisor loop yet — the mock adapter
 *     (`adapters/mockAdapter.ts`) exists for tests + Phase C development, but
 *     no background snapshot reconciliation runs.
 *
 * ## URL contract (post-audit Week 1)
 *
 * Per [`docs/design/web-route-group-audit.md`](../../../../../docs/design/web-route-group-audit.md)
 * §3.4 + [RFC-0006](../../../../../docs/rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md),
 * the automation web slice serves `/en/vessels` (list) + `/en/vessels/<code>`
 * (detail). The previous `(automation)/page.tsx` + `(automation)/[vesselCode]/page.tsx`
 * shape violated the two β disciplines (Discipline 1: group-root page collided
 * with `[locale]/page.tsx`; Discipline 2: group-root dynamic shadowed every
 * non-static URL). Both were corrected in Week 1; the canonical static
 * sub-segment is `vessels`.
 *
 * ## Repeat-call safety (idempotent metadata recording)
 *
 * `@umbraculum/module-sdk`'s `registerModule()` and `registerWebModule()` both
 * use process-wide singleton registries that throw on duplicate registration.
 * In production, `buildApp()` is called once per process so this is a no-op
 * safety net. In test workers, multiple Fastify instances are constructed
 * (e.g. tests with cross-workspace isolation describe blocks), and a
 * process-wide singleton would collide.
 *
 * The vitest setup file clears the registry before each test file imports;
 * within a single file, repeated `buildApp()` calls re-enter this function
 * and the guards below skip the second-and-later registrations. Per-app
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
      registerAiTools(registry, instance) {
        registerAutomationTools(registry, instance.prisma);
      },
      aiPrompts: {
        module: AUTOMATION_MODULE_OVERLAY,
        routes: { ...AUTOMATION_ROUTE_OVERLAYS },
      },
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

  const alreadyRegisteredWeb = listRegisteredWebModules().some(
    (m) => m.code === MODULE_CODE,
  );

  if (!alreadyRegisteredWeb) {
    registerWebModule({
      code: MODULE_CODE,
      ownedUrlSegments: ["vessels"],
      navEntry: { primarySegment: "vessels", labelKey: "nav.automation" },
    });
  }

  app.register(automationVesselsRoutes);
}
