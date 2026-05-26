-- CreateTable
CREATE TABLE "workspace_ai_memory" (
    "workspace_id" TEXT NOT NULL,
    "memory_blob" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 0,
    "last_writer_run_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_ai_memory_pkey" PRIMARY KEY ("workspace_id")
);

-- AddForeignKey
ALTER TABLE "workspace_ai_memory" ADD CONSTRAINT "workspace_ai_memory_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
