import { A as ApiResponse, a as ApiClient } from '../client-Dia82S7S.cjs';

/** Map OpenAPI path keys (leading slash) to first-party client paths via nginx `/api` proxy. */
declare function toClientPath(openApiPath: `/${string}`): string;

declare function assertOk(res: ApiResponse, expectedStatus?: number): void;
declare function getParsed<T>(client: ApiClient, path: string, parse: (data: unknown) => T, expectedStatus?: number): Promise<T>;
declare function postParsed<T>(client: ApiClient, path: string, body: unknown, parse: (data: unknown) => T, expectedStatus?: number): Promise<T>;
declare function putParsed<T>(client: ApiClient, path: string, body: unknown, parse: (data: unknown) => T, expectedStatus?: number): Promise<T>;
declare function patchParsed<T>(client: ApiClient, path: string, body: unknown, parse: (data: unknown) => T, expectedStatus?: number): Promise<T>;
declare function deleteParsed<T>(client: ApiClient, path: string, parse: (data: unknown) => T, expectedStatus?: number): Promise<T>;
/** GET whose body is raw bytes (BeerJSON export, etc.) — not JSON. */
declare function getBytesParsed(client: ApiClient, path: string, parse: (data: unknown) => Buffer, expectedStatus?: number): Promise<Buffer>;

export { assertOk, deleteParsed, getBytesParsed, getParsed, patchParsed, postParsed, putParsed, toClientPath };
