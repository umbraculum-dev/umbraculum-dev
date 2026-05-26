import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CategoryGetResponseSchema,
  CategoryListResponseSchema,
} from "@umbraculum/pim-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("pim categories — read path (Phase B)", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let categoryAId = "";

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

    await app.prisma.pimCategory.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });

    const categoryA = await app.prisma.pimCategory.create({
      data: {
        workspaceId: workspaceA,
        code: "beer.ipa",
        label: "IPA",
        sortOrder: 1,
      },
    });
    categoryAId = categoryA.id;

    await app.prisma.pimCategory.create({
      data: {
        workspaceId: workspaceB,
        code: "beer.ipa",
        label: "Workspace B IPA",
        sortOrder: 1,
      },
    });
  });

  afterAll(async () => {
    await app.prisma.pimCategory.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  describe("GET /pim/categories", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({ method: "GET", url: "/pim/categories" });
      expect(res.statusCode).toBe(401);
      expect(res.json()).toEqual({
        ok: false,
        error: { code: "missing_session", message: "Not authenticated" },
      });
    });

    it("lists categories and tree for the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/categories",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = CategoryListResponseSchema.parse(res.json());
      expect(body.items).toHaveLength(1);
      expect(body.items[0]?.code).toBe("beer.ipa");
      expect(body.items[0]?.workspaceId).toBe(workspaceA);
      expect(body.items[0]?.label).toBe("IPA");
      expect(body.tree).toHaveLength(1);
      expect(body.tree[0]?.code).toBe("beer.ipa");
      expect(body.tree[0]?.children).toEqual([]);
    });

    it("L2 cross-workspace isolation: workspace B sees only its own categories", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/categories",
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(200);
      const body = CategoryListResponseSchema.parse(res.json());
      expect(body.items).toHaveLength(1);
      expect(body.items[0]?.workspaceId).toBe(workspaceB);
      expect(body.items[0]?.label).toBe("Workspace B IPA");
      expect(
        body.items.every((c) => c.workspaceId === workspaceB),
      ).toBe(true);
    });
  });

  describe("GET /pim/categories/:categoryId", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/categories/${categoryAId}`,
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns the category by id in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/categories/${categoryAId}`,
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = CategoryGetResponseSchema.parse(res.json());
      expect(body.item.id).toBe(categoryAId);
      expect(body.item.workspaceId).toBe(workspaceA);
      expect(body.item.code).toBe("beer.ipa");
    });

    it("returns 404 when the id is not present in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/categories/00000000-0000-0000-0000-000000000000",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(404);
      const body = res.json();
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("category_not_found");
    });

    it("L2 cross-workspace isolation: workspace B cannot fetch workspace A category by id", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/categories/${categoryAId}`,
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(404);
      expect(res.json().error.code).toBe("category_not_found");
    });

    it("L2 cross-workspace isolation: workspace A cannot reach workspace B-only category by id", async () => {
      const bOnly = await app.prisma.pimCategory.create({
        data: {
          workspaceId: workspaceB,
          code: "B-ONLY-CAT",
          label: "Workspace-B-only Category",
          sortOrder: 0,
        },
      });
      try {
        const res = await app.inject({
          method: "GET",
          url: `/pim/categories/${bOnly.id}`,
          headers: { cookie: cookieA },
        });
        expect(res.statusCode).toBe(404);
        expect(res.json().error.code).toBe("category_not_found");
      } finally {
        await app.prisma.pimCategory.delete({ where: { id: bOnly.id } });
      }
    });
  });
});
