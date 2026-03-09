// app/types/product.ts

export interface I18nField {
  en: string;
  ti: string;
}

export type Variant = {
  id: number;                     // serializer includes id
  printful_variant_id?: number | null;
  name: string | I18nField;
  name_display?: string;          // Localized display string from API
  sku?: string | null;
  price: number;
  image_url?: string | null;
  all_images?: string[];
  is_available: boolean;
  color?: string | null;           // serializer adds this
  size?: string | null;            // serializer adds this
  currency?: string;               // optional
  files?: any[];                   // serializer returns files[]
  external_id?: string | null;  // <-- new field

};

export type Mockup = {
  url: string;                     // backend only provides { url }
};

export type Product = {
  printful_id: number;
  name: string | I18nField;
  name_display?: string;          // Localized display string from API
  description?: string | I18nField | null;
  description_display?: string;
  category?: string | null;
  image_url?: string | null;
  variants: Variant[];
  mockups: Mockup[];
  gallery: string[];               // from serializer
  colors: string[];                // from serializer
  sizes: string[];                 // from serializer
  
};
