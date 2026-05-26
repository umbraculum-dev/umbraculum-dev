-- CreateEnum
CREATE TYPE "billing_purchase_intent_mode" AS ENUM ('purchase', 'restore');

-- AlterTable
ALTER TABLE "billing_purchase_intents" ADD COLUMN     "mode" "billing_purchase_intent_mode" NOT NULL DEFAULT 'purchase';
