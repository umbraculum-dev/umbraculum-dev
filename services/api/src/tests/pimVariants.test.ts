import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  VariantGetResponseSchema,
  VariantListResponseSchema,
} from "@umbraculum/pim-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("pim variants — read path (Phase B)", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let productAId = "";
  let variantAId = "";
  let productBId = "";

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

    await app.prisma.pimVariant.deleteMany({
      where: {
        product: { workspaceId: { in: [workspaceA, workspaceB] } },
      },
    });
    await app.prisma.pimProduct.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });

    const productA = await app.prisma.pimProduct.create({
      data: {
        workspaceId: workspaceA,
        sku: "PROD-A",
        name: "Product A",
        status: "active",
      },
    });
    productAId = productA.id;

    const variantA = await app.prisma.pimVariant.create({
      data: {
        productId: productAId,
        sku: "VAR-A-01",
        name: "Variant A1",
        attributeValues: { color: { type: "string", value: "red" } },
      },
    });
    variantAId = variantA.id;

    const productB = await app.prisma.pimProduct.create({
      data: {
        workspaceId: workspaceB,
        sku: "PROD-B",
        name: "Product B",
        status: "draft",
      },
    });
    productBId = productB.id;

    await app.prisma.pimVariant.create({
      data: {
        productId: productBId,
        sku: "VAR-A-01",
        name: "Variant B1",
        attributeValues: {},
      },
    });
  });

  afterAll(async () => {
    await app.prisma.pimVariant.deleteMany({
      where: {
        product: { workspaceId: { in: [workspaceA, workspaceB] } },
      },
    });
    await app.prisma.pimProduct.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  describe("GET /pim/products/:productId/variants", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/products/${productAId}/variants`,
      });
      expect(res.statusCode).toBe(401);
      expect(res.json()).toEqual({
        ok: false,
        error: { code: "missing_session", message: "Not authenticated" },
      });
    });

    it("lists variants for a product in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/products/${productAId}/variants`,
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = VariantListResponseSchema.parse(res.json());
      expect(body.items).toHaveLength(1);
      expect(body.items[0]?.sku).toBe("VAR-A-01");
      expect(body.items[0]?.productId).toBe(productAId);
      expect(body.items[0]?.name).toBe("Variant A1");
    });

    it("L2 cross-workspace isolation: workspace B cannot list variants for workspace A product", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/products/${productAId}/variants`,
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(404);
      expect(res.json().error.code).toBe("product_not_found");
    });
  });

  describe("GET /pim/variants/:variantId", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/variants/${variantAId}`,
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns the variant by id in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/variants/${variantAId}`,
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = VariantGetResponseSchema.parse(res.json());
      expect(body.item.id).toBe(variantAId);
      expect(body.item.productId).toBe(productAId);
      expect(body.item.sku).toBe("VAR-A-01");
    });

    it("returns 404 when the id is not present in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/variants/00000000-0000-0000-0000-000000000000",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(404);
      const body = res.json();
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("variant_not_found");
    });

    it("L2 cross-workspace isolation: workspace B cannot fetch workspace A variant by id", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/variants/${variantAId}`,
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(404);
      expect(res.json().error.code).toBe("variant_not_found");
    });

    it("L2 cross-workspace isolation: workspace A cannot reach workspace B-only variant by id", async () => {
      const bOnlyVariant = await app.prisma.pimVariant.create({
        data: {
          productId: productBId,
          sku: "B-ONLY-VAR",
          name: "Workspace-B-only Variant",
          attributeValues: {},
        },
      });
      try {
        const res = await app.inject({
          method: "GET",
          url: `/pim/variants/${bOnlyVariant.id}`,
          headers: { cookie: cookieA },
        });
        expect(res.statusCode).toBe(404);
        expect(res.json().error.code).toBe("variant_not_found");
      } finally {
        await app.prisma.pimVariant.delete({ where: { id: bOnlyVariant.id } });
      }
    });
  });
});
