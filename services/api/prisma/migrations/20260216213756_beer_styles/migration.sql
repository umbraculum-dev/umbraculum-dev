-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "styleKey" TEXT;

-- CreateTable
CREATE TABLE "BeerStyle" (
    "key" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "categoryId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeerStyle_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "BeerStyleAlias" (
    "id" TEXT NOT NULL,
    "aliasKey" TEXT NOT NULL,
    "styleKey" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeerStyleAlias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeerStyle_source_version_idx" ON "BeerStyle"("source", "version");

-- CreateIndex
CREATE INDEX "BeerStyle_code_idx" ON "BeerStyle"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BeerStyleAlias_aliasKey_key" ON "BeerStyleAlias"("aliasKey");

-- CreateIndex
CREATE INDEX "BeerStyleAlias_styleKey_idx" ON "BeerStyleAlias"("styleKey");

-- CreateIndex
CREATE INDEX "Recipe_styleKey_idx" ON "Recipe"("styleKey");

-- AddForeignKey
ALTER TABLE "BeerStyleAlias" ADD CONSTRAINT "BeerStyleAlias_styleKey_fkey" FOREIGN KEY ("styleKey") REFERENCES "BeerStyle"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_styleKey_fkey" FOREIGN KEY ("styleKey") REFERENCES "BeerStyle"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
