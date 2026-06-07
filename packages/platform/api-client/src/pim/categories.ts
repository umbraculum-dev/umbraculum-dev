import {
  CategoryListResponseSchema,
  type CategoryListResponse,
} from "@umbraculum/pim-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type PimCategoriesListPath = "/pim/categories";
type PimCategoriesListGet = PlatformOpenApiPaths[PimCategoriesListPath]["get"];

export type { PimCategoriesListGet };

export async function listCategories(client: ApiClient): Promise<CategoryListResponse> {
  return getParsed(client, toClientPath("/pim/categories"), (data) =>
    CategoryListResponseSchema.parse(data),
  );
}
