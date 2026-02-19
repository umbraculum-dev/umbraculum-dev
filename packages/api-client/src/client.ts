/**
 * Typed API client with pluggable auth.
 */

import type { AuthStrategy } from "./auth.js";

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
export function createApiClient(baseUrl: string, auth: AuthStrategy): ApiClient {
  const headers = (): Record<string, string> => ({
    "Content-Type": "application/json",
    ...auth.getHeaders?.(),
  });

  async function request(path: string, init: RequestInit): Promise<ApiResponse> {
    const url = joinPath(baseUrl, path);
    const res = await fetch(url, {
      ...init,
      credentials: auth.credentials ?? "same-origin",
      headers: {
        ...headers(),
        ...(init.headers as Record<string, string>),
      },
    });
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
