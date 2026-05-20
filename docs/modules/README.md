# `docs/modules/` — per-module pages

**Tier:** Public

> [!NOTE]
> The Umbraculum module ecosystem entry point is **[`docs/MODULES.md`](../MODULES.md)** — start there for vocabulary, the full catalog, the "I want to build a ___" decision tree, and a worked example.

This directory holds **per-artifact pages** linked from `MODULES.md`. It is intentionally narrow in scope; substantive arguments live in the [RFCs](../rfcs/), and substantive implementation lives in the package READMEs.

## Layout

| Sub-directory | Purpose |
|---|---|
| `canonical/` | One page per canonical module (Tier 1, reserved codes from [RFC-0001 §4](../rfcs/0001-modules-tiers-governance-and-automation-placement.md)). Pages land as each module ships. |
| `verticals/` | One page per vertical configuration (Tier 6 — currently just `brewery`). Pages land with the H1 2027 β migration ([RFC-0002 Decision D](../rfcs/0002-canonical-module-physical-layout.md)). |
| `packages/` | Index of horizontal packages (cross-cutting infrastructure that is *not* a module). Each row links to the package's own `README.md`. |
| `contribute/` | "I want to build a ___" guides — per-target contribution paths with working examples. |

## What's here today

| Path | Coverage |
|---|---|
| [`canonical/automation.md`](canonical/automation.md) | **Shipped** — read path + L2 isolation tests; Phase C pending. Use this as the template for the next canonical module. |
| [`canonical/mrp.md`](canonical/mrp.md) | **Open door** stub — code reserved, β layout pre-committed, no implementation yet. |
| [`canonical/wms.md`](canonical/wms.md) | **Open door** stub — same. Native-mandatory when shipped. |
| [`canonical/crm.md`](canonical/crm.md) | **Open door** stub — same. No firm horizon. |
| [`canonical/crp.md`](canonical/crp.md) | **Open door** stub — same. Co-designed with `mrp`. |
| [`canonical/pim.md`](canonical/pim.md) | **Shipped — Phase A + B + C + D-integration-test-Option-B** (read path, web admin, cross-module composition proof); Phase E write paths + channel feeds + Option-A real-FK queued per [surface doc](../design/canonical-pim-module-surface.md) §"Open work". Build record at [`design/canonical-pim-build-log.md`](../design/canonical-pim-build-log.md). |
| [`verticals/brewery.md`](verticals/brewery.md) | **Shipped — reference vertical** (flat layout today; β migration H1 2027). |
| [`contribute/README.md`](contribute/README.md) | Contributor entry — picks one of four paths below. |
| [`contribute/canonical-module.md`](contribute/canonical-module.md) | Allocating a new canonical code (mini-RFC procedure). |
| [`contribute/vertical-configuration.md`](contribute/vertical-configuration.md) | Building a new vertical (uses brewery as worked example). |
| [`contribute/third-party-module.md`](contribute/third-party-module.md) | Tier 3 / Tier 4 connector or extension against an existing canonical. |
| [`contribute/horizontal-package.md`](contribute/horizontal-package.md) | New cross-cutting package under `packages/<name>/`. |

## Adding a per-module page

When a new canonical module's read path ships (the equivalent of `automation`'s Phase B), add a page under `canonical/<code>.md`. Mirror the section layout of `automation.md`:

1. Front matter: Tier / Status / Code / Module tier / License / Audience.
2. §1 What it does (one paragraph).
3. §2 The four slices (β layout — API / web / native / contracts).
4. §3 Registration (the `registerModule()` call, copied from real code via a code reference).
5. §4 HTTP routes (table — method, path, auth, response shape).
6. §5 AI tools (table — name, purpose, scopes).
7. §6 Adapter SDK contract or equivalent third-party-facing surface (when applicable).
8. §7 Data model (Prisma schema name + tables).
9. §8 Tier limits.
10. §9 Phase plan and timeline.
11. §10 How to consume the module from another module / vertical.
12. §11 Cross-references.

Then update [`docs/MODULES.md`](../MODULES.md) §3.1 to flip the row's status from "Open door" to whatever phase shipped, and link to the new page.
