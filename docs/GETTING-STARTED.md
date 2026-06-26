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

## Words you'll see first

Umbraculum reuses a small vocabulary precisely — especially **vertical**,
**canonical**, and **brewery**. Skim [`GLOSSARY.md`](GLOSSARY.md) before
diving in if those words are new; it explains that a **vertical** is a
specific product a team builds on the platform (usually in **your own repo**,
not this monorepo), that **canonical** names shared operational domains
(PIM, MRP, …) that **do** live here, and that **brewery** is the
**reference vertical** shipped in-repo as a worked example — not proof that
the platform is brewery-only.

**Building product X on Umbraculum (vertical ISV / integrator)?** Read
[`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) — how to start your
vertical, omit the brewery reference (default **core profile**), and the Magento sample-data parallel.

**Default stack (2026-06):** `docker compose up` boots the **core installation profile** — no brewery until you opt in. See [`design/installation-profile.md`](design/installation-profile.md).

## Community and production surfaces (live)

These URLs are **already reachable** while the GitHub repos remain private until Stage 2 **2c** (brochure/docs stay on pre-flip `noindex` until then):

| Surface | URL |
|---------|-----|
| Brochure | [umbraculum.dev](https://umbraculum.dev/) |
| Support / sponsorship | [umbraculum.dev/support/](https://umbraculum.dev/support/) — Liberapay + Buy Me a Coffee |
| Documentation | [docs.umbraculum.dev](https://docs.umbraculum.dev/) |
| Community forum | [forum.umbraculum.dev](https://forum.umbraculum.dev/) |
| Public brewery demo | [demo.umbraculum.dev](https://demo.umbraculum.dev/) — E2E fixture accounts on the sign-in banner |

Operator runbooks: [`design/production-hosts.md`](design/production-hosts.md), [`design/community-forum-runbook.md`](design/community-forum-runbook.md), [`design/demo-host-runbook.md`](design/demo-host-runbook.md), [`design/donation-channels.md`](design/donation-channels.md).

## Who this is for

- A developer with a working laptop and a GitHub account who wants to
  make their first contribution to Umbraculum.
- A consultant evaluating whether to bet a project on this codebase and
  wants to know what the contributor experience actually looks like.
- A maintainer setting up a fresh machine.
- A developer **repositioning in hard times** — learning on spare time,
  often without joy, because the stack must remain a viable path to
  employment. You do not need a customer's vertical to start; you need the
  platform. See [`MANIFESTO.md`](../MANIFESTO.md) §2.2 and the ecosystem
  case studies under [`docs/design/`](design/) (especially
  [`ecosystem-case-study-sap.md`](design/ecosystem-case-study-sap.md) and
  [`ecosystem-case-study-odoo.md`](design/ecosystem-case-study-odoo.md)).
- A **student, capstone team, or university lab** building a prototype or
  portfolio app at **no cost for self-host experimentation** — capstones,
  coursework, hackathons, research demos. Public alpha is aimed at this
  audience as much as at production integrators; see
  [`ACADEMIC-AND-EXPERIMENTATION.md`](ACADEMIC-AND-EXPERIMENTATION.md) for
  what free means, suggested project shapes, alpha expectations, and an
  honest fit filter.

**Third-party module authors:** MIT SDK packages are on npm — `@umbraculum/ai-tool-sdk@0.1.1`, `@umbraculum/i18n-keys@0.1.1`, `@umbraculum/module-sdk@0.0.2`, and `@umbraculum/*-contracts@0.0.2` (automation, pim, mrp, crp). See [`third-party-module.md`](modules/contribute/third-party-module.md).

## No certification track

Umbraculum does **not** offer a certification program. Other ecosystems
use exams and partner badges so implementation firms can **sell** credentialed
teams; that is their choice. Ours is different: **this is the stack, try it**
— `docker compose up`, public repo, public docs. Skill is shown by what you
build and what you can explain in conversation, not by a badge we would
administer.

If you ship a vertical module or domain configuration, the same openness helps
**you**: people who taught themselves on the public stack can find you and
offer real expertise — which, in our experience, matters more than a
certificate when matching builders to domain work.

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

### 1.2.1 Pre-push CI parity (after your first code change)

Docker is required not only for the dev stack but also for the **pre-push
static-analysis gate**. Before pushing TypeScript, lint, README, or lockfile
changes, run:

```bash
npx @umbraculum/ci-parity
```

See [`docs/CI-PARITY.md`](CI-PARITY.md). Host needs `git`, `bash`, and Docker —
not host Node for job execution.

### 1.3 macOS / Windows (alternative paths)

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

### 1.4 Install Cursor

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

### 1.5 Git config + DCO sign-off

Set your identity:

```bash
git config --global user.name "Your Real Name"
git config --global user.email "you@your-real-email.example"
```

DCO sign-off (a `Signed-off-by:` trailer on every commit) is **required**
in this project — see [`CONTRIBUTING.md`](../CONTRIBUTING.md) §"Developer
Certificate of Origin (DCO)" for the full text + rationale. Setting this
up correctly is more subtle than most OSS docs admit, so read this
sub-section carefully even if you've configured DCO before.

#### What does NOT work (the common trap)

Many guides recommend:

```bash
git config --global format.signOff true   # MISLEADING — see below
```

The `format.signOff` config **only applies to `git format-patch`** (the
patch-by-email workflow used by e.g. the Linux kernel). It does **nothing
for `git commit`** — commits made after setting it will still **not**
carry the `Signed-off-by:` trailer. There is no equivalent `commit.*`
config in standard git. Multiple blog posts and Stack Overflow answers
propagate this misunderstanding; do not trust them.

#### What DOES work — the canonical setup (recommended)

umbraculum-dev ships a committed `prepare-commit-msg` hook at
[`scripts/git-hooks/prepare-commit-msg`](../scripts/git-hooks/prepare-commit-msg).
Each clone enables it by pointing git's hook directory at the committed
location:

```bash
cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath scripts/git-hooks
```

Run those two lines **once per clone** of `umbraculum-dev` — including
each fresh Cursor worktree under `~/.cursor/worktrees/...`. After that,
every `git commit` in that clone auto-receives the `Signed-off-by:`
trailer (read from your `user.name` + `user.email`).

Properties of this setup:

- The hook content is **version-controlled**. Updates propagate via normal
  `git pull`; you never re-paste a heredoc.
- The hook content is **reviewable**. Open
  [`scripts/git-hooks/prepare-commit-msg`](../scripts/git-hooks/prepare-commit-msg)
  to see exactly what runs before each commit; changes go through PR
  review like any other code.
- The hook is a **no-op** if your commit message already contains a
  `Signed-off-by:` trailer, so manual `git commit -s` keeps working
  alongside it without producing duplicate trailers.
- The hook is a **no-op on merge / squash commits** (those carry their
  own trailer aggregation rules).

#### Cursor co-author attribution (handled by the same hook)

Commits made by a Cursor agent (i.e., a `git commit` invoked from an agent tool call rather than typed by a human in their terminal) will additionally carry a second trailer:

```text
Co-authored-by: Cursor <cursoragent@cursor.com>
```

This is auto-injected by the **same** [`prepare-commit-msg`](../scripts/git-hooks/prepare-commit-msg) hook described above. The hook detects `CURSOR_AGENT=1` in the shell environment — Cursor exports this env var (alongside `CURSOR_EXTENSION_HOST_ROLE=agent-exec` and other markers; verifiable with `env | grep -i cursor` from any agent shell) into every tool-call command its agents invoke. The hook fires `Co-authored-by: Cursor` injection ONLY when `CURSOR_AGENT=1` is set, so commits you type in your own terminal (no `CURSOR_AGENT`) correctly receive only `Signed-off-by:` and no co-author misattribution.

This is the project's AI-assistance attribution mechanism per [`MANIFESTO.md`](../MANIFESTO.md) §1.2 (the AI-orchestrated-code stance). It is **orthogonal to DCO** at the contract level (different concerns, different governance rules) but shares the same hook implementation: same file, two independent injection conditions, both idempotent.

The agent-side post-commit verification rule that catches misconfigurations (hook missing, hook outdated and lacking the `CURSOR_AGENT=1` branch, env var not exported, etc.) is published as `umbraculum-toolset-common` rule `44-agent-commit-cursor-coauthor.mdc` in the public umbraculum-toolset plugin pack — see [`docs/CURSOR-PLUGINS.md`](./CURSOR-PLUGINS.md) for the install procedure.

**No action is required from human contributors** to support this attribution; the mechanism activates automatically when an agent commits.

> **Empirical note.** Cursor's git integration **does** sometimes pre-inject `Co-authored-by: Cursor` into the commit-message file before the `prepare-commit-msg` hook runs — observed empirically — but the pre-injection is **non-deterministic**: it fires on some agent-driven commits and not on others, with no documented signal for when it does or doesn't. Relying on it alone produces silently-misattributed commits. **The hook is the operational contract** that ensures the trailer is consistently present; the Cursor pre-injection — when it fires — is additive and idempotent with the hook's `git interpret-trailers --if-exists addIfDifferent` semantics. This note is repeated in the `prepare-commit-msg` script's comment block, in `CONTRIBUTING.md`, and in the public umbraculum-toolset rules 42 and 44, so the non-determinism is visible during onboarding rather than discovered as a missing attribution after the fact.

#### Alternative mechanisms (fallback)

Two other mechanisms also produce DCO-signed commits; use them only if
`core.hooksPath` is unavailable in your environment (rare):

- **A `prepare-commit-msg` hook installed into `<repo>/.git/hooks/`** —
  the per-clone heredoc-paste mechanism. Equivalent to the canonical
  setup above but with the script copied into the (uncommitted) per-clone
  hooks directory. The full heredoc is preserved at the bottom of this
  section. Use this only if your environment forbids `core.hooksPath`
  (some hosted CI runners, locked-down sandboxes).
- **`git commit --signoff` (or `-s`) every time** — sustained manual
  discipline. Error-prone (one missed `-s` = one unsigned commit) but
  works with no setup at all. Acceptable when you are the sole committer
  in a clone and aware of the trade-off.

#### Verifying

After running `git config core.hooksPath scripts/git-hooks`, verify the
hook fires on an empty test commit (**make sure your working tree and
index are clean first** — see the sharp-edge note below):

```bash
git status               # must show "nothing to commit, working tree clean"
git commit --allow-empty -m "test: DCO hook verification"
git log -1 --format='%(trailers:only=true,key=Signed-off-by)'
# Expect: Signed-off-by: Your Real Name <you@your-real-email.example>

# Clean up the test commit (resets HEAD back one — only safe because
# we just made it and have not pushed)
git reset --hard HEAD~1
```

> [!WARNING]
> **Sharp edge — do NOT run the verification with uncommitted work in
> your index.** `git commit --allow-empty -m "..."` sweeps up any staged
> changes into the test commit. If you have work in progress, either
> `git stash` first (and `git stash pop` after), or run the verification
> on a freshly cloned repo where nothing is staged. Note: `git stash -u`
> will also stash any **untracked** files in the worktree — that is safe
> for verifying the canonical (committed) hook because the hook is
> tracked, but be aware of it if you are debugging the legacy per-clone
> hook below, which lives in untracked `.git/hooks/` and would itself be
> stashed away.

#### Cursor worktree caveat (resolved by `core.hooksPath`)

Cursor agent worktrees are separate clones (under
`~/.cursor/worktrees/...`) that start with empty `.git/hooks/` and do
**not** inherit hooks from your canonical clone. The legacy per-clone
heredoc-paste mechanism required you to remember to re-install the hook
in every fresh worktree.

The `core.hooksPath` + committed-hook setup above resolves this: the
hook content travels with the repo, so every fresh worktree carries it
automatically. You only need to run `git config core.hooksPath scripts/git-hooks`
once per worktree after creation. The Cursor plugin pack rule
`umbraculum-toolset-common/rules/42-dco-signoff-gate.mdc` (shipped)
detects a missing hook config in a fresh worktree and prompts you with
the canonical install command, so even the one-time per-worktree setup
will not silently slip through.

#### Legacy: per-clone heredoc install (rarely needed)

For environments where `core.hooksPath` is not available, the per-clone
hook install is still supported. It is functionally equivalent to the
canonical setup above; the trade-off is that the heredoc must be re-run
in every fresh clone (including every fresh Cursor worktree), and the
Cursor plugin pack rule above does NOT auto-detect a per-clone hook
that's missing in a new worktree.

```bash
cat > "$(git rev-parse --show-toplevel)/.git/hooks/prepare-commit-msg" <<'HOOK'
#!/bin/sh
# Auto-append Signed-off-by trailer if missing (umbraculum DCO gate).
# Reads GIT_COMMITTER_IDENT (= user.name + user.email) for the signer.
# No-op on merge / squash commits.

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

case "$COMMIT_SOURCE" in
  merge|squash) exit 0 ;;
esac

if grep -qiE "^Signed-off-by: " "$COMMIT_MSG_FILE"; then
  exit 0
fi

SOB=$(git var GIT_COMMITTER_IDENT | sed -n 's/^\(.*>\).*$/Signed-off-by: \1/p')
[ -z "$SOB" ] && exit 0

if [ -s "$COMMIT_MSG_FILE" ] && [ -n "$(tail -c 1 "$COMMIT_MSG_FILE")" ]; then
  printf '\n' >> "$COMMIT_MSG_FILE"
fi
printf '\n%s\n' "$SOB" >> "$COMMIT_MSG_FILE"
HOOK

chmod +x "$(git rev-parse --show-toplevel)/.git/hooks/prepare-commit-msg"
```

> [!IMPORTANT]
> If you have ALSO set `core.hooksPath` (the canonical setup), git uses
> the `core.hooksPath` directory and IGNORES `<repo>/.git/hooks/`. Pick
> one mechanism or the other; do NOT install both — having both would
> behave indistinguishably until one copy of the script diverges from
> the other and silently produces inconsistent trailer behavior.

---

## Part 2 — Repo bootstrap

### 2.1 Clone

```bash
mkdir -p ~/dev && cd ~/dev
git clone git@github.com:umbraculum-dev/umbraculum-dev.git
cd umbraculum-dev
```

(SSH clone above. HTTPS works too; SSH is recommended because GitHub
will reject password-based pushes.)

### 2.2 Start the stack

The repo ships a `docker-compose.yml` that brings up everything you
need: nginx (reverse proxy), Next.js web, Fastify API, Postgres
primary + replica, pgpool, Redis, and the internal Gotenberg sidecar used
by the canonical rendering pipeline. The root `package.json` exposes
convenience scripts:

```bash
docker compose up --build      # equivalent to `npm run dev` at repo root
```

**Module profile:** default compose boots the **`reference`** profile (brewery reference vertical on). Integrators omitting brewery: `UMBRACULUM_MODULE_PROFILE=platform` in `.env` or `-f docker-compose.platform.yml` — see [`design/platform-module-profile.md`](design/platform-module-profile.md) and [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md).

First boot takes 5–10 minutes (image pull + build). Subsequent boots are
under a minute.

Gotenberg is internal to the Compose network; it is not exposed on a host
port by default. If async document renders fail with a Gotenberg/request
error, check `docker compose ps gotenberg` and `docker compose logs
gotenberg api`. Redis is also required for async rendering jobs because
BullMQ uses it as the queue transport; see
[`docs/REDIS-ARCHITECTURE.md`](REDIS-ARCHITECTURE.md).

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

### 2.5 (Optional) Native app — Expo Go primer

The web stack from §2.2 is enough for most first contributions. If you need the **brewery native shell** (brew-day screens on a phone or simulator), add this after the stack is healthy:

1. **Build shared packages** (required after any `packages/**` change):

   ```bash
   ./scripts/build-packages-in-docker.sh
   ```

2. **Start Metro** (containerized; auto-detects your LAN IP):

   ```bash
   ./scripts/start-metro-dev.sh
   ```

3. **Open Expo Go** on a physical device (same Wi‑Fi as the laptop) or an iOS/Android simulator. Enter the URL the script prints (`exp://<LAN-IP>:8081`) or scan from Expo Go recents.

The native app auto-derives the API base URL from Metro's host — you usually do **not** edit `apps/native/app.json` for local LAN dev. Platform obligations, route matrix, and troubleshooting live in [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](DEVELOPMENT-NATIVE-LOCAL.md) and [`docs/design/canonical-native-platform-surface.md`](design/canonical-native-platform-surface.md). Cross-platform package boundaries: [`docs/CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md). Ubuntu Touch (Morph webapp wrapper, not Expo): [`docs/design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md).

### 2.6 External integrators — OpenAPI and contracts

If you integrate against the HTTP API (outside the monorepo):

1. **Module route tables** — [`MODULES.md`](MODULES.md) + per-module pages under [`modules/`](modules/).
2. **Type pins** — `@umbraculum/<code>-contracts` packages ([`modules/packages/README.md`](modules/packages/README.md)).
3. **Machine-readable catalog** — partial OpenAPI: platform catalog [`openapi.json`](../services/api/openapi/openapi.json) (canonical + rendering + auth/workspaces) and optional brewery add-on [`brewery.json`](../services/api/openapi/brewery.json). See [`API-OPENAPI.md`](API-OPENAPI.md).
4. **Auth** — [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md) (cookie `sid` for web, bearer for native).
5. **Try a path** — after §2.3, `curl -fsSL http://localhost/healthz` then authenticated module routes per module docs.

Local Swagger UI (maintainers): `http://localhost:18080/api/documentation` when the API runs in dev.

---

## Part 3 — Install the apparatus

This is the step that distinguishes Umbraculum from a typical OSS
contributor experience. Per [`MANIFESTO.md`](../MANIFESTO.md) §1.3 + §2.2,
the project's quality bar lives in the **umbraculum-toolset Cursor
plugin pack**. Installing it is how the project lowers the contribution
bar — not how it raises it.

Follow [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) end-to-end:

> [!CAUTION]
> **Common mistake — installing too many plugins.** This monorepo needs exactly
> **three** umbraculum-toolset plugins (common + node-react + platform-tsjs).
> Do **not**:
>
> - run `install-local.sh.legacy` or rsync into `~/.cursor/plugins/local/`
>   (loads all plugins in **every** workspace on your machine);
> - enable extra toolset plugins while this repo is open;
> - use marketplace **"Add for Myself"** across all workspaces when listings
>   publish — use **per-workspace** toggles only.
>
> Symptom when overloaded: agent "ignores" rules, suggests wrong commands,
> or misses ci-parity / Zod gates — often because unrelated `alwaysApply`
> rules consumed the context budget. See [`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md)
> §"Why workspace-scoped loading matters".

1. Set up **workspace-scoped** plugin loading: [`workspaceOpen` hook](https://cursor.com/docs/hooks#workspaceopen)
   + umbraculum-toolset source clone per toolset
   [`WORKSPACE-PLUGIN-LOADING.md`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/WORKSPACE-PLUGIN-LOADING.md)
   §0 (marketplace per-workspace once listings publish). **Do not** rsync into
   `~/.cursor/plugins/local/` — that loads every plugin in every workspace.
2. **Developer: Reload Window** after hook setup or toolset `git pull`.
3. Open this repo in Cursor and start a fresh agent session.
4. **Settings → Plugins** (workspace filter) — confirm exactly **three**
   umbraculum extensions for this workspace (common, node-react, platform-tsjs).
5. Run the *Verify the install* step from `docs/CURSOR-PLUGINS.md` —
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
  [`packages/platform/i18n/src/it.json`](../packages/platform/i18n/src/it.json) (the
  English keys live in [`packages/platform/i18n/src/en.json`](../packages/platform/i18n/src/en.json)).
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

If you installed the `prepare-commit-msg` hook in §1.4, the
`Signed-off-by:` trailer is appended automatically to every commit
(including this one). Verify with:

```bash
git log -1 --format='%(trailers:only=true,key=Signed-off-by)'
# Expect: Signed-off-by: Your Real Name <you@your-real-email.example>
```

If the trailer is missing, the hook is either not installed or not
executable for this clone — re-run the install command from §1.4 and
amend the commit with `git commit --amend --no-edit` (the hook fires on
amend too).

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
- For **local native development**: [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](DEVELOPMENT-NATIVE-LOCAL.md) — full Expo runbook (also summarized in GETTING-STARTED §2.5).
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
