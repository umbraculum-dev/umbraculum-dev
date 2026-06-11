-- Core installation profile: remove brewery vertical schema after linear migrate deploy.
-- Safe on fresh installs and after disable-only uninstall (schema may already be absent).
-- See docs/design/brewery-vertical-lifecycle.md

ALTER TABLE IF EXISTS automation.vessels
  DROP CONSTRAINT IF EXISTS vessels_equipment_profile_id_fkey;

DROP SCHEMA IF EXISTS brewery CASCADE;
