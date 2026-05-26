-- Sparge modes and salts (v0).
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeAcidificationMode" TEXT NOT NULL DEFAULT 'targetPh';
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeManualAcidAddedMl" DOUBLE PRECISION;
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeManualAcidAddedGrams" DOUBLE PRECISION;
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeManualLastAchievedPh" DOUBLE PRECISION;
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeManualLastFinalAlkalinityPpmCaCO3" DOUBLE PRECISION;
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeManualLastSulfateAddedPpm" DOUBLE PRECISION;
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeManualLastChlorideAddedPpm" DOUBLE PRECISION;
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeManualLastCalculatedAt" TIMESTAMP(3);
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeSaltAdditionsJson" JSONB;
ALTER TABLE "RecipeWaterSettings" ADD COLUMN "spargeSaltsLastResultJson" JSONB;

