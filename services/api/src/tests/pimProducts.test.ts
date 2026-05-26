import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ProductGetResponseSchema,
  ProductListResponseSchema,
} from "@umbraculum/pim-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

/**
 * Phase B integration tests for the PIM products read path.
 *
 * Mirrors `automationVessels.test.ts` axes: 401 unauth, list happy path +
 * L2 list isolation, get-by-id happy path + 404 + two L2 get isolation pins.
 */
describe("pim products — read path (Phase B)", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let productAId = "";

  beforeAll(async () => {
    await app.ready();

    const sessionA = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookieA = sessionA.cookie;
    workspaceA = sessionA.workspaceId;

    const sessionB = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookieB = sessionB.cookie;
    workspaceB = sessionB.workspaceId;

    await app.prisma.pimProduct.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });

    const productA = await app.prisma.pimProduct.create({
      data: {
        workspaceId: workspaceA,
        sku: "PIM-A-01",
        name: "Workspace A Product",
        status: "active",
      },
    });
    productAId = productA.id;

    await app.prisma.pimProduct.create({
      data: {
        workspaceId: workspaceB,
        sku: "PIM-A-01",
        name: "Workspace B Product",
        status: "draft",
      },
    });
  });

  afterAll(async () => {
    await app.prisma.pimProduct.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  describe("GET /pim/products", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({ method: "GET", url: "/pim/products" });
      expect(res.statusCode).toBe(401);
      expect(res.json()).toEqual({
        ok: false,
        error: { code: "missing_session", message: "Not authenticated" },
      });
    });

    it("lists products in the active workspace in `sku asc` order", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/products",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = ProductListResponseSchema.parse(res.json());
      expect(body.items).toHaveLength(1);
      expect(body.items[0]?.sku).toBe("PIM-A-01");
      expect(body.items[0]?.workspaceId).toBe(workspaceA);
      expect(body.items[0]?.name).toBe("Workspace A Product");
      expect(body.items[0]?.status).toBe("active");
    });

    it("L2 cross-workspace isolation: workspace B sees only its own products", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/products",
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(200);
      const body = ProductListResponseSchema.parse(res.json());
      expect(body.items).toHaveLength(1);
      expect(body.items[0]?.workspaceId).toBe(workspaceB);
      expect(body.items[0]?.name).toBe("Workspace B Product");
      expect(
        body.items.every((p) => p.workspaceId === workspaceB),
      ).toBe(true);
    });
  });

  describe("GET /pim/products/:productId", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/products/${productAId}`,
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns the product by id in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/products/${productAId}`,
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = ProductGetResponseSchema.parse(res.json());
      expect(body.item.id).toBe(productAId);
      expect(body.item.workspaceId).toBe(workspaceA);
      expect(body.item.name).toBe("Workspace A Product");
    });

    it("returns 404 when the id is not present in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/products/00000000-0000-0000-0000-000000000000",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(404);
      const body = res.json();
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("product_not_found");
    });

    it("L2 cross-workspace isolation: workspace B cannot fetch workspace A product by id", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/products/${productAId}`,
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(404);
      expect(res.json().error.code).toBe("product_not_found");
    });

    it("L2 cross-workspace isolation: workspace A cannot reach workspace B-only product by id", async () => {
      const bOnly = await app.prisma.pimProduct.create({
        data: {
          workspaceId: workspaceB,
          sku: "B-ONLY",
          name: "Workspace-B-only Product",
          status: "draft",
        },
      });
      try {
        const res = await app.inject({
          method: "GET",
          url: `/pim/products/${bOnly.id}`,
          headers: { cookie: cookieA },
        });
        expect(res.statusCode).toBe(404);
        expect(res.json().error.code).toBe("product_not_found");
      } finally {
        await app.prisma.pimProduct.delete({ where: { id: bOnly.id } });
      }
    });
  });
});
