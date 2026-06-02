import type { ApiClient, ApiResponse } from "../client.js";
import { ApiClientError } from "../errors.js";

export function assertOk(res: ApiResponse, expectedStatus = 200): void {
  if (res.status !== expectedStatus || !res.ok) {
    throw new ApiClientError(res);
  }
}

export async function getParsed<T>(
  client: ApiClient,
  path: string,
  parse: (data: unknown) => T,
  expectedStatus = 200,
): Promise<T> {
  const res = await client.get(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

export async function postParsed<T>(
  client: ApiClient,
  path: string,
  body: unknown,
  parse: (data: unknown) => T,
  expectedStatus = 200,
): Promise<T> {
  const res = await client.post(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

export async function putParsed<T>(
  client: ApiClient,
  path: string,
  body: unknown,
  parse: (data: unknown) => T,
  expectedStatus = 200,
): Promise<T> {
  const res = await client.put(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

export async function patchParsed<T>(
  client: ApiClient,
  path: string,
  body: unknown,
  parse: (data: unknown) => T,
  expectedStatus = 200,
): Promise<T> {
  const res = await client.patch(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

export async function deleteParsed<T>(
  client: ApiClient,
  path: string,
  parse: (data: unknown) => T,
  expectedStatus = 200,
): Promise<T> {
  const res = await client.delete(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

/** GET whose body is raw bytes (BeerJSON export, etc.) — not JSON. */
export async function getBytesParsed(
  client: ApiClient,
  path: string,
  parse: (data: unknown) => Buffer,
  expectedStatus = 200,
): Promise<Buffer> {
  const res = await client.get(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
