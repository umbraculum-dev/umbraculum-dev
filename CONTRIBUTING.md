# Contributing

Thank you for your interest in contributing. This project is built in
the open and we welcome bug reports, fixes, features, documentation,
translations, and thoughtful issue triage.

> [!NOTE]
> This repository is **not yet a public-facing release**. The path to
> the public flip is documented in
> `docs/PLATFORM-ARCHITECTURE.md` §10.1 (working assumption: a fresh
> public repo seeded from this one in H1 2027). The
> conventions below are already in force so that the existing history
> is clean when the flip happens.

## Before you start

- Read [`MANIFESTO.md`](./MANIFESTO.md) — the project's stated values and
  the AI-orchestrated-code distinction. The §1.2 contract (rules + skills
  + agents apparatus = the default authoring path; drive-by Copilot paste
  = explicitly outside what the project endorses; manual writing welcomed
  for *learning*, discouraged for *committing*) is what the contribution
  surface assumes you have internalized.
- Read the [Code of Conduct](./CODE_OF_CONDUCT.md). It is in force in
  every project space, including pull requests, issues, and commits.
- Read [`docs/LICENSING.md`](./docs/LICENSING.md). Contributions are
  accepted under the same license as the project (AGPLv3 for the
  monorepo; selected SDK packages may be MIT — see the licensing doc).
- Read [`DEVELOPMENT.md`](./DEVELOPMENT.md), and if it exists in your
  checkout, the project-local addendum `DEVELOPMENT-LOCAL.md`.
- **Recommended path — contribute with the apparatus.** Umbraculum is an
  AI-orchestrated-code project ([`MANIFESTO.md`](./MANIFESTO.md) §1.2): the
  default authoring path is AI assistance under enforced discipline, where
  the discipline lives in the **umbraculum-toolset Cursor plugin pack** ("the
  apparatus"). The project's CI gates (lint, types, tests, docs structural
  checks, module-README audits, contract-validation audits) are calibrated to
  a high bar that the plugin pack is designed to make one-shot achievable.
  Without the pack loaded, an AI assistant operating in this repo will
  produce code that does not clear those gates in one shot — you will round-
  trip with reviewers until the code converges on what the pack would have
  produced from the start. Installing the pack is what
  [`MANIFESTO.md`](./MANIFESTO.md) §1.3 + §2.2 call "the equalizer that keeps
  the contribution bar low" — it is the project lowering the bar, not
  raising it. See [`docs/CURSOR-PLUGINS.md`](./docs/CURSOR-PLUGINS.md) for
  the install procedure and [`AGENTS.md`](./AGENTS.md) for the agent self-
  check that runs first thing in any Cursor session in this repo. Human
  authorship is welcome: a contribution may begin as manually-written code,
  but before it lands it should pass through the same apparatus discipline
  (rules / skills / agents, lint, types, tests, review, CI) as AI-assisted
  work. What we discourage is bypassing the apparatus, not developers writing
  code. Note also that the apparatus is for *optimization* — for executing
  known work faster and more consistently — not for *strategy*. The questions
  of what is worth building, which problem is the right problem, and when to
  stay with uncertainty remain yours; see [`MANIFESTO.md`](./MANIFESTO.md) §1.2
  for the full framing.
- Security issues do **not** go through public issues or pull requests.
  Please follow [`SECURITY.md`](./SECURITY.md).

## Licensing of your contributions

By submitting a contribution (pull request, patch, suggested edit, or
otherwise) you agree that your contribution is provided under the
license that covers the file you are modifying:

- Files under the monorepo are AGPLv3 unless a more permissive notice
  is present at the top of the file. See `LICENSE` at the repo root.
- Files in SDK / client packages explicitly marked **MIT** in their
  `package.json` `license` field are MIT.
- **npm publication status** (which MIT packages are on the registry vs
  monorepo-only today): [`docs/LICENSING.md`](docs/LICENSING.md) §6.2.1.

If you are unsure which license applies to the file you are touching,
ask in the pull request before you commit.

## Developer Certificate of Origin (DCO) — required

