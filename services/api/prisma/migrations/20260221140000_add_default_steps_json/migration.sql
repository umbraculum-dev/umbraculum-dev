-- AlterTable
ALTER TABLE "brewday_settings" ADD COLUMN IF NOT EXISTS "default_steps_json" JSONB;
