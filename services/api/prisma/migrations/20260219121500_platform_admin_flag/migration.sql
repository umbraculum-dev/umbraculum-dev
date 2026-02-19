-- Platform admin flag on users.

BEGIN;

ALTER TABLE users
ADD COLUMN is_platform_admin BOOLEAN NOT NULL DEFAULT false;

COMMIT;

