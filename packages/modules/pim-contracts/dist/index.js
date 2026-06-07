// src/version.ts
var CONTRACT_VERSION = "0.1.0-alpha.1";
function parseSemVer(input) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(input);
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
    return null;
  }
  const prerelease = match[4];
  if (prerelease === void 0) {
    return { major, minor, patch };
  }
  return { major, minor, patch, prerelease };
}
function classifyContractVersionSkew(runtime, expected = CONTRACT_VERSION) {
  const r = parseSemVer(runtime);
  const e = parseSemVer(expected);
  if (!r || !e) return "unparseable";
  if (r.major !== e.major) return "major";
  if (r.minor !== e.minor) return "minor";
  if (r.patch !== e.patch) return "patch";
  return "match";
}

// src/shared.ts
import { z } from "zod";
var IsoDateTimeStringSchema = z.string().min(1, "timestamp required").refine((s) => !Number.isNaN(Date.parse(s)), "must be ISO 8601");
var PimDeleteResponseSchema = z.object({
  ok: z.literal(true)
});

// src/attribute.ts
import { z as z2 } from "zod";
var AttributeTypeSchema = z2.enum([
  "string",
  "number",
  "boolean",
  "date",
  "select",
  "multiselect",
  "media_ref",
  "reference"
]);
var AttributeSchema = z2.object({
  id: z2.string().min(1, "id required"),
  workspaceId: z2.string().min(1, "workspaceId required"),
  code: z2.string().min(1, "code required"),
  type: AttributeTypeSchema,
  label: z2.string().min(1, "label required"),
  required: z2.boolean(),
  defaultValue: z2.unknown().nullable(),
  selectOptions: z2.array(z2.string().min(1)).nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var AttributeValueSchema = z2.discriminatedUnion("type", [
  z2.object({ type: z2.literal("string"), value: z2.string() }),
  z2.object({ type: z2.literal("number"), value: z2.number().finite() }),
  z2.object({ type: z2.literal("boolean"), value: z2.boolean() }),
  z2.object({
    type: z2.literal("date"),
    value: z2.string().min(1).refine((s) => !Number.isNaN(Date.parse(s)), "date value must be ISO 8601")
  }),
  z2.object({ type: z2.literal("select"), value: z2.string().min(1) }),
  z2.object({ type: z2.literal("multiselect"), value: z2.array(z2.string().min(1)) }),
  z2.object({ type: z2.literal("media_ref"), value: z2.string().min(1) }),
  z2.object({ type: z2.literal("reference"), value: z2.string().min(1) })
]);
var AttributeCreateRequestSchema = z2.object({
  code: z2.string().min(1, "code required"),
  type: AttributeTypeSchema,
  label: z2.string().min(1, "label required"),
  required: z2.boolean().optional(),
  defaultValue: z2.unknown().nullable().optional(),
  selectOptions: z2.array(z2.string().min(1)).nullable().optional()
}).strict();
var AttributeUpdateRequestSchema = z2.object({
  code: z2.string().min(1, "code required").optional(),
  type: AttributeTypeSchema.optional(),
  label: z2.string().min(1, "label required").optional(),
  required: z2.boolean().optional(),
  defaultValue: z2.unknown().nullable().optional(),
  selectOptions: z2.array(z2.string().min(1)).nullable().optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var AttributeListResponseSchema = z2.object({
  ok: z2.literal(true),
  items: z2.array(AttributeSchema)
});
var AttributeGetResponseSchema = z2.object({
  ok: z2.literal(true),
  item: AttributeSchema
});

// src/attributeSet.ts
import { z as z3 } from "zod";
var AttributeSetSchema = z3.object({
  id: z3.string().min(1, "id required"),
  workspaceId: z3.string().min(1, "workspaceId required"),
  code: z3.string().min(1, "code required"),
  label: z3.string().min(1, "label required"),
  attributeIds: z3.array(z3.string().min(1)),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var AttributeSetRefSchema = z3.object({
  attributeSetId: z3.string().min(1, "attributeSetId required")
});
var AttributeSetCreateRequestSchema = z3.object({
  code: z3.string().min(1, "code required"),
  label: z3.string().min(1, "label required"),
  attributeIds: z3.array(z3.string().min(1)).optional()
}).strict();
var AttributeSetUpdateRequestSchema = z3.object({
  code: z3.string().min(1, "code required").optional(),
  label: z3.string().min(1, "label required").optional(),
  attributeIds: z3.array(z3.string().min(1)).optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var AttributeSetListResponseSchema = z3.object({
  ok: z3.literal(true),
  items: z3.array(AttributeSetSchema)
});
var AttributeSetGetResponseSchema = z3.object({
  ok: z3.literal(true),
  item: AttributeSetSchema
});

// src/product.ts
import { z as z4 } from "zod";
var ProductStatusSchema = z4.enum(["draft", "active", "archived"]);
var ProductSchema = z4.object({
  id: z4.string().min(1, "id required"),
  workspaceId: z4.string().min(1, "workspaceId required"),
  sku: z4.string().min(1, "sku required"),
  name: z4.string().min(1, "name required"),
  description: z4.string().nullable(),
  primaryAttributeSetId: z4.string().nullable(),
  status: ProductStatusSchema,
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var ProductRefSchema = z4.object({
  productId: z4.string().min(1, "productId required")
});
var ProductCreateRequestSchema = z4.object({
  sku: z4.string().min(1, "sku required"),
  name: z4.string().min(1, "name required"),
  description: z4.string().nullable().optional(),
  primaryAttributeSetId: z4.string().min(1).nullable().optional(),
  status: ProductStatusSchema.optional()
}).strict();
var ProductUpdateRequestSchema = z4.object({
  sku: z4.string().min(1, "sku required").optional(),
  name: z4.string().min(1, "name required").optional(),
  description: z4.string().nullable().optional(),
  primaryAttributeSetId: z4.string().min(1).nullable().optional(),
  status: ProductStatusSchema.optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var ProductListResponseSchema = z4.object({
  ok: z4.literal(true),
  items: z4.array(ProductSchema)
});
var ProductGetResponseSchema = z4.object({
  ok: z4.literal(true),
  item: ProductSchema
});

// src/variant.ts
import { z as z5 } from "zod";
var VariantSchema = z5.object({
  id: z5.string().min(1, "id required"),
  productId: z5.string().min(1, "productId required"),
  sku: z5.string().min(1, "sku required"),
  name: z5.string().min(1, "name required"),
  attributeValues: z5.record(z5.string(), AttributeValueSchema),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var VariantRefSchema = z5.object({
  variantId: z5.string().min(1, "variantId required")
});
var VariantCreateRequestSchema = z5.object({
  sku: z5.string().min(1, "sku required"),
  name: z5.string().min(1, "name required"),
  attributeValues: z5.record(z5.string(), AttributeValueSchema).optional()
}).strict();
var VariantUpdateRequestSchema = z5.object({
  sku: z5.string().min(1, "sku required").optional(),
  name: z5.string().min(1, "name required").optional(),
  attributeValues: z5.record(z5.string(), AttributeValueSchema).optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var VariantListResponseSchema = z5.object({
  ok: z5.literal(true),
  items: z5.array(VariantSchema)
});
var VariantGetResponseSchema = z5.object({
  ok: z5.literal(true),
  item: VariantSchema
});

// src/category.ts
import { z as z6 } from "zod";
var CategorySchema = z6.object({
  id: z6.string().min(1, "id required"),
  workspaceId: z6.string().min(1, "workspaceId required"),
  code: z6.string().min(1, "code required"),
  label: z6.string().min(1, "label required"),
  parentId: z6.string().nullable(),
  sortOrder: z6.number().int(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var CategoryTreeNodeSchema = z6.lazy(
  () => CategorySchema.extend({
    children: z6.array(CategoryTreeNodeSchema)
  })
);
var CategoryCreateRequestSchema = z6.object({
  code: z6.string().min(1, "code required"),
  label: z6.string().min(1, "label required"),
  parentId: z6.string().min(1).nullable().optional(),
  sortOrder: z6.number().int().optional()
}).strict();
var CategoryUpdateRequestSchema = z6.object({
  code: z6.string().min(1, "code required").optional(),
  label: z6.string().min(1, "label required").optional(),
  parentId: z6.string().min(1).nullable().optional(),
  sortOrder: z6.number().int().optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var CategoryListResponseSchema = z6.object({
  ok: z6.literal(true),
  items: z6.array(CategorySchema),
  tree: z6.array(CategoryTreeNodeSchema)
});
var CategoryGetResponseSchema = z6.object({
  ok: z6.literal(true),
  item: CategorySchema
});

// src/mediaAssetRef.ts
import { z as z7 } from "zod";
var MediaAssetRoleSchema = z7.enum(["primary", "gallery", "swatch", "document"]);
var MediaAssetRefSchema = z7.object({
  id: z7.string().min(1, "id required"),
  productId: z7.string().min(1, "productId required"),
  mediaAssetId: z7.string().min(1, "mediaAssetId required"),
  role: MediaAssetRoleSchema,
  sortOrder: z7.number().int(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var MediaAssetRefCreateRequestSchema = z7.object({
  mediaAssetId: z7.string().min(1, "mediaAssetId required"),
  role: MediaAssetRoleSchema,
  sortOrder: z7.number().int().optional()
}).strict();
var MediaAssetRefUpdateRequestSchema = z7.object({
  mediaAssetId: z7.string().min(1, "mediaAssetId required").optional(),
  role: MediaAssetRoleSchema.optional(),
  sortOrder: z7.number().int().optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var MediaAssetRefListResponseSchema = z7.object({
  ok: z7.literal(true),
  items: z7.array(MediaAssetRefSchema)
});
var MediaAssetRefGetResponseSchema = z7.object({
  ok: z7.literal(true),
  item: MediaAssetRefSchema
});
export {
  AttributeCreateRequestSchema,
  AttributeGetResponseSchema,
  AttributeListResponseSchema,
  AttributeSchema,
  AttributeSetCreateRequestSchema,
  AttributeSetGetResponseSchema,
  AttributeSetListResponseSchema,
  AttributeSetRefSchema,
  AttributeSetSchema,
  AttributeSetUpdateRequestSchema,
  AttributeTypeSchema,
  AttributeUpdateRequestSchema,
  AttributeValueSchema,
  CONTRACT_VERSION,
  CategoryCreateRequestSchema,
  CategoryGetResponseSchema,
  CategoryListResponseSchema,
  CategorySchema,
  CategoryTreeNodeSchema,
  CategoryUpdateRequestSchema,
  MediaAssetRefCreateRequestSchema,
  MediaAssetRefGetResponseSchema,
  MediaAssetRefListResponseSchema,
  MediaAssetRefSchema,
  MediaAssetRefUpdateRequestSchema,
  MediaAssetRoleSchema,
  PimDeleteResponseSchema,
  ProductCreateRequestSchema,
  ProductGetResponseSchema,
  ProductListResponseSchema,
  ProductRefSchema,
  ProductSchema,
  ProductStatusSchema,
  ProductUpdateRequestSchema,
  VariantCreateRequestSchema,
  VariantGetResponseSchema,
  VariantListResponseSchema,
  VariantRefSchema,
  VariantSchema,
  VariantUpdateRequestSchema,
  classifyContractVersionSkew,
  parseSemVer
};
