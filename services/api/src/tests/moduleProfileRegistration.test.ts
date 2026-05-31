import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  clearModuleRegistryForTests,
  clearWebModuleRegistryForTests,
  listRegisteredModules,
  listRegisteredWebModules,
} from "@umbraculum/module-sdk";

import { buildApp } from "../app.js";

describe("module profile — platform SKU", () => {
  const previousProfile = process.env["UMBRACULUM_MODULE_PROFILE"];
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    process.env["UMBRACULUM_MODULE_PROFILE"] = "platform";
    clearModuleRegistryForTests();
    clearWebModuleRegistryForTests();
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    if (previousProfile === undefined) {
      delete process.env["UMBRACULUM_MODULE_PROFILE"];
    } else {
      process.env["UMBRACULUM_MODULE_PROFILE"] = previousProfile;
    }
  });

  it("does not register brewery module metadata", () => {
    const codes = listRegisteredModules().map((m) => m.code);
    expect(codes).not.toContain("brewery");
    expect(codes).toEqual(
      expect.arrayContaining(["automation", "pim", "mrp", "crp"]),
    );
  });

  it("does not register brewery web segments", () => {
    const webCodes = listRegisteredWebModules().map((m) => m.code);
    expect(webCodes).not.toContain("brewery");
  });

  it("platform profile excludes brewery AI overlays via module registration", () => {
    const overlays = listRegisteredModules()
      .filter((m) => m.aiPrompts?.module)
      .map((m) => m.code);
    expect(overlays).not.toContain("brewery");
  });

  it("does not expose brewery inventory route", async () => {
    const res = await app.inject({ method: "GET", url: "/inventory" });
    expect(res.statusCode).toBe(404);
  });
});

describe("module profile — reference default", () => {
  const previousProfile = process.env["UMBRACULUM_MODULE_PROFILE"];
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    delete process.env["UMBRACULUM_MODULE_PROFILE"];
    clearModuleRegistryForTests();
    clearWebModuleRegistryForTests();
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    if (previousProfile === undefined) {
      delete process.env["UMBRACULUM_MODULE_PROFILE"];
    } else {
      process.env["UMBRACULUM_MODULE_PROFILE"] = previousProfile;
    }
  });

  it("registers brewery module metadata by default", () => {
    const codes = listRegisteredModules().map((m) => m.code);
    expect(codes).toContain("brewery");
  });
});
