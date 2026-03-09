// src/features/product/types.ts

export interface I18nField {
  en: string;
  ti: string;
}

export interface Product {
  printful_id: number;          // maps to PrintfulProduct.printful_id
  name: string | I18nField;
  name_display?: string;        // Localized display string from API
  description?: string | I18nField | null;
  description_display?: string;
  category?: string | null;
  image_url?: string | null;    // main product image
  colors: string[];
  sizes: string[];
  gallery: string[];            // unique image URLs
  variants: Variant[];
  mockups: Mockup[];            // right now just { url }
}

export interface Variant {
  id: number;                   // local DB id (PrintfulProductVariant.pk)
  printful_variant_id?: number | null;
  name: string | I18nField;
  name_display?: string;        // Localized display string from API
  price: number;                 // already in dollars
  sku?: string | null;
  color?: string | null;
  size?: string | null;
  image_url?: string | null;     // main preview for variant
  all_images?: string[];         // list of preview images
  is_available: boolean;
  currency?: string;             // optional, default "USD"
  files?: any[];                 // whatever is in `files_json`
}

export interface Mockup {
  url: string;                   // backend currently only gives { url }
}
