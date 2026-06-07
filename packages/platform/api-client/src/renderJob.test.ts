import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "./client.js";
import { resolveArtifactDownloadUrl, runAsyncRenderJobExport } from "./renderJob.js";

const validJob = (status: string) => ({
  id: "job-1",
  templateRef: "mrp:work-order-pdf@v1",
  kind: "pdf",
  status,
  deliveryMode: "persist-to-media",
  requestedAt: "2026-05-25T00:00:00.000Z",
  startedAt: null,
  completedAt: status === "succeeded" ? "2026-05-25T00:01:00.000Z" : null,
  artifactId: status === "succeeded" ? "artifact-1" : null,
  mediaAssetId: null,
  error: null,
});

describe("resolveArtifactDownloadUrl", () => {
  it("prefixes web rendering paths", () => {
    expect(resolveArtifactDownloadUrl("/rendering/artifacts/x", { platform: "web" })).toBe(
      "/api/rendering/artifacts/x",
    );
  });

  it("builds absolute native URLs", () => {
    expect(
      resolveArtifactDownloadUrl("/rendering/artifacts/x", {
        platform: "native",
        apiBaseUrl: "http://192.168.1.10:8080",
      }),
    ).toBe("http://192.168.1.10:8080/rendering/artifacts/x");
  });
});

describe("runAsyncRenderJobExport", () => {
  it("submits, polls, and returns download url", async () => {
    const fetch = vi.fn((url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "POST") {
        return Promise.resolve({
          ok: true,
          status: 202,
          text: () =>
            Promise.resolve(
              JSON.stringify({
                ok: true,
                mode: "async",
                job: validJob("queued"),
              }),
            ),
        });
      }
      if (url.includes("/result")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              JSON.stringify({
                ok: true,
                job: validJob("succeeded"),
                signedUrl: "/rendering/artifacts/out.pdf",
                expiresAt: "2026-05-25T00:05:00.000Z",
              }),
            ),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              job: validJob("succeeded"),
            }),
          ),
      });
    });

    const client = createApiClient("http://test", {
      getHeaders: () => ({ Authorization: "Bearer tok" }),
    }, { fetch });
    const url = await runAsyncRenderJobExport(client, "/api/mrp/work-orders/x/render-jobs", {
      platform: "native",
      apiBaseUrl: "http://test",
    });
    expect(url).toContain("out.pdf");
  });
});
