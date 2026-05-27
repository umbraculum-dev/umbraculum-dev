-- Post-α H2: proposals, reporting views, RAG chunks, OpenAI provider enum

CREATE TYPE "ai_proposal_status" AS ENUM ('pending', 'applied', 'rejected');

ALTER TYPE "ai_provider" ADD VALUE IF NOT EXISTS 'openai';

CREATE TABLE "ai_proposals" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "proposal_type" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "status" "ai_proposal_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),

    CONSTRAINT "ai_proposals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_proposals_workspace_id_created_at_idx" ON "ai_proposals"("workspace_id", "created_at" DESC);

ALTER TABLE "ai_proposals" ADD CONSTRAINT "ai_proposals_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_proposals" ADD CONSTRAINT "ai_proposals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE SCHEMA IF NOT EXISTS reporting;

CREATE OR REPLACE VIEW reporting.mrp_order_status_counts AS
SELECT
  po.workspace_id,
  po.status::text AS status,
  COUNT(*)::int AS order_count
FROM mrp.production_orders po
GROUP BY po.workspace_id, po.status;

CREATE OR REPLACE VIEW reporting.brewery_inventory_summary AS
SELECT
  ii.workspace_id,
  ii.category::text AS category,
  COALESCE(SUM(ii.quantity), 0)::numeric AS on_hand_qty
FROM public.inventory_items ii
GROUP BY ii.workspace_id, ii.category;
