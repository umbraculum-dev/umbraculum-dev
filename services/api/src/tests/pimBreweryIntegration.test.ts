import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ProductGetResponseSchema } from "@umbraculum/pim-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

/**
 * Phase D cross-module integration test for the canonical `pim` module
 * (RFC-0004 §7 step 1).
 *
 * Architectural claim under test: PIM composes cleanly alongside brewery
 * (pre-RFC-0002 flat-route layout) and the canonical β-layout siblings
 * (`automation`, `pim`) in the same Fastify app instance, and PIM reads
 * exhibit **reference-not-copy** semantics — a mutation through the data
 * layer is reflected by a subsequent read on the public HTTP surface
 * without any cached projection blocking it.
 *
 * Why this is "Option B" rather than the originally-planned Option A
 * (brewery `Recipe.pimProductId` FK, brewery-side join view reflecting the
 * mutated PIM product name): Option A requires a schema change to a
 * different module's surface (brewery Recipe) purely to demonstrate a
 * claim that PIM's own public surface already supports. Option B proves
 * the same architectural claim — module composition + reference semantics
 * — without touching the brewery schema.
 *
 * Option A is queued as tech debt: see
 * [`docs/design/canonical-pim-module-surface.md`](../../../../docs/design/canonical-pim-module-surface.md)
 * "Open work — Option A: real brewery↔PIM FK integration". It must be
 * set up when possible (e.g. when brewery Recipe schema is being modified
 * for adjacent reasons, or in a focused cross-module integration sprint).
 */
describe("pim ↔ brewery integration (Phase D, Option B)", () => {
  const app = buildApp();

  let cookie = "";
  let workspaceId = "";
  let productId = "";

  beforeAll(async () => {
    await app.ready();

    const session = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookie = session.cookie;
    workspaceId = session.workspaceId;

    await app.prisma.pimProduct.deleteMany({ where: { workspaceId } });

    const product = await app.prisma.pimProduct.create({
      data: {
        workspaceId,
        sku: "INTEG-001",
        name: "Original Name",
        status: "active",
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await app.prisma.pimProduct.deleteMany({ where: { workspaceId } });
    await app.close();
  });

  it("brewery + pim endpoints coexist in the same app instance (no route conflict, both workspace-scoped)", async () => {
    // Brewery (pre-RFC-0002 flat-route layout): GET /recipes — proves the
    // legacy route family is reachable when canonical modules are also
    // registered.
    const breweryRes = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie },
    });
    expect(breweryRes.statusCode).toBe(200);
    const breweryBody = breweryRes.json();
    expect(breweryBody.ok).toBe(true);
    expect(Array.isArray(breweryBody.recipes)).toBe(true);

    // PIM (canonical-module β-layout per RFC-0002): GET /pim/products —
    // proves the new module surface is reachable in the same app instance.
    const pimRes = await app.inject({
      method: "GET",
      url: "/pim/products",
      headers: { cookie },
    });
    expect(pimRes.statusCode).toBe(200);
    const pimBody = pimRes.json();
    expect(pimBody.ok).toBe(true);
    expect(Array.isArray(pimBody.items)).toBe(true);
    expect(pimBody.items.length).toBe(1);
    expect(pimBody.items[0].sku).toBe("INTEG-001");
  });

  it("pim read returns a fresh projection after a direct Prisma mutation (reference-not-copy semantics)", async () => {
    const initial = await app.inject({
      method: "GET",
      url: `/pim/products/${productId}`,
      headers: { cookie },
    });
    expect(initial.statusCode).toBe(200);
    expect(
      ProductGetResponseSchema.parse(initial.json()).item.name,
    ).toBe("Original Name");

    // Mutate through the data layer (simulating a write coming from any
    // future canonical-module consumer — write APIs are out of scope for
    // Phase A/B/C, so we use Prisma directly).
    await app.prisma.pimProduct.update({
      where: { id: productId },
      data: { name: "Mutated Name" },
    });

    const refreshed = await app.inject({
      method: "GET",
      url: `/pim/products/${productId}`,
      headers: { cookie },
    });
    expect(refreshed.statusCode).toBe(200);
    expect(
      ProductGetResponseSchema.parse(refreshed.json()).item.name,
    ).toBe("Mutated Name");
  });
});
