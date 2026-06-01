/** Map OpenAPI path keys (leading slash) to first-party client paths via nginx `/api` proxy. */
export function toClientPath(openApiPath: `/${string}`): string {
  return `/api${openApiPath}`;
}
