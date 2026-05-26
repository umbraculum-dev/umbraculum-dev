import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  AttributeGetResponseSchema,
  AttributeListResponseSchema,
  AttributeSetGetResponseSchema,
  CategoryGetResponseSchema,
  MediaAssetRefGetResponseSchema,
  MediaAssetRefListResponseSchema,
  PimDeleteResponseSchema,
  ProductGetResponseSchema,
  ProductListResponseSchema,
  VariantGetResponseSchema,
} from "@umbraculum/pim-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("pim Phase E write and read-gap routes", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let noWorkspaceCookie = "";
  let productAId = "";
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

    const noWorkspace = await createSessionForTestUser(app, {
      activeWorkspace: false,
      role: "brewery_admin",
    });
    noWorkspaceCookie = noWorkspace.cookie;

    const productA = await app.prisma.pimProduct.create({
      data: {
        workspaceId: workspaceA,
        sku: "PHASE-E-A",
        name: "Phase E Product A",
        status: "draft",
      },
    });
    productAId = productA.id;

    const productB = await app.prisma.pimProduct.create({
      data: {
        workspaceId: workspaceB,
        sku: "PHASE-E-B",
        name: "Phase E Product B",
        status: "draft",
      },
    });
    productBId = productB.id;
  });

  afterAll(async () => {
    await app.prisma.pimProduct.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.pimAttribute.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.pimAttributeSet.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.pimCategory.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  it("creates, lists, patches, and deletes products in the active workspace", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/pim/products",
      headers: { cookie: cookieA },
      payload: { sku: "PHASE-E-CREATED", name: "Created Product" },
    });
    expect(create.statusCode).toBe(201);
    const created = ProductGetResponseSchema.parse(create.json()).item;
    expect(created.workspaceId).toBe(workspaceA);
    expect(created.status).toBe("draft");

    const list = await app.inject({
      method: "GET",
      url: "/pim/products",
      headers: { cookie: cookieA },
    });
    expect(list.statusCode).toBe(200);
    const listed = ProductListResponseSchema.parse(list.json());
    expect(listed.items.some((p) => p.id === created.id)).toBe(true);

    const patch = await app.inject({
      method: "PATCH",
      url: `/pim/products/${created.id}`,
      headers: { cookie: cookieA },
      payload: { name: "Updated Product", status: "active" },
    });
    expect(patch.statusCode).toBe(200);
    expect(ProductGetResponseSchema.parse(patch.json()).item.name).toBe("Updated Product");

    const remove = await app.inject({
      method: "DELETE",
      url: `/pim/products/${created.id}`,
      headers: { cookie: cookieA },
    });
    expect(remove.statusCode).toBe(200);
    expect(PimDeleteResponseSchema.parse(remove.json())).toEqual({ ok: true });
  });

  it("protects product writes with session, active-workspace, validation, and L2 checks", async () => {
    const unauth = await app.inject({
      method: "POST",
      url: "/pim/products",
      payload: { sku: "NOPE", name: "Nope" },
    });
    expect(unauth.statusCode).toBe(401);
    expect(unauth.json().error.code).toBe("missing_session");

    const noWorkspace = await app.inject({
      method: "POST",
      url: "/pim/products",
      headers: { cookie: noWorkspaceCookie },
      payload: { sku: "NO-WORKSPACE", name: "No Workspace" },
    });
    expect(noWorkspace.statusCode).toBe(401);
    expect(noWorkspace.json().error.code).toBe("missing_active_workspace");

    const invalid = await app.inject({
      method: "POST",
      url: "/pim/products",
      headers: { cookie: cookieA },
      payload: { sku: "", name: "Invalid" },
    });
    expect(invalid.statusCode).toBe(400);
    expect(invalid.json().error.code).toBe("validation_error");

    const crossWorkspace = await app.inject({
      method: "PATCH",
      url: `/pim/products/${productAId}`,
      headers: { cookie: cookieB },
      payload: { name: "Cross Workspace" },
    });
    expect(crossWorkspace.statusCode).toBe(404);
    expect(crossWorkspace.json().error.code).toBe("product_not_found");
  });

  it("writes variants only through products in the active workspace", async () => {
    const create = await app.inject({
      method: "POST",
      url: `/pim/products/${productAId}/variants`,
      headers: { cookie: cookieA },
      payload: {
        sku: "PHASE-E-VAR",
        name: "Phase E Variant",
        attributeValues: { color: { type: "string", value: "gold" } },
      },
    });
    expect(create.statusCode).toBe(201);
    const created = VariantGetResponseSchema.parse(create.json()).item;
    expect(created.productId).toBe(productAId);

    const invalid = await app.inject({
      method: "POST",
      url: `/pim/products/${productAId}/variants`,
      headers: { cookie: cookieA },
      payload: { sku: "", name: "Invalid" },
    });
    expect(invalid.statusCode).toBe(400);

    const crossWorkspace = await app.inject({
      method: "PATCH",
      url: `/pim/variants/${created.id}`,
      headers: { cookie: cookieB },
      payload: { name: "Cross Workspace" },
    });
    expect(crossWorkspace.statusCode).toBe(404);
    expect(crossWorkspace.json().error.code).toBe("variant_not_found");

    const patch = await app.inject({
      method: "PATCH",
      url: `/pim/variants/${created.id}`,
      headers: { cookie: cookieA },
      payload: { name: "Updated Variant" },
    });
    expect(patch.statusCode).toBe(200);
    expect(VariantGetResponseSchema.parse(patch.json()).item.name).toBe("Updated Variant");

    const remove = await app.inject({
      method: "DELETE",
      url: `/pim/variants/${created.id}`,
      headers: { cookie: cookieA },
    });
    expect(remove.statusCode).toBe(200);
  });

  it("writes attribute sets with workspace isolation and response shape pins", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/pim/attribute-sets",
      headers: { cookie: cookieA },
      payload: { code: "base-phase-e", label: "Base Phase E", attributeIds: [] },
    });
    expect(create.statusCode).toBe(201);
    const created = AttributeSetGetResponseSchema.parse(create.json()).item;
    expect(created.workspaceId).toBe(workspaceA);

    const invalid = await app.inject({
      method: "POST",
      url: "/pim/attribute-sets",
      headers: { cookie: cookieA },
      payload: { code: "", label: "Invalid" },
    });
    expect(invalid.statusCode).toBe(400);

    const crossWorkspace = await app.inject({
      method: "PATCH",
      url: `/pim/attribute-sets/${created.id}`,
      headers: { cookie: cookieB },
      payload: { label: "Cross Workspace" },
    });
    expect(crossWorkspace.statusCode).toBe(404);
    expect(crossWorkspace.json().error.code).toBe("attribute_set_not_found");

    const patch = await app.inject({
      method: "PATCH",
      url: `/pim/attribute-sets/${created.id}`,
      headers: { cookie: cookieA },
      payload: { label: "Updated Base" },
    });
    expect(patch.statusCode).toBe(200);
    expect(AttributeSetGetResponseSchema.parse(patch.json()).item.label).toBe("Updated Base");

    const remove = await app.inject({
      method: "DELETE",
      url: `/pim/attribute-sets/${created.id}`,
      headers: { cookie: cookieA },
    });
    expect(remove.statusCode).toBe(200);
  });

  it("writes categories with workspace isolation and response shape pins", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/pim/categories",
      headers: { cookie: cookieA },
      payload: { code: "phase-e-category", label: "Phase E Category" },
    });
    expect(create.statusCode).toBe(201);
    const created = CategoryGetResponseSchema.parse(create.json()).item;
    expect(created.workspaceId).toBe(workspaceA);

    const invalid = await app.inject({
      method: "POST",
      url: "/pim/categories",
      headers: { cookie: cookieA },
      payload: { code: "", label: "Invalid" },
    });
    expect(invalid.statusCode).toBe(400);

    const crossWorkspace = await app.inject({
      method: "PATCH",
      url: `/pim/categories/${created.id}`,
      headers: { cookie: cookieB },
      payload: { label: "Cross Workspace" },
    });
    expect(crossWorkspace.statusCode).toBe(404);
    expect(crossWorkspace.json().error.code).toBe("category_not_found");

    const patch = await app.inject({
      method: "PATCH",
      url: `/pim/categories/${created.id}`,
      headers: { cookie: cookieA },
      payload: { label: "Updated Category" },
    });
    expect(patch.statusCode).toBe(200);
    expect(CategoryGetResponseSchema.parse(patch.json()).item.label).toBe("Updated Category");

    const remove = await app.inject({
      method: "DELETE",
      url: `/pim/categories/${created.id}`,
      headers: { cookie: cookieA },
    });
    expect(remove.statusCode).toBe(200);
  });

  it("adds attribute read and write surfaces with L2 isolation", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/pim/attributes",
      headers: { cookie: cookieA },
      payload: { code: "abv", type: "number", label: "ABV", required: true },
    });
    expect(create.statusCode).toBe(201);
    const created = AttributeGetResponseSchema.parse(create.json()).item;
    expect(created.workspaceId).toBe(workspaceA);

    const list = await app.inject({
      method: "GET",
      url: "/pim/attributes",
      headers: { cookie: cookieA },
    });
    expect(list.statusCode).toBe(200);
    expect(AttributeListResponseSchema.parse(list.json()).items.some((a) => a.id === created.id)).toBe(
      true,
    );

    const invalid = await app.inject({
      method: "POST",
      url: "/pim/attributes",
      headers: { cookie: cookieA },
      payload: { code: "bad", type: "lookup", label: "Bad" },
    });
    expect(invalid.statusCode).toBe(400);

    const crossWorkspace = await app.inject({
      method: "GET",
      url: `/pim/attributes/${created.id}`,
      headers: { cookie: cookieB },
    });
    expect(crossWorkspace.statusCode).toBe(404);
    expect(crossWorkspace.json().error.code).toBe("attribute_not_found");

    const patch = await app.inject({
      method: "PATCH",
      url: `/pim/attributes/${created.id}`,
      headers: { cookie: cookieA },
      payload: { label: "ABV %" },
    });
    expect(patch.statusCode).toBe(200);
    expect(AttributeGetResponseSchema.parse(patch.json()).item.label).toBe("ABV %");

    const remove = await app.inject({
      method: "DELETE",
      url: `/pim/attributes/${created.id}`,
      headers: { cookie: cookieA },
    });
    expect(remove.statusCode).toBe(200);
  });

  it("adds media asset ref read and write surfaces scoped through product ownership", async () => {
    const create = await app.inject({
      method: "POST",
      url: `/pim/products/${productAId}/media-asset-refs`,
      headers: { cookie: cookieA },
      payload: { mediaAssetId: "media-asset-1", role: "primary" },
    });
    expect(create.statusCode).toBe(201);
    const created = MediaAssetRefGetResponseSchema.parse(create.json()).item;
    expect(created.productId).toBe(productAId);

    const list = await app.inject({
      method: "GET",
      url: `/pim/products/${productAId}/media-asset-refs`,
      headers: { cookie: cookieA },
    });
    expect(list.statusCode).toBe(200);
    expect(
      MediaAssetRefListResponseSchema.parse(list.json()).items.some((m) => m.id === created.id),
    ).toBe(true);

    const invalid = await app.inject({
      method: "POST",
      url: `/pim/products/${productAId}/media-asset-refs`,
      headers: { cookie: cookieA },
      payload: { mediaAssetId: "media-asset-1", role: "hero" },
    });
    expect(invalid.statusCode).toBe(400);

    const crossWorkspaceProduct = await app.inject({
      method: "POST",
      url: `/pim/products/${productBId}/media-asset-refs`,
      headers: { cookie: cookieA },
      payload: { mediaAssetId: "media-asset-2", role: "gallery" },
    });
    expect(crossWorkspaceProduct.statusCode).toBe(404);
    expect(crossWorkspaceProduct.json().error.code).toBe("product_not_found");

    const crossWorkspaceGet = await app.inject({
      method: "GET",
      url: `/pim/media-asset-refs/${created.id}`,
      headers: { cookie: cookieB },
    });
    expect(crossWorkspaceGet.statusCode).toBe(404);
    expect(crossWorkspaceGet.json().error.code).toBe("media_asset_ref_not_found");

    const patch = await app.inject({
      method: "PATCH",
      url: `/pim/media-asset-refs/${created.id}`,
      headers: { cookie: cookieA },
      payload: { role: "gallery", sortOrder: 2 },
    });
    expect(patch.statusCode).toBe(200);
    expect(MediaAssetRefGetResponseSchema.parse(patch.json()).item.role).toBe("gallery");

    const remove = await app.inject({
      method: "DELETE",
      url: `/pim/media-asset-refs/${created.id}`,
      headers: { cookie: cookieA },
    });
    expect(remove.statusCode).toBe(200);
  });
});
