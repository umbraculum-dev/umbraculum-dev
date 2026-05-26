import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema,
  RenderJobSubmitResponseSchema,
} from "@umbraculum/contracts";
import { listRegisteredDocumentTemplates } from "@umbraculum/module-sdk";

import { buildApp } from "../app.js";
import {
  PIM_PRODUCT_CATALOG_CSV_TEMPLATE_REF,
  PimProductCatalogFeedDataSchema,
} from "../modules/pim/documentTemplates.js";
import { createSessionForTestUser } from "./helpers/session.js";

async function waitForSucceeded(input: {
  readonly app: ReturnType<typeof buildApp>;
  readonly cookie: string;
  readonly jobId: string;
}) {
  const deadline = Date.now() + 5_000;
  let lastStatus = "";
  while (Date.now() < deadline) {
    const res = await input.app.inject({
      method: "GET",
      url: `/rendering/jobs/${input.jobId}`,
      headers: { cookie: input.cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = RenderJobStatusResponseSchema.parse(res.json());
    lastStatus = body.job.status;
    if (body.job.status === "succeeded") return body;
    if (body.job.status === "failed") {
      throw new Error(`render job failed: ${body.job.error?.code ?? "unknown"}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`render job did not succeed before timeout; last status=${lastStatus}`);
}

async function submitAndDownloadFeed(input: {
  readonly app: ReturnType<typeof buildApp>;
  readonly cookie: string;
}) {
  const submit = await input.app.inject({
    method: "POST",
    url: "/pim/channel-feeds/product-catalog-csv/jobs",
    headers: { cookie: input.cookie },
  });
  expect(submit.statusCode).toBe(202);
  const submitted = RenderJobSubmitResponseSchema.parse(submit.json());
  await waitForSucceeded({
    app: input.app,
    cookie: input.cookie,
    jobId: submitted.job.id,
  });

  const result = await input.app.inject({
    method: "GET",
    url: `/rendering/jobs/${submitted.job.id}/result`,
    headers: { cookie: input.cookie },
  });
  expect(result.statusCode).toBe(200);
  const resultBody = RenderJobResultResponseSchema.parse(result.json());

  const download = await input.app.inject({
    method: "GET",
    url: resultBody.signedUrl,
  });
  expect(download.statusCode).toBe(200);
  return { submitted, csv: download.body, headers: download.headers };
}

describe("pim channel feeds — product catalog CSV", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let noWorkspaceCookie = "";

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

    await app.prisma.renderJob.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.pimProduct.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });

    const activeA = await app.prisma.pimProduct.create({
      data: {
        workspaceId: workspaceA,
        sku: "PIM-FEED-A-01",
        name: "Workspace A Exportable Product",
        description: "A product ready for channel feeds",
        status: "active",
      },
    });
    await app.prisma.pimVariant.create({
      data: {
        productId: activeA.id,
        sku: "PIM-FEED-A-01-500",
        name: "Workspace A 500ml Variant",
        attributeValues: {
          package_size: { type: "string", value: "500ml" },
        },
      },
    });
    await app.prisma.pimProduct.create({
      data: {
        workspaceId: workspaceA,
        sku: "PIM-FEED-A-DRAFT",
        name: "Workspace A Draft Product",
        status: "draft",
      },
    });
    await app.prisma.pimProduct.create({
      data: {
        workspaceId: workspaceB,
        sku: "PIM-FEED-B-01",
        name: "Workspace B Exportable Product",
        status: "active",
      },
    });
  });

  afterAll(async () => {
    await app.prisma.renderJob.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.pimProduct.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  it("registers the product-catalog CSV document template", () => {
    expect(listRegisteredDocumentTemplates()).toContainEqual({
      moduleCode: "pim",
      ref: PIM_PRODUCT_CATALOG_CSV_TEMPLATE_REF,
      kind: "csv",
    });
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/pim/channel-feeds/product-catalog-csv/jobs",
    });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_session", message: "Not authenticated" },
    });
  });

  it("returns 401 when the session has no active workspace", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/pim/channel-feeds/product-catalog-csv/jobs",
      headers: { cookie: noWorkspaceCookie },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe("missing_active_workspace");
  });

  it("returns 400 for invalid feed visibility", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/pim/channel-feeds/product-catalog-csv/jobs",
      headers: { cookie: cookieA },
      payload: { visibility: "private" },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error?.code).toBe("validation_error");
    const issues = body.error?.details?.issues;
    expect(Array.isArray(issues)).toBe(true);
    expect(issues[0]?.instancePath).toBe("/visibility");
    expect(issues[0]?.keyword).toBe("invalid_value");
  });

  it("submits and renders the active product catalog as a CSV artifact", async () => {
    const { submitted, csv, headers } = await submitAndDownloadFeed({ app, cookie: cookieA });

    expect(submitted.job.templateRef).toBe(PIM_PRODUCT_CATALOG_CSV_TEMPLATE_REF);
    expect(submitted.job.kind).toBe("csv");
    expect(String(headers["content-type"] ?? "")).toContain("text/csv");
    expect(String(headers["content-disposition"] ?? "")).toContain("attachment");
    expect(csv).toContain("product_sku");
    expect(csv).toContain("PIM-FEED-A-01");
    expect(csv).toContain("Workspace A 500ml Variant");
    expect(csv).toContain("package_size");
    expect(csv).not.toContain("PIM-FEED-A-DRAFT");
    expect(csv).not.toContain("PIM-FEED-B-01");
  });

  it("L2 isolation: another workspace gets only its own feed rows", async () => {
    const { csv } = await submitAndDownloadFeed({ app, cookie: cookieB });

    expect(csv).toContain("PIM-FEED-B-01");
    expect(csv).not.toContain("PIM-FEED-A-01");
    expect(csv).not.toContain(workspaceA);
    expect(csv).toContain(workspaceB);
  });
});

describe("pim product-catalog feed schema", () => {
  it("reports structured issue paths for invalid product rows", () => {
    const parsed = PimProductCatalogFeedDataSchema.safeParse({
      generatedAt: "2026-05-25T20:00:00.000Z",
      workspaceId: "workspace-a",
      products: [
        {
          id: "product-a",
          sku: "PIM-FEED-A-01",
          name: "Workspace A Product",
          description: null,
          status: "ready",
          variants: [],
        },
      ],
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(["products", 0, "status"]);
    expect(parsed.error?.issues[0]?.code).toBe("invalid_value");
  });
});
