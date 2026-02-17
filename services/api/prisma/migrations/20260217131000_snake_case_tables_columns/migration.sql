-- Switch Prisma-managed Postgres identifiers to snake_case.
-- This migration is rename-only (no data loss): it uses ALTER TABLE RENAME and RENAME COLUMN.

BEGIN;

-- Tables
ALTER TABLE "User" RENAME TO users;
ALTER TABLE "Account" RENAME TO accounts;
ALTER TABLE "AccountMember" RENAME TO account_members;
ALTER TABLE "Session" RENAME TO sessions;
ALTER TABLE "EmailVerificationToken" RENAME TO email_verification_tokens;
ALTER TABLE "BeerStyle" RENAME TO beer_styles;
ALTER TABLE "BeerStyleAlias" RENAME TO beer_style_aliases;
ALTER TABLE "Recipe" RENAME TO recipes;
ALTER TABLE "RecipeWaterSettings" RENAME TO recipe_water_settings;
ALTER TABLE "WaterProfile" RENAME TO water_profiles;
ALTER TABLE "Fermentable" RENAME TO fermentables;
ALTER TABLE "Hop" RENAME TO hops;
ALTER TABLE "Yeast" RENAME TO yeasts;
ALTER TABLE "IngredientSource" RENAME TO ingredient_sources;
ALTER TABLE "IngredientImportRun" RENAME TO ingredient_import_runs;
ALTER TABLE "IngredientStagingRow" RENAME TO ingredient_staging_rows;
ALTER TABLE "IngredientSourceMap" RENAME TO ingredient_source_maps;

-- Columns: users
ALTER TABLE users RENAME COLUMN "passwordHash" TO password_hash;
ALTER TABLE users RENAME COLUMN "preferredLocale" TO preferred_locale;
ALTER TABLE users RENAME COLUMN "preferredTheme" TO preferred_theme;
ALTER TABLE users RENAME COLUMN "preferredFontScale" TO preferred_font_scale;
ALTER TABLE users RENAME COLUMN "preferredDensity" TO preferred_density;
ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: accounts
ALTER TABLE accounts RENAME COLUMN "brandKey" TO brand_key;
ALTER TABLE accounts RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE accounts RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: account_members
ALTER TABLE account_members RENAME COLUMN "accountId" TO account_id;
ALTER TABLE account_members RENAME COLUMN "userId" TO user_id;
ALTER TABLE account_members RENAME COLUMN "createdAt" TO created_at;

-- Columns: sessions
ALTER TABLE sessions RENAME COLUMN "userId" TO user_id;
ALTER TABLE sessions RENAME COLUMN "activeAccountId" TO active_account_id;
ALTER TABLE sessions RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE sessions RENAME COLUMN "expiresAt" TO expires_at;

-- Columns: email_verification_tokens
ALTER TABLE email_verification_tokens RENAME COLUMN "userId" TO user_id;
ALTER TABLE email_verification_tokens RENAME COLUMN "expiresAt" TO expires_at;
ALTER TABLE email_verification_tokens RENAME COLUMN "usedAt" TO used_at;
ALTER TABLE email_verification_tokens RENAME COLUMN "createdAt" TO created_at;

-- Columns: beer_styles
ALTER TABLE beer_styles RENAME COLUMN "categoryId" TO category_id;
ALTER TABLE beer_styles RENAME COLUMN "sortOrder" TO sort_order;
ALTER TABLE beer_styles RENAME COLUMN "isActive" TO is_active;
ALTER TABLE beer_styles RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE beer_styles RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: beer_style_aliases
ALTER TABLE beer_style_aliases RENAME COLUMN "aliasKey" TO alias_key;
ALTER TABLE beer_style_aliases RENAME COLUMN "styleKey" TO style_key;
ALTER TABLE beer_style_aliases RENAME COLUMN "createdAt" TO created_at;

