# AI RAG — horizontal surface (Layer C)

**Tier:** Public  
**Status:** Phase D1 shipped (post-α H2 Wave D, 2026-05); D2–D3 deferred  
**Audience:** platform maintainers, docs authors, AI consultant implementors  
**Related:** [`canonical-ai-prompt-composition-surface.md`](canonical-ai-prompt-composition-surface.md) §1, [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §6.1 Layer C

---

## 1. Summary

| Index | Scope | Phase | Tool |
|-------|-------|-------|------|
| **Product docs** | Global (`workspace_id` NULL) | **D1 shipped** | `platform.searchProductDocs` |
| **Activity timelines** | Per-workspace | D2 (H1 2027 target) | TBD |
| **Memory unification** | Workspace memory writer | D3 | TBD |

Static `aiPrompts.knowledge` (≤2 KB per module) remains for boot-time bullets; RAG supersedes large corpora.

---

## 2. Infrastructure

- **Extension:** `vector` (pgvector) via `pgvector/pgvector:pg16` (`docker-compose.yml`, CI `api.yml`), `infra/postgres/init/03-ai-pgvector.sql` (first boot), and Prisma migration `20260527120200_ai_pgvector_rag_schema` (conditional on `pg_available_extensions`).
- **Schema:** `ai.doc_chunks`

| Column | Purpose |
|--------|---------|
| `id` | UUID |
| `workspace_id` | NULL = global product doc; non-null = future tenant index |
| `source_ref` | Repo-relative path e.g. `docs/help/asking-umbraculum.md` |
| `content_hash` | Dedup on re-ingest |
| `content` | Chunk text (≤2 KB) |
| `embedding` | `vector(384)` — dev MVP uses deterministic local embedder |

---

## 3. Ingest (D1)

`services/api/src/services/ai/rag/ingestPublicDocs.ts` — run at API boot when `AI_RAG_INGEST_ON_BOOT=1` or via one-shot script:

- Scans `docs/help/**/*.md` and module surface §1 summaries listed in registry.
- Chunks by heading (~1.5 KB).
- Upserts by `(source_ref, content_hash)`.

---

## 4. Retrieval

**Tool `platform.searchProductDocs`**

| Input | `query` string (1–500 chars), optional `limit` (≤8) |
| Output | `{ ok: true, chunks: [{ sourceRef, excerpt, score }] }` |

**Orchestrator (optional pre-loop):** When user message contains `?` or help-like keywords, top-3 chunks append to system prompt under “Retrieved product documentation”.

Embeddings: `embedTextLocal()` — deterministic hash embedding for self-host parity without a second API key. Replace with provider embeddings when managed-AI ships.

---

## 5. PII and tenancy

- D1 corpus is **Tier: Public** docs only — no workspace DB rows.
- D2 per-workspace index must filter `workspace_id` on every query; never return another tenant’s chunks.

---

## 6. Phased roadmap

| Phase | Deliverable | Status |
|-------|-------------|--------|
| D1 | pgvector + public doc ingest + search tool | **Shipped** |
| D2 | Activity timeline summaries | Deferred H1 2027 |
| D3 | Unify with workspace memory writer | Deferred H1 2027 |

---

## 7. Maintenance

- Re-run ingest after help/surface doc edits (boot flag or `npm run rag:ingest` in api workspace).
- [`help/asking-umbraculum.md`](../help/asking-umbraculum.md) — operator-facing retrieval notes.
- Build log: [`ai-consultant-post-alpha-h2-build-log.md`](ai-consultant-post-alpha-h2-build-log.md).
