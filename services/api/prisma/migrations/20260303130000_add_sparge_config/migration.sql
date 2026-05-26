-- Sparge configuration (Time, Ramp, Type)
ALTER TABLE recipe_water_settings ADD COLUMN sparge_step_time_min INTEGER DEFAULT 60;
ALTER TABLE recipe_water_settings ADD COLUMN sparge_step_ramp_min INTEGER DEFAULT 0;
ALTER TABLE recipe_water_settings ADD COLUMN sparge_method_type TEXT DEFAULT 'fly_sparge';
