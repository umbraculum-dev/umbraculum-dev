/**
 * Typed API client with pluggable auth.
 */

import type { AuthStrategy } from "./auth.js";
import type { ApiRequestInit, FetchLike, FetchResponseLike } from "./fetchTypes.js";

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export interface ApiClient {
  get(path: string): Promise<ApiResponse>;
  post(path: string, body?: unknown): Promise<ApiResponse>;
  patch(path: string, body?: unknown): Promise<ApiResponse>;
  delete(path: string): Promise<ApiResponse>;
}

function joinPath(base: string, path: string): string {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return p ? `${b}/${p}` : b;
}

/**
 * Create an API client with the given base URL and auth strategy.
 */
export function createApiClient(
  baseUrl: string,
  auth: AuthStrategy,
  options?: {
    fetch?: FetchLike;
  }
): ApiClient {
  const headers = (): Record<string, string> => ({
    "Content-Type": "application/json",
    ...auth.getHeaders?.(),
  });

  const resolvedFetch = (() => {
    if (options?.fetch) return options.fetch;

    const f = (globalThis as unknown as { fetch?: unknown }).fetch;
    if (typeof f !== "function") {
      throw new Error("fetch is not available. Provide options.fetch when creating the API client.");
    }
    return f as unknown as FetchLike;
  })();

  async function request(path: string, init: ApiRequestInit): Promise<ApiResponse> {
    const url = joinPath(baseUrl, path);

    const creds = init.credentials ?? auth.credentials;
    const requestInit: ApiRequestInit = {
      ...init,
      headers: {
        ...headers(),
        ...(init.headers ?? {}),
      },
      ...(creds ? { credentials: creds } : {}),
    };

    const res: FetchResponseLike = await resolvedFetch(url, requestInit);
    const text = await res.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      // keep text
    }
    return { ok: res.ok, status: res.status, data };
  }

  return {
    get(path: string) {
      return request(path, { method: "GET" });
    },
    post(path: string, body?: unknown) {
      return request(path, {
        method: "POST",
        body: body != null ? JSON.stringify(body) : undefined,
      });
    },
    patch(path: string, body?: unknown) {
      return request(path, {
        method: "PATCH",
        body: body != null ? JSON.stringify(body) : undefined,
      });
    },
    delete(path: string) {
      return request(path, { method: "DELETE" });
    },
  };
}
