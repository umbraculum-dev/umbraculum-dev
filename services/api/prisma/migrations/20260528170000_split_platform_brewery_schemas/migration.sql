-- RFC-0010: split platform + brewery Postgres schemas (forward migration only)

CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS brewery;

-- Platform enums
ALTER TYPE "public"."workspace_role" SET SCHEMA platform;
ALTER TYPE "public"."ad_placement" SET SCHEMA platform;
ALTER TYPE "public"."ad_platform" SET SCHEMA platform;
ALTER TYPE "public"."billing_tier" SET SCHEMA platform;
ALTER TYPE "public"."billing_source" SET SCHEMA platform;
ALTER TYPE "public"."billing_purchase_provider" SET SCHEMA platform;
ALTER TYPE "public"."billing_purchase_intent_mode" SET SCHEMA platform;
ALTER TYPE "public"."billing_purchase_intent_status" SET SCHEMA platform;
ALTER TYPE "public"."billing_event_provider" SET SCHEMA platform;
ALTER TYPE "public"."ai_provider" SET SCHEMA platform;
ALTER TYPE "public"."ai_proposal_status" SET SCHEMA platform;
ALTER TYPE "public"."integration_kind" SET SCHEMA platform;

-- Brewery enums
ALTER TYPE "public"."water_profile_scope" SET SCHEMA brewery;
ALTER TYPE "public"."water_profile_type" SET SCHEMA brewery;
ALTER TYPE "public"."water_profile_verification_status" SET SCHEMA brewery;
ALTER TYPE "public"."ingredient_kind" SET SCHEMA brewery;
ALTER TYPE "public"."color_unit" SET SCHEMA brewery;
ALTER TYPE "public"."brew_session_status" SET SCHEMA brewery;
ALTER TYPE "public"."brew_session_step_status" SET SCHEMA brewery;
ALTER TYPE "public"."brew_session_step_timer_state" SET SCHEMA brewery;
ALTER TYPE "public"."brew_session_log_kind" SET SCHEMA brewery;
ALTER TYPE "public"."inventory_category" SET SCHEMA brewery;
ALTER TYPE "public"."inventory_unit" SET SCHEMA brewery;

-- Platform roots and horizontal tables
ALTER TABLE "public"."users" SET SCHEMA platform;
ALTER TABLE "public"."workspaces" SET SCHEMA platform;
ALTER TABLE "public"."ads" SET SCHEMA platform;

-- Brewery domain tables (before integration attachments that FK brew_sessions)
ALTER TABLE "public"."beer_styles" SET SCHEMA brewery;
ALTER TABLE "public"."beer_style_aliases" SET SCHEMA brewery;
ALTER TABLE "public"."water_profiles" SET SCHEMA brewery;
ALTER TABLE "public"."equipment_profiles" SET SCHEMA brewery;
ALTER TABLE "public"."recipes" SET SCHEMA brewery;
ALTER TABLE "public"."recipe_water_settings" SET SCHEMA brewery;
ALTER TABLE "public"."brewday_settings" SET SCHEMA brewery;
ALTER TABLE "public"."brew_sessions" SET SCHEMA brewery;
ALTER TABLE "public"."brew_session_steps" SET SCHEMA brewery;
ALTER TABLE "public"."brew_session_logs" SET SCHEMA brewery;
ALTER TABLE "public"."fermentables" SET SCHEMA brewery;
ALTER TABLE "public"."hops" SET SCHEMA brewery;
ALTER TABLE "public"."yeasts" SET SCHEMA brewery;
ALTER TABLE "public"."ingredient_sources" SET SCHEMA brewery;
ALTER TABLE "public"."ingredient_import_runs" SET SCHEMA brewery;
ALTER TABLE "public"."ingredient_staging_rows" SET SCHEMA brewery;
ALTER TABLE "public"."ingredient_source_maps" SET SCHEMA brewery;
ALTER TABLE "public"."inventory_items" SET SCHEMA brewery;

-- Remaining platform tables (integrations reference brewery.brew_sessions cross-schema)
ALTER TABLE "public"."workspace_members" SET SCHEMA platform;
ALTER TABLE "public"."sessions" SET SCHEMA platform;
ALTER TABLE "public"."email_verification_tokens" SET SCHEMA platform;
ALTER TABLE "public"."workspace_billing" SET SCHEMA platform;
ALTER TABLE "public"."billing_purchase_intents" SET SCHEMA platform;
ALTER TABLE "public"."billing_user_workspace_binding" SET SCHEMA platform;
ALTER TABLE "public"."billing_events" SET SCHEMA platform;
ALTER TABLE "public"."workspace_ai_settings" SET SCHEMA platform;
ALTER TABLE "public"."workspace_ai_memory" SET SCHEMA platform;
ALTER TABLE "public"."ai_usage_ledger" SET SCHEMA platform;
ALTER TABLE "public"."ai_proposals" SET SCHEMA platform;
ALTER TABLE "public"."webview_exchange_codes" SET SCHEMA platform;
ALTER TABLE "public"."integrations" SET SCHEMA platform;
ALTER TABLE "public"."integration_devices" SET SCHEMA platform;
ALTER TABLE "public"."integration_device_attachments" SET SCHEMA platform;
ALTER TABLE "public"."integration_readings" SET SCHEMA platform;

-- Cross-schema FK: automation.vessels -> brewery.equipment_profiles (RFC-0010)
ALTER TABLE automation.vessels
  ADD CONSTRAINT "vessels_equipment_profile_id_fkey"
  FOREIGN KEY ("equipment_profile_id") REFERENCES brewery.equipment_profiles("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Reporting view: point at brewery.inventory_items
CREATE OR REPLACE VIEW reporting.brewery_inventory_summary AS
SELECT
  ii.workspace_id,
  ii.category::text AS category,
  COALESCE(SUM(ii.quantity), 0)::numeric AS on_hand_qty
FROM brewery.inventory_items ii
GROUP BY ii.workspace_id, ii.category;
