# @umbraculum/ai-tool-sdk

The library-agnostic AI-tool contract every callable tool the Umbraculum AI consultant may invoke must satisfy.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications.

## Install

```bash
npm install @umbraculum/ai-tool-sdk@^0.1.0
```

Public alpha — see [third-party-module.md](../../../docs/modules/contribute/third-party-module.md).

## What this is

The five interface types that define what an AI tool is, on the SDK side of the boundary: `AiTool<Input, Output>` (the tool itself — `name`, `description`, `scope`, `inputSchema`, `handler`), `AiToolContext` (per-invocation context: workspaceId, userId, requestId, AbortSignal), `AiToolScope` (`"read" | "write" | "propose"`), `AiToolRegistry` (the boot-time registry surface), and `AiToolDefinition` (the serializable descriptor — no `handler`, safe to send to clients). Zero runtime code, zero schema library dependencies. Third-party module authors and platform-internal tool authors both depend on this package; the platform orchestrator at [`services/api/src/services/ai/orchestrator.ts`](../../../services/api/src/services/ai/orchestrator.ts) consumes it via the registry interface.

## Scope

- **Contains**: the five interface types above (`AiTool`, `AiToolContext`, `AiToolScope`, `AiToolRegistry`, `AiToolDefinition`). Pure type declarations — no runtime code.
- **Does not contain**: tool implementations (those live in [`services/api/src/services/ai/tools/<module>/`](../../../services/api/src/services/ai/tools/)); the orchestrator (lives in `services/api/src/services/ai/orchestrator.ts`); the in-process registry implementation (lives in `services/api/src/services/ai/toolRegistry.ts`); the workspace AI settings DTO (`WorkspaceAiSettings`, `AiRoleLimits` — those are wire-shape contracts in [`@umbraculum/contracts`](../../platform/contracts/)); the AI usage-ledger DTO (`AiUsageLedgerEntry`, `AiToolCallRecord` — also wire shape in `@umbraculum/contracts`).

## Exports

| Symbol | Purpose |
|---|---|
| `AiTool<Input, Output>` | The tool itself — `name`, `description`, `scope`, `inputSchema`, `handler`. |
| `AiToolContext` | Per-invocation context passed to every tool's `handler`. |
| `AiToolScope` | Capability scope union: `"read" \| "write"`. |
| `AiToolRegistry` | The boot-time registry surface (`register` / `resolve` / `list`). |
| `AiToolDefinition` | Serializable descriptor — same as `AiTool` minus the `handler` function. |

## Usage

Authoring a tool inside a canonical-module slice (example from the platform-internal brewery slice; the same shape applies to third-party modules):

```ts
import type { AiTool } from "@umbraculum/ai-tool-sdk";

export const recipeLookupTool: AiTool<{ recipeId: string }, { name: string; abv: number }> = {
  name: "brewery.recipeLookup",
  description: "Fetch a recipe summary by id.",
  scope: "read",
  inputSchema: { type: "object", properties: { recipeId: { type: "string" } }, required: ["recipeId"] },
  async handler(input, ctx) {
    // implementation uses ctx.workspaceId for ACL, ctx.signal for cancellation
    return { name: "Saison du Brett", abv: 6.4 };
  },
};
```

Registering tools from a module-owned bundle:

```ts
import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import { recipeLookupTool } from "./tools/recipeLookup.js";

export function registerBreweryTools(registry: AiToolRegistry): void {
  registry.register(recipeLookupTool);
}
```

The `registerAiTools` slot of [`@umbraculum/module-sdk`](../module-sdk/)'s `RegisterModuleOptions` accepts `(registry, app) => void`; module code usually calls a bundle function like the one above with dependencies from the host app (`app.prisma`, service factories, or other platform-owned runtime services). The SDK packages compose at the registration boundary.

## Build / test / lint (local)

Commands run from the repo root, container-friendly per the plugin-shipped `00-shared-node-npm-container-only.mdc` shared guardrail:

- **Build**: `npm run build:packages` (or `./scripts/build-packages-in-docker.sh` for the Docker route)
- **Test**: `npm run test --workspace=@umbraculum/ai-tool-sdk` (no tests today — pure type-only package; reserved for future schema-conformance tests if/when the surface grows runtime code)
- **Lint**: `npm run lint --workspace=@umbraculum/ai-tool-sdk`
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../../docs/TYPING.md) §"Per-workspace CI gate". All 6 candidate strict flags are on.

## How it fits in

- **Consumed by**: [`@umbraculum/module-sdk`](../module-sdk/) (uses `AiToolRegistry` in `RegisterModuleOptions.registerAiTools`); [`services/api`](../../../services/api/) (the platform-internal tool implementations and the orchestrator's registry consumer); any third-party module authoring `AiTool` implementations.
- **Depends on**: nothing. Zero runtime dependencies, zero schema-library coupling. This is intentional — the SDK boundary is library-agnostic so third parties can use any validation library that produces a JSON Schema for the tool's `inputSchema` field.

## Status

The interface surface is stable and intentionally minimal. Breaking changes follow the semver-discipline-at-SDK-boundary process committed in [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) §10 (RFC + deprecation window + major-version bump). Published on the public npm registry as part of the MIT SDK batch — see [`docs/design/npm-sdk-publish-execution-plan.md`](../../../docs/design/npm-sdk-publish-execution-plan.md).

## Further reading

- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) §4.4 — the SDK surface this package is part of
- [`docs/LICENSING.md`](../../../docs/LICENSING.md) §6.2 — why this package is MIT-licensed (and what that means for module authors)
- [`docs/AI-CONSULTANT.md`](../../../docs/AI-CONSULTANT.md) — the AI consultant architecture this contract serves
- [`docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md`](../../../docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md) — module governance + canonical-code allocation
- [`packages/sdk/module-sdk/README.md`](../module-sdk/README.md) — the companion SDK package authors compose with
