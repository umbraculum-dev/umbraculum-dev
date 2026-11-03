import type { ApiResponse } from "./client.js";

/**
 * Build a short, UI-safe message from a non-2xx ApiResponse.
 *
 * Nginx HTML error pages (502 Bad Gateway with MSIE/Chrome "friendly error"
 * padding comments) must never be dumped into ErrorBox via String(err).
 *
 * Dev recovery when status is 502 after ci-parity / archive runs:
 * `docker compose restart api` then `npm run smoke:stack` (see AGENTS.md —
 * tsx can crash on package unlink mid-relink while nginx still returns 502).
 */
export function messageFromApiResponse(res: ApiResponse): string {
  const data = res.data;
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (/^<!DOCTYPE html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
      const title = trimmed.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
      const h1 = trimmed.match(/<h1>([^<]*)<\/h1>/i)?.[1]?.trim();
      const label = title || h1 || "upstream error";
      return `API unavailable (${res.status}): ${label}`;
    }
    if (trimmed.length > 500) {
      return `API request failed (${res.status})`;
    }
    return trimmed || `API request failed (${res.status})`;
  }
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    const message = rec["message"];
    if (typeof message === "string" && message.trim()) return message.trim();
    const error = rec["error"];
    if (typeof error === "string" && error.trim()) return error.trim();
  }
  try {
    const json = JSON.stringify(data);
    if (json && json !== "null" && json !== "{}") return json;
  } catch {
    // ignore
  }
  return `API request failed (${res.status})`;
}

/** Non-2xx API response from a typed facade call. */
export class ApiClientError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(res: ApiResponse) {
    super(messageFromApiResponse(res));
    this.name = "ApiClientError";
    this.status = res.status;
    this.body = res.data;
  }
}