This project uses the
[**Developer Certificate of Origin 1.1**](https://developercertificate.org/),
not a CLA. Every commit MUST include a `Signed-off-by` trailer:

```text
Signed-off-by: Jane Doe <jane@example.com>
```

The recommended approach is the project's committed `prepare-commit-msg`
hook at [`scripts/git-hooks/prepare-commit-msg`](./scripts/git-hooks/prepare-commit-msg).
Enable it **once per clone** (including each fresh Cursor worktree) with:

```bash
cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath scripts/git-hooks
```

After that, every `git commit` auto-receives the `Signed-off-by:`
trailer. See [`docs/GETTING-STARTED.md`](./docs/GETTING-STARTED.md) §1.4
for the full procedure (canonical setup, verification step, and
fallback mechanisms). For a one-off commit before you set the hook up
— or for environments where `core.hooksPath` is not available —
`git commit --signoff` (or `-s`) appends the trailer manually.

> [!WARNING]
> Do **not** rely on `git config --global format.signOff true` as the
> DCO mechanism. The `format.signOff` config applies **only to
> `git format-patch`**; it does **nothing** for `git commit`. This is
> the single most common DCO misconfiguration. The `core.hooksPath` +
> committed-hook setup above is what actually works for `git commit`;
> see [`docs/GETTING-STARTED.md`](./docs/GETTING-STARTED.md) §1.4 for
> the full mechanism comparison and the per-clone fallback.

By signing off, you certify that:

1. The contribution was created in whole or in part by you and you have
   the right to submit it under the project's open-source license.
2. The contribution is based upon previous work that, to the best of
   your knowledge, is covered under an appropriate open-source license
   and you have the right under that license to submit that work with
   modifications, whether created in whole or in part by you.
3. The contribution was provided directly to you by some other person
   who certified (1) or (2) and you have not modified it.
4. You understand and agree that the project and the contribution are
   public and that a record of the contribution (including all personal
   information you submit with it) is maintained indefinitely and may
   be redistributed consistent with the project's license.

Use your real name (or a long-standing pseudonym you can be reached at)
and a real, monitored email address. Anonymous sign-offs (e.g. `noreply`
addresses) cannot be accepted.

## Pull request conventions

### Keep PRs small and focused

- Before pushing changes that touch TypeScript, ESLint, module READMEs,
  lockfiles, or CI workflows, run `npx @umbraculum/ci-parity` (see
  [`docs/CI-PARITY.md`](docs/CI-PARITY.md)).
- Aim for **≤ 400 changed lines** per PR where reasonable. Large
  refactors should be broken into a chain of reviewable steps.
- One *intent* per PR. Mixed-intent PRs (e.g. "refactor + new feature +
  bug fix") will be asked to split.
- Always link to the issue (`Closes #123`, `Refs #123`) so the change
  has context.

### Branch naming

Prefer descriptive, short branch names. Suggested prefixes:

- `feat/...` — new user-visible behavior
- `fix/...` — bug fix
- `refactor/...` — internal rework without behavior change
- `docs/...` — docs-only
- `test/...` — test-only
- `chore/...` — tooling, deps, config

### Commit messages

- Imperative subject ≤ 72 chars (e.g. `Add memory writer for AI consultant`).
- Body explains **why**, not just **what**. The diff already shows the what.
- Always include a `Signed-off-by:` trailer (see DCO above).
- Reference issues / PRs in the body (`Closes #123`, `Refs #456`).
- Some commits will additionally carry a `Co-authored-by: Cursor <cursoragent@cursor.com>` trailer — this is auto-injected by the project's [`prepare-commit-msg`](./scripts/git-hooks/prepare-commit-msg) hook (the same hook that handles DCO above) when it detects `CURSOR_AGENT=1` in the shell environment. Cursor exports this env var into every agent tool-call shell, so the trailer correctly appears on agent-driven commits and is correctly absent on commits typed by hand (where `CURSOR_AGENT` is unset). It is the project's visible AI-assistance attribution per [`MANIFESTO.md`](./MANIFESTO.md) §1.2 (the AI-orchestrated-code stance). **No action is required from human contributors** to support this attribution; the mechanism activates automatically. The hook uses `git interpret-trailers --in-place --if-exists addIfDifferent`, which makes it idempotent and ensures the trailer ends up in the actual trailer block of the commit (not in the message body) regardless of whether anything else — e.g. Cursor's git integration, which does sometimes pre-inject the same trailer non-deterministically — has touched the message file first. The agent-side post-commit verification rule that catches missing-trailer misconfigurations is published as `umbraculum-toolset-common` rule `44-agent-commit-cursor-coauthor.mdc` in the public [umbraculum-toolset](./docs/CURSOR-PLUGINS.md) plugin pack.

### Release tags and package versions

- Git release tags use a leading `v` (`v0.0.1`, `vX.Y.Z`).
- `package.json` `version` fields use plain npm SemVer with no `v` prefix (`0.0.1`, `X.Y.Z`).
- Do not create both `vX.Y.Z` and `X.Y.Z` Git tags for the same release, and never put a `v` prefix in a package manifest version.

### Tests are not optional

- After non-trivial changes, run the matching test layer and keep it
  green. See `docs/TESTING.md` for the project's layer map (unit,
  integration, contract, web E2E).
- For Magento-style PHP code (where present), unit + integration tests
  in `app/code/*/*` apply per the plugin-shipped
  `20-tests-must-follow-changes.mdc` rule.
- For TS/JS code, the appropriate layer depends on what you changed:
  pure logic → unit; HTTP routes / auth / scoping → integration;
  external client shape → contract snapshot; user-visible web flow →
  Playwright (or equivalent) spec.
- If you cannot test something because the surrounding code is too
  entangled, **say so explicitly in the PR description** rather than
  silently shipping untested code.

### CI must pass

Pull requests must have a green CI run before merge. The required
checks are visible in the PR UI. If a check is failing for unrelated
reasons, leave a comment and a maintainer will help unblock you.

### Reviews

- Address review feedback or push back with a reasoned counterargument;
  silent dismissal of comments is not acceptable.
- Re-request review after substantive changes; don't expect reviewers
  to re-read N pushes silently.
- Avoid force-pushing during review (it loses comment anchors). Rebase
  + force-push is fine right before merge.

## What to work on

- Issues labeled `good first issue` are intentionally scoped for
  newcomers.
- Larger changes (new feature areas, schema migrations, vendor
  switches, billing surfaces, AI orchestrator changes) should start
  as an **RFC / design discussion in an issue** before any code is
  written. This saves you from rewriting a PR after architectural
  feedback.
- For **how the community influences what gets built next** (proposals,
  voting cadence, the bounded core-team veto, and the open ask for
  sponsorship — including for AI compute), see
  [`docs/CORE-DEVELOPMENT-AND-COMMUNITY.md`](./docs/CORE-DEVELOPMENT-AND-COMMUNITY.md).
  This is the v0.1 working agreement that complements the RFC process:
  RFCs govern the *contract*; that doc governs *roadmap sequencing*.

## Development setup

See [`DEVELOPMENT.md`](./DEVELOPMENT.md) and the project-local addendum
`DEVELOPMENT-LOCAL.md` (if present in your checkout). Quick orientation:

- **Stack:** Docker Compose (Postgres + replica + pgpool + nginx +
  Fastify API + Next.js web), plus a separate React Native + Expo app
  under `apps/native/`.
- **Repo layout:** `apps/**`, `services/**`, `packages/**` — a yarn-
  style workspace monorepo built with npm workspaces.
- **No host `node` / `npm` / `npx`** for project commands — see the
  `node-npm-container-only` skill shipped by the
  `umbraculum-node-react-cursor-assistant` plugin. Run everything inside
  the API or web containers.
- **Tests:** `docker compose exec -T api npm test` for the API,
  per-package npm scripts otherwise.

## Project structure

- `apps/web/` — Next.js + React + Tamagui web app.
- `apps/native/` — React Native + Expo + Tamagui native app.
- `services/api/` — Fastify + Prisma API service.
- `packages/contracts/` — typed shared contracts between API and clients.
- `packages/ui/` — cross-platform Tamagui primitives + shared
  components (e.g. `AiChatPanel`).
- `packages/i18n/` + `packages/i18n-react/` — translations and React hooks.
- `docs/` — public-facing docs (architecture, licensing, testing, etc.).
- `internal/` — internal-only docs (strategy, monetization, moat,
  business plans). **Not part of the public release.** When the public
  flip happens (see `docs/PLATFORM-ARCHITECTURE.md` §10.1), this
  directory is excluded from the public mirror.

## Questions

For **community proposals, roadmap sequencing, and project/strategy
discussion**: use the canonical forum at
[`forum.umbraculum.dev`](https://forum.umbraculum.dev) (see
[`docs/CORE-DEVELOPMENT-AND-COMMUNITY.md`](./docs/CORE-DEVELOPMENT-AND-COMMUNITY.md)
§4.6).

**Community participation — authentic representation.** On forum and
other community surfaces, you speak for yourself only. Do not use AI or
automation to post as another person or as an unnamed member; label any
automated announcements clearly; do not run AI-generated replies in
threads as ordinary human participation. If AI helped you draft a post,
say so briefly. Full rules: [`docs/CORE-DEVELOPMENT-AND-COMMUNITY.md`](./docs/CORE-DEVELOPMENT-AND-COMMUNITY.md)
§6.1; enforcement via [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

For **code-shaped questions** (when the repo is public): open a GitHub
Discussion or an issue with the `question` label.

For security questions: see [`SECURITY.md`](./SECURITY.md).

For code-of-conduct concerns: see [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

Thank you for helping build this.
