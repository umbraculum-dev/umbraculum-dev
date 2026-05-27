import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  listRegisteredDocumentTemplates,
  listRegisteredModules,
  listRegisteredWebModules,
  registerRegisteredModuleAiTools,
} from "@umbraculum/module-sdk";

import { buildApp } from "../app.js";
import { InMemoryAiToolRegistry } from "../services/ai/toolRegistry.js";

describe("MRP/CRP module registration — Wave 1", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("records canonical module metadata with Prisma schema ownership", () => {
    const modules = listRegisteredModules();
    expect(modules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "mrp",
          prismaSchema: "mrp",
          addonCodes: ["mrp_module"],
          isCanonical: true,
        }),
        expect.objectContaining({
          code: "crp",
          prismaSchema: "crp",
          addonCodes: ["crp_module"],
          isCanonical: true,
        }),
      ]),
    );
  });

  it("records web segment ownership without shipping web pages in Wave 1", () => {
    const webModules = listRegisteredWebModules();
    expect(webModules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "mrp",
          ownedUrlSegments: ["production-orders", "work-orders", "material-requirements"],
        }),
        expect.objectContaining({
          code: "crp",
          ownedUrlSegments: ["capacity", "schedule", "resources"],
        }),
      ]),
    );
  });

  it("registers Wave 6 MRP/CRP document templates through module ownership", () => {
    const refs = listRegisteredDocumentTemplates().map((template) => template.ref);
    expect(refs).toEqual(
      expect.arrayContaining([
        "mrp:work-order-pdf@v1",
        "mrp:route-card-pdf@v1",
        "mrp:material-requirements-xlsx@v1",
        "mrp:production-order-csv@v1",
        "crp:capacity-load-xlsx@v1",
        "crp:schedule-pdf@v1",
        "crp:resource-calendar-csv@v1",
        "crp:conflict-report-pdf@v1",
      ]),
    );
  });

  it("registers Wave 5 read-only MRP/CRP AI tools through module ownership", () => {
    const registry = new InMemoryAiToolRegistry();
    registerRegisteredModuleAiTools(registry, app);
    const tools = registry.list().map((tool) => ({ name: tool.name, scope: tool.scope }));

    expect(tools).toEqual(
      expect.arrayContaining([
        { name: "mrp.listProductionOrders", scope: "read" },
        { name: "mrp.getProductionOrder", scope: "read" },
        { name: "mrp.explainMaterialRequirements", scope: "read" },
        { name: "mrp.proposeOrderAdjustment", scope: "propose" },
        { name: "crp.listResources", scope: "read" },
        { name: "crp.listWorkCenters", scope: "read" },
        { name: "crp.listScheduledOperations", scope: "read" },
        { name: "crp.explainCapacityLoad", scope: "read" },
        { name: "crp.listConflicts", scope: "read" },
        { name: "crp.proposeScheduleAdjustment", scope: "propose" },
      ]),
    );
  });
});
