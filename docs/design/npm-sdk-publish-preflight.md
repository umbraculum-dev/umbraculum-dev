# MIT npm SDK publish preflight (ROADMAP 2e)

**Tier:** Public  
**Status:** v1 checklist — **complete (SP-3, 2026-05-29)** — see [`npm-sdk-publish-execution-plan.md`](npm-sdk-publish-execution-plan.md)  
**Audience:** maintainer publishing `@umbraculum/*` MIT packages  
**Authority:** [`docs/LICENSING.md`](../LICENSING.md) §6.2.1

---

## 1. Scope

**July 2026 alpha batch** — paths per [RFC-0012](../rfcs/0012-package-tier-clarity.md). **Monorepo manifest:** `0.1.0` (2026-06-08 reset). **npm registry** still carries older versions until the next `sdk-batch-v*` publish:

| Order | Package | Path | Monorepo | On npm (until republish) |
|-------|---------|------|----------|--------------------------|
| 1 | `@umbraculum/ai-tool-sdk` | `packages/sdk/ai-tool-sdk/` | `0.2.0` | `0.1.1` |
| 2 | `@umbraculum/i18n-keys` | `packages/sdk/i18n-keys/` | `0.2.0` | `0.1.1` |
| 3 | `@umbraculum/module-sdk` | `packages/sdk/module-sdk/` | `0.2.0` | `0.0.2` |
| 4 | `@umbraculum/automation-contracts` | `packages/canonical/automation/contracts/` | `0.2.0` | `0.0.2` |
| 5 | `@umbraculum/pim-contracts` | `packages/canonical/pim/contracts/` | `0.2.0` | `0.0.2` |
| 6 | `@umbraculum/mrp-contracts` | `packages/canonical/mrp/contracts/` | `0.2.0` | `0.0.2` |
| 7 | `@umbraculum/crp-contracts` | `packages/canonical/crp/contracts/` | `0.2.0` | `0.0.2` |

**Phase E extension (published 2026-06-02):**

| Order | Package | Path | On npm (latest) |
|-------|---------|------|-----------------|
| 8 | `@umbraculum/contracts` | `packages/platform/contracts/` | `0.0.1` — OIDC via `publish-contracts-api-client.yml` → `sdk-contracts-v*` |
| 9 | `@umbraculum/api-client` | `packages/platform/api-client/` | `0.0.1` — same workflow (deps rewritten at publish time) |

**Not in npm batch (monorepo-only):** `@umbraculum/ui`, `@umbraculum/i18n`, `@umbraculum/navigation`, `@umbraculum/rendering`, brewery packages, etc.

**Published outside the July α SDK batch (tooling):** `@umbraculum/ci-parity` — see [`docs/design/ci-parity-npm-publish.md`](ci-parity-npm-publish.md) and [`docs/CI-PARITY.md`](../CI-PARITY.md).

---

## 2. Prerequisites

- [x] `@umbraculum` npm org created.
- [x] Maintainer npm account with publish rights to the org.
- [x] Monorepo `master` green: `build:packages`, `test:packages` (GHA); `sdk-publish-prep` ci-parity job.
- [x] SP-1 manifest prep + SP-2 `publish-sdk-batch.yml` merged.
- [x] OIDC trusted publishing configured per [`npm-sdk-trusted-publishing.md`](npm-sdk-trusted-publishing.md).
- [ ] Public flip complete — batch intentionally **pre-dated** flip (2026-05-29).

---

## 3. Per-package manifest changes (before publish)

Completed in SP-1: `private` removed, MIT `LICENSE`, `repository`, `publishConfig`, `files`, `engines`, README install sections.

---

## 4. Dependency graph migration

**Monorepo dev (unchanged):**

```
module-sdk → file:../ai-tool-sdk, file:../i18n-keys
```

**Published `module-sdk` tarball (workflow / manual publish only):**

```json
"dependencies": {
  "@umbraculum/ai-tool-sdk": "^0.2.0",
  "@umbraculum/i18n-keys": "^0.2.0"
}
```

**Publish order (strict):**

1. `ai-tool-sdk` → `i18n-keys` → `module-sdk` (deps rewritten at publish time) → four `*-contracts` packages.

---

## 5. Verification after each publish

```bash
npm view @umbraculum/ai-tool-sdk version
npm pack @umbraculum/ai-tool-sdk --dry-run
```

In a **clean temp directory**:

```bash
npm init -y
npm install @umbraculum/ai-tool-sdk@0.2.0 @umbraculum/module-sdk@0.2.0
node --input-type=module -e "import('@umbraculum/module-sdk').then(m => console.log(Object.keys(m).slice(0,6)))"
```

---

## 6. Monorepo follow-up

- [x] Bump consumer workspace deps from `file:` to published semver for `@umbraculum/contracts` + `@umbraculum/api-client` (2026-06-02) — see [`npm-sdk-monorepo-dogfood.md`](npm-sdk-monorepo-dogfood.md).
- [ ] Bump remaining workspace `package.json` deps from `file:` to published semver where appropriate (module-sdk batch still `file:` for active co-dev).
- [x] Update [`ROADMAP.md`](../ROADMAP.md) MIT npm table → **On npm registry**.
- [x] Update [`GETTING-STARTED.md`](../GETTING-STARTED.md) / [`third-party-module.md`](../modules/contribute/third-party-module.md) install instructions to `npm install` first, git/workspace as fallback.

---

## 7. Execution log

| Date | Package | Version | Note |
|------|---------|---------|------|
| 2026-05-29 | `@umbraculum/ai-tool-sdk` | `0.1.0` | Maintainer laptop publish |
| 2026-05-29 | `@umbraculum/i18n-keys` | `0.1.0` | Maintainer laptop publish |
| 2026-05-29 | `@umbraculum/module-sdk` | `0.0.1` | Laptop; deps rewritten to `^0.1.0` leaves at publish time |
| 2026-05-29 | `@umbraculum/automation-contracts` | `0.0.1` | Maintainer laptop publish |
| 2026-05-29 | `@umbraculum/pim-contracts` | `0.0.1` | Maintainer laptop publish |
| 2026-05-29 | `@umbraculum/mrp-contracts` | `0.0.1` | Maintainer laptop publish |
| 2026-05-29 | `@umbraculum/crp-contracts` | `0.0.1` | Maintainer laptop publish |
| 2026-05-29 | *(all seven)* | — | OIDC trusted publishing via `npx npm@11.16.0 trust github …` |
| 2026-05-29 | *(all seven)* | patch bump | `sdk-batch-v0.1.1` GHA OIDC publish — **green** |
| — | — | — | `sdk-batch-v0.1.0` tag **not** pushed (versions already published manually) |
| 2026-06-02 | `@umbraculum/contracts` | `0.0.1` | Maintainer laptop publish |
| 2026-06-02 | `@umbraculum/api-client` | `0.0.1` | Laptop; deps rewritten to registry semver at publish time |
| 2026-06-02 | *(contracts + api-client)* | — | OIDC trusted publishing via `publish-contracts-api-client.yml` |
| — | — | — | `sdk-contracts-v0.0.1` tag **not** pushed (versions already published manually) |
