import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  clearModuleRegistryForTests,
  clearWebModuleRegistryForTests,
  collectModulePromptOverlayTexts,
  listRegisteredModules,
  listRegisteredWebModules,
  resolveRoutePromptOverlay,
} from "@umbraculum/module-sdk";

import { buildApp } from "../app.js";

function saveEnv(key: string): string | undefined {
  return process.env[key];
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

/** Module-profile tests only need route registration — skip BullMQ/ioredis boot. */
function disableRedisForProfileTests(): {
  redisUrl: string | undefined;
  workerDisabled: string | undefined;
} {
  const redisUrl = saveEnv("REDIS_URL");
  const workerDisabled = saveEnv("RENDERING_WORKER_DISABLED");
  delete process.env["REDIS_URL"];
  process.env["RENDERING_WORKER_DISABLED"] = "1";
  return { redisUrl, workerDisabled };
}

function restoreRedisAfterProfileTests(saved: {
  redisUrl: string | undefined;
  workerDisabled: string | undefined;
}): void {
  restoreEnv("REDIS_URL", saved.redisUrl);
  restoreEnv("RENDERING_WORKER_DISABLED", saved.workerDisabled);
}

describe("module profile — platform SKU", () => {
  const previousProfile = process.env["UMBRACULUM_MODULE_PROFILE"];
  const savedRedis = disableRedisForProfileTests();
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
    restoreEnv("UMBRACULUM_MODULE_PROFILE", previousProfile);
    restoreRedisAfterProfileTests(savedRedis);
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
    expect(collectModulePromptOverlayTexts().join("\n")).not.toMatch(/beerjson/i);
    expect(resolveRoutePromptOverlay("recipes")).toBeUndefined();
  });

  it("does not expose brewery inventory route", async () => {
    const res = await app.inject({ method: "GET", url: "/inventory" });
    expect(res.statusCode).toBe(404);
  });
});

describe("module profile — reference default", () => {
  const previousProfile = process.env["UMBRACULUM_MODULE_PROFILE"];
  const savedRedis = disableRedisForProfileTests();
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
    restoreEnv("UMBRACULUM_MODULE_PROFILE", previousProfile);
    restoreRedisAfterProfileTests(savedRedis);
  });

  it("registers brewery module metadata by default", () => {
    const codes = listRegisteredModules().map((m) => m.code);
    expect(codes).toContain("brewery");
  });
});
