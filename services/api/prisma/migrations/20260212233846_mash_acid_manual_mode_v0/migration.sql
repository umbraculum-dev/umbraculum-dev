-- AlterTable
ALTER TABLE "RecipeWaterSettings" ADD COLUMN     "mashAcidificationMode" TEXT NOT NULL DEFAULT 'targetPh',
ADD COLUMN     "mashManualAcidAddedGrams" DOUBLE PRECISION,
ADD COLUMN     "mashManualAcidAddedMl" DOUBLE PRECISION,
ADD COLUMN     "mashManualLastAchievedPh" DOUBLE PRECISION,
ADD COLUMN     "mashManualLastCalculatedAt" TIMESTAMP(3),
ADD COLUMN     "mashManualLastChlorideAddedPpm" DOUBLE PRECISION,
ADD COLUMN     "mashManualLastFinalAlkalinityPpmCaCO3" DOUBLE PRECISION,
ADD COLUMN     "mashManualLastSulfateAddedPpm" DOUBLE PRECISION;
