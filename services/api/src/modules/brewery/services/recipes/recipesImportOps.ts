import type { PrismaClient } from "@prisma/client";

import type { StyleCandidate } from "../../../../importers/beerxmlImporter.js";
import { resolveBjcp2021Style } from "../recipesImportService.js";

export async function resolveStyleForImport(
  prisma: PrismaClient,
  candidate: StyleCandidate | null,
) {
  return resolveBjcp2021Style(prisma, candidate);
}

export class RecipesImportService {
  constructor(private readonly prisma: PrismaClient) {}

  resolveStyle(candidate: StyleCandidate | null) {
    return resolveStyleForImport(this.prisma, candidate);
  }
}