-- Columns: recipes
ALTER TABLE recipes RENAME COLUMN "accountId" TO account_id;
ALTER TABLE recipes RENAME COLUMN "styleKey" TO style_key;
ALTER TABLE recipes RENAME COLUMN "gristJson" TO grist_json;
ALTER TABLE recipes RENAME COLUMN "hopsJson" TO hops_json;
ALTER TABLE recipes RENAME COLUMN "yeastJson" TO yeast_json;
ALTER TABLE recipes RENAME COLUMN "miscJson" TO misc_json;
ALTER TABLE recipes RENAME COLUMN "beerJsonRecipeJson" TO beer_json_recipe_json;
ALTER TABLE recipes RENAME COLUMN "recipeExtJson" TO recipe_ext_json;
ALTER TABLE recipes RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE recipes RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: recipe_water_settings
ALTER TABLE recipe_water_settings RENAME COLUMN "accountId" TO account_id;
ALTER TABLE recipe_water_settings RENAME COLUMN "recipeId" TO recipe_id;
ALTER TABLE recipe_water_settings RENAME COLUMN "sourceWaterProfileId" TO source_water_profile_id;
ALTER TABLE recipe_water_settings RENAME COLUMN "targetWaterProfileId" TO target_water_profile_id;
ALTER TABLE recipe_water_settings RENAME COLUMN "dilutionWaterProfileId" TO dilution_water_profile_id;
ALTER TABLE recipe_water_settings RENAME COLUMN "tapWaterVolumeLiters" TO tap_water_volume_liters;
ALTER TABLE recipe_water_settings RENAME COLUMN "dilutionWaterVolumeLiters" TO dilution_water_volume_liters;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashStartingAlkalinityPpmCaCO3" TO mash_starting_alkalinity_ppm_caco3;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashStartingPh" TO mash_starting_ph;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashTargetPh" TO mash_target_ph;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashWaterVolumeLiters" TO mash_water_volume_liters;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashAcidType" TO mash_acid_type;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashStrengthKind" TO mash_strength_kind;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashStrengthValue" TO mash_strength_value;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashLastAcidRequiredMl" TO mash_last_acid_required_ml;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashLastAcidRequiredTsp" TO mash_last_acid_required_tsp;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashLastAcidRequiredGrams" TO mash_last_acid_required_grams;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashLastAcidRequiredKg" TO mash_last_acid_required_kg;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashLastFinalAlkalinityPpmCaCO3" TO mash_last_final_alkalinity_ppm_caco3;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashLastSulfateAddedPpm" TO mash_last_sulfate_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashLastChlorideAddedPpm" TO mash_last_chloride_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashLastCalculatedAt" TO mash_last_calculated_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashAcidificationMode" TO mash_acidification_mode;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashManualAcidAddedMl" TO mash_manual_acid_added_ml;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashManualAcidAddedGrams" TO mash_manual_acid_added_grams;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashManualLastAchievedPh" TO mash_manual_last_achieved_ph;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashManualLastFinalAlkalinityPpmCaCO3" TO mash_manual_last_final_alkalinity_ppm_caco3;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashManualLastSulfateAddedPpm" TO mash_manual_last_sulfate_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashManualLastChlorideAddedPpm" TO mash_manual_last_chloride_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashManualLastCalculatedAt" TO mash_manual_last_calculated_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashSaltAdditionsJson" TO mash_salt_additions_json;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashSaltsLastResultJson" TO mash_salts_last_result_json;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashOverallLastResultJson" TO mash_overall_last_result_json;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashOverallLastCalculatedAt" TO mash_overall_last_calculated_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashGristImportedJson" TO mash_grist_imported_json;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashGristImportedAt" TO mash_grist_imported_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "mashGristSourceRecipeUpdatedAt" TO mash_grist_source_recipe_updated_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeWaterProfileId" TO sparge_water_profile_id;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeStartingAlkalinityPpmCaCO3" TO sparge_starting_alkalinity_ppm_caco3;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeStartingPh" TO sparge_starting_ph;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeTargetPh" TO sparge_target_ph;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeVolumeLiters" TO sparge_volume_liters;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeAcidType" TO sparge_acid_type;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeStrengthKind" TO sparge_strength_kind;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeStrengthValue" TO sparge_strength_value;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeLastAcidRequiredMl" TO sparge_last_acid_required_ml;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeLastAcidRequiredTsp" TO sparge_last_acid_required_tsp;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeLastAcidRequiredGrams" TO sparge_last_acid_required_grams;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeLastAcidRequiredKg" TO sparge_last_acid_required_kg;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeLastFinalAlkalinityPpmCaCO3" TO sparge_last_final_alkalinity_ppm_caco3;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeLastSulfateAddedPpm" TO sparge_last_sulfate_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeLastChlorideAddedPpm" TO sparge_last_chloride_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeLastCalculatedAt" TO sparge_last_calculated_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeAcidificationMode" TO sparge_acidification_mode;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeManualAcidAddedMl" TO sparge_manual_acid_added_ml;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeManualAcidAddedGrams" TO sparge_manual_acid_added_grams;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeManualLastAchievedPh" TO sparge_manual_last_achieved_ph;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeManualLastFinalAlkalinityPpmCaCO3" TO sparge_manual_last_final_alkalinity_ppm_caco3;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeManualLastSulfateAddedPpm" TO sparge_manual_last_sulfate_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeManualLastChlorideAddedPpm" TO sparge_manual_last_chloride_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeManualLastCalculatedAt" TO sparge_manual_last_calculated_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeSaltAdditionsJson" TO sparge_salt_additions_json;
ALTER TABLE recipe_water_settings RENAME COLUMN "spargeSaltsLastResultJson" TO sparge_salts_last_result_json;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilSourceWaterProfileId" TO boil_source_water_profile_id;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilTargetWaterProfileId" TO boil_target_water_profile_id;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilDilutionWaterProfileId" TO boil_dilution_water_profile_id;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilTapWaterVolumeLiters" TO boil_tap_water_volume_liters;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilDilutionWaterVolumeLiters" TO boil_dilution_water_volume_liters;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilStartingAlkalinityPpmCaCO3" TO boil_starting_alkalinity_ppm_caco3;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilStartingPh" TO boil_starting_ph;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilTargetPh" TO boil_target_ph;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilWaterVolumeLiters" TO boil_water_volume_liters;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilAcidType" TO boil_acid_type;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilStrengthKind" TO boil_strength_kind;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilStrengthValue" TO boil_strength_value;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilLastAcidRequiredMl" TO boil_last_acid_required_ml;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilLastAcidRequiredTsp" TO boil_last_acid_required_tsp;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilLastAcidRequiredGrams" TO boil_last_acid_required_grams;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilLastAcidRequiredKg" TO boil_last_acid_required_kg;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilLastFinalAlkalinityPpmCaCO3" TO boil_last_final_alkalinity_ppm_caco3;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilLastSulfateAddedPpm" TO boil_last_sulfate_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilLastChlorideAddedPpm" TO boil_last_chloride_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilLastCalculatedAt" TO boil_last_calculated_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilAcidificationMode" TO boil_acidification_mode;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilManualAcidAddedMl" TO boil_manual_acid_added_ml;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilManualAcidAddedGrams" TO boil_manual_acid_added_grams;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilManualLastAchievedPh" TO boil_manual_last_achieved_ph;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilManualLastFinalAlkalinityPpmCaCO3" TO boil_manual_last_final_alkalinity_ppm_caco3;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilManualLastSulfateAddedPpm" TO boil_manual_last_sulfate_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilManualLastChlorideAddedPpm" TO boil_manual_last_chloride_added_ppm;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilManualLastCalculatedAt" TO boil_manual_last_calculated_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilSaltAdditionsJson" TO boil_salt_additions_json;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilSaltsLastResultJson" TO boil_salts_last_result_json;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilOverallLastResultJson" TO boil_overall_last_result_json;
ALTER TABLE recipe_water_settings RENAME COLUMN "boilOverallLastCalculatedAt" TO boil_overall_last_calculated_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE recipe_water_settings RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: water_profiles
ALTER TABLE water_profiles RENAME COLUMN "accountId" TO account_id;
ALTER TABLE water_profiles RENAME COLUMN "verificationStatus" TO verification_status;
ALTER TABLE water_profiles RENAME COLUMN "submittedByUserId" TO submitted_by_user_id;
ALTER TABLE water_profiles RENAME COLUMN "verifiedByUserId" TO verified_by_user_id;
ALTER TABLE water_profiles RENAME COLUMN "verifiedAt" TO verified_at;
ALTER TABLE water_profiles RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE water_profiles RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: fermentables
ALTER TABLE fermentables RENAME COLUMN "accountId" TO account_id;
ALTER TABLE fermentables RENAME COLUMN "colorEbc" TO color_ebc;
ALTER TABLE fermentables RENAME COLUMN "colorOriginal" TO color_original;
ALTER TABLE fermentables RENAME COLUMN "colorOriginalUnit" TO color_original_unit;
ALTER TABLE fermentables RENAME COLUMN "colorLovibond" TO color_lovibond;
ALTER TABLE fermentables RENAME COLUMN "colorSrm" TO color_srm;
ALTER TABLE fermentables RENAME COLUMN "potentialSg" TO potential_sg;
ALTER TABLE fermentables RENAME COLUMN "yieldPercent" TO yield_percent;
ALTER TABLE fermentables RENAME COLUMN "mashDiPh" TO mash_di_ph;
ALTER TABLE fermentables RENAME COLUMN "mashTaToPh57_mEqPerKg" TO mash_ta_to_ph57_meq_per_kg;
ALTER TABLE fermentables RENAME COLUMN "mashPhModelKey" TO mash_ph_model_key;
ALTER TABLE fermentables RENAME COLUMN "mashPhModelSource" TO mash_ph_model_source;
ALTER TABLE fermentables RENAME COLUMN "mashPhModelVersion" TO mash_ph_model_version;
ALTER TABLE fermentables RENAME COLUMN "deprecatedAt" TO deprecated_at;
ALTER TABLE fermentables RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE fermentables RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: hops
ALTER TABLE hops RENAME COLUMN "accountId" TO account_id;
ALTER TABLE hops RENAME COLUMN "alphaMin" TO alpha_min;
ALTER TABLE hops RENAME COLUMN "alphaMax" TO alpha_max;
ALTER TABLE hops RENAME COLUMN "betaMin" TO beta_min;
ALTER TABLE hops RENAME COLUMN "betaMax" TO beta_max;
ALTER TABLE hops RENAME COLUMN "deprecatedAt" TO deprecated_at;
ALTER TABLE hops RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE hops RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: yeasts
ALTER TABLE yeasts RENAME COLUMN "accountId" TO account_id;
ALTER TABLE yeasts RENAME COLUMN "productId" TO product_id;
ALTER TABLE yeasts RENAME COLUMN "endPhMin" TO end_ph_min;
ALTER TABLE yeasts RENAME COLUMN "endPhMax" TO end_ph_max;
ALTER TABLE yeasts RENAME COLUMN "pitchTempC" TO pitch_temp_c;
ALTER TABLE yeasts RENAME COLUMN "tolerancePercent" TO tolerance_percent;
ALTER TABLE yeasts RENAME COLUMN "attenuationMin" TO attenuation_min;
ALTER TABLE yeasts RENAME COLUMN "attenuationMax" TO attenuation_max;
ALTER TABLE yeasts RENAME COLUMN "flocculationPercent" TO flocculation_percent;
ALTER TABLE yeasts RENAME COLUMN "tempMinC" TO temp_min_c;
ALTER TABLE yeasts RENAME COLUMN "tempMaxC" TO temp_max_c;
ALTER TABLE yeasts RENAME COLUMN "deprecatedAt" TO deprecated_at;
ALTER TABLE yeasts RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE yeasts RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: ingredient_sources
ALTER TABLE ingredient_sources RENAME COLUMN "sourceName" TO source_name;
ALTER TABLE ingredient_sources RENAME COLUMN "sourceUrl" TO source_url;
ALTER TABLE ingredient_sources RENAME COLUMN "sourceLicense" TO source_license;
ALTER TABLE ingredient_sources RENAME COLUMN "resourcePath" TO resource_path;
ALTER TABLE ingredient_sources RENAME COLUMN "lastCheckedAt" TO last_checked_at;
ALTER TABLE ingredient_sources RENAME COLUMN "lastAppliedAt" TO last_applied_at;
ALTER TABLE ingredient_sources RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE ingredient_sources RENAME COLUMN "updatedAt" TO updated_at;

