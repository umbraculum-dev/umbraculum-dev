import type { AuthMeResponse } from "@umbraculum/contracts";

import { ApiClientError, getAuthMe } from "@umbraculum/api-client";

import { webPlatformApiClient } from "./webApiClient";

export type FetchAuthMeResult =
  | { ok: true; status: number; data: AuthMeResponse }
  | { ok: false; status: number; data: unknown };

/** Typed auth/me; session-expired UX runs via webPlatformApiClient session fetch. */
export async function fetchAuthMe(): Promise<FetchAuthMeResult> {
  try {
    const me = await getAuthMe(webPlatformApiClient());
    return { ok: true, status: 200, data: me };
  } catch (err) {
    if (err instanceof ApiClientError) {
      return { ok: false, status: err.status, data: err.body };
    }
    throw err;
  }
}
