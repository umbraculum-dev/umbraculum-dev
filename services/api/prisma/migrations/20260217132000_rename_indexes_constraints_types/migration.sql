-- Rename Postgres enum types, constraints, and indexes to snake_case.
-- Cosmetic-only: does not change data.

BEGIN;

-- Enum types
ALTER TYPE "AccountRole" RENAME TO account_role;
ALTER TYPE "ColorUnit" RENAME TO color_unit;
ALTER TYPE "IngredientKind" RENAME TO ingredient_kind;
ALTER TYPE "WaterProfileScope" RENAME TO water_profile_scope;
ALTER TYPE "WaterProfileType" RENAME TO water_profile_type;
ALTER TYPE "WaterProfileVerificationStatus" RENAME TO water_profile_verification_status;

-- Constraints (PK/FK)
ALTER TABLE account_members RENAME CONSTRAINT "AccountMember_pkey" TO account_members_pkey;
ALTER TABLE account_members RENAME CONSTRAINT "AccountMember_accountId_fkey" TO account_members_account_id_fkey;
ALTER TABLE account_members RENAME CONSTRAINT "AccountMember_userId_fkey" TO account_members_user_id_fkey;
ALTER TABLE accounts RENAME CONSTRAINT "Account_pkey" TO accounts_pkey;
ALTER TABLE beer_style_aliases RENAME CONSTRAINT "BeerStyleAlias_pkey" TO beer_style_aliases_pkey;
ALTER TABLE beer_style_aliases RENAME CONSTRAINT "BeerStyleAlias_styleKey_fkey" TO beer_style_aliases_style_key_fkey;
ALTER TABLE beer_styles RENAME CONSTRAINT "BeerStyle_pkey" TO beer_styles_pkey;
ALTER TABLE email_verification_tokens RENAME CONSTRAINT "EmailVerificationToken_pkey" TO email_verification_tokens_pkey;
ALTER TABLE email_verification_tokens RENAME CONSTRAINT "EmailVerificationToken_userId_fkey" TO email_verification_tokens_user_id_fkey;
ALTER TABLE fermentables RENAME CONSTRAINT "Fermentable_pkey" TO fermentables_pkey;
ALTER TABLE fermentables RENAME CONSTRAINT "Fermentable_accountId_fkey" TO fermentables_account_id_fkey;
ALTER TABLE hops RENAME CONSTRAINT "Hop_pkey" TO hops_pkey;
ALTER TABLE hops RENAME CONSTRAINT "Hop_accountId_fkey" TO hops_account_id_fkey;
ALTER TABLE ingredient_import_runs RENAME CONSTRAINT "IngredientImportRun_pkey" TO ingredient_import_runs_pkey;
ALTER TABLE ingredient_import_runs RENAME CONSTRAINT "IngredientImportRun_sourceId_fkey" TO ingredient_import_runs_source_id_fkey;
ALTER TABLE ingredient_source_maps RENAME CONSTRAINT "IngredientSourceMap_pkey" TO ingredient_source_maps_pkey;
ALTER TABLE ingredient_source_maps RENAME CONSTRAINT "IngredientSourceMap_fermentableId_fkey" TO ingredient_source_maps_fermentable_id_fkey;
ALTER TABLE ingredient_source_maps RENAME CONSTRAINT "IngredientSourceMap_hopId_fkey" TO ingredient_source_maps_hop_id_fkey;
ALTER TABLE ingredient_source_maps RENAME CONSTRAINT "IngredientSourceMap_yeastId_fkey" TO ingredient_source_maps_yeast_id_fkey;
ALTER TABLE ingredient_sources RENAME CONSTRAINT "IngredientSource_pkey" TO ingredient_sources_pkey;
ALTER TABLE ingredient_staging_rows RENAME CONSTRAINT "IngredientStagingRow_pkey" TO ingredient_staging_rows_pkey;
ALTER TABLE ingredient_staging_rows RENAME CONSTRAINT "IngredientStagingRow_importRunId_fkey" TO ingredient_staging_rows_import_run_id_fkey;
ALTER TABLE recipe_water_settings RENAME CONSTRAINT "RecipeWaterSettings_pkey" TO recipe_water_settings_pkey;
ALTER TABLE recipe_water_settings RENAME CONSTRAINT "RecipeWaterSettings_accountId_fkey" TO recipe_water_settings_account_id_fkey;
ALTER TABLE recipe_water_settings RENAME CONSTRAINT "RecipeWaterSettings_recipeId_fkey" TO recipe_water_settings_recipe_id_fkey;
ALTER TABLE recipes RENAME CONSTRAINT "Recipe_pkey" TO recipes_pkey;
ALTER TABLE recipes RENAME CONSTRAINT "Recipe_accountId_fkey" TO recipes_account_id_fkey;
ALTER TABLE recipes RENAME CONSTRAINT "Recipe_styleKey_fkey" TO recipes_style_key_fkey;
ALTER TABLE sessions RENAME CONSTRAINT "Session_pkey" TO sessions_pkey;
ALTER TABLE sessions RENAME CONSTRAINT "Session_userId_fkey" TO sessions_user_id_fkey;
ALTER TABLE sessions RENAME CONSTRAINT "Session_activeAccountId_fkey" TO sessions_active_account_id_fkey;
ALTER TABLE users RENAME CONSTRAINT "User_pkey" TO users_pkey;
ALTER TABLE water_profiles RENAME CONSTRAINT "WaterProfile_pkey" TO water_profiles_pkey;
ALTER TABLE water_profiles RENAME CONSTRAINT "WaterProfile_accountId_fkey" TO water_profiles_account_id_fkey;
ALTER TABLE yeasts RENAME CONSTRAINT "Yeast_pkey" TO yeasts_pkey;
ALTER TABLE yeasts RENAME CONSTRAINT "Yeast_accountId_fkey" TO yeasts_account_id_fkey;

