import { apiClient } from "@/lib/api/client";

export type AdminCatalogProduct = {
  id: number;
  slug: string | null;
  source: "local" | "printful";
  external_product_id: string | null;
  printful_id: string | null;
  price: string | number;
  is_available: boolean;
  image_url: string | null;
  updated_at: string;
  name: any;
  name_display: string;
  category_id: string | null;
  additional_category_ids?: string[];
};

export type AdminLocalProductImage = {
  id: number;
  url: string;
  is_primary: boolean;
  sort_order?: number;
  alt_text?: { en?: string; ti?: string } | null;
};

export type AdminLocalProductDetail = {
  product_type: "product" | "book" | "food" | "jewellery" | "hair" | "perfume" | "body-scrub" | "beauty";
  name: any;
  sku: string;
  price: string | number;
  description?: any;
  publish: boolean;
  category_id: string | null;
  additional_category_ids: string[];
  stock_control: "finite" | "infinite" | "preorder";
  stock_quantity: number;

  // Book
  author?: any;
  isbn?: string | null;
  publisher?: any;
  publication_date?: string | null;
  language?: any;
  genre?: any;
  translated_by?: any;
  page_count?: number | null;
  tags?: string[];

  // Food
  expiration_date?: string | null;
  ingredients?: any;
  is_vegan?: boolean;
  is_organic?: boolean;
  allergens?: any;
  nutrition_facts?: any;
  storage_instructions?: any;
  weight?: number | null;

  // Jewellery
  material?: { en?: string; ti?: string } | null;
  gemstone?: { en?: string; ti?: string } | null;
  purity?: { en?: string; ti?: string } | null;
  is_handmade?: boolean;
  certification?: { en?: string; ti?: string } | null;

  // Clothing
  sizes?: string[];
  colors?: string[];
  gender?: string | null;
  fit?: string | null;
  care_instructions?: { en?: string; ti?: string } | null;
  size_chart_url?: string | null;

  // Hair (beauty)
  hair_type?: { en?: string; ti?: string } | null;
  length?: { en?: string; ti?: string } | null;
  color?: { en?: string; ti?: string } | null;
  texture?: { en?: string; ti?: string } | null;
  origin?: { en?: string; ti?: string } | null;
  is_virgin?: boolean;
  is_lace?: boolean;

  // Perfume (beauty)
  volume_ml?: number | null;
  concentration?: string | null;
  fragrance_family?: string | null;
  scent_notes?: { en?: string; ti?: string } | null;

  images: AdminLocalProductImage[];
};

export type PaginatedResult<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export async function listAdminCatalogProducts(params?: {
  page?: number;
  page_size?: number;
  q?: string;
  source?: "local" | "printful";
  is_available?: "true" | "false";
  ordering?: string;
}) {
  const resp = await apiClient.get<PaginatedResult<AdminCatalogProduct>>(
    "/catalog/admin-products/",
    { params }
  );
  return resp.data;
}

export async function setAdminCatalogProductAvailability(productId: number, isAvailable: boolean) {
  const resp = await apiClient.post<AdminCatalogProduct>(
    `/catalog/admin-products/${productId}/set-availability/`,
    { is_available: isAvailable }
  );
  return resp.data;
}

export async function deleteAdminLocalCatalogProduct(productId: number) {
  await apiClient.delete(`/catalog/admin-products/${productId}/delete-local/`);
}

export async function createAdminLocalProduct(payload: {
  product_type?: "product" | "book" | "food" | "jewellery" | "hair" | "perfume" | "body-scrub" | "beauty";
  name: { en: string; ti?: string };
  sku: string;
  price: string | number;
  description?: { en?: string; ti?: string } | null;
  category_id?: string | null;
  additional_category_ids?: string[];
  publish?: boolean;
  stock_control?: "finite" | "infinite" | "preorder";
  stock_quantity?: number;
  variant_sku?: string | null;
  option_combination?: string | null;

  // Book fields (when product_type === "book")
  author?: { en: string; ti?: string };
  isbn?: string | null;
  publisher?: { en?: string; ti?: string } | null;
  translated_by?: { en?: string; ti?: string } | null;
  publication_date?: string | null;
  language?: { en?: string; ti?: string } | null;
  genre?: { en?: string; ti?: string } | null;
  page_count?: number | null;
  tags?: string[];

  // Food fields (when product_type === "food")
  expiration_date?: string | null;
  ingredients?: { en?: string; ti?: string } | null;
  is_vegan?: boolean;
  is_organic?: boolean;
  allergens?: { en?: string; ti?: string } | null;
  nutrition_facts?: any;
  storage_instructions?: { en?: string; ti?: string } | null;
  weight?: number | null;

  // Clothing fields
  sizes?: string[];
  colors?: string[];
  gender?: string | null;
  fit?: string | null;
  care_instructions?: { en?: string; ti?: string } | null;
  size_chart_url?: string | null;

  // Hair (beauty)
  hair_type?: { en?: string; ti?: string } | null;
  length?: { en?: string; ti?: string } | null;
  color?: { en?: string; ti?: string } | null;
  texture?: { en?: string; ti?: string } | null;
  origin?: { en?: string; ti?: string } | null;
  is_virgin?: boolean;
  is_lace?: boolean;

  // Perfume (beauty)
  volume_ml?: number | null;
  concentration?: string | null;
  fragrance_family?: string | null;
  scent_notes?: { en?: string; ti?: string } | null;

  // Jewellery fields (when product_type === "jewellery")
  material?: { en?: string; ti?: string } | null;
  gemstone?: { en?: string; ti?: string } | null;
  purity?: { en?: string; ti?: string } | null;
  is_handmade?: boolean;
  certification?: { en?: string; ti?: string } | null;
}) {
  const resp = await apiClient.post<AdminCatalogProduct>(
    "/catalog/admin-products/create-local/",
    payload
  );
  return resp.data;
}

