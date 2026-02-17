-- Create equipment_profiles (account-scoped equipment templates)

CREATE TABLE IF NOT EXISTS "equipment_profiles" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "account_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,

  "kettle_volume_liters" DOUBLE PRECISION,
  "kettle_losses_liters" DOUBLE PRECISION,
  "kettle_boil_evaporation_rate_percent_per_hour" DOUBLE PRECISION,
  "kettle_cooling_shrinkage_percent" DOUBLE PRECISION,
  "kettle_hops_absorption_liters" DOUBLE PRECISION,

  "mash_volume_liters" DOUBLE PRECISION,
  "mash_efficiency_percent" DOUBLE PRECISION,
  "mash_losses_liters" DOUBLE PRECISION,
  "mash_thickness_l_per_kg" DOUBLE PRECISION,
  "mash_grain_absorption_l_per_kg" DOUBLE PRECISION,
  "mash_water_leftover_liters" DOUBLE PRECISION,

  "other_losses_liters" DOUBLE PRECISION,

  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "equipment_profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "equipment_profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "equipment_profiles_account_id_name_key" ON "equipment_profiles"("account_id", "name");
CREATE INDEX IF NOT EXISTS "equipment_profiles_account_id_idx" ON "equipment_profiles"("account_id");

