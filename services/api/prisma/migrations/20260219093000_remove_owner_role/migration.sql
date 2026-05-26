-- Remove the account-scoped "owner" role.
--
-- Policy:
-- - All former owners become brewery_admin.
-- - The Postgres enum `account_role` no longer includes `owner`.

BEGIN;

-- 0) Drop default to avoid enum swap issues.
ALTER TABLE account_members
ALTER COLUMN role DROP DEFAULT;

-- 1) Data migration: ensure no rows still use `owner`.
UPDATE account_members
SET role = 'brewery_admin'
WHERE role = 'owner';

-- 2) Enum migration: rebuild without `owner`.
ALTER TYPE account_role RENAME TO account_role_old;

CREATE TYPE account_role AS ENUM ('brewery_admin', 'member', 'viewer');

ALTER TABLE account_members
ALTER COLUMN role TYPE account_role
USING role::text::account_role;

-- Restore default.
ALTER TABLE account_members
ALTER COLUMN role SET DEFAULT 'member';

DROP TYPE account_role_old;

COMMIT;

