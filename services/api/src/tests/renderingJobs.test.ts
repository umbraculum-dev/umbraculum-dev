import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema,
  RenderJobSubmitResponseSchema,
} from "@umbraculum/contracts";
import { registerModule } from "@umbraculum/module-sdk";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

const TEMPLATE_REF = "rendering_test:sample@v1";
const FLAKY_TEMPLATE_REF = "rendering_test:flaky@v1";
const SampleTemplateSchema = z.object({ message: z.string().min(1) }).strict();
const flakyTemplateAttempts = new Map<string, number>();

registerModule(null, {
  code: "rendering_test",
  documentTemplates: [
    {
      kind: "json",
      ref: TEMPLATE_REF,
      schema: SampleTemplateSchema,
      async render(data) {
        const parsed = SampleTemplateSchema.parse(data);
        return Promise.resolve(
          new TextEncoder().encode(JSON.stringify({ ok: true, message: parsed.message })),
        );
      },
    },
    {
      kind: "json",
      ref: FLAKY_TEMPLATE_REF,
      schema: SampleTemplateSchema,
      retryPolicy: { maxAttempts: 2, backoffMs: 1 },
      async render(data) {
        const parsed = SampleTemplateSchema.parse(data);
        const attempts = (flakyTemplateAttempts.get(parsed.message) ?? 0) + 1;
        flakyTemplateAttempts.set(parsed.message, attempts);
        if (attempts === 1) {
          throw new Error("transient render failure");
        }
        return Promise.resolve(
          new TextEncoder().encode(JSON.stringify({ ok: true, attempts })),
        );
      },
    },
  ],
});

async function waitForSucceeded(input: {
  readonly app: ReturnType<typeof buildApp>;
  readonly cookie: string;
  readonly jobId: string;
}) {
  const deadline = Date.now() + 15_000;
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

describe("rendering jobs — route integration", () => {
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
  });

  afterAll(async () => {
    await app.prisma.renderJob.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  it("returns 401 for unauthenticated submit", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/rendering/jobs",
      payload: {
        templateRef: TEMPLATE_REF,
        data: { message: "hello" },
      },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe("missing_session");
  });

  it("returns 401 when the session has no active workspace", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/rendering/jobs",
      headers: { cookie: noWorkspaceCookie },
      payload: {
        templateRef: TEMPLATE_REF,
        data: { message: "hello" },
      },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe("missing_active_workspace");
  });

  it("rejects unknown templates", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/rendering/jobs",
      headers: { cookie: cookieA },
      payload: {
        templateRef: "rendering_test:missing@v1",
        data: { message: "hello" },
      },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe("render_template_not_found");
  });

  it("submits, processes, signs, and downloads an async render artifact", async () => {
    const submit = await app.inject({
      method: "POST",
      url: "/rendering/jobs",
      headers: { cookie: cookieA },
      payload: {
        templateRef: TEMPLATE_REF,
        kind: "json",
        data: { message: "hello" },
        delivery: { mode: "persist-to-media", visibility: "workspace" },
      },
    });
    expect(submit.statusCode).toBe(202);
    const submitted = RenderJobSubmitResponseSchema.parse(submit.json());
    expect(submitted.job.status).toBe("queued");
    expect(submitted.job.templateRef).toBe(TEMPLATE_REF);

    const succeeded = await waitForSucceeded({
      app,
      cookie: cookieA,
      jobId: submitted.job.id,
    });
    expect(succeeded.job.artifactId).toBeTruthy();

    const result = await app.inject({
      method: "GET",
      url: `/rendering/jobs/${submitted.job.id}/result`,
      headers: { cookie: cookieA },
    });
    expect(result.statusCode).toBe(200);
    const resultBody = RenderJobResultResponseSchema.parse(result.json());
    expect(resultBody.signedUrl).toContain("/rendering/artifacts/");

    const proxiedResult = await app.inject({
      method: "GET",
      url: `/rendering/jobs/${submitted.job.id}/result`,
      headers: { cookie: cookieA, "x-forwarded-prefix": "/api" },
    });
    expect(proxiedResult.statusCode).toBe(200);
    const proxiedResultBody = RenderJobResultResponseSchema.parse(proxiedResult.json());
    expect(proxiedResultBody.signedUrl).toContain("/api/rendering/artifacts/");

    const download = await app.inject({
      method: "GET",
      url: resultBody.signedUrl,
    });
    expect(download.statusCode).toBe(200);
    expect(String(download.headers["content-type"] ?? "")).toContain("application/json");
    expect(String(download.headers["content-disposition"] ?? "")).toContain("attachment");
    expect(download.body).toContain('"message":"hello"');
  });

  it(
    "retries a failed BullMQ attempt before marking the job failed",
    async () => {
    const message = `retry-${Date.now()}`;
    const submit = await app.inject({
      method: "POST",
      url: "/rendering/jobs",
      headers: { cookie: cookieA },
      payload: {
        templateRef: FLAKY_TEMPLATE_REF,
        kind: "json",
        data: { message },
        delivery: { mode: "persist-to-media", visibility: "workspace" },
      },
    });
    expect(submit.statusCode).toBe(202);
    const submitted = RenderJobSubmitResponseSchema.parse(submit.json());

    const succeeded = await waitForSucceeded({
      app,
      cookie: cookieA,
      jobId: submitted.job.id,
    });
    expect(succeeded.job.status).toBe("succeeded");
    expect(flakyTemplateAttempts.get(message)).toBe(2);

    const attempts = await app.prisma.renderJobAttempt.findMany({
      where: { jobId: submitted.job.id },
      orderBy: { attemptNumber: "asc" },
    });
    expect(attempts).toHaveLength(2);
    expect(attempts[0]?.error).toBeTruthy();
    expect(attempts[1]?.error).toBeNull();
  },
  20_000,
  );

  it("L2 isolation: another workspace cannot read or retrieve a job", async () => {
    const submit = await app.inject({
      method: "POST",
      url: "/rendering/jobs",
      headers: { cookie: cookieA },
      payload: {
        templateRef: TEMPLATE_REF,
        data: { message: "private" },
      },
    });
    expect(submit.statusCode).toBe(202);
    const submitted = RenderJobSubmitResponseSchema.parse(submit.json());

    const status = await app.inject({
      method: "GET",
      url: `/rendering/jobs/${submitted.job.id}`,
      headers: { cookie: cookieB },
    });
    expect(status.statusCode).toBe(404);
    expect(status.json().error.code).toBe("render_job_not_found");

    const result = await app.inject({
      method: "GET",
      url: `/rendering/jobs/${submitted.job.id}/result`,
      headers: { cookie: cookieB },
    });
    expect(result.statusCode).toBe(404);
    expect(result.json().error.code).toBe("render_job_not_found");

    await waitForSucceeded({
      app,
      cookie: cookieA,
      jobId: submitted.job.id,
    });
  });

  it("rejects tampered signed artifact URLs", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/rendering/artifacts/not-real?expires=1&signature=bad",
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("invalid_render_artifact_signature");
  });
});