export async function uploadAdminLocalProductImage(productId: number, file: File, opts?: {
  is_primary?: boolean;
  alt_text?: { en?: string; ti?: string } | null;
}) {
  const form = new FormData();
  form.append("image", file);
  if (typeof opts?.is_primary === "boolean") {
    form.append("is_primary", String(opts.is_primary));
  }
  if (opts?.alt_text) {
    form.append("alt_text", JSON.stringify(opts.alt_text));
  }

  const resp = await apiClient.post<AdminCatalogProduct>(
    `/catalog/admin-products/${productId}/upload-image/`,
    form
  );
  return resp.data;
}

export async function getAdminLocalProductDetail(productId: number) {
  const resp = await apiClient.get<AdminLocalProductDetail>(
    `/catalog/admin-products/${productId}/local-detail/`
  );
  return resp.data;
}

export async function updateAdminLocalProduct(productId: number, payload: {
  name: { en: string; ti?: string };
  price: string | number;
  description?: { en?: string; ti?: string } | null;
  publish?: boolean;
  category_id?: string | null;
  additional_category_ids?: string[];
  stock_control?: "finite" | "infinite" | "preorder";
  stock_quantity?: number;

  // Book
  author?: { en: string; ti?: string };
  isbn?: string | null;
  publisher?: { en?: string; ti?: string } | null;
  translated_by?: { en?: string; ti?: string } | null;
  publication_date?: string | null;
  language?: { en?: string; ti?: string } | null;
  genre?: { en?: string; ti?: string } | null;
  page_count?: number | null;
  tags?: string[];

  // Food
  expiration_date?: string | null;
  ingredients?: { en?: string; ti?: string } | null;
  is_vegan?: boolean;
  is_organic?: boolean;
  allergens?: { en?: string; ti?: string } | null;
  nutrition_facts?: any;
  storage_instructions?: { en?: string; ti?: string } | null;
  weight?: number | null;

  // Clothing
  sizes?: string[];
  colors?: string[];
  gender?: string | null;
  fit?: string | null;
  care_instructions?: { en?: string; ti?: string } | null;
  size_chart_url?: string | null;

  // Hair (beauty)
  hair_type?: { en?: string; ti?: string } | null;
  length?: { en?: string; ti?: string } | null;
  color?: { en?: string; ti?: string } | null;
  texture?: { en?: string; ti?: string } | null;
  origin?: { en?: string; ti?: string } | null;
  is_virgin?: boolean;
  is_lace?: boolean;

  // Perfume (beauty)
  volume_ml?: number | null;
  concentration?: string | null;
  fragrance_family?: string | null;
  scent_notes?: { en?: string; ti?: string } | null;

  // Jewellery
  material?: { en?: string; ti?: string } | null;
  gemstone?: { en?: string; ti?: string } | null;
  purity?: { en?: string; ti?: string } | null;
  is_handmade?: boolean;
  certification?: { en?: string; ti?: string } | null;
}) {
  const resp = await apiClient.patch<AdminLocalProductDetail>(
    `/catalog/admin-products/${productId}/update-local/`,
    payload
  );
  return resp.data;
}

export async function deleteAdminLocalProductImage(productId: number, imageId: number) {
  const resp = await apiClient.delete<AdminLocalProductDetail>(
    `/catalog/admin-products/${productId}/images/${imageId}/`
  );
  return resp.data;
}

export async function setAdminLocalProductImagePrimary(productId: number, imageId: number) {
  const resp = await apiClient.post<AdminLocalProductDetail>(
    `/catalog/admin-products/${productId}/images/${imageId}/set-primary/`,
    {}
  );
  return resp.data;
}

export async function reorderAdminLocalProductImages(productId: number, imageIds: number[]) {
  const resp = await apiClient.post<AdminLocalProductDetail>(
    `/catalog/admin-products/${productId}/images/reorder/`,
    { image_ids: imageIds }
  );
  return resp.data;
}
