# AGENTS.md — repo-root agent interceptor

Repo-root instructions for AI assistants in the **Umbraculum** monorepo. This
file is read at session start by Cursor, Claude Code, Codex CLI, and any
agentic IDE that honors the `AGENTS.md` convention. It precedes
[`DEVELOPMENT.md`](DEVELOPMENT.md).

If you are a human contributor, read [`README.md`](README.md) and
[`CONTRIBUTING.md`](CONTRIBUTING.md) instead — this file is the agent-facing
gate, not the human onboarding doc.

## Apparatus self-check (FIRST action in any non-trivial task)

Umbraculum is an **AI-orchestrated-code project** by stated design
([`MANIFESTO.md`](MANIFESTO.md) §1.2). The project's CI gates — lint, types,
tests, docs structural checks, module-README audits, contract-validation
audits — are calibrated to the bar the *umbraculum-toolset Cursor plugin pack*
("the apparatus") encodes. Without the apparatus loaded into your session, the
code you produce is unlikely to clear those gates in one shot; the contributor
will round-trip with reviewers until the code converges on what the apparatus
would have produced from the start. Installing the apparatus is the project
**lowering the contribution bar**, not raising it
([`MANIFESTO.md`](MANIFESTO.md) §1.3, §2.2).

So the first thing you do in this repo, before any non-trivial change, is
confirm the apparatus is loaded.

### Required plugin pack (presence check)

Confirm the following Cursor plugins are loaded in your session by
**introspecting your own active rule set**. Each plugin has a unique "witness
rule" — a rule file that appears only when that plugin is installed:

| # | Plugin | Required for | Witness rule (must appear in loaded rules) |
|---|---|---|---|
| 1 | `umbraculum-toolset-common` | every task | `00-development-local-addendum-gate.mdc` |
| 2 | `umbraculum-node-react-cursor-assistant` | every task | `22-typescript-contracts-runtime-validation.mdc` |
| 3 | `umbraculum-platform-tsjs-cursor-assistant` | every task | `02-foundation-hardening.mdc` |
| 4 | `rf-magento-cursor-assistant` | tasks touching Magento code only | `00-core.mdc` |

Plugins 1–3 are required for **every** non-trivial task in this repo.
Plugin 4 is required only when the change set touches the Magento sub-tree
(check the change set scope before declaring it required).

A fifth plugin in the umbraculum-toolset — `umbraculum-openplc-python-cursor-assistant`
— applies to the OpenPLC + Python industrial-automation **sister-repo**, not
to this repo. Do **not** require it here.

### Fail-mode (soft block — recommended workflow)

If any of plugins 1–3 is missing (or 4 is missing on a Magento-touching task),
**do not silently proceed**. In your first reply to the user:

1. State explicitly which plugins are missing (by name, from the table above).
2. Explain why it matters, in the project's own terms:

   > *The Umbraculum CI gates (lint, types, tests, docs structural checks,
   > module-README audits, contract-validation audits) are calibrated to a
   > high bar that the umbraculum-toolset plugin pack is designed to make
   > one-shot achievable. Without the pack loaded, the code I produce here is
   > unlikely to pass CI in one shot — expect a CI-feedback loop with
   > reviewers until the code converges on what the pack would have produced
   > from the start. Installing the pack is what
   > [`MANIFESTO.md`](MANIFESTO.md) §1.3 and §2.2 call "the equalizer that
   > keeps the contribution bar low" — it is the project lowering the bar,
   > not raising it.*

3. Point the user at [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) for
   the install procedure (marketplace install where available; local install
   from the public `umbraculum-toolset` sister-repo as the fallback).

4. Offer an explicit override:

   > *If you would like to proceed without the apparatus anyway (e.g. you are
   > making a documentation-only fix, or a one-line typo correction, where
   > the apparatus would be overkill), tell me **`apparatus: override`** and
   > I will continue. Note: any code I produce in override mode is more
   > likely to need CI-feedback iterations before merge.*

Do **not** refuse the task outright. Do **not** auto-override. Wait for the
user's explicit choice.

## Scope notes

- **Presence is the v1 gate.** This interceptor currently checks plugin
  *presence* only. A future revision will pin minimum versions in a
  machine-readable manifest (`.cursor/required-plugins.json`) and add a CI
  parity check that confirms PR-time CI is running the same plugin versions
  as agent-side authoring. Until that revision lands, presence of the witness
  rules is sufficient.

- **Magento conditional.** The `rf-magento-cursor-assistant` requirement
  applies only when the change set touches files under the Magento sub-tree.
  Inspect the change set before declaring it required, to avoid blocking
  pure-TS/JS tasks on a Magento-only plugin.

- **Non-Cursor agents** (Claude Code, Codex CLI, others). If you are an
  agent that does not natively load Cursor plugins, see
  [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) §"Non-Cursor agents"
  for the equivalent rule-pack inclusion path. The introspection check above
  still applies — your equivalent is "are the umbraculum-toolset rules in my
  system-prompt / project-instructions context?".

- **Documentation-only tasks** (typo fixes, link updates, prose-only doc
  edits) are the standard override case. The user-issued
  `apparatus: override` covers them; the apparatus is not required for prose
  changes that touch no code.

## What this file is NOT

- Not the place for repository workflow guidance — that is
  [`DEVELOPMENT.md`](DEVELOPMENT.md).
- Not the place for human-contributor onboarding — that is
  [`CONTRIBUTING.md`](CONTRIBUTING.md).
- Not the place for the project's values / license posture — that is
  [`MANIFESTO.md`](MANIFESTO.md).
- Not the place for the plugin install procedure — that is
  [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md).

This file's single job is: ensure the agent confirms the apparatus is
present *before* it starts producing changes.

## Forward

If the apparatus check passes (or the user explicitly overrides it),
continue with [`DEVELOPMENT.md`](DEVELOPMENT.md) — the repo's policy,
runbook, and subagent inventory you operate inside.
