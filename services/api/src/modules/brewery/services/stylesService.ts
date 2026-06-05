import type { PrismaClient } from "@prisma/client";

export async function listActiveStyles(prisma: PrismaClient) {
  return prisma.beerStyle.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
    select: {
      key: true,
      name: true,
      source: true,
      version: true,
      code: true,
      category: true,
      categoryId: true,
      sortOrder: true,
    },
  });
}

export class StylesService {
  constructor(private readonly prisma: PrismaClient) {}

  listActiveStyles() {
    return listActiveStyles(this.prisma);
  }
}
