-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "mrp";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "crp";

-- CreateTable
CREATE TABLE "mrp"."production_orders" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "source_module" TEXT,
    "source_ref_id" TEXT,
    "output_product_id" TEXT,
    "output_variant_id" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "planned_start_at" TIMESTAMP(3),
    "due_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrp"."production_order_lines" (
    "id" TEXT NOT NULL,
    "production_order_id" TEXT NOT NULL,
    "line_number" INTEGER NOT NULL,
    "output_product_id" TEXT,
    "output_variant_id" TEXT,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    CONSTRAINT "production_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrp"."boms" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_module" TEXT,
    "source_ref_id" TEXT,
    CONSTRAINT "boms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrp"."bom_lines" (
    "id" TEXT NOT NULL,
    "bom_id" TEXT NOT NULL,
    "line_number" INTEGER NOT NULL,
    "material_ref_module" TEXT,
    "material_ref_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "loss_percent" DOUBLE PRECISION,
    CONSTRAINT "bom_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrp"."operations" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "production_order_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "required_resource_kind" TEXT,
    "planned_duration_minutes" INTEGER,
    "earliest_start_at" TIMESTAMP(3),
    "due_at" TIMESTAMP(3),
    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrp"."material_requirements" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "production_order_id" TEXT NOT NULL,
    "bom_line_id" TEXT,
    "material_ref_module" TEXT,
    "material_ref_id" TEXT,
    "description" TEXT NOT NULL,
    "required_quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "availability_status" TEXT NOT NULL DEFAULT 'planned',
    "availability_note" TEXT,
    CONSTRAINT "material_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crp"."resources" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source_module" TEXT,
    "source_ref_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crp"."work_centers" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "resource_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source_module" TEXT,
    "source_ref_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "work_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crp"."resource_calendars" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    CONSTRAINT "resource_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crp"."availability_windows" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "calendar_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "capacity_minutes" INTEGER NOT NULL,
    "source_module" TEXT,
    "source_ref_id" TEXT,
    CONSTRAINT "availability_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crp"."scheduled_operations" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "resource_id" TEXT,
    "work_center_id" TEXT,
    "production_order_id" TEXT,
    "operation_id" TEXT,
    "operation_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "source_module" TEXT,
    "source_ref_id" TEXT,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "planned_duration_minutes" INTEGER NOT NULL,
    CONSTRAINT "scheduled_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crp"."capacity_conflicts" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "message" TEXT NOT NULL,
    "resource_id" TEXT,
    "scheduled_operation_id" TEXT,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "capacity_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_workspace_id_order_number_key" ON "mrp"."production_orders"("workspace_id", "order_number");
CREATE INDEX "production_orders_workspace_id_idx" ON "mrp"."production_orders"("workspace_id");
CREATE INDEX "production_orders_status_idx" ON "mrp"."production_orders"("status");
CREATE UNIQUE INDEX "production_order_lines_production_order_id_line_number_key" ON "mrp"."production_order_lines"("production_order_id", "line_number");
CREATE INDEX "production_order_lines_production_order_id_idx" ON "mrp"."production_order_lines"("production_order_id");
CREATE UNIQUE INDEX "boms_workspace_id_code_key" ON "mrp"."boms"("workspace_id", "code");
CREATE INDEX "boms_workspace_id_idx" ON "mrp"."boms"("workspace_id");
CREATE UNIQUE INDEX "bom_lines_bom_id_line_number_key" ON "mrp"."bom_lines"("bom_id", "line_number");
CREATE INDEX "bom_lines_bom_id_idx" ON "mrp"."bom_lines"("bom_id");
CREATE UNIQUE INDEX "operations_production_order_id_sequence_key" ON "mrp"."operations"("production_order_id", "sequence");
CREATE INDEX "operations_workspace_id_idx" ON "mrp"."operations"("workspace_id");
CREATE INDEX "operations_production_order_id_idx" ON "mrp"."operations"("production_order_id");
CREATE INDEX "material_requirements_workspace_id_idx" ON "mrp"."material_requirements"("workspace_id");
CREATE INDEX "material_requirements_production_order_id_idx" ON "mrp"."material_requirements"("production_order_id");
CREATE INDEX "material_requirements_bom_line_id_idx" ON "mrp"."material_requirements"("bom_line_id");
CREATE UNIQUE INDEX "resources_workspace_id_code_key" ON "crp"."resources"("workspace_id", "code");
CREATE INDEX "resources_workspace_id_idx" ON "crp"."resources"("workspace_id");
CREATE INDEX "resources_kind_idx" ON "crp"."resources"("kind");
CREATE UNIQUE INDEX "work_centers_workspace_id_code_key" ON "crp"."work_centers"("workspace_id", "code");
CREATE INDEX "work_centers_workspace_id_idx" ON "crp"."work_centers"("workspace_id");
CREATE INDEX "work_centers_resource_id_idx" ON "crp"."work_centers"("resource_id");
CREATE UNIQUE INDEX "resource_calendars_workspace_id_code_key" ON "crp"."resource_calendars"("workspace_id", "code");
CREATE INDEX "resource_calendars_workspace_id_idx" ON "crp"."resource_calendars"("workspace_id");
CREATE INDEX "resource_calendars_resource_id_idx" ON "crp"."resource_calendars"("resource_id");
CREATE INDEX "availability_windows_workspace_id_idx" ON "crp"."availability_windows"("workspace_id");
CREATE INDEX "availability_windows_calendar_id_idx" ON "crp"."availability_windows"("calendar_id");
CREATE INDEX "availability_windows_resource_id_idx" ON "crp"."availability_windows"("resource_id");
CREATE INDEX "availability_windows_starts_at_ends_at_idx" ON "crp"."availability_windows"("starts_at", "ends_at");
CREATE INDEX "scheduled_operations_workspace_id_idx" ON "crp"."scheduled_operations"("workspace_id");
CREATE INDEX "scheduled_operations_resource_id_idx" ON "crp"."scheduled_operations"("resource_id");
CREATE INDEX "scheduled_operations_work_center_id_idx" ON "crp"."scheduled_operations"("work_center_id");
CREATE INDEX "scheduled_operations_starts_at_ends_at_idx" ON "crp"."scheduled_operations"("starts_at", "ends_at");
CREATE INDEX "capacity_conflicts_workspace_id_idx" ON "crp"."capacity_conflicts"("workspace_id");
CREATE INDEX "capacity_conflicts_resource_id_idx" ON "crp"."capacity_conflicts"("resource_id");
CREATE INDEX "capacity_conflicts_scheduled_operation_id_idx" ON "crp"."capacity_conflicts"("scheduled_operation_id");
CREATE INDEX "capacity_conflicts_status_idx" ON "crp"."capacity_conflicts"("status");

-- AddForeignKey
ALTER TABLE "mrp"."production_order_lines" ADD CONSTRAINT "production_order_lines_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "mrp"."production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mrp"."bom_lines" ADD CONSTRAINT "bom_lines_bom_id_fkey" FOREIGN KEY ("bom_id") REFERENCES "mrp"."boms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mrp"."operations" ADD CONSTRAINT "operations_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "mrp"."production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mrp"."material_requirements" ADD CONSTRAINT "material_requirements_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "mrp"."production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mrp"."material_requirements" ADD CONSTRAINT "material_requirements_bom_line_id_fkey" FOREIGN KEY ("bom_line_id") REFERENCES "mrp"."bom_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crp"."work_centers" ADD CONSTRAINT "work_centers_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "crp"."resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crp"."resource_calendars" ADD CONSTRAINT "resource_calendars_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "crp"."resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crp"."availability_windows" ADD CONSTRAINT "availability_windows_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "crp"."resource_calendars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crp"."scheduled_operations" ADD CONSTRAINT "scheduled_operations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "crp"."resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crp"."scheduled_operations" ADD CONSTRAINT "scheduled_operations_work_center_id_fkey" FOREIGN KEY ("work_center_id") REFERENCES "crp"."work_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crp"."capacity_conflicts" ADD CONSTRAINT "capacity_conflicts_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "crp"."resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crp"."capacity_conflicts" ADD CONSTRAINT "capacity_conflicts_scheduled_operation_id_fkey" FOREIGN KEY ("scheduled_operation_id") REFERENCES "crp"."scheduled_operations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
