-- CreateEnum
CREATE TYPE "IngredientKind" AS ENUM ('fermentable', 'hop', 'yeast');

-- CreateEnum
CREATE TYPE "ColorUnit" AS ENUM ('ebc', 'srm', 'lovibond', 'unknown');

-- CreateTable
CREATE TABLE "Fermentable" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "name" TEXT NOT NULL,
    "producer" TEXT,
    "group" TEXT,
    "type" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "colorEbc" DOUBLE PRECISION,
    "colorOriginal" DOUBLE PRECISION,
    "colorOriginalUnit" "ColorUnit" NOT NULL DEFAULT 'unknown',
    "colorLovibond" DOUBLE PRECISION,
    "colorSrm" DOUBLE PRECISION,
    "standard" TEXT,
    "potentialSg" DOUBLE PRECISION,
    "yieldPercent" DOUBLE PRECISION,
    "ppg" DOUBLE PRECISION,
    "deprecatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fermentable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hop" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "type" TEXT,
    "notes" TEXT,
    "alphaMin" DOUBLE PRECISION,
    "alphaMax" DOUBLE PRECISION,
    "betaMin" DOUBLE PRECISION,
    "betaMax" DOUBLE PRECISION,
    "deprecatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Yeast" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "name" TEXT NOT NULL,
    "lab" TEXT,
    "type" TEXT,
    "form" TEXT,
    "notes" TEXT,
    "attenuationMin" DOUBLE PRECISION,
    "attenuationMax" DOUBLE PRECISION,
    "tempMinC" DOUBLE PRECISION,
    "tempMaxC" DOUBLE PRECISION,
    "deprecatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Yeast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientSource" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceLicense" TEXT NOT NULL,
    "resourcePath" TEXT NOT NULL,
    "etag" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "lastAppliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientImportRun" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "statsJson" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientImportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientStagingRow" (
    "id" TEXT NOT NULL,
    "importRunId" TEXT NOT NULL,
    "kind" "IngredientKind" NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "rawPayloadJson" JSONB NOT NULL,
    "warningsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientStagingRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientSourceMap" (
    "id" TEXT NOT NULL,
    "kind" "IngredientKind" NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "fermentableId" TEXT,
    "hopId" TEXT,
    "yeastId" TEXT,
    "confidence" DOUBLE PRECISION DEFAULT 1.0,
    "notes" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientSourceMap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fermentable_accountId_idx" ON "Fermentable"("accountId");

-- CreateIndex
CREATE INDEX "Fermentable_name_idx" ON "Fermentable"("name");

-- CreateIndex
CREATE INDEX "Fermentable_producer_idx" ON "Fermentable"("producer");

-- CreateIndex
CREATE INDEX "Hop_accountId_idx" ON "Hop"("accountId");

-- CreateIndex
CREATE INDEX "Hop_name_idx" ON "Hop"("name");

-- CreateIndex
CREATE INDEX "Yeast_accountId_idx" ON "Yeast"("accountId");

-- CreateIndex
CREATE INDEX "Yeast_name_idx" ON "Yeast"("name");

-- CreateIndex
CREATE INDEX "Yeast_lab_idx" ON "Yeast"("lab");

-- CreateIndex
CREATE INDEX "IngredientSource_sourceName_idx" ON "IngredientSource"("sourceName");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientSource_sourceName_resourcePath_key" ON "IngredientSource"("sourceName", "resourcePath");

-- CreateIndex
CREATE INDEX "IngredientImportRun_sourceId_idx" ON "IngredientImportRun"("sourceId");

-- CreateIndex
CREATE INDEX "IngredientImportRun_startedAt_idx" ON "IngredientImportRun"("startedAt");

-- CreateIndex
CREATE INDEX "IngredientStagingRow_importRunId_idx" ON "IngredientStagingRow"("importRunId");

-- CreateIndex
CREATE INDEX "IngredientStagingRow_kind_idx" ON "IngredientStagingRow"("kind");

-- CreateIndex
CREATE INDEX "IngredientStagingRow_sourceKey_idx" ON "IngredientStagingRow"("sourceKey");

-- CreateIndex
CREATE INDEX "IngredientSourceMap_sourceName_idx" ON "IngredientSourceMap"("sourceName");

-- CreateIndex
CREATE INDEX "IngredientSourceMap_sourceKey_idx" ON "IngredientSourceMap"("sourceKey");

-- CreateIndex
CREATE INDEX "IngredientSourceMap_fermentableId_idx" ON "IngredientSourceMap"("fermentableId");

-- CreateIndex
CREATE INDEX "IngredientSourceMap_hopId_idx" ON "IngredientSourceMap"("hopId");

-- CreateIndex
CREATE INDEX "IngredientSourceMap_yeastId_idx" ON "IngredientSourceMap"("yeastId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientSourceMap_kind_sourceName_sourceKey_key" ON "IngredientSourceMap"("kind", "sourceName", "sourceKey");

-- AddForeignKey
ALTER TABLE "Fermentable" ADD CONSTRAINT "Fermentable_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hop" ADD CONSTRAINT "Hop_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Yeast" ADD CONSTRAINT "Yeast_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientImportRun" ADD CONSTRAINT "IngredientImportRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IngredientSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientStagingRow" ADD CONSTRAINT "IngredientStagingRow_importRunId_fkey" FOREIGN KEY ("importRunId") REFERENCES "IngredientImportRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientSourceMap" ADD CONSTRAINT "IngredientSourceMap_fermentableId_fkey" FOREIGN KEY ("fermentableId") REFERENCES "Fermentable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientSourceMap" ADD CONSTRAINT "IngredientSourceMap_hopId_fkey" FOREIGN KEY ("hopId") REFERENCES "Hop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientSourceMap" ADD CONSTRAINT "IngredientSourceMap_yeastId_fkey" FOREIGN KEY ("yeastId") REFERENCES "Yeast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
