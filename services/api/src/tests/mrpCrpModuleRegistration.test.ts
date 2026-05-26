import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  listRegisteredDocumentTemplates,
  listRegisteredModules,
  listRegisteredWebModules,
} from "@umbraculum/module-sdk";

import { buildApp } from "../app.js";

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

  it("does not register MRP/CRP document templates before runtime rendering hooks exist", () => {
    const refs = listRegisteredDocumentTemplates().map((template) => template.ref);
    expect(refs.some((ref) => ref.startsWith("mrp:"))).toBe(false);
    expect(refs.some((ref) => ref.startsWith("crp:"))).toBe(false);
  });
});
