-- First-boot init for pgvector image (docker-entrypoint-initdb.d).
-- Extension + RAG table; mirrors services/api/prisma/migrations/20260527120200_ai_pgvector_rag_schema.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS ai;

CREATE TABLE IF NOT EXISTS ai.doc_chunks (
  id TEXT NOT NULL,
  workspace_id TEXT,
  source_ref TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(384),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT doc_chunks_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS doc_chunks_source_hash_idx
  ON ai.doc_chunks (source_ref, content_hash);
CREATE INDEX IF NOT EXISTS doc_chunks_workspace_idx
  ON ai.doc_chunks (workspace_id);
