export const PIM_MODULE_OVERLAY = [
  "PIM module: search products by SKU or name fragment; use pim.getProductDetail for one id.",
  "Categories and attribute sets are workspace-scoped lists.",
].join(" ");

export const PIM_ROUTE_OVERLAYS = {
  products: "The user is viewing products; prefer pim.searchProducts and pim.getProductDetail.",
  productDetail: "The user is viewing one product; prefer pim.getProductDetail.",
  categories: "The user is viewing categories; prefer pim.listCategories.",
  attributeSets: "The user is viewing attribute sets; prefer pim.listAttributeSets.",
} as const;
