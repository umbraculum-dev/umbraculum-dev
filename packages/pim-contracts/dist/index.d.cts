import { z } from 'zod';

/**
 * Wire-level contract version of `@umbraculum/pim-contracts`.
 *
 * Phase A baseline per RFC-0004. Bumped when the canonical PIM surface
 * ships breaking contract changes.
 */
declare const CONTRACT_VERSION: "0.1.0-alpha.1";
interface SemVer {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease?: string;
}
declare function parseSemVer(input: string): SemVer | null;
type VersionMismatchSeverity = "match" | "patch" | "minor" | "major" | "unparseable";
declare function classifyContractVersionSkew(runtime: string, expected?: string): VersionMismatchSeverity;

declare const AttributeTypeSchema: z.ZodEnum<{
    string: "string";
    number: "number";
    boolean: "boolean";
    date: "date";
    select: "select";
    multiselect: "multiselect";
    media_ref: "media_ref";
    reference: "reference";
}>;
declare const AttributeSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    type: z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        date: "date";
        select: "select";
        multiselect: "multiselect";
        media_ref: "media_ref";
        reference: "reference";
    }>;
    label: z.ZodString;
    required: z.ZodBoolean;
    defaultValue: z.ZodNullable<z.ZodUnknown>;
    selectOptions: z.ZodNullable<z.ZodArray<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const AttributeValueSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"string">;
    value: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"number">;
    value: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"boolean">;
    value: z.ZodBoolean;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"date">;
    value: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"select">;
    value: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"multiselect">;
    value: z.ZodArray<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"media_ref">;
    value: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"reference">;
    value: z.ZodString;
}, z.core.$strip>], "type">;
declare const AttributeListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        type: z.ZodEnum<{
            string: "string";
            number: "number";
            boolean: "boolean";
            date: "date";
            select: "select";
            multiselect: "multiselect";
            media_ref: "media_ref";
            reference: "reference";
        }>;
        label: z.ZodString;
        required: z.ZodBoolean;
        defaultValue: z.ZodNullable<z.ZodUnknown>;
        selectOptions: z.ZodNullable<z.ZodArray<z.ZodString>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const AttributeGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        type: z.ZodEnum<{
            string: "string";
            number: "number";
            boolean: "boolean";
            date: "date";
            select: "select";
            multiselect: "multiselect";
            media_ref: "media_ref";
            reference: "reference";
        }>;
        label: z.ZodString;
        required: z.ZodBoolean;
        defaultValue: z.ZodNullable<z.ZodUnknown>;
        selectOptions: z.ZodNullable<z.ZodArray<z.ZodString>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
type AttributeType = z.infer<typeof AttributeTypeSchema>;
type Attribute = z.infer<typeof AttributeSchema>;
type AttributeValue = z.infer<typeof AttributeValueSchema>;
type AttributeListResponse = z.infer<typeof AttributeListResponseSchema>;
type AttributeGetResponse = z.infer<typeof AttributeGetResponseSchema>;

declare const AttributeSetSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    label: z.ZodString;
    attributeIds: z.ZodArray<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const AttributeSetRefSchema: z.ZodObject<{
    attributeSetId: z.ZodString;
}, z.core.$strip>;
declare const AttributeSetListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        label: z.ZodString;
        attributeIds: z.ZodArray<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const AttributeSetGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        label: z.ZodString;
        attributeIds: z.ZodArray<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
type AttributeSet = z.infer<typeof AttributeSetSchema>;
type AttributeSetRef = z.infer<typeof AttributeSetRefSchema>;
type AttributeSetListResponse = z.infer<typeof AttributeSetListResponseSchema>;
type AttributeSetGetResponse = z.infer<typeof AttributeSetGetResponseSchema>;

declare const ProductStatusSchema: z.ZodEnum<{
    draft: "draft";
    active: "active";
    archived: "archived";
}>;
declare const ProductSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    primaryAttributeSetId: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        draft: "draft";
        active: "active";
        archived: "archived";
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const ProductRefSchema: z.ZodObject<{
    productId: z.ZodString;
}, z.core.$strip>;
declare const ProductListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        sku: z.ZodString;
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        primaryAttributeSetId: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            draft: "draft";
            active: "active";
            archived: "archived";
        }>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const ProductGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        sku: z.ZodString;
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        primaryAttributeSetId: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            draft: "draft";
            active: "active";
            archived: "archived";
        }>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
type ProductStatus = z.infer<typeof ProductStatusSchema>;
type Product = z.infer<typeof ProductSchema>;
type ProductRef = z.infer<typeof ProductRefSchema>;
type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
type ProductGetResponse = z.infer<typeof ProductGetResponseSchema>;

