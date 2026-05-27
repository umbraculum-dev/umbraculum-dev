-- RAG D1 schema is applied when Postgres runs the pgvector image (see docker-compose.yml).
-- Stock postgres:16 has no vector extension; this migration is intentionally a no-op so
-- migrate deploy/reset succeeds. After `docker compose up -d --force-recreate postgres postgres-replica`,
-- run the SQL in docs/design/canonical-ai-rag-surface.md §2 or infra/postgres/init/03-ai-pgvector.sql manually.

SELECT 1;
