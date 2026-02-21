BEGIN;

-- Add versioning columns (explicit, user-created versions).
ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "version_group_id" TEXT;
ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;

-- Backfill: existing recipes become version 0, group=id.
UPDATE "recipes"
SET "version_group_id" = "id"
WHERE "version_group_id" IS NULL;

-- Enforce non-null after backfill.
ALTER TABLE "recipes" ALTER COLUMN "version_group_id" SET NOT NULL;

-- Uniqueness: one row per (account, group, version).
CREATE UNIQUE INDEX IF NOT EXISTS "recipes_account_id_version_group_id_version_key"
  ON "recipes" ("account_id", "version_group_id", "version");

-- Common query patterns: list versions for a group.
CREATE INDEX IF NOT EXISTS "recipes_account_id_version_group_id_idx"
  ON "recipes" ("account_id", "version_group_id");

COMMIT;

