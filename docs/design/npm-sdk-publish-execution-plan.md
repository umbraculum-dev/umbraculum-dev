# MIT npm SDK publish — execution plan (ROADMAP 2f)

**Tier:** Public  
**Status:** v1.0 — ready for executor  
**Target window:** **ASAP** — complete registry batch **~3–5 days before** public repo flip (Stage 2 / [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md))  
**Audience:** maintainer (npm + trusted publishers); frontier or maintainer agent (prep PR + workflow); executor running publish + verification  
**Owners:** maintainers  
**Related:** [`npm-sdk-publish-preflight.md`](npm-sdk-publish-preflight.md) (checklist), [`LICENSING.md`](../LICENSING.md) §6.2.1 (authority), [`ci-parity-npm-trusted-publishing.md`](ci-parity-npm-trusted-publishing.md) (OIDC pattern), [`third-party-module.md`](../modules/contribute/third-party-module.md) (consumer contract), [`ROADMAP.md`](../ROADMAP.md) priority **2f**

> [!IMPORTANT]
> **Alpha pragmatism.** This batch ships **before** full public-alpha closure. Missing pieces (DocSearch, marketplace live, `api-client` split, monorepo `file:` → registry migration) **do not block** npm publish. Goal: external module authors can `npm install` the MIT spine **days before** GitHub visibility flips.

> [!NOTE]
> **Relationship to flip.** Flip-day runbook §6 allows npm to trail flip; **this plan inverts that** — registry first, flip second — so `third-party-module.md` install instructions are truthful on flip day.

---

## Documentation context (required)

