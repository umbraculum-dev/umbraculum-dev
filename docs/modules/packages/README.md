# `docs/modules/packages/` — package index

**Tier:** Public

> [!NOTE]
> Quick primer for **npm workspaces under `packages/`** — horizontal infrastructure, canonical contracts slices, and vertical-flavored packages. For module vocabulary and the "I want to build a ___" tree, start at [`docs/MODULES.md`](../../MODULES.md). For contribution mechanics, see [`../contribute/horizontal-package.md`](../contribute/horizontal-package.md) (horizontal) or [`../contribute/vertical-configuration.md`](../contribute/vertical-configuration.md) (vertical-flavored).

This index links to each package's own `README.md` (the runnable Usage / build commands live there). Module README quality is enforced by [`docs/DOCS-README-STANDARDS.md`](../../DOCS-README-STANDARDS.md) and CI (`scripts/docs/check-readmes.py`).

---

## 1. How to read this index

| Category | Scope prefix | Registers via `registerModule()`? |
|---|---|---|
| **Horizontal infrastructure** | `@umbraculum/<name>` (unprefixed) | No — consumed by apps, services, and module slices |
| **Canonical contracts** | `@umbraculum/<code>-contracts` | No — the third-party pin surface for canonical `<code>` |
| **Vertical-flavored** | `@umbraculum/brewery-<name>` | No — brewery-vertical domain helpers and UI |

Horizontal packages must stay industry-agnostic ([RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md)). Vertical-flavored packages carry the brewery prefix so they are not mistaken for platform-wide infrastructure.

---

## 2. Horizontal infrastructure (platform-wide)

| Package | Role | README |
|---|---|---|
| `@umbraculum/module-sdk` | Module registration spine — `registerModule()`, reserved codes, `ValidatedSchema<T>`, web/native registration helpers | [`packages/sdk/module-sdk/README.md`](../../../packages/sdk/module-sdk/README.md) |
| `@umbraculum/ai-tool-sdk` | AI tool contract types (`AiTool`, scopes, registry) | [`packages/sdk/ai-tool-sdk/README.md`](../../../packages/sdk/ai-tool-sdk/README.md) |
| `@umbraculum/i18n-keys` | Module message-key conventions (`ModuleNavLabelKey`, reserved roots) | [`packages/sdk/i18n-keys/README.md`](../../../packages/sdk/i18n-keys/README.md) |
| `@umbraculum/contracts` | Platform-wide auth/me and shared API wire DTOs | [`packages/platform/contracts/README.md`](../../../packages/platform/contracts/README.md) |
| `@umbraculum/api-client` | HTTP client — cookie auth (web), bearer auth (native), render-job helpers | [`packages/platform/api-client/README.md`](../../../packages/platform/api-client/README.md) |
| `@umbraculum/i18n` | Cross-platform message catalog (`en`, `it`) | [`packages/platform/i18n/README.md`](../../../packages/platform/i18n/README.md) |
| `@umbraculum/i18n-react` | Universal `useT()` for React + React Native | [`packages/platform/i18n-react/README.md`](../../../packages/platform/i18n-react/README.md) |
| `@umbraculum/ui` | Tamagui design-system primitives (web + native) | [`packages/platform/ui/README.md`](../../../packages/platform/ui/README.md) |
| `@umbraculum/navigation` | Route IDs and cross-platform availability policy | [`packages/platform/navigation/README.md`](../../../packages/platform/navigation/README.md) |
| `@umbraculum/media` | Shared asset URLs and sync helpers | [`packages/platform/media/README.md`](../../../packages/platform/media/README.md) |
| `@umbraculum/rendering` | Document rendering pipeline ([RFC-0007](../../rfcs/0007-canonical-document-rendering.md)) | [`packages/platform/rendering/README.md`](../../../packages/platform/rendering/README.md) |
| `@umbraculum/test-mcp` | Test-MCP HTTP server (developer tooling) | [`packages/platform/test-mcp/README.md`](../../../packages/platform/test-mcp/README.md) |

**Worked examples for new horizontal packages:** [`@umbraculum/i18n`](../../../packages/platform/i18n/README.md) and [`@umbraculum/ui`](../../../packages/platform/ui/README.md) READMEs; consumption-contract checklist shape in [RFC-0007 §9](../../rfcs/0007-canonical-document-rendering.md) for `@umbraculum/rendering`.

---

## 3. Canonical contracts slices (per reserved code)

These are the **stable npm surfaces** third-party adapters and integrators pin. They are not horizontal infrastructure — each belongs to one canonical module's β layout ([RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md)).

| Package | Canonical | README |
|---|---|---|
| `@umbraculum/automation-contracts` | `automation` | [`packages/canonical/automation/contracts/README.md`](../../../packages/canonical/automation/contracts/README.md) |
| `@umbraculum/pim-contracts` | `pim` | [`packages/canonical/pim/contracts/README.md`](../../../packages/canonical/pim/contracts/README.md) |
| `@umbraculum/mrp-contracts` | `mrp` | [`packages/canonical/mrp/contracts/README.md`](../../../packages/canonical/mrp/contracts/README.md) |
| `@umbraculum/crp-contracts` | `crp` | [`packages/canonical/crp/contracts/README.md`](../../../packages/canonical/crp/contracts/README.md) |

Open-door canonicals (`wms`, `crm`) will gain `<code>-contracts` packages when their read paths ship.

**Integrator triangle:** pin **`@umbraculum/<code>-contracts`** (types) + read the **module route table** (human) + filter the **OpenAPI spec** by tag (machine-readable) — see [`API-OPENAPI.md`](../../API-OPENAPI.md).

---

## 4. Vertical-flavored (brewery reference vertical)

| Package | Role | README |
|---|---|---|
| `@umbraculum/brewery-core` | Gravity, unit conversion, mash pH helpers | [`packages/verticals/brewery/core/README.md`](../../../packages/verticals/brewery/core/README.md) |
| `@umbraculum/brewery-beerjson` | BeerJSON types and editor-row converters | [`packages/verticals/brewery/beerjson/README.md`](../../../packages/verticals/brewery/beerjson/README.md) |
| `@umbraculum/brewery-recipes-ui` | Recipe / water / yeast Tamagui editors | [`packages/verticals/brewery/recipes-ui/README.md`](../../../packages/verticals/brewery/recipes-ui/README.md) |

Future verticals use their own prefix (`@umbraculum/distillery-*`, etc.) per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md).

---

## 5. Cross-references

- [`docs/MODULES.md`](../../MODULES.md) §3.3 — catalog table (same packages, ecosystem framing)
- [`docs/REPOSITORY-STRUCTURE.md`](../../REPOSITORY-STRUCTURE.md) — five-layer mental model and workspace inventory
- [`docs/DOCS-README-STANDARDS.md`](../../DOCS-README-STANDARDS.md) — README template and CI gate
- [`../contribute/third-party-module.md`](../contribute/third-party-module.md) — pin `@umbraculum/<code>-contracts` from an external repo
