import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import {
  getWorkOrderPreview,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  submitWorkOrderRenderJob,
  workOrderRenderJobsPath,
} from "./workOrders.js";

const workOrderPreviewFixture = {
  productionOrder: {
    id: "o1",
    workspaceId: "w1",
    orderNumber: "PO-1",
    status: "planned",
    sourceModule: null,
    sourceRefId: null,
    outputProductId: null,
    outputVariantId: null,
    quantity: 10,
    unit: "bbl",
    plannedStartAt: null,
    dueAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lines: [],
  },
  operations: [],
  materialRequirements: [],
  operatorNotes: [],
};

describe("mrp workOrders facades", () => {
  it("getWorkOrderPreview parses preview", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(JSON.stringify({ ok: true, item: workOrderPreviewFixture })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await getWorkOrderPreview(client, "o1");
    expect(res.item.productionOrder.id).toBe("o1");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/mrp/work-orders/o1/preview",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("submitWorkOrderRenderJob POSTs render job", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 202,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              mode: "async",
              job: {
                id: "job-1",
                templateRef: MRP_WORK_ORDER_PDF_TEMPLATE_REF,
                kind: "pdf",
                status: "queued",
                deliveryMode: "persist-to-media",
                requestedAt: "2026-01-01T00:00:00.000Z",
                startedAt: null,
                completedAt: null,
                artifactId: null,
                mediaAssetId: null,
                error: null,
              },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await submitWorkOrderRenderJob(client, "o1", {
      templateRef: MRP_WORK_ORDER_PDF_TEMPLATE_REF,
    });
    expect(res.jobId).toBe("job-1");
    expect(fetch).toHaveBeenCalledWith(
      `http://test${workOrderRenderJobsPath("o1")}`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});
