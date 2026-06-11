# Brewery vertical lifecycle

**Tier:** Public  
**Status:** Shipped 2026-06 (Wave E)  
**Audience:** operators, integrators  
**Related:** [`installation-profile.md`](installation-profile.md)

---

## Opt-in (install brewery after core-only)

1. Switch installation profile to reference (env or manifest):

   ```bash
   export UMBRACULUM_MODULE_PROFILE=reference
   # or copy .umbraculum/install.reference.json → .umbraculum/install.json
   ```

2. Restart api/web so boot registers `registerBreweryModule`.

3. Apply database changes:

   ```bash
   ./scripts/prisma-brewery-opt-in.sh
   ```

   If the database was previously on core profile, `brewery` schema may have been stripped after migrate deploy. In that case restore from backup or contact maintainers — automated Prisma rollback is **not** supported (cross-schema FK risk).

4. Optional: seed reference data (`docker compose exec api npm run seed:e2e` for demo personas).

---

## Disable-only uninstall

Removing brewery from the installation profile:

- Stops boot registration, routes, build/CI vertical surface, and new brewery migrations at deploy.
- **Leaves** existing `brewery.*` tables and data in Postgres (Magento-like disable).

Operators who accept data loss may manually run:

```sql
ALTER TABLE IF EXISTS automation.vessels
  DROP CONSTRAINT IF EXISTS vessels_equipment_profile_id_fkey;
DROP SCHEMA IF EXISTS brewery CASCADE;
```

This is **not** automated in v1.

---

## Core profile migrate behavior

[`prisma-migrate-install-profile.sh`](../../scripts/prisma-migrate-install-profile.sh):

1. `prisma migrate deploy` (linear history — required by Prisma)
2. When brewery is **not** in profile: execute [`strip-brewery-schema.sql`](../../scripts/prisma/strip-brewery-schema.sql)

End state: no `brewery.*` objects on fresh core installs.

---

## MRP/CRP projections

When brewery is not installed, [`NullBreweryScheduleProjection`](../../services/api/src/platform/prismaBreweryScheduleProjection.ts) returns empty read models — MRP/CRP modules still register without querying missing schema.

---

## Demo host

`demo.umbraculum.dev` and onboarding walkthroughs must **explicitly** use the reference profile (`docker-compose.reference.yml` or env override). Fresh clone defaults to core.
