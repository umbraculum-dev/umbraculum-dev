-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "gristJson" JSONB;

-- AlterTable
ALTER TABLE "RecipeWaterSettings" ADD COLUMN     "mashGristImportedAt" TIMESTAMP(3),
ADD COLUMN     "mashGristImportedJson" JSONB,
ADD COLUMN     "mashGristSourceRecipeUpdatedAt" TIMESTAMP(3);
