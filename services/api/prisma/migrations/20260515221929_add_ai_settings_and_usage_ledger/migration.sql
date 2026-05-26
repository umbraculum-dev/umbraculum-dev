-- CreateEnum
CREATE TYPE "ai_provider" AS ENUM ('anthropic');

-- CreateTable
CREATE TABLE "workspace_ai_settings" (
    "workspace_id" TEXT NOT NULL,
    "provider" "ai_provider" NOT NULL DEFAULT 'anthropic',
    "encrypted_key" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "role_limits" JSONB NOT NULL DEFAULT '{}',
    "per_user_daily_cap" INTEGER NOT NULL DEFAULT 200000,
    "data_egress_accepted" BOOLEAN NOT NULL DEFAULT false,
    "data_egress_accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_ai_settings_pkey" PRIMARY KEY ("workspace_id")
);

-- CreateTable
CREATE TABLE "ai_usage_ledger" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "model" TEXT NOT NULL,
    "tokens_in" INTEGER NOT NULL DEFAULT 0,
    "tokens_out" INTEGER NOT NULL DEFAULT 0,
    "cost_micro_usd" BIGINT NOT NULL DEFAULT 0,
    "duration_ms" INTEGER NOT NULL DEFAULT 0,
    "provider_request_id" TEXT,
    "tool_calls" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usage_ledger_workspace_id_created_at_idx" ON "ai_usage_ledger"("workspace_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ai_usage_ledger_user_id_created_at_idx" ON "ai_usage_ledger"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "workspace_ai_settings" ADD CONSTRAINT "workspace_ai_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_ledger" ADD CONSTRAINT "ai_usage_ledger_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_ledger" ADD CONSTRAINT "ai_usage_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
