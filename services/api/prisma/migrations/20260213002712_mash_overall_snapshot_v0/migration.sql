-- AlterTable
ALTER TABLE "RecipeWaterSettings" ADD COLUMN     "mashOverallLastCalculatedAt" TIMESTAMP(3),
ADD COLUMN     "mashOverallLastResultJson" JSONB;
