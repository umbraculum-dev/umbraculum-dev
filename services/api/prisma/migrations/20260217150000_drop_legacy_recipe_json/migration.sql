-- Drop legacy recipe JSON columns now that BeerJSON + recipeExtJson are canonical.
-- This is destructive (schema-only): ensure backups exist before applying.

ALTER TABLE recipes
  DROP COLUMN IF EXISTS grist_json,
  DROP COLUMN IF EXISTS hops_json,
  DROP COLUMN IF EXISTS yeast_json,
  DROP COLUMN IF EXISTS misc_json;

