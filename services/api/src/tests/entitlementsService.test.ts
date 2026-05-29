import { describe, expect, it } from "vitest";

import { EntitlementsService } from "../services/entitlementsService.js";

describe("EntitlementsService", () => {
  it("tier_only mode always grants addon entitlement without DB lookup", async () => {
    const svc = new EntitlementsService({} as never, "tier_only");
    expect(svc.getEnforcementMode()).toBe("tier_only");
    await expect(svc.hasActiveAddon("ws-1", "automation_module")).resolves.toBe(true);
  });

  it("tier_and_addons mode denies until WorkspaceBillingAddon is implemented", async () => {
    const svc = new EntitlementsService({} as never, "tier_and_addons");
    await expect(svc.hasActiveAddon("ws-1", "automation_module")).resolves.toBe(false);
  });
});