-- Columns: ingredient_import_runs
ALTER TABLE ingredient_import_runs RENAME COLUMN "sourceId" TO source_id;
ALTER TABLE ingredient_import_runs RENAME COLUMN "startedAt" TO started_at;
ALTER TABLE ingredient_import_runs RENAME COLUMN "finishedAt" TO finished_at;
ALTER TABLE ingredient_import_runs RENAME COLUMN "statsJson" TO stats_json;
ALTER TABLE ingredient_import_runs RENAME COLUMN "createdAt" TO created_at;

-- Columns: ingredient_staging_rows
ALTER TABLE ingredient_staging_rows RENAME COLUMN "importRunId" TO import_run_id;
ALTER TABLE ingredient_staging_rows RENAME COLUMN "sourceKey" TO source_key;
ALTER TABLE ingredient_staging_rows RENAME COLUMN "rawPayloadJson" TO raw_payload_json;
ALTER TABLE ingredient_staging_rows RENAME COLUMN "warningsJson" TO warnings_json;
ALTER TABLE ingredient_staging_rows RENAME COLUMN "createdAt" TO created_at;

-- Columns: ingredient_source_maps
ALTER TABLE ingredient_source_maps RENAME COLUMN "sourceName" TO source_name;
ALTER TABLE ingredient_source_maps RENAME COLUMN "sourceKey" TO source_key;
ALTER TABLE ingredient_source_maps RENAME COLUMN "fermentableId" TO fermentable_id;
ALTER TABLE ingredient_source_maps RENAME COLUMN "hopId" TO hop_id;
ALTER TABLE ingredient_source_maps RENAME COLUMN "yeastId" TO yeast_id;
ALTER TABLE ingredient_source_maps RENAME COLUMN "lastSeenAt" TO last_seen_at;
ALTER TABLE ingredient_source_maps RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE ingredient_source_maps RENAME COLUMN "updatedAt" TO updated_at;

COMMIT;

