-- CreateEnum
CREATE TYPE "integration_kind" AS ENUM ('tilt');

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "kind" "integration_kind" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_devices" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "device_key" TEXT NOT NULL,
    "display_name" TEXT,
    "metadata_json" JSONB,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_device_attachments" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "brew_session_id" TEXT NOT NULL,
    "attached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detached_at" TIMESTAMP(3),

    CONSTRAINT "integration_device_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_readings" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "brew_session_id" TEXT,
    "recorded_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature_c" DOUBLE PRECISION,
    "gravity_sg" DOUBLE PRECISION,
    "raw_json" JSONB NOT NULL,

    CONSTRAINT "integration_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integrations_token_hash_key" ON "integrations"("token_hash");

-- CreateIndex
CREATE INDEX "integrations_workspace_id_idx" ON "integrations"("workspace_id");

-- CreateIndex
CREATE INDEX "integrations_kind_idx" ON "integrations"("kind");

-- CreateIndex
CREATE INDEX "integration_devices_integration_id_idx" ON "integration_devices"("integration_id");

-- CreateIndex
CREATE INDEX "integration_devices_last_seen_at_idx" ON "integration_devices"("last_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "integration_devices_integration_id_device_key_key" ON "integration_devices"("integration_id", "device_key");

-- CreateIndex
CREATE INDEX "integration_device_attachments_device_id_idx" ON "integration_device_attachments"("device_id");

-- CreateIndex
CREATE INDEX "integration_device_attachments_brew_session_id_idx" ON "integration_device_attachments"("brew_session_id");

-- CreateIndex
CREATE INDEX "integration_device_attachments_device_id_detached_at_idx" ON "integration_device_attachments"("device_id", "detached_at");

-- CreateIndex
CREATE INDEX "integration_readings_device_id_idx" ON "integration_readings"("device_id");

-- CreateIndex
CREATE INDEX "integration_readings_brew_session_id_idx" ON "integration_readings"("brew_session_id");

-- CreateIndex
CREATE INDEX "integration_readings_received_at_idx" ON "integration_readings"("received_at");

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_devices" ADD CONSTRAINT "integration_devices_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_device_attachments" ADD CONSTRAINT "integration_device_attachments_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "integration_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_device_attachments" ADD CONSTRAINT "integration_device_attachments_brew_session_id_fkey" FOREIGN KEY ("brew_session_id") REFERENCES "brew_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_readings" ADD CONSTRAINT "integration_readings_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "integration_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_readings" ADD CONSTRAINT "integration_readings_brew_session_id_fkey" FOREIGN KEY ("brew_session_id") REFERENCES "brew_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
