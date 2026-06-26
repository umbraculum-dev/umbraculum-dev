# DEVELOPMENT-LOCAL-MODELS-DELEGATION.md

Policy: **Frontier planning + bounded executor** for the plugin-shipped rules / skills / subagents system.

This document defines what the **frontier agent** (Cursor's main agent) owns vs what may be delegated to **bounded executors** — primarily Cursor subagents shipped by the umbraculum-toolset plugins, and as a fallback, a chat-only delegation packet sent to a separate model UI.

> Companion documents:
>
> - [DEVELOPMENT-LOCAL-OLLAMA.md](DEVELOPMENT-LOCAL-OLLAMA.md) — local-model integration patterns.
> - `14-subagent-contract.mdc` — subagent file structure (plugin source: `<umbraculum-toolset>/cursor-plugins/umbraculum-node-react-cursor-assistant/rules/14-subagent-contract.mdc`).
> - Skill Contract — shipped by `umbraculum-toolset-common` (plugin source: `<umbraculum-toolset>/cursor-plugins/umbraculum-toolset-common/rules/12-skill-contract.mdc`).

## Goal

- Keep **planning, architecture decisions, and final validation** on frontier models.
- Delegate **bounded, contract-shaped, executor work** to:
  - Cursor subagents (preferred) with `model: fast` / `inherit` / a specific id.
  - A chat-only delegation packet (fallback) when subagents are unavailable.
- Preserve all productivity and safety guardrails.

## Definitions

- **Frontier agent**: Cursor's primary agent — handles planning, repo navigation, reasoning, final decisions.
- **Subagent**: a Cursor-native specialized agent (plugin-pack `agents/*.md`, optionally mirrored by repo-local `.cursor/agents/*.local.md` variants) with its own context window and configurable model.
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

## Recommended initial subagent set (plugin-shipped)

The frontier agent automatically delegates to these based on their `description` field (umbraculum-dev apparatus):

- `verifier.md` — `model: fast`, `readonly: true`. Validates URL/exception fixes and test claims. Shipped by `umbraculum-node-react-cursor-assistant`.
- `e2e-smoke.md` — `model: fast`, `readonly: true`, `is_background: true`. Bounded agentic E2E. Shipped by `umbraculum-node-react-cursor-assistant`.
- `types-baseline-verifier.md` — `model: inherit`, `readonly: true`. TypeScript strict-flag + `tsc` gate. Shipped by `umbraculum-platform-tsjs-cursor-assistant`.
- `module-readme-checker.md` — `model: fast`, `readonly: true`. Module README structural audit. Shipped by `umbraculum-platform-tsjs-cursor-assistant`.

For local-model variants of any of these (Ollama et al.), see `DEVELOPMENT-LOCAL-OLLAMA.md`.

## Pattern A (preferred): use a subagent

The Cursor subagent system replaces what used to be a manual "delegation packet" between the frontier agent and a separate executor model.

How it works:

1. Frontier agent identifies the task → "this is a URL exception verification".
2. Frontier agent invokes the matching subagent (e.g. `/verifier`) — Cursor automatically isolates context, switches model per the subagent's `model:` frontmatter, and returns only the final result.
3. Frontier agent integrates the subagent's bounded output into the final response.

The subagent body itself enforces the Skill Contract by referencing the canonical plugin skill (e.g. `curl-exception-verification/SKILL.md` in the relevant plugin install).

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

Scenario: a developer reports a Zod contract parse failure on a new API route.

1. **Frontier**: read `DEVELOPMENT.md` + `DEVELOPMENT-LOCAL.md`. Decide which subagents apply.
2. **Frontier**: invoke `/contracts-zod-auditor` or read rule 22 and fix the schema boundary.
3. **Frontier**: run scoped integration tests per `api-integration-tests-pre-push` skill.
4. **Frontier**: invoke `/verifier` to confirm the public endpoint and test claims.
5. **Frontier**: report the final, integrated result.

## Operational notes

- For zero-config use, prefer the plugin-shipped subagents with `model: fast` or `model: inherit`. No external endpoint setup is needed.
- For local-model integration (Ollama, regulated environments): see `DEVELOPMENT-LOCAL-OLLAMA.md`. The recommended approach is to register an OpenAI-compatible custom provider in Cursor and add `*.local.md` subagent siblings that pin a specific model id.
