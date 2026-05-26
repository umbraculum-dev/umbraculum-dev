-- CreateTable
CREATE TABLE "RecipeWaterSettings" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "targetWaterProfileId" TEXT,
    "dilutionWaterProfileId" TEXT,
    "spargeStartingAlkalinityPpmCaCO3" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spargeStartingPh" DOUBLE PRECISION NOT NULL DEFAULT 7.0,
    "spargeTargetPh" DOUBLE PRECISION NOT NULL DEFAULT 5.6,
    "spargeVolumeLiters" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "spargeAcidType" TEXT NOT NULL DEFAULT 'phosphoric',
    "spargeStrengthKind" TEXT NOT NULL DEFAULT 'percent',
    "spargeStrengthValue" DOUBLE PRECISION,
    "spargeLastAcidRequiredMl" DOUBLE PRECISION,
    "spargeLastAcidRequiredTsp" DOUBLE PRECISION,
    "spargeLastAcidRequiredGrams" DOUBLE PRECISION,
    "spargeLastAcidRequiredKg" DOUBLE PRECISION,
    "spargeLastFinalAlkalinityPpmCaCO3" DOUBLE PRECISION,
    "spargeLastSulfateAddedPpm" DOUBLE PRECISION,
    "spargeLastChlorideAddedPpm" DOUBLE PRECISION,
    "spargeLastCalculatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeWaterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeWaterSettings_recipeId_key" ON "RecipeWaterSettings"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeWaterSettings_recipeId_idx" ON "RecipeWaterSettings"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeWaterSettings_accountId_idx" ON "RecipeWaterSettings"("accountId");

-- AddForeignKey
ALTER TABLE "RecipeWaterSettings" ADD CONSTRAINT "RecipeWaterSettings_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeWaterSettings" ADD CONSTRAINT "RecipeWaterSettings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
