import type { AuthMeResponse } from "@umbraculum/contracts";

import { ApiClientError, getAuthMe } from "@umbraculum/api-client";

import {
  emitAuthExpiredIfNeeded,
  markSessionValidFromAuthEndpoint,
} from "./sessionAuthUx";
import { webPlatformApiClient } from "./webApiClient";

const AUTH_ME_PATH = "/api/auth/me";

export type FetchAuthMeResult =
  | { ok: true; status: number; data: AuthMeResponse }
  | { ok: false; status: number; data: unknown };

/** Typed auth/me with the same session-expired UX as apiFetch. */
export async function fetchAuthMe(): Promise<FetchAuthMeResult> {
  try {
    const me = await getAuthMe(webPlatformApiClient());
    markSessionValidFromAuthEndpoint(AUTH_ME_PATH, "GET", true);
    return { ok: true, status: 200, data: me };
  } catch (err) {
    if (err instanceof ApiClientError) {
      emitAuthExpiredIfNeeded(err.status, AUTH_ME_PATH, "GET");
      return { ok: false, status: err.status, data: err.body };
    }
    throw err;
  }
}
