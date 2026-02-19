-- Sparge step temperature (editable in Edit recipe when sparge is configured)
ALTER TABLE recipe_water_settings ADD COLUMN sparge_step_temperature_c DOUBLE PRECISION DEFAULT 76;
