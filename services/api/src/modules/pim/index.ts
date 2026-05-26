import type { FastifyInstance } from "fastify";
import {
  listRegisteredModules,
  listRegisteredWebModules,
  registerModule,
  registerWebModule,
} from "@umbraculum/module-sdk";

import { pimDocumentTemplates } from "./documentTemplates.js";
import { pimAttributeSetsRoutes } from "./routes/attributeSetsRoutes.js";
import { pimCategoriesRoutes } from "./routes/categoriesRoutes.js";
import { pimChannelFeedsRoutes } from "./routes/channelFeedsRoutes.js";
import { pimProductsRoutes } from "./routes/productsRoutes.js";
import { pimVariantsRoutes } from "./routes/variantsRoutes.js";
import { registerPimTools } from "../../services/ai/tools/pim/index.js";

const MODULE_CODE = "pim";

/**
 * Wire the canonical `pim` module — API surface + web URL-segment
 * registration.
 *
 * ## URL contract (post-audit Week 1)
 *
 * Per [`docs/design/web-route-group-audit.md`](../../../../../docs/design/web-route-group-audit.md)
 * §3.4 + [RFC-0006](../../../../../docs/rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md),
 * the PIM web slice serves `/en/products`, `/en/products/<id>`,
 * `/en/categories`, `/en/attribute-sets`, and `/en/attribute-sets/<id>`.
 * The pre-audit shape (`/en/pim/*`) was a URL-axis layout that contradicted
 * RFC-0002 Decision B's filesystem-axis commitment; the Week 1 audit
 * corrected the web slice into `apps/web/app/[locale]/(pim)/` with
 * static sub-segments (no group-root `page.tsx`, no group-root dynamic
 * segment per the two β disciplines).
 *
 * `registerWebModule` claims the three top-level URL segments PIM owns;
 * the CI collision check (`scripts/check-web-url-segments.ts`) enforces
 * uniqueness against every other module's registration.
 *
 * ## Repeat-call safety
 *
 * Same idempotent guards as `registerAutomationModule` — see that file's
 * comment block for the full rationale.
 */
export function registerPimModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some((m) => m.code === MODULE_CODE);

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      prismaSchema: "pim",
      addonCodes: ["pim_module"],
      registerAiTools(registry, instance) {
        registerPimTools(registry, instance.prisma);
      },
      documentTemplates: pimDocumentTemplates,
      routes: [],
    });
  }

  const alreadyRegisteredWeb = listRegisteredWebModules().some(
    (m) => m.code === MODULE_CODE,
  );

  if (!alreadyRegisteredWeb) {
    registerWebModule({
      code: MODULE_CODE,
      ownedUrlSegments: ["products", "categories", "attribute-sets"],
      navEntry: { primarySegment: "products", labelKey: "nav.pim" },
    });
  }

  app.register(pimProductsRoutes);
  app.register(pimVariantsRoutes);
  app.register(pimAttributeSetsRoutes);
  app.register(pimCategoriesRoutes);
  app.register(pimChannelFeedsRoutes);
}
