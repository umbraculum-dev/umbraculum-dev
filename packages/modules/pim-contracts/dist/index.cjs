"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AttributeCreateRequestSchema: () => AttributeCreateRequestSchema,
  AttributeGetResponseSchema: () => AttributeGetResponseSchema,
  AttributeListResponseSchema: () => AttributeListResponseSchema,
  AttributeSchema: () => AttributeSchema,
  AttributeSetCreateRequestSchema: () => AttributeSetCreateRequestSchema,
  AttributeSetGetResponseSchema: () => AttributeSetGetResponseSchema,
  AttributeSetListResponseSchema: () => AttributeSetListResponseSchema,
  AttributeSetRefSchema: () => AttributeSetRefSchema,
  AttributeSetSchema: () => AttributeSetSchema,
  AttributeSetUpdateRequestSchema: () => AttributeSetUpdateRequestSchema,
  AttributeTypeSchema: () => AttributeTypeSchema,
  AttributeUpdateRequestSchema: () => AttributeUpdateRequestSchema,
  AttributeValueSchema: () => AttributeValueSchema,
  CONTRACT_VERSION: () => CONTRACT_VERSION,
  CategoryCreateRequestSchema: () => CategoryCreateRequestSchema,
  CategoryGetResponseSchema: () => CategoryGetResponseSchema,
  CategoryListResponseSchema: () => CategoryListResponseSchema,
  CategorySchema: () => CategorySchema,
  CategoryTreeNodeSchema: () => CategoryTreeNodeSchema,
  CategoryUpdateRequestSchema: () => CategoryUpdateRequestSchema,
  MediaAssetRefCreateRequestSchema: () => MediaAssetRefCreateRequestSchema,
  MediaAssetRefGetResponseSchema: () => MediaAssetRefGetResponseSchema,
  MediaAssetRefListResponseSchema: () => MediaAssetRefListResponseSchema,
  MediaAssetRefSchema: () => MediaAssetRefSchema,
  MediaAssetRefUpdateRequestSchema: () => MediaAssetRefUpdateRequestSchema,
  MediaAssetRoleSchema: () => MediaAssetRoleSchema,
  PimDeleteResponseSchema: () => PimDeleteResponseSchema,
  ProductCreateRequestSchema: () => ProductCreateRequestSchema,
  ProductGetResponseSchema: () => ProductGetResponseSchema,
  ProductListResponseSchema: () => ProductListResponseSchema,
  ProductRefSchema: () => ProductRefSchema,
  ProductSchema: () => ProductSchema,
  ProductStatusSchema: () => ProductStatusSchema,
  ProductUpdateRequestSchema: () => ProductUpdateRequestSchema,
  VariantCreateRequestSchema: () => VariantCreateRequestSchema,
  VariantGetResponseSchema: () => VariantGetResponseSchema,
  VariantListResponseSchema: () => VariantListResponseSchema,
  VariantRefSchema: () => VariantRefSchema,
  VariantSchema: () => VariantSchema,
  VariantUpdateRequestSchema: () => VariantUpdateRequestSchema,
  classifyContractVersionSkew: () => classifyContractVersionSkew,
  parseSemVer: () => parseSemVer
});
module.exports = __toCommonJS(index_exports);

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
var import_zod = require("zod");
var IsoDateTimeStringSchema = import_zod.z.string().min(1, "timestamp required").refine((s) => !Number.isNaN(Date.parse(s)), "must be ISO 8601");
var PimDeleteResponseSchema = import_zod.z.object({
  ok: import_zod.z.literal(true)
});

