import {
  RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema,
  RenderJobSubmitResponseSchema,
} from "@umbraculum/contracts";

import { apiFetch } from "./apiClient.js";

const POLL_INTERVAL_MS = 50;
const POLL_TIMEOUT_MS = 15_000;

export type RenderJobPhase = "idle" | "submitting" | "polling" | "ready" | "error";

export function toWebArtifactUrl(signedUrl: string): string {
  if (signedUrl.startsWith("/api/")) return signedUrl;
  if (signedUrl.startsWith("/rendering/")) return `/api${signedUrl}`;
  return signedUrl;
}

export async function submitRenderJob(
  postUrl: string,
  body?: Record<string, unknown>,
): Promise<{ jobId: string }> {
  const res = await apiFetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (res.status !== 202) {
    const detail =
      typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    throw new Error(detail || `Render job submit failed (${res.status})`);
  }
  const parsed = RenderJobSubmitResponseSchema.parse(res.data);
  return { jobId: parsed.job.id };
}

export async function pollRenderJobUntilSucceeded(jobId: string): Promise<void> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastStatus = "";
  while (Date.now() < deadline) {
    const res = await apiFetch(`/api/rendering/jobs/${encodeURIComponent(jobId)}`);
    if (res.status !== 200) {
      throw new Error(`Render job status failed (${res.status})`);
    }
    const body = RenderJobStatusResponseSchema.parse(res.data);
    lastStatus = body.job.status;
    if (body.job.status === "succeeded") return;
    if (body.job.status === "failed") {
      throw new Error(body.job.error?.code ?? "render_job_failed");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`Render job timed out (last status=${lastStatus})`);
}

export async function fetchRenderJobDownloadUrl(jobId: string): Promise<string> {
  const res = await apiFetch(`/api/rendering/jobs/${encodeURIComponent(jobId)}/result`);
  if (res.status !== 200) {
    throw new Error(`Render job result failed (${res.status})`);
  }
  const body = RenderJobResultResponseSchema.parse(res.data);
  return toWebArtifactUrl(body.signedUrl);
}

/** Submit async render job, poll to success, return browser-ready download URL. */
export async function runAsyncRenderJobExport(
  postUrl: string,
  body?: Record<string, unknown>,
): Promise<string> {
  const { jobId } = await submitRenderJob(postUrl, body);
  await pollRenderJobUntilSucceeded(jobId);
  return fetchRenderJobDownloadUrl(jobId);
}
