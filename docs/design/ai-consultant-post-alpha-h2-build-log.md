# AI consultant post-public-alpha H2 — build log

**Tier:** Public  
**Status:** In progress (2026-05)  
**Plan:** Post-α H2 AI consultant expansion (Cursor plan, not checked in)

---

## 1. Wave table

| Wave | Focus | Status | Surface doc |
|------|--------|--------|-------------|
| **A** | Design surfaces + ROADMAP | Shipped | reporting / RAG / propose-write surfaces |
| **B** | MRP/CRP propose-write MVP | Shipped | [`canonical-ai-propose-write-surface.md`](canonical-ai-propose-write-surface.md) |
| **C** | Reporting DSL MVP | Shipped | [`canonical-ai-reporting-dsl-surface.md`](canonical-ai-reporting-dsl-surface.md) |
| **D** | RAG D1 (product docs) | Shipped | [`canonical-ai-rag-surface.md`](canonical-ai-rag-surface.md) |
| **E** | Multi-provider BYOK router; managed-AI deferred | Shipped (router only) | [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §7.3 |

---

## 2. Wave A — documentation

| Artifact | Path |
|----------|------|
| Reporting DSL surface | [`canonical-ai-reporting-dsl-surface.md`](canonical-ai-reporting-dsl-surface.md) |
| RAG surface | [`canonical-ai-rag-surface.md`](canonical-ai-rag-surface.md) |
| Propose-write surface | [`canonical-ai-propose-write-surface.md`](canonical-ai-propose-write-surface.md) |
| ROADMAP wave table | [`ROADMAP.md`](../ROADMAP.md) § H2 2026 AI consultant |

---

## 3. Wave B — propose-write

| Area | Paths |
|------|--------|
| SDK scope | [`packages/ai-tool-sdk/src/aiTool.ts`](../../packages/ai-tool-sdk/src/aiTool.ts) |
| Prisma | `AiProposal` in [`services/api/prisma/schema.prisma`](../../services/api/prisma/schema.prisma) |
| Service | [`services/api/src/services/ai/proposalService.ts`](../../services/api/src/services/ai/proposalService.ts) |
| Tools | [`services/api/src/services/ai/tools/mrp/proposeOrderAdjustment.ts`](../../services/api/src/services/ai/tools/mrp/proposeOrderAdjustment.ts) |
| Routes | [`services/api/src/routes/ai.ts`](../../services/api/src/routes/ai.ts) |
| Contracts | [`packages/contracts/src/ai/aiProposals.ts`](../../packages/contracts/src/ai/aiProposals.ts) |
| UI | [`packages/ui/src/ai/useAiChatStream.ts`](../../packages/ui/src/ai/useAiChatStream.ts), [`AiChatPanel.tsx`](../../packages/ui/src/ai/AiChatPanel.tsx) |

---

## 4. Wave C — reporting DSL

| Area | Paths |
|------|--------|
| AST + executor | [`services/api/src/services/ai/reporting/`](../../services/api/src/services/ai/reporting/) |
| Tool | [`services/api/src/services/ai/tools/platform/reportingQuery.ts`](../../services/api/src/services/ai/tools/platform/reportingQuery.ts) |
| Migration | `services/api/prisma/migrations/*_reporting_views/` |

---

## 5. Wave D — RAG D1

| Area | Paths |
|------|--------|
| pgvector init | [`infra/postgres/init/03-ai-pgvector.sql`](../../infra/postgres/init/03-ai-pgvector.sql) |
| Ingest | [`services/api/src/services/ai/rag/ingestPublicDocs.ts`](../../services/api/src/services/ai/rag/ingestPublicDocs.ts) |
| Tool | [`services/api/src/services/ai/tools/platform/searchProductDocs.ts`](../../services/api/src/services/ai/tools/platform/searchProductDocs.ts) |

---

## 6. Wave E — provider router (managed-AI deferred)

| Area | Notes |
|------|--------|
| Adapters | [`services/api/src/services/ai/providers/`](../../services/api/src/services/ai/providers/) |
| Deferral | `WorkspaceBillingAddon` + credits documented in ROADMAP → H1 2027 |

---

## 7. Verification

```bash
cd packages/ai-tool-sdk && npm run build
cd packages/contracts && npm run build
cd packages/ui && npm run build
cd services/api && npm run typecheck
docker compose exec -T api sh -c 'cd /app && npm test -- src/tests/ai/'
```

---

## 8. Known limits

- Propose **apply** is preview-only until MRP/CRP domain write routes ship.
- Reporting MVP: two views only; no cross-module joins.
- RAG D1: local deterministic embeddings; not provider-quality semantic search.
- Managed-AI credits: **not shipped**; OpenAI BYOK adapter + router only.