// src/attribute.ts
var import_zod2 = require("zod");
var AttributeTypeSchema = import_zod2.z.enum([
  "string",
  "number",
  "boolean",
  "date",
  "select",
  "multiselect",
  "media_ref",
  "reference"
]);
var AttributeSchema = import_zod2.z.object({
  id: import_zod2.z.string().min(1, "id required"),
  workspaceId: import_zod2.z.string().min(1, "workspaceId required"),
  code: import_zod2.z.string().min(1, "code required"),
  type: AttributeTypeSchema,
  label: import_zod2.z.string().min(1, "label required"),
  required: import_zod2.z.boolean(),
  defaultValue: import_zod2.z.unknown().nullable(),
  selectOptions: import_zod2.z.array(import_zod2.z.string().min(1)).nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var AttributeValueSchema = import_zod2.z.discriminatedUnion("type", [
  import_zod2.z.object({ type: import_zod2.z.literal("string"), value: import_zod2.z.string() }),
  import_zod2.z.object({ type: import_zod2.z.literal("number"), value: import_zod2.z.number().finite() }),
  import_zod2.z.object({ type: import_zod2.z.literal("boolean"), value: import_zod2.z.boolean() }),
  import_zod2.z.object({
    type: import_zod2.z.literal("date"),
    value: import_zod2.z.string().min(1).refine((s) => !Number.isNaN(Date.parse(s)), "date value must be ISO 8601")
  }),
  import_zod2.z.object({ type: import_zod2.z.literal("select"), value: import_zod2.z.string().min(1) }),
  import_zod2.z.object({ type: import_zod2.z.literal("multiselect"), value: import_zod2.z.array(import_zod2.z.string().min(1)) }),
  import_zod2.z.object({ type: import_zod2.z.literal("media_ref"), value: import_zod2.z.string().min(1) }),
  import_zod2.z.object({ type: import_zod2.z.literal("reference"), value: import_zod2.z.string().min(1) })
]);
var AttributeCreateRequestSchema = import_zod2.z.object({
  code: import_zod2.z.string().min(1, "code required"),
  type: AttributeTypeSchema,
  label: import_zod2.z.string().min(1, "label required"),
  required: import_zod2.z.boolean().optional(),
  defaultValue: import_zod2.z.unknown().nullable().optional(),
  selectOptions: import_zod2.z.array(import_zod2.z.string().min(1)).nullable().optional()
}).strict();
var AttributeUpdateRequestSchema = import_zod2.z.object({
  code: import_zod2.z.string().min(1, "code required").optional(),
  type: AttributeTypeSchema.optional(),
  label: import_zod2.z.string().min(1, "label required").optional(),
  required: import_zod2.z.boolean().optional(),
  defaultValue: import_zod2.z.unknown().nullable().optional(),
  selectOptions: import_zod2.z.array(import_zod2.z.string().min(1)).nullable().optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var AttributeListResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  items: import_zod2.z.array(AttributeSchema)
});
var AttributeGetResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  item: AttributeSchema
});

