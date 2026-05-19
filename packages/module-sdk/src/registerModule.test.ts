import { describe, expect, it, beforeEach } from "vitest";
import {
  clearModuleRegistryForTests,
  clearWebModuleRegistryForTests,
  ModuleCodeAlreadyRegisteredError,
  registerModule,
  registerWebModule,
} from "./index.js";

beforeEach(() => {
  clearModuleRegistryForTests();
  clearWebModuleRegistryForTests();
});

function fakeApp(): { get: () => void } {
  return {
    get() {
      return undefined;
    },
  };
}

describe("registerModule", () => {
  it("registers routes and records canonical module metadata", () => {
    const app = fakeApp();
    let mounted = false;

    const snapshot = registerModule(app, {
      code: "automation",
      prismaSchema: "automation",
      routes: [
        () => {
          mounted = true;
        },
      ],
    });

    expect(snapshot.code).toBe("automation");
    expect(snapshot.isCanonical).toBe(true);
    expect(snapshot.prismaSchema).toBe("automation");
    expect(mounted).toBe(true);
  });

  it("rejects duplicate module codes at boot", () => {
    const app = fakeApp();
    registerModule(app, { code: "wms" });

    expect(() => registerModule(app, { code: "wms" })).toThrow(ModuleCodeAlreadyRegisteredError);
  });

  it("allows tier-6 vertical codes alongside canonical codes", () => {
    const app = fakeApp();
    const brewery = registerModule(app, { code: "brewery" });
    const wms = registerModule(app, { code: "wms" });

    expect(brewery.isCanonical).toBe(false);
    expect(wms.isCanonical).toBe(true);
  });
});

describe("registerWebModule", () => {
  it("records web module code for a future (code)/ route group", () => {
    const web = registerWebModule({ code: "automation" });
    expect(web.code).toBe("automation");
  });
});
