import type { PrismaClient } from "@prisma/client";

import { listSyncRuns, runBeerprotoSync } from "./ingredientsAdminOps.js";
import {
  listYeasts,
  parseSearchPagination,
  searchFermentables,
  searchHops,
} from "./ingredientsReadOps.js";

export class IngredientsService {
  constructor(private readonly prisma: PrismaClient) {}

  searchFermentables(
    activeWorkspaceId: string | null | undefined,
    query: { query?: unknown; offset?: unknown; limit?: unknown },
  ) {
    const { offset, limit } = parseSearchPagination(query);
    return searchFermentables(this.prisma, {
      activeWorkspaceId,
      query: typeof query.query === "string" ? query.query : "",
      offset,
      limit,
    });
  }

  searchHops(
    activeWorkspaceId: string | null | undefined,
    query: { query?: unknown; offset?: unknown; limit?: unknown },
  ) {
    const { offset, limit } = parseSearchPagination(query);
    return searchHops(this.prisma, {
      activeWorkspaceId,
      query: typeof query.query === "string" ? query.query : "",
      offset,
      limit,
    });
  }

  listYeasts(activeWorkspaceId: string | null | undefined, query: { query?: unknown }) {
    return listYeasts(this.prisma, {
      activeWorkspaceId,
      query: typeof query.query === "string" ? query.query : "",
    });
  }

  listSyncRuns() {
    return listSyncRuns(this.prisma);
  }

  runBeerprotoSync() {
    return runBeerprotoSync(this.prisma);
  }
}
