import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  AttributeSetGetResponseSchema,
  AttributeSetListResponseSchema,
} from "@umbraculum/pim-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("pim attribute sets — read path (Phase B)", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let setAId = "";

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

    await app.prisma.pimAttributeSet.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });

    const setA = await app.prisma.pimAttributeSet.create({
      data: {
        workspaceId: workspaceA,
        code: "beer-core",
        label: "Beer Core Attributes",
        attributeIds: ["attr-abv", "attr-ibu"],
      },
    });
    setAId = setA.id;

    await app.prisma.pimAttributeSet.create({
      data: {
        workspaceId: workspaceB,
        code: "beer-core",
        label: "Workspace B Beer Core",
        attributeIds: ["attr-abv"],
      },
    });
  });

  afterAll(async () => {
    await app.prisma.pimAttributeSet.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  describe("GET /pim/attribute-sets", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({ method: "GET", url: "/pim/attribute-sets" });
      expect(res.statusCode).toBe(401);
      expect(res.json()).toEqual({
        ok: false,
        error: { code: "missing_session", message: "Not authenticated" },
      });
    });

    it("lists attribute sets in the active workspace in `code asc` order", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/attribute-sets",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = AttributeSetListResponseSchema.parse(res.json());
      expect(body.items).toHaveLength(1);
      expect(body.items[0]?.code).toBe("beer-core");
      expect(body.items[0]?.workspaceId).toBe(workspaceA);
      expect(body.items[0]?.label).toBe("Beer Core Attributes");
      expect(body.items[0]?.attributeIds).toEqual(["attr-abv", "attr-ibu"]);
    });

    it("L2 cross-workspace isolation: workspace B sees only its own attribute sets", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/attribute-sets",
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(200);
      const body = AttributeSetListResponseSchema.parse(res.json());
      expect(body.items).toHaveLength(1);
      expect(body.items[0]?.workspaceId).toBe(workspaceB);
      expect(body.items[0]?.label).toBe("Workspace B Beer Core");
      expect(
        body.items.every((s) => s.workspaceId === workspaceB),
      ).toBe(true);
    });
  });

  describe("GET /pim/attribute-sets/:setId", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/attribute-sets/${setAId}`,
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns the attribute set by id in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/attribute-sets/${setAId}`,
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = AttributeSetGetResponseSchema.parse(res.json());
      expect(body.item.id).toBe(setAId);
      expect(body.item.workspaceId).toBe(workspaceA);
      expect(body.item.code).toBe("beer-core");
    });

    it("returns 404 when the id is not present in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/pim/attribute-sets/00000000-0000-0000-0000-000000000000",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(404);
      const body = res.json();
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("attribute_set_not_found");
    });

    it("L2 cross-workspace isolation: workspace B cannot fetch workspace A attribute set by id", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/pim/attribute-sets/${setAId}`,
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(404);
      expect(res.json().error.code).toBe("attribute_set_not_found");
    });

    it("L2 cross-workspace isolation: workspace A cannot reach workspace B-only attribute set by id", async () => {
      const bOnly = await app.prisma.pimAttributeSet.create({
        data: {
          workspaceId: workspaceB,
          code: "B-ONLY-SET",
          label: "Workspace-B-only Set",
          attributeIds: [],
        },
      });
      try {
        const res = await app.inject({
          method: "GET",
          url: `/pim/attribute-sets/${bOnly.id}`,
          headers: { cookie: cookieA },
        });
        expect(res.statusCode).toBe(404);
        expect(res.json().error.code).toBe("attribute_set_not_found");
      } finally {
        await app.prisma.pimAttributeSet.delete({ where: { id: bOnly.id } });
      }
    });
  });
});
