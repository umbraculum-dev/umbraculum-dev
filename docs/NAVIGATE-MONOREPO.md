# Navigate the monorepo

**Tier:** Public  
**Status:** v1.0 — RFC-0012 (2026-06-08)  
**Audience:** onboarding developers, evaluators, anyone who needs the tree to read like Magento's `vendor/` layout.

> **Start here** before diving into [`GLOSSARY.md`](GLOSSARY.md) or [`REPOSITORY-STRUCTURE.md`](REPOSITORY-STRUCTURE.md). This page maps **terms → paths → plain English** in four rows, then walks one feature end-to-end.

---

## 1. Magento mapping

| Magento 2 | Umbraculum term | On-disk path | Plain English |
|-----------|-----------------|--------------|---------------|
| `vendor/magento/framework` | **Platform** | `packages/platform/*` | Industry-agnostic shared libs (UI, i18n, auth client, platform contracts). |
| `vendor/magento/module-catalog` | **Canonical module** (`pim`, `mrp`, …) | `packages/canonical/<code>/contracts/` + β API/web/native slices | Reserved operational domain — one shipped implementation per code. |
| Module registration / extension contract | **SDK** | `packages/sdk/*` | How you plug in (`registerModule()`, AI-tool types, nav key conventions). |
| `Magento_SampleData*` / `vendor/amasty/*` | **Vertical** | `packages/verticals/brewery/*` | Industry-specific product (reference brewery in-repo). |
| `app/code/YourVendor/Module` | **Your vertical** | **Your repo** | Tier-6 product you ship on top of Umbraculum. |

**β layout (every module — canonical or vertical):**

| Slice | Canonical `pim` | Vertical `brewery` |
|-------|-----------------|---------------------|
| API | `services/api/src/modules/pim/` | `services/api/src/modules/brewery/` |
| Web | `apps/web/app/[locale]/(pim)/` | `apps/web/app/[locale]/(brewery)/` |
| Native | `apps/native/.../modules/pim/` (when shipped) | `apps/native/brewery/...` |
| Contracts | `packages/canonical/pim/contracts/` | `packages/verticals/brewery/contracts/` |

Route groups use **module code** (`pim`, `brewery`), not tier names — same as Magento module names in URLs.

---

## 2. Four package tiers (symmetric tree)

```text
packages/
  platform/              # framework — no industry domain
  sdk/                   # plug-in spine — not a domain module
  canonical/             # reserved domains (peer modules inside)
    pim/contracts/
    mrp/contracts/
    …
  verticals/             # reference + ISV pattern
    brewery/contracts/
    brewery/core/
    …
```

Workspace globs in root [`package.json`](../package.json):

```json
"packages/platform/*",
"packages/sdk/*",
"packages/canonical/*/*",
"packages/verticals/*/*"
```

---

## 3. Worked example — PIM product list

Tracing **list products** from web UI to wire types:

1. **Web page** — [`apps/web/app/[locale]/(pim)/products/`](../apps/web/app/[locale]/(pim)/) (route group `(pim)/`, URL `/en/products/…`).

2. **HTTP client** — `@umbraculum/api-client/pim` → `listProducts()` in [`packages/platform/api-client/src/pim/`](../packages/platform/api-client/src/pim/).

3. **API routes** — [`services/api/src/modules/pim/routes/`](../services/api/src/modules/pim/routes/) (Fastify plugins registered via `registerModule({ code: "pim", … })`).

4. **Wire types / Zod** — [`packages/canonical/pim/contracts/`](../packages/canonical/pim/contracts/) → npm `@umbraculum/pim-contracts`.

5. **Registration** — reserved code validated in [`packages/sdk/module-sdk/src/reservedCodes.ts`](../packages/sdk/module-sdk/src/reservedCodes.ts).

Nothing in this path lives under a folder named `modules/` at the `packages/` tier — that name is reserved for **API domain slices** only (`services/api/src/modules/`).

---

## 4. Where to go next

| Question | Doc |
|----------|-----|
| Full workspace inventory | [`REPOSITORY-STRUCTURE.md`](REPOSITORY-STRUCTURE.md) |
| Vocabulary (`vertical`, `canonical`, …) | [`GLOSSARY.md`](GLOSSARY.md) |
| Building your own vertical | [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) |
| RFC decision record | [`rfcs/0012-package-tier-clarity.md`](rfcs/0012-package-tier-clarity.md) |
