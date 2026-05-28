# `docs/modules/contribute/` — contributor paths

**Tier:** Public

> [!NOTE]
> Per-target contribution guides. Pick the path that matches what you're adding. The Umbraculum module ecosystem has four kinds of additions, and the ceremony cost varies by an order of magnitude across them. Read this index first, then jump to the right page.

## The four paths

Find your "I want to add a ___" goal in the left column; the right column tells you which page to read and what ceremony level you're signing up for.

| You want to add… | Read | Ceremony |
|---|---|---|
| **A new canonical module** (a new reserved code like `quality`, `maintenance`, `hr`) | [`canonical-module.md`](canonical-module.md) | **High** — mini-RFC + consumption-contract checklist + core team approval. The only gated path in the ecosystem. |
| **A vertical configuration** (a new vertical like `distillery`, `kombucha`, `cosmetics`) | [`vertical-configuration.md`](vertical-configuration.md) | **None** (Tier 6, permissionless). Use brewery as the worked example. |
| **A third-party / community module** against an existing canonical (e.g. a Salesforce connector for the future `crm`) | [`third-party-module.md`](third-party-module.md) | **None** (Tier 3 / Tier 4, permissionless). Pin the SDK, ship from your own repo. |
| **A horizontal package** (cross-cutting infrastructure consumed by every module) | [`horizontal-package.md`](horizontal-package.md) | **Low** — regular PR with reviewer agreement that the concern is genuinely cross-cutting. Package index: [`../packages/README.md`](../packages/README.md). |

## Common to all four paths — the consumption contract

Whatever you're building, you do **not** ship a parallel implementation of any horizontal platform service. Auth, sessions, tenancy, ACL, billing, AI orchestration, observability, i18n, UI primitives, secrets, integrations, HTTP, DB — all owned by the platform, all consumed (never replaced) by every module and every vertical. This is [RFC-0001 §8 (Decision F)](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md), and it applies to all four paths above without exception.

If your idea requires owning one of those concerns yourself, you're not contributing a module — you're proposing a horizontal-platform change. That goes through a different process (typically an RFC against `docs/PLATFORM-ARCHITECTURE.md`).

## Common to all four paths — the consumption-contract pre-check

Before you start writing code, run a one-minute sanity check against the per-service obligation table in [RFC-0001 §8.2](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md). If your design implies "we'll add our own X" for any X in that table, stop and reconsider — either you missed an extension point, or you're misclassifying what you're building.

## Cross-references

- [`docs/MODULES.md`](../../MODULES.md) — ecosystem entry page (vocabulary + catalog).
- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) — governance, tier model, consumption contract.
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) — β physical layout, naming conventions.
- [`docs/modules/packages/README.md`](../packages/README.md) — package workspace index (horizontal + contracts + vertical-flavored).
- [`docs/LICENSING.md`](../../LICENSING.md) — per-tier license obligations.
