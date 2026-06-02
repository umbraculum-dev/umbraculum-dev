import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import {
  conflictsRenderJobsPath,
  getCapacityLoad,
  listResources,
  submitConflictsRenderJob,
} from "./planning.js";

describe("crp planning facades", () => {
  it("listResources parses list response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, items: [] })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listResources(client);
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/crp/resources",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("getCapacityLoad parses capacity load response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              item: { workspaceId: "w1", buckets: [] },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await getCapacityLoad(client);
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/crp/capacity-load",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("submitConflictsRenderJob POSTs render job", async () => {
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
                templateRef: "crp:conflict-report-pdf@v1",
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
    const res = await submitConflictsRenderJob(client);
    expect(res.jobId).toBe("job-1");
    expect(fetch).toHaveBeenCalledWith(
      `http://test${conflictsRenderJobsPath()}`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});
