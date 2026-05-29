# MIT npm SDK publish preflight (ROADMAP 2e)

**Tier:** Public  
**Status:** v1 executor checklist — **do not publish** until flip decision + npm org access  
**Audience:** maintainer publishing `@umbraculum/*` MIT packages  
**Authority:** [`docs/LICENSING.md`](../LICENSING.md) §6.2.1

---

## 1. Scope

**In the July 2026 alpha batch:**

| Order | Package | Path | Today |
|-------|---------|------|-------|
| 1 | `@umbraculum/ai-tool-sdk` | `packages/ai-tool-sdk/` | `private: true`, no `"license"` |
| 2 | `@umbraculum/i18n-keys` | `packages/i18n-keys/` | same |
| 3 | `@umbraculum/module-sdk` | `packages/module-sdk/` | `file:` deps on leaves |
| 4+ | `@umbraculum/<code>-contracts` | `packages/automation-contracts/`, `pim-contracts/`, `mrp-contracts/`, `crp-contracts/` | same |

**Deferred post-α:** `@umbraculum/api-client` (contracts coupling — see LICENSING table).

**Not in npm batch (monorepo-only):** `@umbraculum/contracts`, `@umbraculum/ui`, `@umbraculum/i18n`, `@umbraculum/navigation`, `@umbraculum/rendering`, brewery packages, etc.

**Published outside the July α SDK batch (tooling):** `@umbraculum/ci-parity` — see [`docs/design/ci-parity-npm-publish.md`](ci-parity-npm-publish.md) and [`docs/CI-PARITY.md`](../CI-PARITY.md).

---

## 2. Prerequisites

- [ ] `@umbraculum` npm org created (or documented scoped-publish alternative).
- [ ] Maintainer npm account with publish rights to the org.
- [ ] `npm whoami` from a trusted machine (not committed to repo).
- [ ] Monorepo `master` green: `npm run build:packages`, `npm run test:packages`.
- [ ] Public flip complete (or imminent) — published versions align with `v0.0.1-alpha` tag narrative.

---

## 3. Per-package manifest changes (before publish)

For each package in §1, in `package.json`:

1. Remove `"private": true`.
2. Add `"license": "MIT"`.
3. Add `"repository"` / `"bugs"` / `"homepage"` pointing at `umbraculum-dev/umbraculum-dev` (subpath if npm supports `directory` field for monorepo — prefer standard npm monorepo publish pattern your org uses).
4. Add `"publishConfig": { "access": "public" }` for scoped packages.
5. Ensure `files` or `.npmignore` includes only `dist/` + README (no `src/` leakage unless intentional).

Add or verify **MIT** text: root [`LICENSE`](../../LICENSE) is AGPL for core; each published MIT package should ship MIT license text per npm convention (copy MIT snippet or `LICENSE` file in package dir — legal review at publish time).

---

## 4. Dependency graph migration

**Today (workspace):**

```
module-sdk → file:../ai-tool-sdk, file:../i18n-keys
```

**After publish (example — pin to published versions):**

```json
"dependencies": {
  "@umbraculum/ai-tool-sdk": "^0.1.0",
  "@umbraculum/i18n-keys": "^0.1.0"
}
```

**Publish order (strict):**

1. `npm publish -w @umbraculum/ai-tool-sdk`
2. `npm publish -w @umbraculum/i18n-keys`
3. Update `module-sdk` deps to registry versions → build → `npm publish -w @umbraculum/module-sdk`
4. Each `*-contracts` package (no inter-contract `file:` deps expected) → publish

After step 3, monorepo can keep `file:` for dev **or** switch to registry deps — document the chosen policy in [`third-party-module.md`](../modules/contribute/third-party-module.md).

---

## 5. Verification after each publish

```bash
npm view @umbraculum/ai-tool-sdk version
npm pack @umbraculum/ai-tool-sdk --dry-run
```

In a **clean temp directory**:

```bash
npm init -y
npm install @umbraculum/ai-tool-sdk@<version>
node -e "import('@umbraculum/ai-tool-sdk').then(m => console.log(Object.keys(m).slice(0,5)))"
```

Repeat for `i18n-keys`, `module-sdk`, one contracts package.

---

## 6. Monorepo follow-up

- [ ] Bump workspace `package.json` deps from `file:` to published semver where appropriate.
- [ ] Run full CI (`typecheck`, `test:packages`, affected workspaces).
- [ ] Update [`ROADMAP.md`](../ROADMAP.md) MIT npm table → **On npm registry**.
- [ ] Update [`GETTING-STARTED.md`](../GETTING-STARTED.md) / [`third-party-module.md`](../modules/contribute/third-party-module.md) install instructions to `npm install` first, git/workspace as fallback.

---

## 7. Execution log

| Date | Package | Version | npm sha / note |
|------|---------|---------|----------------|
| — | — | — | Not published yet |
