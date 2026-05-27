/**
 * RFC-0007 async render-job client (web + native + Node).
 * Uses Zod schemas from @umbraculum/contracts; no PDF/XLSX libraries on the client.
 */
import {
  RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema,
  RenderJobSubmitResponseSchema,
} from "@umbraculum/contracts";

import type { ApiClient } from "./client.js";

const POLL_INTERVAL_MS = 50;
const POLL_TIMEOUT_MS = 15_000;

export type RenderJobPhase = "idle" | "submitting" | "polling" | "ready" | "error";

/** Prefix relative artifact paths for Next.js `/api` proxy (web). */
export function toWebArtifactUrl(signedUrl: string, apiBaseUrl?: string): string {
  if (signedUrl.startsWith("/api/")) return signedUrl;
  if (signedUrl.startsWith("/rendering/")) return `/api${signedUrl}`;
  if (signedUrl.startsWith("/") && apiBaseUrl) {
    const base = apiBaseUrl.replace(/\/+$/, "");
    return `${base}${signedUrl.startsWith("/api") ? signedUrl : `/api${signedUrl}`}`;
  }
  return signedUrl;
}

/** Resolve download URL for native (absolute) or web (proxied). */
export function resolveArtifactDownloadUrl(
  signedUrl: string,
  options?: { platform?: "web" | "native"; apiBaseUrl?: string },
): string {
  if (options?.platform === "web") {
    return toWebArtifactUrl(signedUrl);
  }
  if (signedUrl.startsWith("http://") || signedUrl.startsWith("https://")) {
    return signedUrl;
  }
  const base = options?.apiBaseUrl?.replace(/\/+$/, "") ?? "";
  if (!base) return signedUrl;
  if (signedUrl.startsWith("/api/")) return `${base}${signedUrl.slice(4)}`;
  if (signedUrl.startsWith("/")) return `${base}${signedUrl}`;
  return signedUrl;
}

export async function submitRenderJob(
  client: ApiClient,
  postUrl: string,
  body?: Record<string, unknown>,
): Promise<{ jobId: string }> {
  const res = await client.post(postUrl, body ?? {});
  if (res.status !== 202) {
    const detail = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    throw new Error(detail || `Render job submit failed (${res.status})`);
  }
  const parsed = RenderJobSubmitResponseSchema.parse(res.data);
  return { jobId: parsed.job.id };
}

export async function pollRenderJobUntilSucceeded(
  client: ApiClient,
  jobId: string,
): Promise<void> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastStatus = "";
  while (Date.now() < deadline) {
    const res = await client.get(`/api/rendering/jobs/${encodeURIComponent(jobId)}`);
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

export async function fetchRenderJobDownloadUrl(
  client: ApiClient,
  jobId: string,
  options?: { platform?: "web" | "native"; apiBaseUrl?: string },
): Promise<string> {
  const res = await client.get(`/api/rendering/jobs/${encodeURIComponent(jobId)}/result`);
  if (res.status !== 200) {
    throw new Error(`Render job result failed (${res.status})`);
  }
  const body = RenderJobResultResponseSchema.parse(res.data);
  return resolveArtifactDownloadUrl(body.signedUrl, options);
}

/** Submit async render job, poll to success, return download URL. */
export async function runAsyncRenderJobExport(
  client: ApiClient,
  postUrl: string,
  options?: {
    body?: Record<string, unknown>;
    platform?: "web" | "native";
    apiBaseUrl?: string;
  },
): Promise<string> {
  const { jobId } = await submitRenderJob(client, postUrl, options?.body);
  await pollRenderJobUntilSucceeded(client, jobId);
  const downloadOpts: { platform?: "web" | "native"; apiBaseUrl?: string } = {};
  if (options?.platform !== undefined) downloadOpts.platform = options.platform;
  if (options?.apiBaseUrl !== undefined) downloadOpts.apiBaseUrl = options.apiBaseUrl;
  return fetchRenderJobDownloadUrl(client, jobId, downloadOpts);
}
