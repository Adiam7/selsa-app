// types/catalog.ts

export type SourceType = "local" | "printful";

export interface I18nField {
  en: string;
  ti: string;
}

export interface CatalogProduct {
  id: number;
  local_product?: number | null; // FK ID
  printful_product?: number | null; // FK ID
  printful_id?: number | null;
  name: string | I18nField;
  name_display?: string;        // Localized display string from API
  slug?: string | null;
  description?: string | I18nField | null;
  description_display?: string;
  price: number;
  category?: number | null; // FK ID
  image_url?: string | null;
  all_images: string[];
  is_available: boolean;
  source: SourceType;
  external_product_id?: string | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  variants?: CatalogProductVariant[]; // Optional, populated via API
}

export interface CatalogProductVariant {
  id: number;
  catalog_product?: number | null; // FK ID
  local_variant?: number | null; // FK ID
  printful_variant?: number | null; // FK ID
  sku: string;
  price: number;
  retail_price?: number | null;
  price_usd?: number | null;
  product_name_display?: string;
  source: SourceType;

  // Options
  option_values?: number[]; // FK IDs of ProductOptionValue
  option_combination?: string | null;
  option_values_json?: Record<string, any> | null;

  // Inventory
  stock_control: "finite" | "infinite" | "preorder";
  stock_quantity: number;
  is_available: boolean;

  // Images / files
  image_url?: string | null;
  all_images: string[];
  files_json?: any[];

  external_id?: string | null;

  created_at: string; // ISO string
  updated_at: string; // ISO string
}
