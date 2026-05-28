# Platform + brewery Postgres schema split — companion runbook

**Tier:** Public
**Status:** As-built companion to [RFC-0010](../rfcs/0010-platform-brewery-postgres-schema-split.md)
**Audience:** maintainers, agents executing schema migrations
**Last reviewed:** 2026-05-28

> [!NOTE]
> Governance commitment: [RFC-0010](../rfcs/0010-platform-brewery-postgres-schema-split.md). Strategy context: [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.5 option 3.

---

## 1. Verdict

**Shipped.** Prisma `datasource.schemas` is `platform`, `brewery`, `automation`, `pim`, `mrp`, `crp`, `rendering`. No Prisma-managed models remain in `public` except `_prisma_migrations`.

Forward migration: `services/api/prisma/migrations/20260528170000_split_platform_brewery_schemas/migration.sql`

---

## 2. Model allocation

### `platform.*`

**Enums:** `WorkspaceRole`, `AdPlacement`, `AdPlatform`, `BillingTier`, `BillingSource`, `BillingPurchaseProvider`, `BillingPurchaseIntentMode`, `BillingPurchaseIntentStatus`, `BillingEventProvider`, `AiProvider`, `AiProposalStatus`, `IntegrationKind`

**Models:** `User`, `Workspace`, `WorkspaceMember`, `Session`, `WebviewExchangeCode`, `EmailVerificationToken`, `Ad`, `WorkspaceBilling`, `BillingPurchaseIntent`, `BillingUserWorkspaceBinding`, `BillingEvent`, `WorkspaceAiSettings`, `WorkspaceAiMemory`, `AiUsageLedger`, `AiProposal`, `Integration`, `IntegrationDevice`, `IntegrationDeviceAttachment`, `IntegrationReading`

### `brewery.*`

**Enums:** `WaterProfileScope`, `WaterProfileType`, `WaterProfileVerificationStatus`, `IngredientKind`, `ColorUnit`, `BrewSessionStatus`, `BrewSessionStepStatus`, `BrewSessionStepTimerState`, `BrewSessionLogKind`, `InventoryCategory`, `InventoryUnit`

**Models:** `BrewdaySettings`, `BrewSession`, `BrewSessionStep`, `BrewSessionLog`, `BeerStyle`, `BeerStyleAlias`, `Recipe`, `RecipeWaterSettings`, `WaterProfile`, `EquipmentProfile`, `Fermentable`, `Hop`, `Yeast`, `IngredientSource`, `IngredientImportRun`, `IngredientStagingRow`, `IngredientSourceMap`, `InventoryItem`

### Cross-schema relations (Prisma)

| From | To |
|------|-----|
| `brewery.*` (workspace-scoped) | `platform.Workspace` |
| `platform.IntegrationDeviceAttachment` | `brewery.BrewSession` |
| `platform.IntegrationReading` | `brewery.BrewSession` |
| `automation.Vessel` | `brewery.EquipmentProfile` |

---

## 3. Backup and restore (required before apply)

**Location:** `backups/` at repo root (gitignored).

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U postgres -d brewapp -Fc -f /tmp/brewapp_pre_schema_split.dump
docker compose cp postgres:/tmp/brewapp_pre_schema_split.dump backups/brewapp_pre_schema_split_$(date +%Y%m%d_%H%M%S).dump

docker compose exec -T postgres pg_dump -U postgres -d brewapp_test -Fc -f /tmp/brewapp_test_pre_schema_split.dump
docker compose cp postgres:/tmp/brewapp_test_pre_schema_split.dump backups/brewapp_test_pre_schema_split_$(date +%Y%m%d_%H%M%S).dump
```

**Restore (rollback):**

```bash
docker compose exec -T postgres dropdb -U postgres --if-exists brewapp
docker compose exec -T postgres createdb -U postgres brewapp
docker compose cp backups/brewapp_pre_schema_split_YYYYMMDD_HHMMSS.dump postgres:/tmp/restore.dump
docker compose exec -T postgres pg_restore -U postgres -d brewapp /tmp/restore.dump
```

For dev-only reset instead of restore: `docker compose exec -T api sh -c 'DATABASE_URL=$DATABASE_URL_DIRECT npx prisma migrate reset --force'`.

---

## 4. Migration apply

Inside API container (direct Postgres URL bypasses pgpool for DDL):

```bash
docker compose exec -T api sh -c 'cd /app && DATABASE_URL=$DATABASE_URL_DIRECT npx prisma migrate deploy'
docker compose exec -T api sh -c 'cd /app && npx prisma generate'
docker compose restart api
```

Test DB (CI parity):

```bash
docker compose exec -T api npm run test:db:prepare
```

---

## 5. Reporting view

`reporting.brewery_inventory_summary` reads `brewery.inventory_items` (updated in the forward migration). The reporting executor queries the view by name — no application SQL changes required.

---

## 6. Module registration

[`services/api/src/modules/brewery/index.ts`](../../services/api/src/modules/brewery/index.ts) sets `prismaSchema: "brewery"` on `registerModule()`.

---

## 7. Public flip

The fresh public seed includes migration `20260528170000_split_platform_brewery_schemas` from commit 1. No alpha upgrade guide for this split.

---

## 8. pgpool / replica

Schema moves are DDL on the primary; streaming replication propagates normally. No pgpool configuration change required.
