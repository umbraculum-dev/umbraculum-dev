import { describe, expect, it, vi } from "vitest";

import {
  resolveEntitlementEnforcementMode,
  EntitlementsService,
} from "../services/entitlementsService.js";

describe("EntitlementsService", () => {
  it("tier_only mode always grants addon entitlement without DB lookup", async () => {
    const svc = new EntitlementsService({} as never, "tier_only");
    expect(svc.getEnforcementMode()).toBe("tier_only");
    await expect(svc.hasActiveAddon("ws-1", "automation_module")).resolves.toBe(true);
  });

  it("UMBRACULUM_GRANT_ALL_ADDONS=1 skips DB lookup even in tier_and_addons mode", async () => {
    const prev = process.env["UMBRACULUM_GRANT_ALL_ADDONS"];
    process.env["UMBRACULUM_GRANT_ALL_ADDONS"] = "1";
    const svc = new EntitlementsService(
      {
        workspaceBillingAddon: {
          findFirst: () => Promise.reject(new Error("should not query")),
        },
      } as never,
      "tier_and_addons",
    );
    await expect(svc.hasActiveAddon("ws-1", "automation_module")).resolves.toBe(true);
    if (prev === undefined) delete process.env["UMBRACULUM_GRANT_ALL_ADDONS"];
    else process.env["UMBRACULUM_GRANT_ALL_ADDONS"] = prev;
  });

  it("tier_and_addons denies brewery_module when brewery vertical is not installed", async () => {
    const prev = process.env["UMBRACULUM_MODULE_PROFILE"];
    process.env["UMBRACULUM_MODULE_PROFILE"] = "platform";
    const findFirst = vi.fn();
    const svc = new EntitlementsService(
      { workspaceBillingAddon: { findFirst } } as never,
      "tier_and_addons",
    );
    await expect(svc.hasActiveAddon("ws-1", "brewery_module")).resolves.toBe(false);
    expect(findFirst).not.toHaveBeenCalled();
    if (prev === undefined) delete process.env["UMBRACULUM_MODULE_PROFILE"];
    else process.env["UMBRACULUM_MODULE_PROFILE"] = prev;
  });

  it("tier_and_addons mode queries WorkspaceBillingAddon rows", async () => {
    const prev = process.env["UMBRACULUM_MODULE_PROFILE"];
    process.env["UMBRACULUM_MODULE_PROFILE"] = "reference";
    const findFirst = vi.fn().mockResolvedValue({ id: "addon-1" });
    const svc = new EntitlementsService(
      { workspaceBillingAddon: { findFirst } } as never,
      "tier_and_addons",
    );
    await expect(svc.hasActiveAddon("ws-1", "brewery_module")).resolves.toBe(true);
    expect(findFirst).toHaveBeenCalledWith({
      where: { workspaceId: "ws-1", addonCode: "brewery_module", status: "active" },
      select: { id: true },
    });
    if (prev === undefined) delete process.env["UMBRACULUM_MODULE_PROFILE"];
    else process.env["UMBRACULUM_MODULE_PROFILE"] = prev;
  });

  it("tier_and_addons mode denies when no active row", async () => {
    const prev = process.env["UMBRACULUM_MODULE_PROFILE"];
    process.env["UMBRACULUM_MODULE_PROFILE"] = "reference";
    const svc = new EntitlementsService(
      { workspaceBillingAddon: { findFirst: vi.fn().mockResolvedValue(null) } } as never,
      "tier_and_addons",
    );
    await expect(svc.hasActiveAddon("ws-1", "brewery_module")).resolves.toBe(false);
    if (prev === undefined) delete process.env["UMBRACULUM_MODULE_PROFILE"];
    else process.env["UMBRACULUM_MODULE_PROFILE"] = prev;
  });
});

describe("resolveEntitlementEnforcementMode", () => {
  it("defaults to tier_only", () => {
    expect(resolveEntitlementEnforcementMode({})).toBe("tier_only");
  });

  it("reads ENTITLEMENTS_ENFORCEMENT_MODE=tier_and_addons", () => {
    expect(
      resolveEntitlementEnforcementMode({ ENTITLEMENTS_ENFORCEMENT_MODE: "tier_and_addons" }),
    ).toBe("tier_and_addons");
  });
});