describe("rendering jobs — queued cancellation", () => {
  let previousWorkerDisabled: string | undefined;
  let app: ReturnType<typeof buildApp> | null = null;
  let cookie = "";
  let workspaceId = "";

  beforeAll(async () => {
    previousWorkerDisabled = process.env['RENDERING_WORKER_DISABLED'];
    process.env['RENDERING_WORKER_DISABLED'] = "1";
    app = buildApp();
    await app.ready();
    const session = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookie = session.cookie;
    workspaceId = session.workspaceId;
  });

  afterAll(async () => {
    if (app) {
      await app.prisma.renderJob.deleteMany({ where: { workspaceId } });
      await app.close();
    }
    if (previousWorkerDisabled === undefined) {
      delete process.env['RENDERING_WORKER_DISABLED'];
    } else {
      process.env['RENDERING_WORKER_DISABLED'] = previousWorkerDisabled;
    }
  });

  it("cancels a queued job without adding a public cancelled status", async () => {
    if (!app) throw new Error("test app not initialized");
    const submit = await app.inject({
      method: "POST",
      url: "/rendering/jobs",
      headers: { cookie },
      payload: {
        templateRef: TEMPLATE_REF,
        data: { message: "cancel me" },
      },
    });
    expect(submit.statusCode).toBe(202);
    const submitted = RenderJobSubmitResponseSchema.parse(submit.json());

    const cancel = await app.inject({
      method: "POST",
      url: `/rendering/jobs/${submitted.job.id}/cancel`,
      headers: { cookie },
    });

    expect(cancel.statusCode).toBe(200);
    const body = RenderJobStatusResponseSchema.parse(cancel.json());
    expect(body.job.status).toBe("failed");
    expect(body.job.error?.code).toBe("render.cancelled");
  });
});
