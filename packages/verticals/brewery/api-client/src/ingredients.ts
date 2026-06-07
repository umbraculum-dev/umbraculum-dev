import { FermentablesListResponseSchema, HopsListResponseSchema, IngredientsSearchQuerySchema, YeastsListResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { getParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "./openapiTypes.js";

type FermentablesPath = "/ingredients/fermentables";
type FermentablesGet = BreweryOpenApiPaths[FermentablesPath]["get"];

type HopsPath = "/ingredients/hops";
type HopsGet = BreweryOpenApiPaths[HopsPath]["get"];

type YeastsPath = "/ingredients/yeasts";
type YeastsGet = BreweryOpenApiPaths[YeastsPath]["get"];

export type { FermentablesGet, HopsGet, YeastsGet };

export type IngredientsSearchParams = {
  query?: string;
  offset?: number;
  limit?: number;
};

function ingredientsQueryString(params?: IngredientsSearchParams): string {
  if (!params) return "";
  const parsed = IngredientsSearchQuerySchema.parse(params);
  const sp = new URLSearchParams();
  if (parsed.query !== undefined && parsed.query !== "") sp.set("query", parsed.query);
  if (parsed.offset !== undefined) sp.set("offset", String(parsed.offset));
  if (parsed.limit !== undefined) sp.set("limit", String(parsed.limit));
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export async function searchFermentables(client: ApiClient, params?: IngredientsSearchParams) {
  return getParsed(
    client,
    `${toClientPath("/ingredients/fermentables")}${ingredientsQueryString(params)}`,
    (data) => FermentablesListResponseSchema.parse(data),
  );
}

export async function searchHops(client: ApiClient, params?: IngredientsSearchParams) {
  return getParsed(
    client,
    `${toClientPath("/ingredients/hops")}${ingredientsQueryString(params)}`,
    (data) => HopsListResponseSchema.parse(data),
  );
}

export async function searchYeasts(client: ApiClient, params?: IngredientsSearchParams) {
  return getParsed(
    client,
    `${toClientPath("/ingredients/yeasts")}${ingredientsQueryString(params)}`,
    (data) => YeastsListResponseSchema.parse(data),
  );
}
