import {
  cookieAuth,
  createApiClient,
  type FetchLike,
} from "@umbraculum/api-client";

import {
  emitAuthExpiredIfNeeded,
  markSessionLoggedOut,
  markSessionValidFromAuthEndpoint,
} from "./sessionAuthUx";

function requestPath(url: string): string {
  if (url.startsWith("/")) return url;
  try {
    return new URL(url, "http://localhost").pathname;
  } catch {
    return url;
  }
}

const sessionAwareFetch: FetchLike = async (url, init) => {
  const res = await fetch(url, init);
  const method = (init?.method ?? "GET").toUpperCase();
  const path = requestPath(url);

  emitAuthExpiredIfNeeded(res.status, path, method);
  markSessionValidFromAuthEndpoint(path, method, res.ok);
  markSessionLoggedOut(path, method);

  return res;
};

export function webPlatformApiClient() {
  return createApiClient("", cookieAuth(), { fetch: sessionAwareFetch });
}
