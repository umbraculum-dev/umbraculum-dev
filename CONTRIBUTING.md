# Contributing

Thank you for your interest in contributing. This project is built in
the open and we welcome bug reports, fixes, features, documentation,
translations, and thoughtful issue triage.

> [!NOTE]
> This repository is **not yet a public-facing release**. The path to
> the public flip is documented in
> `docs/PLATFORM-ARCHITECTURE.md` §10.1 (working assumption: a fresh
> public repo seeded from this one in H1 2027 once `<PLATFORM_NAME>`
> is chosen). The conventions below are already in force so that the
> existing history is clean when the flip happens.

## Before you start

- Read the [Code of Conduct](./CODE_OF_CONDUCT.md). It is in force in
  every project space, including pull requests, issues, and commits.
- Read [`docs/LICENSING.md`](./docs/LICENSING.md). Contributions are
  accepted under the same license as the project (AGPLv3 for the
  monorepo; selected SDK packages may be MIT — see the licensing doc).
- Read [`DEVELOPMENT.md`](./DEVELOPMENT.md), and if it exists in your
  checkout, the project-local addendum `DEVELOPMENT-LOCAL.md`.
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

If you are unsure which license applies to the file you are touching,
ask in the pull request before you commit.

## Developer Certificate of Origin (DCO) — required

This project uses the
[**Developer Certificate of Origin 1.1**](https://developercertificate.org/),
not a CLA. Every commit MUST include a `Signed-off-by` trailer:

```text
Signed-off-by: Jane Doe <jane@example.com>
```

The easiest way to add it is `git commit --signoff` (or `git commit -s`).
You can also configure git to add it automatically:

```bash
git config --global format.signOff true
```

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

### Tests are not optional

- After non-trivial changes, run the matching test layer and keep it
  green. See `docs/TESTING.md` for the project's layer map (unit,
  integration, contract, web E2E).
- For Magento-style PHP code (where present), unit + integration tests
  in `app/code/*/*` apply per the workspace rules in `.cursor/rules/20-tests-must-follow-changes.mdc`.
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

## Development setup

See [`DEVELOPMENT.md`](./DEVELOPMENT.md) and the project-local addendum
`DEVELOPMENT-LOCAL.md` (if present in your checkout). Quick orientation:

- **Stack:** Docker Compose (Postgres + replica + pgpool + nginx +
  Fastify API + Next.js web), plus a separate React Native + Expo app
  under `apps/native/`.
- **Repo layout:** `apps/**`, `services/**`, `packages/**` — a yarn-
  style workspace monorepo built with npm workspaces.
- **No host `node` / `npm` / `npx`** for project commands — see
  `.cursor/skills/node-npm-container-only.md`. Run everything inside
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

For project / strategy questions: open a GitHub Discussion (when the
repo is public) or an issue with the `question` label.

For security questions: see [`SECURITY.md`](./SECURITY.md).

For code-of-conduct concerns: see [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

Thank you for helping build this.