// src/attributeSet.ts
var import_zod3 = require("zod");
var AttributeSetSchema = import_zod3.z.object({
  id: import_zod3.z.string().min(1, "id required"),
  workspaceId: import_zod3.z.string().min(1, "workspaceId required"),
  code: import_zod3.z.string().min(1, "code required"),
  label: import_zod3.z.string().min(1, "label required"),
  attributeIds: import_zod3.z.array(import_zod3.z.string().min(1)),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var AttributeSetRefSchema = import_zod3.z.object({
  attributeSetId: import_zod3.z.string().min(1, "attributeSetId required")
});
var AttributeSetCreateRequestSchema = import_zod3.z.object({
  code: import_zod3.z.string().min(1, "code required"),
  label: import_zod3.z.string().min(1, "label required"),
  attributeIds: import_zod3.z.array(import_zod3.z.string().min(1)).optional()
}).strict();
var AttributeSetUpdateRequestSchema = import_zod3.z.object({
  code: import_zod3.z.string().min(1, "code required").optional(),
  label: import_zod3.z.string().min(1, "label required").optional(),
  attributeIds: import_zod3.z.array(import_zod3.z.string().min(1)).optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var AttributeSetListResponseSchema = import_zod3.z.object({
  ok: import_zod3.z.literal(true),
  items: import_zod3.z.array(AttributeSetSchema)
});
var AttributeSetGetResponseSchema = import_zod3.z.object({
  ok: import_zod3.z.literal(true),
  item: AttributeSetSchema
});

// src/product.ts
var import_zod4 = require("zod");
var ProductStatusSchema = import_zod4.z.enum(["draft", "active", "archived"]);
var ProductSchema = import_zod4.z.object({
  id: import_zod4.z.string().min(1, "id required"),
  workspaceId: import_zod4.z.string().min(1, "workspaceId required"),
  sku: import_zod4.z.string().min(1, "sku required"),
  name: import_zod4.z.string().min(1, "name required"),
  description: import_zod4.z.string().nullable(),
  primaryAttributeSetId: import_zod4.z.string().nullable(),
  status: ProductStatusSchema,
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var ProductRefSchema = import_zod4.z.object({
  productId: import_zod4.z.string().min(1, "productId required")
});
var ProductCreateRequestSchema = import_zod4.z.object({
  sku: import_zod4.z.string().min(1, "sku required"),
  name: import_zod4.z.string().min(1, "name required"),
  description: import_zod4.z.string().nullable().optional(),
  primaryAttributeSetId: import_zod4.z.string().min(1).nullable().optional(),
  status: ProductStatusSchema.optional()
}).strict();
var ProductUpdateRequestSchema = import_zod4.z.object({
  sku: import_zod4.z.string().min(1, "sku required").optional(),
  name: import_zod4.z.string().min(1, "name required").optional(),
  description: import_zod4.z.string().nullable().optional(),
  primaryAttributeSetId: import_zod4.z.string().min(1).nullable().optional(),
  status: ProductStatusSchema.optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var ProductListResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  items: import_zod4.z.array(ProductSchema)
});
var ProductGetResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  item: ProductSchema
});

// src/variant.ts
var import_zod5 = require("zod");
var VariantSchema = import_zod5.z.object({
  id: import_zod5.z.string().min(1, "id required"),
  productId: import_zod5.z.string().min(1, "productId required"),
  sku: import_zod5.z.string().min(1, "sku required"),
  name: import_zod5.z.string().min(1, "name required"),
  attributeValues: import_zod5.z.record(import_zod5.z.string(), AttributeValueSchema),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var VariantRefSchema = import_zod5.z.object({
  variantId: import_zod5.z.string().min(1, "variantId required")
});
var VariantCreateRequestSchema = import_zod5.z.object({
  sku: import_zod5.z.string().min(1, "sku required"),
  name: import_zod5.z.string().min(1, "name required"),
  attributeValues: import_zod5.z.record(import_zod5.z.string(), AttributeValueSchema).optional()
}).strict();
var VariantUpdateRequestSchema = import_zod5.z.object({
  sku: import_zod5.z.string().min(1, "sku required").optional(),
  name: import_zod5.z.string().min(1, "name required").optional(),
  attributeValues: import_zod5.z.record(import_zod5.z.string(), AttributeValueSchema).optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var VariantListResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  items: import_zod5.z.array(VariantSchema)
});
var VariantGetResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  item: VariantSchema
});

// src/category.ts
var import_zod6 = require("zod");
var CategorySchema = import_zod6.z.object({
  id: import_zod6.z.string().min(1, "id required"),
  workspaceId: import_zod6.z.string().min(1, "workspaceId required"),
  code: import_zod6.z.string().min(1, "code required"),
  label: import_zod6.z.string().min(1, "label required"),
  parentId: import_zod6.z.string().nullable(),
  sortOrder: import_zod6.z.number().int(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var CategoryTreeNodeSchema = import_zod6.z.lazy(
  () => CategorySchema.extend({
    children: import_zod6.z.array(CategoryTreeNodeSchema)
  })
);
var CategoryCreateRequestSchema = import_zod6.z.object({
  code: import_zod6.z.string().min(1, "code required"),
  label: import_zod6.z.string().min(1, "label required"),
  parentId: import_zod6.z.string().min(1).nullable().optional(),
  sortOrder: import_zod6.z.number().int().optional()
}).strict();
var CategoryUpdateRequestSchema = import_zod6.z.object({
  code: import_zod6.z.string().min(1, "code required").optional(),
  label: import_zod6.z.string().min(1, "label required").optional(),
  parentId: import_zod6.z.string().min(1).nullable().optional(),
  sortOrder: import_zod6.z.number().int().optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var CategoryListResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  items: import_zod6.z.array(CategorySchema),
  tree: import_zod6.z.array(CategoryTreeNodeSchema)
});
var CategoryGetResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  item: CategorySchema
});

// src/mediaAssetRef.ts
var import_zod7 = require("zod");
var MediaAssetRoleSchema = import_zod7.z.enum(["primary", "gallery", "swatch", "document"]);
var MediaAssetRefSchema = import_zod7.z.object({
  id: import_zod7.z.string().min(1, "id required"),
  productId: import_zod7.z.string().min(1, "productId required"),
  mediaAssetId: import_zod7.z.string().min(1, "mediaAssetId required"),
  role: MediaAssetRoleSchema,
  sortOrder: import_zod7.z.number().int(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var MediaAssetRefCreateRequestSchema = import_zod7.z.object({
  mediaAssetId: import_zod7.z.string().min(1, "mediaAssetId required"),
  role: MediaAssetRoleSchema,
  sortOrder: import_zod7.z.number().int().optional()
}).strict();
var MediaAssetRefUpdateRequestSchema = import_zod7.z.object({
  mediaAssetId: import_zod7.z.string().min(1, "mediaAssetId required").optional(),
  role: MediaAssetRoleSchema.optional(),
  sortOrder: import_zod7.z.number().int().optional()
}).strict().superRefine((value, ctx) => {
  if (Object.values(value).every((v) => v === void 0)) {
    ctx.addIssue({
      code: "custom",
      message: "at least one field required"
    });
  }
});
var MediaAssetRefListResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  items: import_zod7.z.array(MediaAssetRefSchema)
});
var MediaAssetRefGetResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  item: MediaAssetRefSchema
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
