import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  RenderJobResultResponseSchema,
  RenderJobSubmitRequestSchema,
  RenderJobStatusResponseSchema,
  parseRenderJobSubmitRequest,
} from "./renderJobs";

function expectFirstIssuePathStartsWith(
  value: unknown,
  expectedPathPrefix: ReadonlyArray<string | number>,
): void {
  let error: unknown;
  try {
    RenderJobSubmitRequestSchema.parse(value);
  } catch (e) {
    error = e;
  }
  if (!(error instanceof ZodError)) {
    throw new Error(
      "expected ZodError, got: " + (error === undefined ? "no throw" : String(error)),
    );
  }
  const path = error.issues[0]?.path ?? [];
  for (let i = 0; i < expectedPathPrefix.length; i += 1) {
    expect(path[i]).toBe(expectedPathPrefix[i]);
  }
}

function validJob() {
  return {
    id: "job-1",
    templateRef: "brewery:test@v1",
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
}

describe("parseRenderJobSubmitRequest", () => {
  it("accepts a persist-to-media render submit request", () => {
    const parsed = parseRenderJobSubmitRequest({
      templateRef: "brewery:test@v1",
      kind: "json",
      data: { hello: "world" },
      delivery: { mode: "persist-to-media", visibility: "workspace" },
    });

    expect(parsed.templateRef).toBe("brewery:test@v1");
    expect(parsed.delivery?.mode).toBe("persist-to-media");
  });

  it("accepts a stream-response render submit request", () => {
    const parsed = parseRenderJobSubmitRequest({
      templateRef: "brewery:test@v1",
      data: { hello: "world" },
      delivery: { mode: "stream-response" },
    });

    expect(parsed.delivery?.mode).toBe("stream-response");
  });

  it("rejects invalid render kinds", () => {
    expectFirstIssuePathStartsWith(
      {
        templateRef: "brewery:test@v1",
        kind: "exe",
        data: {},
      },
      ["kind"],
    );
  });

  it("rejects invalid delivery discriminants", () => {
    expectFirstIssuePathStartsWith(
      {
        templateRef: "brewery:test@v1",
        data: {},
        delivery: { mode: "carrier-pigeon" },
      },
      ["delivery", "mode"],
    );
  });
});

describe("rendering response schemas", () => {
  it("accepts job status responses", () => {
    const parsed = RenderJobStatusResponseSchema.parse({
      ok: true,
      job: validJob(),
    });

    expect(parsed.job.id).toBe("job-1");
  });

  it("accepts result responses with signed artifact URLs", () => {
    const parsed = RenderJobResultResponseSchema.parse({
      ok: true,
      job: { ...validJob(), status: "succeeded", artifactId: "artifact-1" },
      signedUrl: "/rendering/artifacts/artifact-1?expires=1&signature=sig",
      expiresAt: "2026-05-25T00:05:00.000Z",
    });

    expect(parsed.signedUrl).toContain("artifact-1");
  });
});
