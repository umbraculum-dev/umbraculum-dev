# DEVELOPMENT-LOCAL-MODELS-DELEGATION.md

Policy: **Frontier planning + bounded executor** for the rules / skills / subagents system.

This document defines what the **frontier agent** (Cursor's main agent) owns vs what may be delegated to **bounded executors** — primarily Cursor subagents (`.cursor/agents/*.md`), and as a fallback, a chat-only delegation packet sent to a separate model UI.

> Companion documents:
>
> - [DEVELOPMENT-LOCAL-OLLAMA.md](DEVELOPMENT-LOCAL-OLLAMA.md) — local-model integration patterns.
> - [.cursor/rules/14-subagent-contract.mdc](.cursor/rules/14-subagent-contract.mdc) — subagent file structure.
> - [.cursor/skills/README.md](.cursor/skills/README.md) — skill contract.

## Goal

- Keep **planning, architecture decisions, and final validation** on frontier models.
- Delegate **bounded, contract-shaped, executor work** to:
  - Cursor subagents (preferred) with `model: fast` / `inherit` / a specific id.
  - A chat-only delegation packet (fallback) when subagents are unavailable.
- Preserve all productivity and safety guardrails.

## Definitions

- **Frontier agent**: Cursor's primary agent — handles planning, repo navigation, reasoning, final decisions.
- **Subagent**: a Cursor-native specialized agent (`.cursor/agents/*.md`) with its own context window and configurable model.
- **Executor skill**: a skill whose output is deterministic and bounded (commands, checklists, templates) and does not require deep reasoning.

## Hard rules (non-negotiable)

### Frontier agent owns

- Reading `DEVELOPMENT.md` first and `DEVELOPMENT-LOCAL.md` next (when present).
- Problem framing, plan creation, risk assessment.
- Choosing which skills / subagents apply and when to invoke them.
- Filling all required inputs using `DEVELOPMENT-LOCAL.md` (containers, repo root/workdir, defaults).
- Validating subagent outputs against bounds and safety.
- All final implementation decisions and edits.

### Subagents (or local-lane chat) are allowed to

- Produce **Skill Contract** outputs in the required format:
  - `Prerequisites`
  - `Commands`
  - `Stop conditions`
- Drive a single canonical skill end-to-end with bounded output.
- Set `readonly: true` for validators (no edits, no state-changing shell).

### Subagents (or local-lane chat) MUST NOT

- Plan, choose architecture, or pick "the best approach".
- Speculate about:
  - container names
  - repo roots / mount points
  - file paths
  - service names
- Use loops/polling or unbounded output.
- Run destructive operations unless the frontier agent explicitly approves.

## Source of truth for inputs

Every subagent and chat-only delegation must rely on values from:

- `DEVELOPMENT-LOCAL.md` (project parameters)
- explicit user-provided task context

If a required input is missing, return a `Stop conditions` entry that blocks execution until the input is provided. **Do not guess.**

## Recommended initial subagent set (already shipped in v3)

The frontier agent automatically delegates to these based on their `description` field:

- [.cursor/agents/verifier.md](.cursor/agents/verifier.md) — `model: fast`, `readonly: true`. Validates URL/exception fixes and unit-test claims.
- [.cursor/agents/magento-debugger.md](.cursor/agents/magento-debugger.md) — `model: inherit`. Triages PHP/Magento exceptions.
- [.cursor/agents/e2e-smoke.md](.cursor/agents/e2e-smoke.md) — `model: fast`, `readonly: true`, `is_background: true`. Bounded agentic E2E.
- [.cursor/agents/phpunit-runner.md](.cursor/agents/phpunit-runner.md) — `model: fast`. Module-scoped unit tests.
- [.cursor/agents/template-refactor-verifier.md](.cursor/agents/template-refactor-verifier.md) — `model: fast`, `readonly: true`. Post-template-refactor sanity.

For local-model variants of any of these (Ollama et al.), see `DEVELOPMENT-LOCAL-OLLAMA.md`.

## Pattern A (preferred): use a subagent

The Cursor subagent system replaces what used to be a manual "delegation packet" between the frontier agent and a separate executor model.

How it works:

1. Frontier agent identifies the task → "this is a URL exception verification".
2. Frontier agent invokes the matching subagent (e.g. `/verifier`) — Cursor automatically isolates context, switches model per the subagent's `model:` frontmatter, and returns only the final result.
3. Frontier agent integrates the subagent's bounded output into the final response.

The subagent body itself enforces the Skill Contract by referencing the canonical skill (e.g. `.cursor/skills/curl-exception-verification.md`).

## Pattern B (fallback): chat-only delegation packet

When subagents are unavailable (e.g. you are using a separate Ollama or web UI for cost / privacy / offline reasons), use this manual packet shape. Copy/paste between Cursor (frontier) and the executor UI.

### Delegation packet template

```text
You are executing the skill: <SKILL_PATH>

Inputs (filled, do not assume):
- <KEY>: <VALUE>
- <KEY>: <VALUE>

Output format (return exactly):
### Prerequisites
### Commands
### Stop conditions

Bounds (hard):
- Max 5 commands
- No loops/polling
- No speculative container names/paths
- Keep output bounded (no huge logs / no full JSON dumps)

Return only the three output sections.
```

This is functionally what a Cursor subagent does internally — the packet is just the manual version. If you're integrating Ollama, Pattern A via a custom provider is preferred (see `DEVELOPMENT-LOCAL-OLLAMA.md`).

## Example workflow (real task)

Scenario: a developer reports "PDP throws a `TypeError` after a template refactor".

1. **Frontier**: read `DEVELOPMENT.md` + `DEVELOPMENT-LOCAL.md`. Decide which subagents apply.
2. **Frontier**: invoke `/template-refactor-verifier` with the URL.
3. **Subagent** (per its frontmatter): runs the bounded skill, returns OK/FAIL summary.
4. **Frontier**: if FAIL, invoke `/magento-debugger` with the error excerpt.
5. **Frontier**: implements the fix (ViewModel wiring, template changes, DI decisions).
6. **Frontier**: invoke `/verifier` to confirm the URL no longer throws AND the unit suite still passes.
7. **Frontier**: report the final, integrated result.

## Operational notes

- For zero-config use, prefer the shipped `.cursor/agents/*.md` subagents with `model: fast` or `model: inherit`. No external endpoint setup is needed.
- For local-model integration (Ollama, regulated environments): see `DEVELOPMENT-LOCAL-OLLAMA.md`. The recommended approach is to register an OpenAI-compatible custom provider in Cursor and add `*.local.md` subagent siblings that pin a specific model id.
