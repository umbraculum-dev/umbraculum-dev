# RFC-0010 — Platform and brewery Postgres schema split

**Tier:** Public
**Status:** Accepted 2026-05-28 (pre-public-flip solo-author + core-team approval recorded; this is a living RFC — see §8 Resolution for the change procedure)
**Audience:** prospective contributors, third-party module developers, self-hosters, hosted-service customers, evaluators preparing to adopt Umbraculum as a long-term operational dependency.
**Document role:** closes RFC-0002 §11.4 deferral — `platform.*` + `brewery.*` Postgres schemas before the July 2026 public flip.

> **Disclaimer.** This RFC authorizes a one-time forward migration of Prisma-managed models out of the legacy `public` namespace. It does not relitigate RFC-0002 Decisions A–C (β layout, naming, `registerModule()` location). Companion runbook: [`docs/design/platform-brewery-postgres-schema-split.md`](../design/platform-brewery-postgres-schema-split.md).

---

## 1. Summary

This RFC commits to five decisions:

- **Decision A — Authorize `platform` and `brewery` Postgres schemas.** Horizontal tenancy, auth, billing, ads, AI consultant state, and the integrations IoT framework live in `platform.*`. The tier-6 brewery vertical's domain tables live in `brewery.*`. Canonical module schemas (`automation`, `pim`, `mrp`, `crp`, `rendering`) are unchanged. SQL-only schemas (`ai`, `reporting`) remain outside Prisma `datasource.schemas`.

- **Decision B — Model allocation is fixed per the companion doc §2.** ~19 platform models + 12 platform enums; ~18 brewery models + 11 brewery enums. No new Prisma-managed models land in `public` after this RFC ships.

- **Decision C — Forward migration only.** One new migration (`ALTER SCHEMA` / `SET SCHEMA`); historical migration files are not rewritten.

- **Decision D — Amend RFC-0002 §11.4.** The first deferred bullet ("full brewery Postgres schema split from `public`") is **DONE** as of this RFC. ESLint import boundaries and external-repo packaging deferrals remain on their original terms.

- **Decision E — Pre-flip timing.** This split lands before the fresh public repository seed ([`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1) so external contributors never clone a codebase whose first commit still mixes platform and brewery in `public`.

---

## 2. Motivation

RFC-0006 accelerated the brewery **file move** but explicitly retained the Prisma deferral. With the public flip moved to July 2026, deferring the schema split to H1 2027 would:

- ship alpha self-hosters a layout the architecture docs already describe as interim;
- force a community-facing upgrade migration after pilots accumulate data;
- waste the fresh-seed opportunity to start public git history with the target shape.

The file move proved β layout without data-layer risk; this RFC completes the data-layer alignment once, with maintainer-controlled backup/restore discipline pre-flip.

---

## 3. Decision A — Schema authorization (commit)

Postgres schemas after this RFC:

| Schema | Owner | Examples |
|--------|-------|----------|
| `platform` | Horizontal platform | `users`, `workspaces`, `workspace_billing`, `integrations`, `ai_usage_ledger` |
| `brewery` | Tier-6 vertical | `recipes`, `brew_sessions`, `equipment_profiles`, `inventory_items` |
| `automation`, `pim`, `mrp`, `crp`, `rendering` | Canonical modules | unchanged |
| `ai`, `reporting` | SQL-only | pgvector RAG, reporting views — not in Prisma `datasource.schemas` |
| `public` | Legacy empty for Prisma | `_prisma_migrations` only |

---

## 4. Decision B — Cross-schema relations (commit)

Prisma `multiSchema` cross-schema `@relation` is permitted when both schemas appear in `datasource.schemas`. This RFC ships:

- `brewery.*` → `platform.Workspace` (tenancy FKs)
- `platform.IntegrationDeviceAttachment` / `IntegrationReading` → `brewery.BrewSession`
- `automation.Vessel` → `brewery.EquipmentProfile` (formal FK replacing L1 app-level UUID)

Prefer app-level UUID only when documented (future modules); do not add new cross-schema relations without updating the companion doc.

---

## 5. Decision C — Migration discipline (commit)

- **Backup before apply:** `pg_dump -Fc` of `brewapp` and `brewapp_test` to `backups/` (gitignored) — see companion doc §3.
- **Forward migration:** `services/api/prisma/migrations/20260528170000_split_platform_brewery_schemas/`
- **Reporting view:** `reporting.brewery_inventory_summary` recreated to read `brewery.inventory_items`.
- **No historical rewrite:** applied migrations under `prisma/migrations/` prior to this RFC are immutable.

---

## 6. Decision D — RFC-0002 §11.4 amendment (commit)

[RFC-0002](0002-canonical-module-physical-layout.md) §11.4 first bullet is superseded:

> ~~Full `brewery` Postgres schema split from `public`~~ → **Shipped (RFC-0010).** `registerModule({ code: "brewery", prismaSchema: "brewery" })` is required.

---

## 7. Decision E — Pre-flip / public seed (commit)

The July 2026 fresh public seed MUST include this migration. No external alpha upgrade guide is required for the schema split itself (no public alpha users exist at apply time). Self-hosters who cloned private pre-flip commits restore from backup or run `prisma migrate deploy`.

---

## 8. Resolution

**Status: Accepted 2026-05-28.**

Amendments require a successor RFC at `docs/rfcs/NNNN-<title>.md` with migration plan. Material changes to model allocation (e.g. moving `Integration*` to a future `integrations` schema) re-trigger the 30-day public-comment window post-public-alpha per [`LICENSING.md`](../LICENSING.md) §10.

**Touched docs:** [`docs/rfcs/README.md`](README.md), [`docs/rfcs/0002-canonical-module-physical-layout.md`](0002-canonical-module-physical-layout.md) §11.4, [`docs/design/platform-brewery-postgres-schema-split.md`](../design/platform-brewery-postgres-schema-split.md), [`docs/design/rfc-companion-documentation-audit.md`](../design/rfc-companion-documentation-audit.md).
