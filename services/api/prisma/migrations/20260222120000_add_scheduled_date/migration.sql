-- AlterTable
ALTER TABLE "brew_sessions" ADD COLUMN IF NOT EXISTS "scheduled_date" TIMESTAMP(3);