| Role | Document |
|------|----------|
| Licensing authority | [`LICENSING.md`](../LICENSING.md) §6.2.1 — MIT SDK batch scope + publish order |
| Preflight checklist | [`npm-sdk-publish-preflight.md`](npm-sdk-publish-preflight.md) |
| Consumer contract | [`third-party-module.md`](../modules/contribute/third-party-module.md) — peer deps + install path |
| Platform placement | [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4, §10.1.1 |
| Flip coordination | [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) — §6 (npm no longer trails flip) |
| OIDC reference workflow | `umbraculum-toolset/.github/workflows/publish-ci-parity.yml` + [`ci-parity-npm-trusted-publishing.md`](ci-parity-npm-trusted-publishing.md) |
| Plugin rules | `22-typescript-contracts-runtime-validation.mdc`, `42-dco-signoff-gate.mdc`, `72-ci-parity-local-vs-ci-divergence.mdc` |
| Non-frontier traps | [`NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md`](../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md) §10 — enumerate files, gate skills, README boilerplate |
| Runbook | [`DEVELOPMENT.md`](../../DEVELOPMENT.md) — container npm only; `npm run build:packages`, `npm run test:packages` |

---

## 1. Purpose

`@umbraculum/ci-parity` proved the `@umbraculum` npm org and OIDC trusted publishing. The **July α MIT SDK batch** (seven packages) is the foundation third-party module authors need **before** the monorepo goes public.

This plan converts [`npm-sdk-publish-preflight.md`](npm-sdk-publish-preflight.md) into phased, file-level work with acceptance criteria, maintainer gates, and a single automated publish path in **umbraculum-dev** (not toolset).

---

## 2. Scope

### 2.1 In scope (publish batch)

| Order | Package | Path | Initial version |
|-------|---------|------|-----------------|
| 1 | `@umbraculum/ai-tool-sdk` | `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/ai-tool-sdk/` | `0.1.0` (already in manifest) |
| 2 | `@umbraculum/i18n-keys` | `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/i18n-keys/` | `0.1.0` |
| 3 | `@umbraculum/module-sdk` | `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/module-sdk/` | `0.0.1` |
| 4 | `@umbraculum/automation-contracts` | `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/automation-contracts/` | `0.0.1` |
| 5 | `@umbraculum/pim-contracts` | `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/pim-contracts/` | `0.0.1` |
| 6 | `@umbraculum/mrp-contracts` | `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/mrp-contracts/` | `0.0.1` |
| 7 | `@umbraculum/crp-contracts` | `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/crp-contracts/` | `0.0.1` |

**Publish tag (proposed):** `sdk-batch-v0.1.0` — one tag drives the ordered batch workflow.

### 2.2 Explicitly out of scope (OK to be missing at publish time)

| Item | Rationale |
|------|-----------|
| `@umbraculum/api-client` | Still coupled to full `@umbraculum/contracts` — [`LICENSING.md`](../LICENSING.md) defers post-α |
| `@umbraculum/contracts`, `ui`, `i18n`, `navigation`, `rendering`, brewery packages | Monorepo-only per §6.2.1 |
| Monorepo switching all `file:` deps → registry semver | **Policy decision:** keep `file:` in committed `package.json` for workspace dev; registry is for **external** consumers (see §8) |
| npm org “disallow tokens” hardening | Optional; OIDC-only publish is sufficient for GHA |
| GitHub repo visibility → public | Flip-day runbook; **after** this batch lands |
| Cursor marketplace listings live | Flip closure criterion; independent of npm |
| DocSearch / Algolia | ROADMAP 2f adjacent; not blocking |
| Per-package changelog files | Optional for α; GitHub release notes carry narrative |

### 2.3 Success definition

1. All seven packages return a version from `npm view @umbraculum/<name> version`.
2. Clean-dir smoke install works for `ai-tool-sdk`, `i18n-keys`, `module-sdk`, and one `*-contracts` package (§7).
3. Monorepo CI green on `master` after prep PR merges (no publish required for CI green).
4. Docs updated: [`LICENSING.md`](../LICENSING.md) §6.2.1, [`ROADMAP.md`](../ROADMAP.md) MIT table, [`third-party-module.md`](../modules/contribute/third-party-module.md) install section.
5. [`npm-sdk-publish-preflight.md`](npm-sdk-publish-preflight.md) §7 execution log filled.

---

## 3. Timeline (ASAP)

| Day | Work |
|-----|------|
| **D0** | Maintainer: npm org access verified; start trusted-publisher prep (§5) |
| **D0–D1** | **SP-1** prep PR: manifests, LICENSE files, `files` fields, README npm install blurb |
| **D1** | **SP-2** publish workflow PR; configure trusted publishers (§5) |
| **D1–D2** | Merge; `npm run build:packages` + `test:packages` in container; tag `sdk-batch-v0.1.0` |
| **D2** | GHA publish job green; §7 verification; **SP-3** docs PR |
| **D3–D5** | Buffer; flip-day runbook with registry already live |

---

## 4. Sub-plans

| ID | Owner | Deliverable |
|----|-------|-------------|
| **SP-1** | Agent / maintainer | Package metadata + MIT LICENSE + `files` — **no** `npm publish` |
| **SP-2** | Agent / maintainer | `.github/workflows/publish-sdk-batch.yml` + maintainer trusted-publisher config |
| **SP-3** | Maintainer | Tag push → publish → verify → docs sync |
| **SP-4** | Optional follow-up | GitHub Release `v0.0.1-alpha` body cites published SDK versions |

---

## 5. Maintainer gates (human — not automatable)

### 5.1 npm prerequisites

- [ ] `npm whoami` on maintainer machine (not committed).
- [ ] Publish rights on `@umbraculum` org (proven by `@umbraculum/ci-parity@1.0.6`).
- [ ] npm account 2FA (passkey) — required to edit package access / trusted publishers.

### 5.2 Trusted publishers (one per package)

For **each** package in §2.1, after the package exists on npm **or** via org-level scope policy:

| Field | Value |
|-------|--------|
| Organization or user | `umbraculum-dev` |
| Repository | `umbraculum-toolset` → **`umbraculum-dev`** |
| Workflow filename | `publish-sdk-batch.yml` |
| Environment name | *(empty)* |
| Allowed actions | `npm publish` |

**First-time packages:** npm has no `/access` page until the first version is published. Two supported paths:

1. **Recommended:** Org-level trusted publishing for the `@umbraculum` scope (if enabled on the org account) — covers all new packages in the batch.
2. **Fallback:** Manual first publish of each leaf from maintainer laptop (`npm login` + `npm publish -w …`), configure trusted publisher on each package’s `/access` page, then use GHA for subsequent bumps.

**Lesson from ci-parity:** Save trusted publisher on the **`/access`** page (not `/admins`); re-save if OIDC exchange returns HTTP 404 `package not found`. Verify exchange URL pattern:

```text
POST https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/@umbraculum%2fai-tool-sdk
```

### 5.3 Tag authority

Only maintainers push `sdk-batch-v*` tags. Executor must not tag without maintainer sign-off on green `master`.

---

## 6. SP-1 — Per-package manifest prep

### 6.1 Changes applied to **each** of the seven `package.json` files

1. **Remove** `"private": true`.
2. **Add** `"license": "MIT"`.
3. **Add** `"publishConfig": { "access": "public" }`.
4. **Add** repository metadata (monorepo subpath):

```json
"repository": {
  "type": "git",
  "url": "git+https://github.com/umbraculum-dev/umbraculum-dev.git",
  "directory": "packages/<workspace-dir>"
},
"bugs": {
  "url": "https://github.com/umbraculum-dev/umbraculum-dev/issues"
},
"homepage": "https://github.com/umbraculum-dev/umbraculum-dev/tree/main/packages/<workspace-dir>#readme"
```

5. **Add** `"files": ["dist", "README.md", "LICENSE"]` — never publish `src/`.
6. **Add** `"engines": { "node": ">=20" }` if missing (align with monorepo `.nvmrc`).

**Do not change** `module-sdk` `dependencies` in committed source (keep `file:../…` for workspace CI).

### 6.2 MIT `LICENSE` file per package

Copy standard MIT license text into each package directory:

- `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/ai-tool-sdk/LICENSE`
- `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/i18n-keys/LICENSE`
- `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/module-sdk/LICENSE`
- `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/automation-contracts/LICENSE`
- `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/pim-contracts/LICENSE`
- `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/mrp-contracts/LICENSE`
- `/home/rf/dkprojects/rfapps/umbraculum-dev/packages/crp-contracts/LICENSE`

Copyright holder: **Umbraculum contributors** (or legal name maintainer confirms).

### 6.3 README additions (one paragraph each)

In each package `README.md`, add **Install** section:

```markdown
## Install

```bash
npm install @umbraculum/<package-name>@^<version>
```

Public alpha — see [third-party-module.md](../../docs/modules/contribute/third-party-module.md).
```

Adjust relative link depth per package README location.

### 6.4 SP-1 acceptance criteria

- [ ] `npm run build:packages` succeeds in API/Node container.
- [ ] `npm run test:packages` succeeds.
- [ ] For each package: `npm pack -w @umbraculum/<name> --dry-run` lists only `dist/`, `README.md`, `LICENSE`, `package.json`.
- [ ] No secrets or `src/` in pack list.
- [ ] `npx @umbraculum/ci-parity` or `./scripts/ci-parity-check.sh` docs/typecheck jobs still pass after merge.

### 6.5 SP-1 file inventory (executor may touch only these)

| Path |
|------|
| `packages/ai-tool-sdk/package.json`, `LICENSE`, `README.md` |
| `packages/i18n-keys/package.json`, `LICENSE`, `README.md` |
| `packages/module-sdk/package.json`, `LICENSE`, `README.md` |
| `packages/automation-contracts/package.json`, `LICENSE`, `README.md` |
| `packages/pim-contracts/package.json`, `LICENSE`, `README.md` |
| `packages/mrp-contracts/package.json`, `LICENSE`, `README.md` |
| `packages/crp-contracts/package.json`, `LICENSE`, `README.md` |
| `docs/design/npm-sdk-publish-preflight.md` — status line → “prep in progress” |
| `docs/design/npm-sdk-publish-execution-plan.md` — §12 sign-off when SP-1 merges |

**Do not modify** root `package.json` workspace deps in SP-1.

---

## 7. SP-2 — Publish workflow

### 7.1 New file

**Path:** `/home/rf/dkprojects/rfapps/umbraculum-dev/.github/workflows/publish-sdk-batch.yml`

**Trigger:**

```yaml
on:
  push:
    tags:
      - "sdk-batch-v*"
```

**Job outline** (mirror ci-parity OIDC — no `registry-url` on setup-node, npm ≥ 11.5.1, explicit OIDC exchange):

1. `actions/checkout@v5`
2. `setup-node@v4` — Node 24, **no** `registry-url`
3. `npm install -g npm@11.6.2`
4. `npm ci`
5. `npm run build:packages`
6. `npm run test:packages`
7. **Publish leaves** (reuse OIDC exchange helper per package name):
   - `@umbraculum/ai-tool-sdk`
   - `@umbraculum/i18n-keys`
8. **Publish `module-sdk`** — before `npm publish`, workflow **temporarily** rewrites `packages/module-sdk/package.json` dependencies:

```json
"@umbraculum/ai-tool-sdk": "^0.1.0",
"@umbraculum/i18n-keys": "^0.1.0"
```

   (Use `jq` or `node -e` in workflow; **do not commit** this rewrite — tarball only.)

9. **Publish contracts** (order among them arbitrary; no inter-contract `file:` deps):
   - `automation-contracts`, `pim-contracts`, `mrp-contracts`, `crp-contracts`
10. Job summary: print `npm view` version for all seven packages.

**Reusable OIDC steps:** Factor exchange into a composite action or shell function parameterized by `PKG_NAME` / `PKG_ESCAPED` to avoid seven copy-paste blocks (max ~30 lines per call).

### 7.2 New design doc (short)

**Path:** `/home/rf/dkprojects/rfapps/umbraculum-dev/docs/design/npm-sdk-trusted-publishing.md`

Content: clone structure of [`ci-parity-npm-trusted-publishing.md`](ci-parity-npm-trusted-publishing.md) with repo = `umbraculum-dev`, workflow = `publish-sdk-batch.yml`, table of seven package exchange URLs, troubleshooting (404 = trusted publisher not saved).

### 7.3 SP-2 acceptance criteria

- [ ] Workflow validates with `actionlint` if available locally, or review against existing workflow patterns.
- [ ] `permissions.id-token: write` on publish job.
- [ ] No `NPM_TOKEN` secret referenced.
- [ ] Maintainer confirms trusted publisher entries (§5.2) before first tag push.

---

## 8. Monorepo dependency policy (post-publish)

**Chosen policy for α:** committed `module-sdk/package.json` **keeps** `file:../ai-tool-sdk` and `file:../i18n-keys` so workspace CI does not require registry round-trips.

| Consumer | Install path |
|----------|--------------|
| External third-party module repo | `npm install @umbraculum/module-sdk@^0.0.1` (+ peers) |
| Umbraculum monorepo contributor | `npm install` at repo root (workspaces + `file:`) |

Document this split in [`third-party-module.md`](../modules/contribute/third-party-module.md) §npm registry vs monorepo.

**Future (post-α):** optional PR to pin registry versions in monorepo for dogfooding — not required for this batch.

---

## 9. SP-3 — Publish day runbook

### 9.1 Pre-tag checklist

- [ ] `master` green (typecheck, test:packages, docs-readmes).
- [ ] SP-1 + SP-2 merged.
- [ ] Trusted publishers configured (§5.2).
- [ ] No unintended version bumps in the seven manifests.

### 9.2 Tag and watch

```bash
git checkout master && git pull
git tag sdk-batch-v0.1.0
git push origin sdk-batch-v0.1.0
```

Watch: GitHub Actions → `publish-sdk-batch` workflow.

### 9.3 Post-publish verification

**Registry:**

```bash
npm view @umbraculum/ai-tool-sdk version
npm view @umbraculum/i18n-keys version
npm view @umbraculum/module-sdk version
npm view @umbraculum/automation-contracts version
# … remaining contracts
```

**Clean install smoke** (temp directory on host is OK for read-only smoke):

```bash
TMP=$(mktemp -d) && cd "$TMP"
npm init -y
npm install @umbraculum/ai-tool-sdk@0.1.0
node --input-type=module -e "import('@umbraculum/ai-tool-sdk').then(m => console.log(Object.keys(m).slice(0,8)))"
```

Repeat for `i18n-keys`, `module-sdk`, `pim-contracts`.

**Pack contents:**

```bash
npm pack @umbraculum/module-sdk --dry-run
```

Confirm no `src/`.

### 9.4 Failure handling

| Symptom | Action |
|---------|--------|
| OIDC exchange HTTP 404 | Re-save trusted publisher on npm `/access`; confirm repo `umbraculum-dev` |
| `ENEEDAUTH` on publish | Do not use `registry-url` on setup-node; use explicit exchange (ci-parity lesson) |
| `403` version already exists | Bump patch in manifest + new tag `sdk-batch-v0.1.1`; never republish same version |
| `module-sdk` resolves wrong leaf version | Check workflow jq rewrite ran before publish step |

---

## 10. SP-3 — Documentation sync

Update in the **same PR or immediate follow-up** after green publish:

| Document | Change |
|----------|--------|
| [`LICENSING.md`](../LICENSING.md) §6.2.1 | Table → **On npm registry**; dates; remove “not ready today” |
| [`ROADMAP.md`](../ROADMAP.md) MIT npm table | **On npm registry** column ✅ |
| [`third-party-module.md`](../modules/contribute/third-party-module.md) | Replace `file:`/git-only wording with `npm install` primary; keep monorepo fallback |
| [`npm-sdk-publish-preflight.md`](npm-sdk-publish-preflight.md) | §7 execution log; status → complete |
| [`GETTING-STARTED.md`](../GETTING-STARTED.md) | One line: SDK packages on npm @ versions |
| [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) §6 | Note: npm batch **pre-completed** before flip |
| This plan §12 | Sign-off log |

---

## 11. CI parity before push

Any PR touching TypeScript or workflows:

```bash
npx @umbraculum/ci-parity
```

From repo root per [`CI-PARITY.md`](../CI-PARITY.md).

---

## 12. Sign-off log

| Date | Sub-plan | Maintainer | Published versions | Notes |
|------|----------|------------|-------------------|-------|
| — | SP-1 | — | — | Prep not started |
| — | SP-2 | — | — | Workflow not started |
| — | SP-3 | — | — | Tag not pushed |

---

## 13. Executor prompt template (frontier handoff)

```text
Execute SP-1 of docs/design/npm-sdk-publish-execution-plan.md only.

Constraints:
- Touch only files listed in §6.5.
- Container npm only (DEVELOPMENT.md).
- Do not npm publish.
- Run build:packages + test:packages before handback.
- Report npm pack --dry-run output for all seven packages.

Handback: PR-ready diff + checklist §6.4 ticked.
```

---

## 14. Risk register (accepted for α)

| Risk | Mitigation |
|------|------------|
| Published SDK while repo still private | MIT packages are intended public; source alignment via tagged monorepo commit |
| `api-client` still git-only | Documented deferral; third-party modules use contracts packages only |
| Version skew between npm and monorepo `file:` | Pin peers in third-party-module.md; monorepo uses workspace |
| Trusted publisher misconfiguration | Explicit OIDC logging; ci-parity playbook |
| Incomplete contracts coverage | Four canonical modules only; brewery contracts not in batch |

---

## 15. References

- [`ci-parity-platform-execution-plan.md`](ci-parity-platform-execution-plan.md) — pattern for phased platform tooling rollout
- [`ci-parity-npm-publish.md`](ci-parity-npm-publish.md) — first `@umbraculum` publish precedent
- npm trusted publishers: https://docs.npmjs.com/trusted-publishers/
