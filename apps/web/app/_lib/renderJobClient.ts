import {
  cookieAuth,
  createApiClient,
  fetchRenderJobDownloadUrl as fetchRenderJobDownloadUrlCore,
  pollRenderJobUntilSucceeded as pollRenderJobUntilSucceededCore,
  runAsyncRenderJobExport as runAsyncRenderJobExportCore,
  submitRenderJob as submitRenderJobCore,
  toWebArtifactUrl,
  type RenderJobPhase,
} from "@umbraculum/api-client";

export type { RenderJobPhase };
export { toWebArtifactUrl };

function webApiClient() {
  return createApiClient("", cookieAuth());
}

export async function submitRenderJob(
  postUrl: string,
  body?: Record<string, unknown>,
): Promise<{ jobId: string }> {
  return submitRenderJobCore(webApiClient(), postUrl, body);
}

export async function pollRenderJobUntilSucceeded(jobId: string): Promise<void> {
  return pollRenderJobUntilSucceededCore(webApiClient(), jobId);
}

export async function fetchRenderJobDownloadUrl(jobId: string): Promise<string> {
  return fetchRenderJobDownloadUrlCore(webApiClient(), jobId, { platform: "web" });
}

/** Submit async render job, poll to success, return browser-ready download URL. */
export async function runAsyncRenderJobExport(
  postUrl: string,
  body?: Record<string, unknown>,
): Promise<string> {
  return runAsyncRenderJobExportCore(webApiClient(), postUrl, { body, platform: "web" });
}
