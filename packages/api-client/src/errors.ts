import type { ApiResponse } from "./client.js";

/** Non-2xx API response from a typed facade call. */
export class ApiClientError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(res: ApiResponse) {
    const detail = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    super(detail || `API request failed (${res.status})`);
    this.name = "ApiClientError";
    this.status = res.status;
    this.body = res.data;
  }
}
