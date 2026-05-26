import { z } from "zod";
import type { DocumentTemplate } from "@umbraculum/module-sdk";
import { ProductStatusSchema } from "@umbraculum/pim-contracts";
import { renderCsv } from "@umbraculum/rendering";

export const PIM_PRODUCT_CATALOG_CSV_TEMPLATE_REF = "pim:product-catalog-csv@v1";

const ProductCatalogFeedVariantSchema = z
  .object({
    id: z.string().min(1, "variant.id required"),
    sku: z.string().min(1, "variant.sku required"),
    name: z.string().min(1, "variant.name required"),
    attributeValuesJson: z.string(),
  })
  .strict();

const ProductCatalogFeedProductSchema = z
  .object({
    id: z.string().min(1, "product.id required"),
    sku: z.string().min(1, "product.sku required"),
    name: z.string().min(1, "product.name required"),
    description: z.string().nullable(),
    status: ProductStatusSchema,
    variants: z.array(ProductCatalogFeedVariantSchema),
  })
  .strict();

export const PimProductCatalogFeedDataSchema = z
  .object({
    generatedAt: z.string().min(1, "generatedAt required"),
    workspaceId: z.string().min(1, "workspaceId required"),
    products: z.array(ProductCatalogFeedProductSchema),
  })
  .strict();

export type PimProductCatalogFeedData = z.infer<typeof PimProductCatalogFeedDataSchema>;

const PRODUCT_CATALOG_CSV_HEADERS = [
  "generated_at",
  "workspace_id",
  "product_id",
  "product_sku",
  "product_name",
  "product_description",
  "product_status",
  "variant_id",
  "variant_sku",
  "variant_name",
  "variant_attribute_values_json",
] as const;

export const pimDocumentTemplates: readonly DocumentTemplate<unknown>[] = [
  {
    kind: "csv",
    ref: PIM_PRODUCT_CATALOG_CSV_TEMPLATE_REF,
    schema: PimProductCatalogFeedDataSchema,
    retryPolicy: { maxAttempts: 2, backoffMs: 250 },
    async render(data) {
      const feed = PimProductCatalogFeedDataSchema.parse(data);
      const rows = feed.products.flatMap((product) => {
        if (product.variants.length === 0) {
          return [productCatalogRow(feed, product, null)];
        }
        return product.variants.map((variant) => productCatalogRow(feed, product, variant));
      });
      const artifact = await renderCsv(rows, { headers: PRODUCT_CATALOG_CSV_HEADERS });
      return artifact.body;
    },
  },
];

function productCatalogRow(
  feed: PimProductCatalogFeedData,
  product: PimProductCatalogFeedData["products"][number],
  variant: PimProductCatalogFeedData["products"][number]["variants"][number] | null,
): Readonly<Record<string, unknown>> {
  return {
    generated_at: feed.generatedAt,
    workspace_id: feed.workspaceId,
    product_id: product.id,
    product_sku: product.sku,
    product_name: product.name,
    product_description: product.description ?? "",
    product_status: product.status,
    variant_id: variant?.id ?? "",
    variant_sku: variant?.sku ?? "",
    variant_name: variant?.name ?? "",
    variant_attribute_values_json: variant?.attributeValuesJson ?? "",
  };
}
