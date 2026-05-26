-- AlterTable
ALTER TABLE "RecipeWaterSettings" ADD COLUMN     "dilutionWaterVolumeLiters" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "sourceWaterProfileId" TEXT,
ADD COLUMN     "tapWaterVolumeLiters" DOUBLE PRECISION DEFAULT 0;
