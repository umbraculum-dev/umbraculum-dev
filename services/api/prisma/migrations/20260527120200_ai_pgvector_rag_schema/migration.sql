-- RAG D1 schema: applies only when pgvector is available (pgvector/pgvector:pg16 or equivalent).
-- On stock postgres:16 without the extension package, this block is a no-op.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector') THEN
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
  END IF;
END $$;
