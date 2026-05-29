import { OPENAPI_TAGS } from "./metadata.js";

/** Tags included in the alpha partial committed spec. */
export const OPENAPI_ALPHA_TAGS = new Set<string>(OPENAPI_TAGS.map((tag) => tag.name));

export function filterAlphaOpenApiPaths<T extends { paths?: Record<string, unknown> }>(
  spec: T,
): T {
  const paths = spec.paths ?? {};
  const filteredPaths: Record<string, unknown> = {};

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== "object") continue;
    const item = pathItem as Record<string, unknown>;
    const filteredItem: Record<string, unknown> = {};
    let kept = false;

    for (const [method, operation] of Object.entries(item)) {
      if (
        method === "parameters" ||
        !operation ||
        typeof operation !== "object"
      ) {
        continue;
      }
      const op = operation as { tags?: string[] };
      if (op.tags?.some((tag) => OPENAPI_ALPHA_TAGS.has(tag))) {
        filteredItem[method] = operation;
        kept = true;
      }
    }

    if (item["parameters"] !== undefined) {
      filteredItem["parameters"] = item["parameters"];
    }

    if (kept) {
      filteredPaths[path] = filteredItem;
    }
  }

  return { ...spec, paths: filteredPaths };
}
