-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pim";

-- CreateTable
CREATE TABLE "pim"."products" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "primary_attribute_set_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pim"."variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attribute_values" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pim"."attribute_sets" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "attribute_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pim"."attributes" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "default_value" JSONB,
    "select_options" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pim"."categories" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pim"."media_asset_refs" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "media_asset_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_asset_refs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_workspace_id_idx" ON "pim"."products"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_workspace_id_sku_key" ON "pim"."products"("workspace_id", "sku");

-- CreateIndex
CREATE INDEX "variants_product_id_idx" ON "pim"."variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "variants_product_id_sku_key" ON "pim"."variants"("product_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_sets_workspace_id_code_key" ON "pim"."attribute_sets"("workspace_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_workspace_id_code_key" ON "pim"."attributes"("workspace_id", "code");

-- CreateIndex
CREATE INDEX "categories_workspace_id_idx" ON "pim"."categories"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_workspace_id_code_key" ON "pim"."categories"("workspace_id", "code");

-- CreateIndex
CREATE INDEX "media_asset_refs_product_id_idx" ON "pim"."media_asset_refs"("product_id");

-- AddForeignKey
ALTER TABLE "pim"."products" ADD CONSTRAINT "products_primary_attribute_set_id_fkey" FOREIGN KEY ("primary_attribute_set_id") REFERENCES "pim"."attribute_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pim"."variants" ADD CONSTRAINT "variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "pim"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pim"."categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "pim"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pim"."media_asset_refs" ADD CONSTRAINT "media_asset_refs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "pim"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
