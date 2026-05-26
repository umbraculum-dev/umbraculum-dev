-- Add mash pH model parameters to canonical fermentables (v1).

ALTER TABLE "Fermentable"
ADD COLUMN     "mashDiPh" DOUBLE PRECISION,
ADD COLUMN     "mashTaToPh57_mEqPerKg" DOUBLE PRECISION,
ADD COLUMN     "mashPhModelKey" TEXT,
ADD COLUMN     "mashPhModelSource" TEXT,
ADD COLUMN     "mashPhModelVersion" INTEGER;

