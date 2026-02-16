-- AlterTable
ALTER TABLE "Yeast" ADD COLUMN     "bestFor" TEXT,
ADD COLUMN     "endPhMax" DOUBLE PRECISION,
ADD COLUMN     "endPhMin" DOUBLE PRECISION,
ADD COLUMN     "flavorAroma" TEXT,
ADD COLUMN     "flocculationPercent" DOUBLE PRECISION,
ADD COLUMN     "pitch" TEXT,
ADD COLUMN     "pitchTempC" DOUBLE PRECISION,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "species" TEXT,
ADD COLUMN     "tolerancePercent" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Yeast_productId_idx" ON "Yeast"("productId");

-- CreateIndex
CREATE INDEX "Yeast_species_idx" ON "Yeast"("species");
