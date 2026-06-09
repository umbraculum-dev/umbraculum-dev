# AI consultant pre-public-alpha hardening — build log

**Tier:** Public  
**Status:** Complete (2026-05-27)  
**Plan:** AI consultant pre-public-alpha hardening (Cursor plan, not checked in)

---

## 1. Summary

Shipped module-pluggable prompt composition (`registerModule({ aiPrompts })`), neutral base prompt, platform overlay, per-module and per-route overlays, static knowledge snippets, optional `routeId` on `POST /ai/chat`, web deep-links via `?fromRoute=`, and refreshed public docs — without reporting DSL, pgvector RAG, managed-AI, or autonomous writes.

---

## 2. Artifacts

| Area | Paths |
|------|--------|
| Horizontal surface | [`canonical-ai-prompt-composition-surface.md`](canonical-ai-prompt-composition-surface.md) |
| SDK | [`packages/sdk/module-sdk/src/types.ts`](../../packages/sdk/module-sdk/src/types.ts), [`moduleRegistry.ts`](../../packages/sdk/module-sdk/src/moduleRegistry.ts) |
| Prompt text | [`services/api/src/services/ai/prompts/`](../../services/api/src/services/ai/prompts/) |
| Composer | [`services/api/src/services/ai/promptComposer.ts`](../../services/api/src/services/ai/promptComposer.ts) |
| Orchestrator | [`services/api/src/services/ai/orchestrator.ts`](../../services/api/src/services/ai/orchestrator.ts) |
| Chat contract | [`packages/platform/contracts/src/ai/aiChat.ts`](../../packages/platform/contracts/src/ai/aiChat.ts) |
| Web | [`apps/web/app/_components/AskAiLink.tsx`](../../apps/web/app/_components/AskAiLink.tsx), [`useAiChat.ts`](../../apps/web/app/[locale]/ai/_components/useAiChat.ts) |
| UI hook | [`packages/platform/ui/src/ai/useAiChatStream.ts`](../../packages/platform/ui/src/ai/useAiChatStream.ts) |

---

## 3. Verification

```bash
# module-sdk (host)
cd packages/sdk/module-sdk && npm test && npm run build

# API AI tests (api container)
docker compose exec -T api sh -c 'cd /app && npm test -- src/tests/ai/promptComposer.test.ts src/tests/ai/workspacePromptComposition.test.ts src/tests/ai/ai.integration.test.ts'

# contracts + ui dist (host)
cd packages/platform/contracts && npm run build
cd packages/platform/ui && npm run build
```

**Results:** 29/29 module-sdk tests; 25/25 API AI-scoped tests (container, 2026-05-27).

---

## 4. Known limits (public α)

- All boot-registered modules contribute overlays (no per-workspace module install filter).
- Unknown `routeId` values are ignored (no 400).
- Knowledge snippets are static strings, not pgvector RAG.
- Native AI screen does not pass `routeId` unless extended later.

---

## 5. Public messaging

**Today:** Workspace-scoped consultant; typed read tools; module-aware prompts; `render_document`; BYOK; memory; no autonomous domain writes.

**Next:** Reporting DSL, full RAG, managed-AI, propose/confirm mutations.
