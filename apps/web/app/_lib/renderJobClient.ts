import {
  fetchRenderJobDownloadUrl as fetchRenderJobDownloadUrlCore,
  pollRenderJobUntilSucceeded as pollRenderJobUntilSucceededCore,
  runAsyncRenderJobExport as runAsyncRenderJobExportCore,
  submitRenderJob as submitRenderJobCore,
  toWebArtifactUrl,
  type RenderJobPhase,
} from "@umbraculum/api-client";

import { webPlatformApiClient } from "./webApiClient";

export type { RenderJobPhase };
export { toWebArtifactUrl };

export async function submitRenderJob(
  postUrl: string,
  body?: Record<string, unknown>,
): Promise<{ jobId: string }> {
  return submitRenderJobCore(webPlatformApiClient(), postUrl, body);
}

export async function pollRenderJobUntilSucceeded(jobId: string): Promise<void> {
  return pollRenderJobUntilSucceededCore(webPlatformApiClient(), jobId);
}

export async function fetchRenderJobDownloadUrl(jobId: string): Promise<string> {
  return fetchRenderJobDownloadUrlCore(webPlatformApiClient(), jobId, { platform: "web" });
}

/** Submit async render job, poll to success, return browser-ready download URL. */
export async function runAsyncRenderJobExport(
  postUrl: string,
  body?: Record<string, unknown>,
): Promise<string> {
  return runAsyncRenderJobExportCore(webPlatformApiClient(), postUrl, { body, platform: "web" });
}
