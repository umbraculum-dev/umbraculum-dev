# DEVELOPMENT-LOCAL-OLLAMA.md

Local-model integration for the Cursor subagent system (the umbraculum-toolset plugin pack).

This document covers how to drive [Ollama](https://ollama.com/) (or any OpenAI-compatible local endpoint) from the same subagents that ship with the umbraculum-toolset plugins (see [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) for the install procedure). Canonical subagent files live under `<umbraculum-toolset>/cursor-plugins/<plugin-name>/agents/*.md` (loaded via the [`workspaceOpen` hook](https://cursor.com/docs/hooks#workspaceopen) when the workspace matches); this doc explains how to add local-model variants of those agents in this repo's `.cursor/agents/`.

> Companion documents:
>
> - [DEVELOPMENT-LOCAL-MODELS-DELEGATION.md](DEVELOPMENT-LOCAL-MODELS-DELEGATION.md) — frontier-vs-executor policy.
> - `14-subagent-contract.mdc` — subagent file structure (plugin source: `<umbraculum-toolset>/cursor-plugins/umbraculum-node-react-cursor-assistant/rules/14-subagent-contract.mdc`).
> - [Cursor subagents docs](https://cursor.com/docs/subagents)

## Why use Ollama?

- **Cost**: bounded executor runs (verifiers, test runners, smoke checks) accumulate tokens fast. A small local model for these is essentially free.
- **Privacy**: no source code or environment values leave the machine.
- **Offline**: works without internet (after model pull).
- **Regulated environments**: meets compliance constraints when hosted-model use is restricted.

You should NOT use Ollama for planning, architecture, or final validation — keep those on Cursor's frontier model. See `DEVELOPMENT-LOCAL-MODELS-DELEGATION.md` for the policy.

## Two integration patterns

### Pattern A (preferred): Cursor-native subagent with custom model id

This pattern reuses the same subagent files the umbraculum-toolset plugins ship (under `<umbraculum-toolset>/cursor-plugins/<plugin-name>/agents/*.md`), only swapping the `model:` field by creating a sibling `.local.md` in this repo's `.cursor/agents/`. Cursor manages context isolation, parallelism, and tool access for you.

**Prerequisites:**

- Ollama installed and running locally (default: `http://localhost:11434`).
- A model pulled (e.g. `ollama pull qwen2.5-coder:14b` or `ollama pull llama3.1`).
- Cursor admin / settings allows registering an OpenAI-compatible custom provider. (Cursor exposes this in Settings → Models → Custom; the exact menu may evolve. If your team admin has restricted custom providers, this pattern is unavailable — use Pattern B.)

**Steps:**

1. Pull a model:
   ```bash
   ollama pull qwen2.5-coder:14b
   # or any other model that supports tool/function calling well
   ```
2. Verify the OpenAI-compatible endpoint is reachable:
   ```bash
   curl -s http://localhost:11434/v1/models | head
   ```
3. In Cursor settings, register a custom OpenAI-compatible provider:
   - Base URL: `http://localhost:11434/v1`
   - API key: any non-empty string (Ollama ignores it but Cursor requires the field).
   - Model id: the exact name returned by `ollama list` (e.g. `qwen2.5-coder:14b`).
4. Drop a sibling subagent file in this repo's `.cursor/agents/` directory, using the naming convention `<name>.local.md`. The plugin install never writes into the repo's `.cursor/agents/`, so `*.local.md` files are safe from being overwritten by a plugin update.

   Example: `.cursor/agents/verifier.local.md`

   ```markdown
   ---
   name: verifier-local
   description: Local-model variant of the verifier subagent. Use when offline / cost-sensitive validation is preferred.
   model: qwen2.5-coder:14b
   readonly: true
   ---

   You are a skeptical validator running on a local model. Same instructions as the canonical `verifier` subagent shipped at `<umbraculum-toolset>/cursor-plugins/umbraculum-node-react-cursor-assistant/agents/verifier.md`:

   1. Read `DEVELOPMENT.md` and `DEVELOPMENT-LOCAL.md` first.
   2. For URL/exception fixes, follow the `curl-exception-verification` skill exactly (lives at `<umbraculum-toolset>/cursor-plugins/umbraculum-node-react-cursor-assistant/skills/curl-exception-verification/SKILL.md`).
   3. For API/integration test claims in this monorepo, follow the `api-integration-tests-pre-push` skill exactly.
   4. Do not modify files. Do not run state-changing shell commands.

   Final report format:

   - `PASSED` — what was verified, one-line evidence per item.
   - `INCOMPLETE` — what was claimed but evidence is missing.
   - `FAILED` — what was claimed but is broken; cite the exception text or failing test name.
   ```
5. Invoke explicitly: `/verifier-local`. Confirm Ollama logs received the request:
   ```bash
   journalctl --user -u ollama -f
   # or watch the Ollama desktop app
   ```

**Caveats (per Cursor docs):**

Cursor honors the `model` field in subagent frontmatter unless one of these applies:

- Your team admin has blocked the specified model (or custom providers entirely).
- The model requires Max Mode and you don't have it enabled.
- The model isn't available on your current plan.

In those cases Cursor falls back to a compatible model (typically the parent model). If you see unexpected behavior, check plan settings, Max Mode status, and admin policies first.

### Pattern B (fallback): chat-only delegation packet

If Pattern A is not available (Cursor admin restrictions, no custom-provider support, or you simply prefer a separate UI), use the manual delegation packet from `DEVELOPMENT-LOCAL-MODELS-DELEGATION.md`. Open Ollama in a separate UI / CLI, paste the packet (with all inputs filled), receive the bounded output, and copy the result back into Cursor.

Quick-start with raw Ollama CLI:

```bash
echo '<packet contents from DEVELOPMENT-LOCAL-MODELS-DELEGATION.md>' \
  | ollama run qwen2.5-coder:14b
```

Or via the OpenAI-compatible endpoint with `curl`:

```bash
curl -s http://localhost:11434/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen2.5-coder:14b",
    "messages": [{"role": "user", "content": "<packet contents>"}],
    "temperature": 0.1
  }' | jq -r '.choices[0].message.content'
```

This pattern has no Cursor integration; the human is the carrier.

## Stop conditions / safety (copied from policy doc)

A local-model executor must NOT:

- Plan, choose architecture, or pick "the best approach".
- Speculate about container names, repo roots, mount points, file paths, service names.
- Use loops/polling or unbounded output.
- Run destructive operations unless the frontier agent explicitly approves.

If a required input is missing, return a `Stop conditions` entry and STOP.

## Model selection guidance (rough heuristics)

| Task | Recommended local model size | Notes |
|---|---|---|
| `verifier` (OK/FAIL summaries) | 7B–14B | `qwen2.5-coder:14b` is a good default. |
| `e2e-smoke` | 7B–14B | Bounded; just enqueue + status fetch. |
| `types-baseline-verifier` / `module-readme-checker` | 7B–14B | Read-only structural checks. |

Models that handle structured output and tool calls reliably tend to do better here. If you see hallucinated container names or fabricated paths, your model is too small for the task — increase size or fall back to `model: inherit`.

## Quick start (TL;DR)

```bash
# 1. Install + run Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &

# 2. Pull a model
ollama pull qwen2.5-coder:14b

# 3. In Cursor settings, register http://localhost:11434/v1 as a custom OpenAI-compatible provider.

# 4. Create a project-only subagent
cat > .cursor/agents/verifier.local.md <<'EOF'
---
name: verifier-local
description: Local-model variant of the verifier subagent. Use when offline / cost-sensitive validation is preferred.
model: qwen2.5-coder:14b
readonly: true
---
(body as in Pattern A example above)
EOF

# 5. In Cursor chat:
#    /verifier-local against your test target
```

## Cross-links

- [DEVELOPMENT-LOCAL-MODELS-DELEGATION.md](DEVELOPMENT-LOCAL-MODELS-DELEGATION.md)
- `14-subagent-contract.mdc` — subagent file structure (plugin source: `<umbraculum-toolset>/cursor-plugins/umbraculum-node-react-cursor-assistant/rules/14-subagent-contract.mdc`).
- Plugin-shipped subagents (Pattern A starting points) — under `<umbraculum-toolset>/cursor-plugins/<plugin-name>/agents/*.md` (see [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) for install).
- [Cursor subagents docs](https://cursor.com/docs/subagents)
- [Ollama OpenAI-compatible API](https://github.com/ollama/ollama/blob/main/docs/openai.md)
