-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "rendering";

-- CreateTable
CREATE TABLE "rendering"."render_jobs" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "template_ref" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "delivery_mode" TEXT NOT NULL,
    "delivery_json" JSONB NOT NULL,
    "input_json" JSONB NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "media_asset_id" TEXT,
    "error" JSONB,

    CONSTRAINT "render_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendering"."render_job_attempts" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error" JSONB,

    CONSTRAINT "render_job_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendering"."render_artifacts" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filename_extension" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "body" BYTEA NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "render_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "render_jobs_workspace_id_status_requested_at_idx" ON "rendering"."render_jobs"("workspace_id", "status", "requested_at");

-- CreateIndex
CREATE INDEX "render_jobs_template_ref_idx" ON "rendering"."render_jobs"("template_ref");

-- CreateIndex
CREATE INDEX "render_jobs_requested_by_id_idx" ON "rendering"."render_jobs"("requested_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "render_job_attempts_job_id_attempt_number_key" ON "rendering"."render_job_attempts"("job_id", "attempt_number");

-- CreateIndex
CREATE INDEX "render_job_attempts_job_id_idx" ON "rendering"."render_job_attempts"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "render_artifacts_job_id_key" ON "rendering"."render_artifacts"("job_id");

-- CreateIndex
CREATE INDEX "render_artifacts_workspace_id_idx" ON "rendering"."render_artifacts"("workspace_id");

-- CreateIndex
CREATE INDEX "render_artifacts_expires_at_idx" ON "rendering"."render_artifacts"("expires_at");

-- AddForeignKey
ALTER TABLE "rendering"."render_job_attempts" ADD CONSTRAINT "render_job_attempts_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "rendering"."render_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendering"."render_artifacts" ADD CONSTRAINT "render_artifacts_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "rendering"."render_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