declare const VariantSchema: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    attributeValues: z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"string">;
        value: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"number">;
        value: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"boolean">;
        value: z.ZodBoolean;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"date">;
        value: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"select">;
        value: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"multiselect">;
        value: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"media_ref">;
        value: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"reference">;
        value: z.ZodString;
    }, z.core.$strip>], "type">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const VariantRefSchema: z.ZodObject<{
    variantId: z.ZodString;
}, z.core.$strip>;
declare const VariantListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        productId: z.ZodString;
        sku: z.ZodString;
        name: z.ZodString;
        attributeValues: z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"string">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"number">;
            value: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"boolean">;
            value: z.ZodBoolean;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"date">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"select">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"multiselect">;
            value: z.ZodArray<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"media_ref">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"reference">;
            value: z.ZodString;
        }, z.core.$strip>], "type">>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const VariantGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        productId: z.ZodString;
        sku: z.ZodString;
        name: z.ZodString;
        attributeValues: z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"string">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"number">;
            value: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"boolean">;
            value: z.ZodBoolean;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"date">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"select">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"multiselect">;
            value: z.ZodArray<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"media_ref">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"reference">;
            value: z.ZodString;
        }, z.core.$strip>], "type">>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
type Variant = z.infer<typeof VariantSchema>;
type VariantRef = z.infer<typeof VariantRefSchema>;
type VariantListResponse = z.infer<typeof VariantListResponseSchema>;
type VariantGetResponse = z.infer<typeof VariantGetResponseSchema>;

declare const CategorySchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    label: z.ZodString;
    parentId: z.ZodNullable<z.ZodString>;
    sortOrder: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const CategoryTreeNodeSchema: z.ZodType<CategoryTreeNode>;
interface CategoryTreeNode extends z.infer<typeof CategorySchema> {
    readonly children: readonly CategoryTreeNode[];
}
declare const CategoryListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        label: z.ZodString;
        parentId: z.ZodNullable<z.ZodString>;
        sortOrder: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    tree: z.ZodArray<z.ZodType<CategoryTreeNode, unknown, z.core.$ZodTypeInternals<CategoryTreeNode, unknown>>>;
}, z.core.$strip>;
declare const CategoryGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        label: z.ZodString;
        parentId: z.ZodNullable<z.ZodString>;
        sortOrder: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
type Category = z.infer<typeof CategorySchema>;
type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;
type CategoryGetResponse = z.infer<typeof CategoryGetResponseSchema>;

declare const MediaAssetRoleSchema: z.ZodEnum<{
    primary: "primary";
    gallery: "gallery";
    swatch: "swatch";
    document: "document";
}>;
declare const MediaAssetRefSchema: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    mediaAssetId: z.ZodString;
    role: z.ZodEnum<{
        primary: "primary";
        gallery: "gallery";
        swatch: "swatch";
        document: "document";
    }>;
    sortOrder: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const MediaAssetRefListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        productId: z.ZodString;
        mediaAssetId: z.ZodString;
        role: z.ZodEnum<{
            primary: "primary";
            gallery: "gallery";
            swatch: "swatch";
            document: "document";
        }>;
        sortOrder: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
type MediaAssetRole = z.infer<typeof MediaAssetRoleSchema>;
type MediaAssetRef = z.infer<typeof MediaAssetRefSchema>;
type MediaAssetRefListResponse = z.infer<typeof MediaAssetRefListResponseSchema>;

export { type Attribute, type AttributeGetResponse, AttributeGetResponseSchema, type AttributeListResponse, AttributeListResponseSchema, AttributeSchema, type AttributeSet, type AttributeSetGetResponse, AttributeSetGetResponseSchema, type AttributeSetListResponse, AttributeSetListResponseSchema, type AttributeSetRef, AttributeSetRefSchema, AttributeSetSchema, type AttributeType, AttributeTypeSchema, type AttributeValue, AttributeValueSchema, CONTRACT_VERSION, type Category, type CategoryGetResponse, CategoryGetResponseSchema, type CategoryListResponse, CategoryListResponseSchema, CategorySchema, type CategoryTreeNode, CategoryTreeNodeSchema, type MediaAssetRef, type MediaAssetRefListResponse, MediaAssetRefListResponseSchema, MediaAssetRefSchema, type MediaAssetRole, MediaAssetRoleSchema, type Product, type ProductGetResponse, ProductGetResponseSchema, type ProductListResponse, ProductListResponseSchema, type ProductRef, ProductRefSchema, ProductSchema, type ProductStatus, ProductStatusSchema, type SemVer, type Variant, type VariantGetResponse, VariantGetResponseSchema, type VariantListResponse, VariantListResponseSchema, type VariantRef, VariantRefSchema, VariantSchema, type VersionMismatchSeverity, classifyContractVersionSkew, parseSemVer };
