# Getting Started — first-time contributor tutorial

> [!NOTE]
> This is the **linear, top-to-bottom tutorial** for setting up an
> Umbraculum development environment from a fresh machine. It targets the
> [`MANIFESTO.md`](../MANIFESTO.md) §1.4 gap explicitly — taking a contributor
> from *"Ubuntu laptop, nothing installed"* to *"first commit landing with
> the apparatus running"*. Other docs (`README.md`, `CONTRIBUTING.md`,
> `DEVELOPMENT.md`, `AGENTS.md`, `docs/CURSOR-PLUGINS.md`) are reference
> documents; this one is the narrative that ties them together for
> someone who has never opened the repo before.

If you have already contributed to this repo before and just need a
quick reminder, jump straight to [`DEVELOPMENT.md`](../DEVELOPMENT.md).

## Who this is for

- A developer with a working laptop and a GitHub account who wants to
  make their first contribution to Umbraculum.
- A consultant evaluating whether to bet a project on this codebase and
  wants to know what the contributor experience actually looks like.
- A maintainer setting up a fresh machine.

## What you will have at the end

1. A working local stack (web + API + Postgres + native, optional) under
   Docker Compose.
2. Cursor installed with the **umbraculum-toolset plugin pack** (the
   "apparatus" referenced throughout [`MANIFESTO.md`](../MANIFESTO.md)
   §1.2 / §1.3 / §1.4).
3. One small change merged or open as a PR, with DCO sign-off, passing CI,
   end-to-end — proving the workflow runs.

## Time + prerequisites

- **Time**: ~1 hour for parts 1–4 on a clean machine with reasonable
  bandwidth; another 1–2 hours for parts 5–6 depending on what your first
  PR touches.
