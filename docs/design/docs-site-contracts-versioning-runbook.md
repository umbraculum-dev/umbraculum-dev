# Docs-site — contracts package versioning runbook (RFC-0005 P6)

**Tier:** Public  
**Status:** v1 skeleton — execute on first post-α `@umbraculum/*-contracts` release  
**Audience:** maintainers cutting a contracts package release  
**Related:** [`docs/rfcs/0005-docs-site.md`](../rfcs/0005-docs-site.md) P6, [`docs-site/README.md`](../../docs-site/README.md)

---

## 1. When to run this

Run when **any** of these is true:

- A contracts package (`@umbraculum/pim-contracts`, `@umbraculum/automation-contracts`, `@umbraculum/mrp-contracts`, `@umbraculum/crp-contracts`, or future `@umbraculum/<code>-contracts`) ships a **semver-visible** API change you want frozen on the docs site.
- You publish that package to npm and external module authors need the **matching** published docs snapshot.

**Do not** version-snapshot on every patch that only fixes tests or internal comments.

---

## 2. Scope (v1)

RFC-0005 limits versioned snapshots to **`packages/*-contracts/`** READMEs and contract-facing prose — not the full monorepo docs tree.

**Pre-P6 (current):** the docs-site markdown preprocessor injects a **Contract version** INFO banner on each `*-contracts` reference page, reading `CONTRACT_VERSION` from that package's `src/version.ts` at build time (`docs-site/docusaurus.config.ts` → `injectContractsVersionBanner`). The page still tracks `master`; the banner is the pin hint until `docusaurus docs:version` snapshots land.

| Package | README path | `CONTRACT_VERSION` source |
|---------|-------------|---------------------------|
| `@umbraculum/automation-contracts` | `packages/modules/automation-contracts/README.md` | `packages/modules/automation-contracts/src/version.ts` |
| `@umbraculum/pim-contracts` | `packages/modules/pim-contracts/README.md` | `packages/modules/pim-contracts/src/version.ts` |
| `@umbraculum/mrp-contracts` | `packages/modules/mrp-contracts/README.md` | `packages/modules/mrp-contracts/src/version.ts` |
| `@umbraculum/crp-contracts` | `packages/modules/crp-contracts/README.md` | `packages/modules/crp-contracts/src/version.ts` |

---

## 3. Prerequisites

1. `docs-site` builds green: `npm run build -w @umbraculum/docs-site` (Node 20 container).
2. Release version decided and reflected in the package's `package.json` `version` and `CONTRACT_VERSION` (no `v` prefix in `package.json` per [`DEVELOPMENT.md`](../../DEVELOPMENT.md)).
3. Reference plugin already renders the package README at `reference/packages/<name>/` (Pass 2 wiring).

---

## 4. Procedure (Docusaurus versioning)

> **Note:** The monorepo has not cut the first versioned snapshot yet. Commands below are the intended discipline; adjust if Docusaurus 3.10 + multi-plugin layout requires a docs-site config tweak when first executed.

From repo root, inside a Node 20 container with repo mounted at `/repo`:

```bash
cd /repo/docs-site

# 1. Ensure current docs build is clean
npm run build

# 2. Create a version label matching the contracts release (example)
npx docusaurus docs:version 0.1.0-alpha.1

# 3. Rebuild and verify /versions/ and version dropdown
npm run build
```

**Maintainer checks after step 2:**

- [ ] Version dropdown appears in the docs navbar (if enabled in `docusaurus.config.ts`).
- [ ] Prior snapshot remains reachable for the previous contracts release.
- [ ] `CONTRACT_VERSION` named in the release notes matches the snapshot label rationale.

---

## 5. Config follow-ups (first execution only)

On first real run, the maintainer may need to:

1. Enable `docsVersioning` in `docusaurus.config.ts` per [Docusaurus versioning docs](https://docusaurus.io/docs/versioning).
2. Decide whether versioned paths apply only to the main `docs/` plugin or also to reference README plugins (likely **main docs only**; reference READMEs track `master` until a separate policy is RFC'd).
3. Record the exact config diff in this file §7.

---

## 6. Release coordination

| Step | Owner |
|------|-------|
| Bump `CONTRACT_VERSION` + package `version` | Contracts PR author |
| API handshake tests green | CI |
| npm publish (post-α batch) | Maintainer ([`LICENSING.md`](../LICENSING.md) §6.2.1) |
| Docs snapshot (`docs:version`) | Maintainer |
| Mention in release notes / changelog | Maintainer |

---

## 7. Execution log

| Date | Package | Version label | Commit | Notes |
|------|---------|---------------|--------|-------|
| — | — | — | — | Skeleton only; no snapshot cut yet |
