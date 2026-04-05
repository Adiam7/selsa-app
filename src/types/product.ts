// src/features/product/types.ts

export interface I18nField {
  en: string;
  ti: string;
}

export interface Product {
  id?: number | string;          // catalog product PK
  printful_id: number;          // maps to PrintfulProduct.printful_id
  slug?: string;                // URL-friendly slug
  name: string | I18nField;
  name_display?: string;        // Localized display string from API
  description?: string | I18nField | null;
  description_display?: string;
  category?: string | null;
  image_url?: string | null;    // main product image
  default_image?: string | null; // fallback product image
  colors: string[];
  sizes: string[];
  gallery: string[];            // unique image URLs
  variants: Variant[];
  mockups: Mockup[];            // right now just { url }
  source?: string;              // e.g. 'local' | 'printful'
  external_product_id?: number | string | null;
  is_new?: boolean;
  is_trending?: boolean;
  discount?: number | null;
  rating?: number | null;
  review_count?: number;
  stock_status?: 'high' | 'low' | 'out';
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
