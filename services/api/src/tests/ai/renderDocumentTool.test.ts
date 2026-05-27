import { describe, expect, it, vi } from "vitest";
import type { RenderJobStatus } from "@umbraculum/contracts";

import { InMemoryAiToolRegistry } from "../../services/ai/toolRegistry.js";
import { registerRenderingTools } from "../../services/ai/tools/rendering/index.js";
import { createRenderDocumentTool } from "../../services/ai/tools/rendering/renderDocument.js";
import type { RenderingJobService } from "../../services/rendering/renderingJobService.js";

const queuedJob: RenderJobStatus = {
  id: "render-job-1",
  templateRef: "brewery:beerjson-export@v1",
  kind: "json",
  status: "queued",
  deliveryMode: "persist-to-media",
  requestedAt: "2026-05-25T00:00:00.000Z",
  startedAt: null,
  completedAt: null,
  artifactId: null,
  mediaAssetId: null,
  error: null,
};

function fakeRenderingJobs() {
  return {
    submit: vi.fn((_input: Parameters<RenderingJobService["submit"]>[0]) =>
      Promise.resolve({
        kind: "async" as const,
        job: queuedJob,
      }),
    ),
  } satisfies Pick<RenderingJobService, "submit">;
}

describe("render_document AI tool", () => {
  it("registers as a platform write tool", () => {
    const registry = new InMemoryAiToolRegistry();
    registerRenderingTools(registry, fakeRenderingJobs());

    const tool = registry.resolve("render_document");
    expect(tool?.scope).toBe("write");
    expect(tool?.description).toContain("canonical rendering pipeline");
  });

  it("submits an async rendering job using workspace context", async () => {
    const renderingJobs = fakeRenderingJobs();
    const tool = createRenderDocumentTool(renderingJobs);

    const result = await tool.handler(
      {
        templateRef: "brewery:beerjson-export@v1",
        kind: "json",
        data: { beerjson: { version: 1, recipes: [] } },
        delivery: { mode: "persist-to-media", visibility: "workspace" },
      },
      {
        userId: "user-1",
        workspaceId: "workspace-1",
        requestId: "request-1",
      },
    );

    expect(renderingJobs.submit).toHaveBeenCalledWith({
      userId: "user-1",
      workspaceId: "workspace-1",
      locale: "en",
      request: {
        templateRef: "brewery:beerjson-export@v1",
        kind: "json",
        data: { beerjson: { version: 1, recipes: [] } },
        delivery: { mode: "persist-to-media", visibility: "workspace" },
      },
    });
    expect(result).toMatchObject({
      jobId: "render-job-1",
      status: "queued",
      templateRef: "brewery:beerjson-export@v1",
      kind: "json",
      signedUrl: null,
    });
  });

  it("defaults delivery to workspace-scoped persisted media", async () => {
    const renderingJobs = fakeRenderingJobs();
    const tool = createRenderDocumentTool(renderingJobs);

    await tool.handler(
      {
        templateRef: "brewery:beerjson-export@v1",
        data: { beerjson: { version: 1, recipes: [] } },
      },
      {
        userId: "user-1",
        workspaceId: "workspace-1",
        requestId: "request-1",
      },
    );

    const submitted = renderingJobs.submit.mock.calls[0]?.[0];
    expect(submitted?.request.delivery).toEqual({
      mode: "persist-to-media",
      visibility: "workspace",
    });
  });

  it("submits MRP and CRP template refs through the platform write tool", async () => {
    const renderingJobs = fakeRenderingJobs();
    const tool = createRenderDocumentTool(renderingJobs);

    await tool.handler(
      {
        templateRef: "mrp:work-order-pdf@v1",
        kind: "pdf",
        data: {
          workspaceId: "workspace-1",
          productionOrderId: "po-1",
          preview: {
            productionOrder: {
              id: "po-1",
              workspaceId: "workspace-1",
              orderNumber: "MRP-1",
              status: "planned",
              sourceModule: "brewery",
              sourceRefId: "session-1",
              outputProductId: null,
              outputVariantId: null,
              quantity: 1,
              unit: "batch",
              plannedStartAt: null,
              dueAt: null,
              createdAt: "2026-05-26T12:00:00.000Z",
              updatedAt: "2026-05-26T12:00:00.000Z",
              lines: [],
            },
            operations: [],
            materialRequirements: [],
            operatorNotes: [],
          },
        },
      },
      { userId: "user-1", workspaceId: "workspace-1", requestId: "request-1" },
    );

    await tool.handler(
      {
        templateRef: "crp:capacity-load-xlsx@v1",
        kind: "xlsx",
        data: { workspaceId: "workspace-1", loadBuckets: [] },
      },
      { userId: "user-1", workspaceId: "workspace-1", requestId: "request-2" },
    );

    expect(renderingJobs.submit).toHaveBeenCalledTimes(2);
    expect(renderingJobs.submit.mock.calls[0]?.[0].request.templateRef).toBe(
      "mrp:work-order-pdf@v1",
    );
    expect(renderingJobs.submit.mock.calls[1]?.[0].request.templateRef).toBe(
      "crp:capacity-load-xlsx@v1",
    );
  });

  it("rejects stream-response delivery because AI tools return JSON metadata", async () => {
    const tool = createRenderDocumentTool(fakeRenderingJobs());

    await expect(
      tool.handler(
        {
          templateRef: "brewery:beerjson-export@v1",
          data: { beerjson: { version: 1, recipes: [] } },
          delivery: { mode: "stream-response" },
        },
        {
          userId: "user-1",
          workspaceId: "workspace-1",
          requestId: "request-1",
        },
      ),
    ).rejects.toThrow("persist-to-media delivery only");
  });
});