-- Indexes
ALTER INDEX "AccountMember_accountId_idx" RENAME TO account_members_account_id_idx;
ALTER INDEX "AccountMember_accountId_userId_key" RENAME TO account_members_account_id_user_id_key;
ALTER INDEX "AccountMember_userId_idx" RENAME TO account_members_user_id_idx;
ALTER INDEX "BeerStyleAlias_aliasKey_key" RENAME TO beer_style_aliases_alias_key_key;
ALTER INDEX "BeerStyleAlias_styleKey_idx" RENAME TO beer_style_aliases_style_key_idx;
ALTER INDEX "BeerStyle_code_idx" RENAME TO beer_styles_code_idx;
ALTER INDEX "BeerStyle_source_version_idx" RENAME TO beer_styles_source_version_idx;
ALTER INDEX "EmailVerificationToken_email_idx" RENAME TO email_verification_tokens_email_idx;
ALTER INDEX "EmailVerificationToken_expiresAt_idx" RENAME TO email_verification_tokens_expires_at_idx;
ALTER INDEX "EmailVerificationToken_userId_idx" RENAME TO email_verification_tokens_user_id_idx;
ALTER INDEX "Fermentable_accountId_idx" RENAME TO fermentables_account_id_idx;
ALTER INDEX "Fermentable_name_idx" RENAME TO fermentables_name_idx;
ALTER INDEX "Fermentable_producer_idx" RENAME TO fermentables_producer_idx;
ALTER INDEX "Hop_accountId_idx" RENAME TO hops_account_id_idx;
ALTER INDEX "Hop_name_idx" RENAME TO hops_name_idx;
ALTER INDEX "IngredientImportRun_sourceId_idx" RENAME TO ingredient_import_runs_source_id_idx;
ALTER INDEX "IngredientImportRun_startedAt_idx" RENAME TO ingredient_import_runs_started_at_idx;
ALTER INDEX "IngredientSourceMap_fermentableId_idx" RENAME TO ingredient_source_maps_fermentable_id_idx;
ALTER INDEX "IngredientSourceMap_hopId_idx" RENAME TO ingredient_source_maps_hop_id_idx;
ALTER INDEX "IngredientSourceMap_kind_sourceName_sourceKey_key" RENAME TO ingredient_source_maps_kind_source_name_source_key_key;
ALTER INDEX "IngredientSourceMap_sourceKey_idx" RENAME TO ingredient_source_maps_source_key_idx;
ALTER INDEX "IngredientSourceMap_sourceName_idx" RENAME TO ingredient_source_maps_source_name_idx;
ALTER INDEX "IngredientSourceMap_yeastId_idx" RENAME TO ingredient_source_maps_yeast_id_idx;
ALTER INDEX "IngredientSource_sourceName_idx" RENAME TO ingredient_sources_source_name_idx;
ALTER INDEX "IngredientSource_sourceName_resourcePath_key" RENAME TO ingredient_sources_source_name_resource_path_key;
ALTER INDEX "IngredientStagingRow_importRunId_idx" RENAME TO ingredient_staging_rows_import_run_id_idx;
ALTER INDEX "IngredientStagingRow_kind_idx" RENAME TO ingredient_staging_rows_kind_idx;
ALTER INDEX "IngredientStagingRow_sourceKey_idx" RENAME TO ingredient_staging_rows_source_key_idx;
ALTER INDEX "RecipeWaterSettings_accountId_idx" RENAME TO recipe_water_settings_account_id_idx;
ALTER INDEX "RecipeWaterSettings_recipeId_idx" RENAME TO recipe_water_settings_recipe_id_idx;
ALTER INDEX "RecipeWaterSettings_recipeId_key" RENAME TO recipe_water_settings_recipe_id_key;
ALTER INDEX "Recipe_accountId_idx" RENAME TO recipes_account_id_idx;
ALTER INDEX "Recipe_styleKey_idx" RENAME TO recipes_style_key_idx;
ALTER INDEX "Session_activeAccountId_idx" RENAME TO sessions_active_account_id_idx;
ALTER INDEX "Session_expiresAt_idx" RENAME TO sessions_expires_at_idx;
ALTER INDEX "Session_userId_idx" RENAME TO sessions_user_id_idx;
ALTER INDEX "User_email_idx" RENAME TO users_email_idx;
ALTER INDEX "User_email_key" RENAME TO users_email_key;
ALTER INDEX "WaterProfile_accountId_idx" RENAME TO water_profiles_account_id_idx;
ALTER INDEX "WaterProfile_key_key" RENAME TO water_profiles_key_key;
ALTER INDEX "WaterProfile_scope_idx" RENAME TO water_profiles_scope_idx;
ALTER INDEX "WaterProfile_type_idx" RENAME TO water_profiles_type_idx;
ALTER INDEX "Yeast_accountId_idx" RENAME TO yeasts_account_id_idx;
ALTER INDEX "Yeast_lab_idx" RENAME TO yeasts_lab_idx;
ALTER INDEX "Yeast_name_idx" RENAME TO yeasts_name_idx;
ALTER INDEX "Yeast_productId_idx" RENAME TO yeasts_product_id_idx;
ALTER INDEX "Yeast_species_idx" RENAME TO yeasts_species_idx;

COMMIT;

