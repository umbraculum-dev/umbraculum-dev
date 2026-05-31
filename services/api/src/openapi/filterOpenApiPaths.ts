import { OPENAPI_TAGS } from "./metadata.js";

/** Tags included in the committed platform partial spec (legacy name preserved). */
export const OPENAPI_ALPHA_TAGS = new Set<string>(OPENAPI_TAGS.map((tag) => tag.name));

export type FilterOpenApiPathsOptions = {
  /** When set, only operations with at least one of these tags are kept. */
  includeTags?: ReadonlySet<string>;
  /** Operations with any of these tags are dropped. */
  excludeTags?: ReadonlySet<string>;
};

export function filterOpenApiPaths<T extends { paths?: Record<string, unknown> }>(
  spec: T,
  options: FilterOpenApiPathsOptions = {},
): T {
  const includeTags = options.includeTags ?? OPENAPI_ALPHA_TAGS;
  const excludeTags = options.excludeTags;

  const paths = spec.paths ?? {};
  const filteredPaths: Record<string, unknown> = {};

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== "object") continue;
    const item = pathItem as Record<string, unknown>;
    const filteredItem: Record<string, unknown> = {};
    let kept = false;

    for (const [method, operation] of Object.entries(item)) {
      if (method === "parameters" || !operation || typeof operation !== "object") {
        continue;
      }
      const op = operation as { tags?: string[] };
      const opTags = op.tags ?? [];
      const included = opTags.some((tag) => includeTags.has(tag));
      const excluded = excludeTags?.size
        ? opTags.some((tag) => excludeTags.has(tag))
        : false;
      if (included && !excluded) {
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

/** @deprecated Use filterOpenApiPaths */
export function filterAlphaOpenApiPaths<T extends { paths?: Record<string, unknown> }>(
  spec: T,
): T {
  return filterOpenApiPaths(spec);
}
