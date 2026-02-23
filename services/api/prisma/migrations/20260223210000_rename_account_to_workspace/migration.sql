-- Rename tenancy terminology from account → workspace (DB identifiers).
-- Rename-only migration: no data changes, no drops.

BEGIN;

-- Enum types
DO $$ BEGIN
  EXECUTE 'ALTER TYPE account_role RENAME TO workspace_role';
EXCEPTION WHEN undefined_object OR duplicate_object THEN
  NULL;
END $$;

-- Tables
DO $$ BEGIN
  EXECUTE 'ALTER TABLE accounts RENAME TO workspaces';
EXCEPTION WHEN undefined_table OR duplicate_table THEN
  NULL;
END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE account_members RENAME TO workspace_members';
EXCEPTION WHEN undefined_table OR duplicate_table THEN
  NULL;
END $$;

-- Columns (foreign keys + scoping columns)
DO $$ BEGIN EXECUTE 'ALTER TABLE workspace_members RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE sessions RENAME COLUMN active_account_id TO active_workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;

DO $$ BEGIN EXECUTE 'ALTER TABLE recipes RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE recipe_water_settings RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;

DO $$ BEGIN EXECUTE 'ALTER TABLE equipment_profiles RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE brew_sessions RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE brewday_settings RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;

DO $$ BEGIN EXECUTE 'ALTER TABLE water_profiles RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE fermentables RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE hops RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE yeasts RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;

DO $$ BEGIN EXECUTE 'ALTER TABLE inventory_items RENAME COLUMN account_id TO workspace_id'; EXCEPTION WHEN undefined_column OR duplicate_column OR undefined_table THEN NULL; END $$;

-- Constraints (PK/FK)
DO $$ BEGIN EXECUTE 'ALTER TABLE workspaces RENAME CONSTRAINT accounts_pkey TO workspaces_pkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE workspace_members RENAME CONSTRAINT account_members_pkey TO workspace_members_pkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;

DO $$ BEGIN EXECUTE 'ALTER TABLE workspace_members RENAME CONSTRAINT account_members_account_id_fkey TO workspace_members_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE workspace_members RENAME CONSTRAINT account_members_user_id_fkey TO workspace_members_user_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;

DO $$ BEGIN EXECUTE 'ALTER TABLE sessions RENAME CONSTRAINT sessions_active_account_id_fkey TO sessions_active_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;

DO $$ BEGIN EXECUTE 'ALTER TABLE recipes RENAME CONSTRAINT recipes_account_id_fkey TO recipes_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE recipe_water_settings RENAME CONSTRAINT recipe_water_settings_account_id_fkey TO recipe_water_settings_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE equipment_profiles RENAME CONSTRAINT equipment_profiles_account_id_fkey TO equipment_profiles_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE brew_sessions RENAME CONSTRAINT brew_sessions_account_id_fkey TO brew_sessions_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE brewday_settings RENAME CONSTRAINT brewday_settings_account_id_fkey TO brewday_settings_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;

DO $$ BEGIN EXECUTE 'ALTER TABLE water_profiles RENAME CONSTRAINT water_profiles_account_id_fkey TO water_profiles_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE fermentables RENAME CONSTRAINT fermentables_account_id_fkey TO fermentables_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE hops RENAME CONSTRAINT hops_account_id_fkey TO hops_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE yeasts RENAME CONSTRAINT yeasts_account_id_fkey TO yeasts_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER TABLE inventory_items RENAME CONSTRAINT inventory_items_account_id_fkey TO inventory_items_workspace_id_fkey'; EXCEPTION WHEN undefined_object OR duplicate_object THEN NULL; END $$;

-- Indexes / unique indexes
ALTER INDEX IF EXISTS account_members_account_id_idx RENAME TO workspace_members_workspace_id_idx;
ALTER INDEX IF EXISTS account_members_account_id_user_id_key RENAME TO workspace_members_workspace_id_user_id_key;
ALTER INDEX IF EXISTS account_members_user_id_idx RENAME TO workspace_members_user_id_idx;

ALTER INDEX IF EXISTS sessions_active_account_id_idx RENAME TO sessions_active_workspace_id_idx;

ALTER INDEX IF EXISTS recipes_account_id_idx RENAME TO recipes_workspace_id_idx;
ALTER INDEX IF EXISTS recipes_account_id_version_group_id_idx RENAME TO recipes_workspace_id_version_group_id_idx;
ALTER INDEX IF EXISTS recipes_account_id_version_group_id_version_key RENAME TO recipes_workspace_id_version_group_id_version_key;

ALTER INDEX IF EXISTS recipe_water_settings_account_id_idx RENAME TO recipe_water_settings_workspace_id_idx;

ALTER INDEX IF EXISTS equipment_profiles_account_id_idx RENAME TO equipment_profiles_workspace_id_idx;
ALTER INDEX IF EXISTS equipment_profiles_account_id_name_key RENAME TO equipment_profiles_workspace_id_name_key;

ALTER INDEX IF EXISTS brew_sessions_account_id_idx RENAME TO brew_sessions_workspace_id_idx;
ALTER INDEX IF EXISTS brew_sessions_account_id_recipe_id_idx RENAME TO brew_sessions_workspace_id_recipe_id_idx;
ALTER INDEX IF EXISTS brew_sessions_account_id_code_key RENAME TO brew_sessions_workspace_id_code_key;

ALTER INDEX IF EXISTS brewday_settings_account_id_key RENAME TO brewday_settings_workspace_id_key;
ALTER INDEX IF EXISTS brewday_settings_account_id_idx RENAME TO brewday_settings_workspace_id_idx;

ALTER INDEX IF EXISTS water_profiles_account_id_idx RENAME TO water_profiles_workspace_id_idx;
ALTER INDEX IF EXISTS fermentables_account_id_idx RENAME TO fermentables_workspace_id_idx;
ALTER INDEX IF EXISTS hops_account_id_idx RENAME TO hops_workspace_id_idx;
ALTER INDEX IF EXISTS yeasts_account_id_idx RENAME TO yeasts_workspace_id_idx;

ALTER INDEX IF EXISTS inventory_items_account_id_idx RENAME TO inventory_items_workspace_id_idx;
ALTER INDEX IF EXISTS inventory_items_account_id_category_idx RENAME TO inventory_items_workspace_id_category_idx;

COMMIT;