- **Prerequisites**: a laptop (Ubuntu LTS recommended; macOS or Windows
  also work — see §1.2), a GitHub account, an email address you can
  receive mail on (DCO sign-off requires a real, monitored address — see
  [`CONTRIBUTING.md`](../CONTRIBUTING.md) §"Developer Certificate of
  Origin (DCO)").

We do not argue against macOS or Windows — see [`MANIFESTO.md`](../MANIFESTO.md)
§1.4's OS-neutrality clarification. The Ubuntu path is the documented
*recommendation*, not the only supported path.

---

## Part 1 — Machine bootstrap

### 1.1 Ubuntu (recommended path)

Tested on Ubuntu 24.04 LTS. The packages below cover the project's host
needs — Node, npm, etc. are not required on the host because all
project commands run inside containers (see
[`DEVELOPMENT.md`](../DEVELOPMENT.md) §"Policies" — the *node-npm
container-only* policy).

```bash
# Base packages for development + Docker repo setup
sudo apt update
sudo apt install -y \
    git curl ca-certificates gnupg lsb-release \
    build-essential

# Install Docker Engine + Compose v2 plugin from Docker's official repo
# (the apt-shipped docker.io is older and lacks Compose v2).
# Full reference: https://docs.docker.com/engine/install/ubuntu/
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin

# Add yourself to the docker group so you can run docker without sudo
sudo usermod -aG docker "$USER"
# Log out and back in (or run `newgrp docker`) for the group change to apply
```

Verify the install:

```bash
docker --version           # Expect: Docker version 27.x or newer
docker compose version     # Expect: Docker Compose version v2.x or newer
git --version              # Expect: 2.30+
```

### 1.2 macOS / Windows (alternative paths)

- **macOS**: install [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/);
  install [Git](https://git-scm.com/download/mac) via Homebrew
  (`brew install git`) or the Apple Developer Tools.
- **Windows**: install [Docker Desktop for
  Windows](https://docs.docker.com/desktop/install/windows-install/) with
  the WSL2 backend; do the rest of this tutorial **inside WSL2** (Ubuntu
  on WSL2 is the closest match to the recommended Ubuntu path above).

The rest of the tutorial assumes `docker`, `docker compose`, and `git`
are on your `PATH`. If they are, the OS underneath does not matter for
the remaining steps.

### 1.3 Install Cursor

Cursor is the recommended IDE because the project's discipline ships as
**Cursor plugins** (see [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md)).
Other agentic IDEs work — see the *Non-Cursor agents* section of that
doc — but Cursor is the primary supported path.

- Download from [cursor.com](https://cursor.com).
- Install (`.deb` on Ubuntu, `.dmg` on macOS, `.exe` on Windows).
- Sign in.

> [!NOTE]
> Cursor itself is a commercial product, not open source. This is a
> deliberate exception to the open-source-stack discipline described in
> [`MANIFESTO.md`](../MANIFESTO.md) §1.4 — the IDE is the *one* closed
> dependency we tolerate because no equivalent agentic IDE with the same
> rules / skills / agents integration exists today. If that changes, the
> project's posture is to track it openly (this paragraph would change).

### 1.4 Git config + DCO sign-off

Set your identity and turn on automatic DCO sign-off:

```bash
git config --global user.name "Your Real Name"
git config --global user.email "you@your-real-email.example"
git config --global format.signOff true
```

The `format.signOff true` flag adds a `Signed-off-by:` trailer to every
commit automatically. DCO sign-off is **required on every commit** — see
[`CONTRIBUTING.md`](../CONTRIBUTING.md) §"Developer Certificate of Origin
(DCO)" for the full text + rationale.

---

## Part 2 — Repo bootstrap

### 2.1 Clone

```bash
mkdir -p ~/dev && cd ~/dev
git clone git@github.com:romeof1980/umbraculum-dev.git
cd umbraculum-dev
```

(SSH clone above. HTTPS works too; SSH is recommended because GitHub
will reject password-based pushes.)

### 2.2 Start the stack

The repo ships a `docker-compose.yml` that brings up everything you
need: nginx (reverse proxy), Next.js web, Fastify API, Postgres
primary + replica, and pgpool. The root `package.json` exposes
convenience scripts:

```bash
docker compose up --build      # equivalent to `npm run dev` at repo root
```

First boot takes 5–10 minutes (image pull + build). Subsequent boots are
under a minute.

### 2.3 Verify the stack

Once `docker compose up` settles, in another terminal:

```bash
curl -fsSL http://localhost/healthz             # nginx → api
curl -fsSL http://localhost:3000/ | head -20    # web (Next.js)
docker compose ps                               # all services should be "Up"
```

Open `http://localhost` in a browser — you should land on the brewery
vertical's UI. If you do not, check `docker compose logs api web` and
post the relevant logs when asking for help.

### 2.4 (Optional) seed E2E data

```bash
npm run seed:e2e        # runs `docker compose exec -T api npm run seed:e2e`
```

This is not required for most first PRs.

---

## Part 3 — Install the apparatus

This is the step that distinguishes Umbraculum from a typical OSS
contributor experience. Per [`MANIFESTO.md`](../MANIFESTO.md) §1.3 + §2.2,
the project's quality bar lives in the **umbraculum-toolset Cursor
plugin pack**. Installing it is how the project lowers the contribution
bar — not how it raises it.

Follow [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) end-to-end:

1. Install the four required plugins (local-from-source today; Cursor
   marketplace once the listings publish).
2. Restart Cursor.
3. Open the repo in Cursor and start a fresh agent session.
4. Run the *Verify the install* step from `docs/CURSOR-PLUGINS.md` —
   ask the agent literally to list the three witness rule filenames.

When the agent's first action in any non-trivial task hits
[`AGENTS.md`](../AGENTS.md), it runs the **apparatus self-check** and
either proceeds or soft-blocks. If you ever see the agent soft-block,
that is the apparatus working as intended; install the missing plugin
and retry.

---

## Part 4 — Read the policy + skill inventory

Before your first PR, skim:

1. [`DEVELOPMENT.md`](../DEVELOPMENT.md) — the "Policies" section and the
   subagent + skill inventory. You do not need to memorize either; you
   need to know they exist so you can invoke them when the situation
   matches.
2. [`CONTRIBUTING.md`](../CONTRIBUTING.md) — DCO, PR conventions, branch
   naming, commit message format, test expectations.
3. [`MANIFESTO.md`](../MANIFESTO.md) §1.2 — the AI-orchestrated-code
   distinction. The §1.2 contract is what the contribution surface
   assumes you have internalized.

If you are contributing to a specific module surface, also read the
relevant page in [`docs/modules/`](modules/) — start with the index at
[`docs/MODULES.md`](MODULES.md).

---

## Part 5 — Your first PR

### 5.1 Pick a task

Good first tasks share three properties:

- **Small** (under ~50 changed lines).
- **One intent** (a single fix, a single doc clarification, a single
  translation).
- **Easy to verify** (you can see "did this work?" without standing up a
  complex test scenario).

Concrete categories that fit:

- Fixing a typo or a broken cross-reference in a `docs/` file.
- Adding a missing Italian translation for an existing English key in
  [`packages/i18n/src/it.json`](../packages/i18n/src/it.json) (the
  English keys live in [`packages/i18n/src/en.json`](../packages/i18n/src/en.json)).
- Fixing an `eslint`-flagged violation in a small file.

Avoid for a first PR: schema migrations, billing surfaces, AI
orchestrator changes, anything cross-vertical. Per
[`CONTRIBUTING.md`](../CONTRIBUTING.md) §"What to work on", larger
changes should start as an issue / RFC discussion, not as code.

### 5.2 Branch

```bash
git switch -c docs/fix-typo-in-getting-started
```

Branch-name prefixes: `feat/`, `fix/`, `refactor/`, `docs/`, `test/`,
`chore/`. See [`CONTRIBUTING.md`](../CONTRIBUTING.md) §"Branch naming".

### 5.3 Make the change

Open the file in Cursor. Use the agent — the apparatus is loaded and
will guide you through the change with the right discipline applied.
For a documentation typo fix, the agent will likely recognize this as
the explicit `apparatus: override` case described in
[`AGENTS.md`](../AGENTS.md) §"Fail-mode" — that is fine.

For a code change, expect the agent to invoke skills like
`typescript-strict-flag-verification`, `module-readme-verification`,
`zod-schema-scaffold`, or `public-endpoint-verification` depending on
what you touched. That is the apparatus doing its job.

### 5.4 Verify locally

The CI gates the PR must clear are documented across
[`docs/FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md),
[`docs/TESTING.md`](TESTING.md), and [`docs/LINTING.md`](LINTING.md). The
most common local checks for a first PR:

```bash
npm run lint                                              # ESLint flat config
docker compose exec -T api npm test                       # API unit tests
docker compose exec -T api npx tsc --noEmit               # type-check API
```

For a docs-only change, only the structural docs checks apply — the
`module-readme-checker` subagent or the `module-readme-verification`
skill is the right entry point.

### 5.5 Commit (DCO sign-off)

```bash
git add docs/GETTING-STARTED.md
git commit -m "docs: fix typo in getting-started"
```

If you set `git config --global format.signOff true` in §1.4, the
`Signed-off-by:` trailer is added automatically. Verify with
`git log -1`.

Commit messages: imperative subject ≤ 72 chars; body explains *why*. See
[`CONTRIBUTING.md`](../CONTRIBUTING.md) §"Commit messages".

### 5.6 Push + open PR

```bash
git push -u origin docs/fix-typo-in-getting-started
```

GitHub will offer a "Compare & pull request" link. Open the PR with:

- A short title that matches the commit subject.
- A body that explains the *why*, not the *what* (the diff is the what).
- `Closes #N` or `Refs #N` if it relates to an issue.

### 5.7 Address review

- Engage with feedback or push back with a reasoned counter-argument.
- Re-request review after substantive changes.
- Avoid force-pushing during review; rebase + force-push is fine right
  before merge.

When CI is green and a maintainer approves: merge.

---

## Part 6 — Where to go next

You now have a working environment and one merged PR. From here:

- For the **why** of the project: [`MANIFESTO.md`](../MANIFESTO.md)
  end-to-end (it is short).
- For the **module ecosystem**: [`docs/MODULES.md`](MODULES.md) — the
  Drupal-style entry point with the canonical-module catalog, vertical
  configurations, and contributor paths.
- For **platform vision + trajectory**:
  [`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md).
- For **architectural decisions**: [`docs/rfcs/`](rfcs/) — start with
  RFC-0001 (canonical modules / tiers / governance).
- For **how the apparatus is constructed**:
  [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) + the
  `umbraculum-toolset` sister-repo (see the install section).

## Getting help

- For workflow questions: open an issue with the `question` label, or a
  GitHub Discussion (once the repo is public).
- For security issues: [`SECURITY.md`](../SECURITY.md), **not** a public
  issue.
- For code-of-conduct concerns: [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md).
- When asking for help, include: what command you ran, the full output,
  the relevant `docker compose logs`, and what you expected to happen.
  Saying "it doesn't work" without those four is the most common reason
  help threads stall.

Welcome to Umbraculum.
