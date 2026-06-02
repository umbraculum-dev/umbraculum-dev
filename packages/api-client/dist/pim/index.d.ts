import { ProductCreateRequest, ProductGetResponse, VariantListResponse, ProductListResponse, AttributeSetGetResponse, AttributeSetListResponse, CategoryListResponse } from '@umbraculum/pim-contracts';
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

type PimAttributeSetsListPath = "/pim/attribute-sets";
type PimAttributeSetsListGet = paths[PimAttributeSetsListPath]["get"];
type PimAttributeSetDetailPath = "/pim/attribute-sets/{setId}";
type PimAttributeSetDetailGet = paths[PimAttributeSetDetailPath]["get"];

declare function listAttributeSets(client: ApiClient): Promise<AttributeSetListResponse>;
declare function getAttributeSet(client: ApiClient, setId: string): Promise<AttributeSetGetResponse>;

type PimCategoriesListPath = "/pim/categories";
type PimCategoriesListGet = paths[PimCategoriesListPath]["get"];

declare function listCategories(client: ApiClient): Promise<CategoryListResponse>;

export { type PimAttributeSetDetailGet, type PimAttributeSetsListGet, type PimCategoriesListGet, type PimProductDetailGet, type PimProductVariantsListGet, type PimProductsCreatePost, type PimProductsListGet, createProduct, getAttributeSet, getProduct, listAttributeSets, listCategories, listProductVariants, listProducts };
