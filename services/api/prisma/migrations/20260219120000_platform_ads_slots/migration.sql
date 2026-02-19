-- Platform ads (web) + account/workspace no-ads flag.

BEGIN;

-- Account-level ads policy (platform-controlled).
ALTER TABLE accounts
ADD COLUMN ads_disabled BOOLEAN NOT NULL DEFAULT false;

-- Ads: placement + platform enums.
CREATE TYPE ad_placement AS ENUM (
  'global_top',
  'global_bottom',
  'recipe_edit_after_fermentables',
  'recipe_edit_after_hops',
  'recipe_edit_after_yeast'
);

CREATE TYPE ad_platform AS ENUM (
  'web'
);

-- Ads table.
CREATE TABLE ads (
  id TEXT NOT NULL,
  placement ad_placement NOT NULL,
  platform ad_platform NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP(3),
  ends_at TIMESTAMP(3),
  priority INTEGER NOT NULL DEFAULT 0,
  weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL,
  CONSTRAINT ads_pkey PRIMARY KEY (id)
);

CREATE INDEX ads_placement_platform_is_active_idx ON ads(placement, platform, is_active);
CREATE INDEX ads_platform_is_active_idx ON ads(platform, is_active);
CREATE INDEX ads_starts_at_idx ON ads(starts_at);
CREATE INDEX ads_ends_at_idx ON ads(ends_at);

COMMIT;

