import { ProductCreateRequest, ProductGetResponse, VariantListResponse, ProductListResponse, AttributeCreateRequest, AttributeGetResponse, PimDeleteResponse, AttributeListResponse, AttributeUpdateRequest, AttributeSetGetResponse, AttributeSetListResponse, CategoryListResponse, MediaAssetRefCreateRequest, MediaAssetRefGetResponse, MediaAssetRefListResponse, MediaAssetRefUpdateRequest } from '@umbraculum/pim-contracts';
export { AttributeCreateRequest, AttributeGetResponse, AttributeListResponse, AttributeUpdateRequest, MediaAssetRefCreateRequest, MediaAssetRefGetResponse, MediaAssetRefListResponse, MediaAssetRefUpdateRequest, PimDeleteResponse } from '@umbraculum/pim-contracts';
import { a as ApiClient } from '../client-Dia82S7S.js';
import { p as paths } from '../platform.openapi-DFK6FUu2.js';

type PimProductsListPath = "/pim/products";
type PimProductsListGet = paths[PimProductsListPath]["get"];
type PimProductsCreatePost = paths[PimProductsListPath]["post"];
type PimProductDetailPath = "/pim/products/{productId}";
type PimProductDetailGet = paths[PimProductDetailPath]["get"];
type PimProductVariantsPath = "/pim/products/{productId}/variants";
type PimProductVariantsListGet = paths[PimProductVariantsPath]["get"];

declare function listProducts(client: ApiClient): Promise<ProductListResponse>;
declare function createProduct(client: ApiClient, body: ProductCreateRequest): Promise<ProductGetResponse>;
declare function getProduct(client: ApiClient, productId: string): Promise<ProductGetResponse>;
declare function listProductVariants(client: ApiClient, productId: string): Promise<VariantListResponse>;

type PimAttributesListPath = "/pim/attributes";
type PimAttributesListGet = paths[PimAttributesListPath]["get"];
type PimAttributesCreatePost = paths[PimAttributesListPath]["post"];
type PimAttributeDetailPath = "/pim/attributes/{attributeId}";
type PimAttributeDetailGet = paths[PimAttributeDetailPath]["get"];

declare function listAttributes(client: ApiClient): Promise<AttributeListResponse>;
declare function createAttribute(client: ApiClient, body: AttributeCreateRequest): Promise<AttributeGetResponse>;
declare function getAttribute(client: ApiClient, attributeId: string): Promise<AttributeGetResponse>;
declare function patchAttribute(client: ApiClient, attributeId: string, body: AttributeUpdateRequest): Promise<AttributeGetResponse>;
declare function deleteAttribute(client: ApiClient, attributeId: string): Promise<PimDeleteResponse>;

type PimAttributeSetsListPath = "/pim/attribute-sets";
type PimAttributeSetsListGet = paths[PimAttributeSetsListPath]["get"];
type PimAttributeSetDetailPath = "/pim/attribute-sets/{setId}";
type PimAttributeSetDetailGet = paths[PimAttributeSetDetailPath]["get"];

declare function listAttributeSets(client: ApiClient): Promise<AttributeSetListResponse>;
declare function getAttributeSet(client: ApiClient, setId: string): Promise<AttributeSetGetResponse>;

type PimCategoriesListPath = "/pim/categories";
type PimCategoriesListGet = paths[PimCategoriesListPath]["get"];

declare function listCategories(client: ApiClient): Promise<CategoryListResponse>;

type PimProductMediaRefsPath = "/pim/products/{productId}/media-asset-refs";
type PimProductMediaRefsListGet = paths[PimProductMediaRefsPath]["get"];
type PimProductMediaRefsCreatePost = paths[PimProductMediaRefsPath]["post"];
type PimMediaAssetRefDetailPath = "/pim/media-asset-refs/{mediaAssetRefId}";
type PimMediaAssetRefDetailGet = paths[PimMediaAssetRefDetailPath]["get"];

declare function listProductMediaAssetRefs(client: ApiClient, productId: string): Promise<MediaAssetRefListResponse>;
declare function createProductMediaAssetRef(client: ApiClient, productId: string, body: MediaAssetRefCreateRequest): Promise<MediaAssetRefGetResponse>;
declare function getMediaAssetRef(client: ApiClient, mediaAssetRefId: string): Promise<MediaAssetRefGetResponse>;
declare function patchMediaAssetRef(client: ApiClient, mediaAssetRefId: string, body: MediaAssetRefUpdateRequest): Promise<MediaAssetRefGetResponse>;
declare function deleteMediaAssetRef(client: ApiClient, mediaAssetRefId: string): Promise<PimDeleteResponse>;

export { type PimAttributeDetailGet, type PimAttributeSetDetailGet, type PimAttributeSetsListGet, type PimAttributesCreatePost, type PimAttributesListGet, type PimCategoriesListGet, type PimMediaAssetRefDetailGet, type PimProductDetailGet, type PimProductMediaRefsCreatePost, type PimProductMediaRefsListGet, type PimProductVariantsListGet, type PimProductsCreatePost, type PimProductsListGet, createAttribute, createProduct, createProductMediaAssetRef, deleteAttribute, deleteMediaAssetRef, getAttribute, getAttributeSet, getMediaAssetRef, getProduct, listAttributeSets, listAttributes, listCategories, listProductMediaAssetRefs, listProductVariants, listProducts, patchAttribute, patchMediaAssetRef };
