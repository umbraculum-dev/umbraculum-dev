-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "automation";

-- CreateTable
CREATE TABLE "automation"."vessels" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "vessel_kind" TEXT NOT NULL,
    "equipment_profile_id" TEXT,
    "adapter_connection_id" TEXT,
    "mode" TEXT,
    "current_temp_c" DOUBLE PRECISION,
    "target_temp_c" DOUBLE PRECISION,
    "alarm_active" BOOLEAN NOT NULL DEFAULT false,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vessels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation"."adapter_connections" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "adapter_kind" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "config_json" JSONB NOT NULL,
    "secret_ref_id" TEXT,
    "contract_version" TEXT NOT NULL,
    "runtime_version" TEXT,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adapter_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation"."alarm_events" (
    "id" TEXT NOT NULL,
    "vessel_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "raised_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cleared_at" TIMESTAMP(3),

    CONSTRAINT "alarm_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vessels_workspace_id_idx" ON "automation"."vessels"("workspace_id");

-- CreateIndex
CREATE INDEX "vessels_adapter_connection_id_idx" ON "automation"."vessels"("adapter_connection_id");

-- CreateIndex
CREATE UNIQUE INDEX "vessels_workspace_id_code_key" ON "automation"."vessels"("workspace_id", "code");

-- CreateIndex
CREATE INDEX "adapter_connections_workspace_id_idx" ON "automation"."adapter_connections"("workspace_id");

-- CreateIndex
CREATE INDEX "adapter_connections_adapter_kind_idx" ON "automation"."adapter_connections"("adapter_kind");

-- CreateIndex
CREATE INDEX "alarm_events_vessel_id_active_idx" ON "automation"."alarm_events"("vessel_id", "active");

-- CreateIndex
CREATE INDEX "alarm_events_code_active_idx" ON "automation"."alarm_events"("code", "active");

-- AddForeignKey
ALTER TABLE "automation"."vessels" ADD CONSTRAINT "vessels_adapter_connection_id_fkey" FOREIGN KEY ("adapter_connection_id") REFERENCES "automation"."adapter_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation"."alarm_events" ADD CONSTRAINT "alarm_events_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "automation"."vessels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
