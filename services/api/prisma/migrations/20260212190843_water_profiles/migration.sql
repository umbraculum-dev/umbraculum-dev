-- CreateEnum
CREATE TYPE "WaterProfileScope" AS ENUM ('system', 'account', 'public');

-- CreateEnum
CREATE TYPE "WaterProfileType" AS ENUM ('water', 'dilution');

-- CreateEnum
CREATE TYPE "WaterProfileVerificationStatus" AS ENUM ('unverified', 'verified');

-- CreateTable
CREATE TABLE "WaterProfile" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scope" "WaterProfileScope" NOT NULL,
    "type" "WaterProfileType" NOT NULL,
    "accountId" TEXT,
    "name" TEXT NOT NULL,
    "calcium" DOUBLE PRECISION NOT NULL,
    "magnesium" DOUBLE PRECISION NOT NULL,
    "sodium" DOUBLE PRECISION NOT NULL,
    "sulfate" DOUBLE PRECISION NOT NULL,
    "chloride" DOUBLE PRECISION NOT NULL,
    "bicarbonate" DOUBLE PRECISION NOT NULL,
    "verificationStatus" "WaterProfileVerificationStatus" NOT NULL DEFAULT 'unverified',
    "submittedByUserId" TEXT,
    "verifiedByUserId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaterProfile_key_key" ON "WaterProfile"("key");

-- CreateIndex
CREATE INDEX "WaterProfile_scope_idx" ON "WaterProfile"("scope");

-- CreateIndex
CREATE INDEX "WaterProfile_type_idx" ON "WaterProfile"("type");

-- CreateIndex
CREATE INDEX "WaterProfile_accountId_idx" ON "WaterProfile"("accountId");

-- AddForeignKey
ALTER TABLE "WaterProfile" ADD CONSTRAINT "WaterProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
