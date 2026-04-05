// type/category.ts

export interface I18nField {
  en: string;
  ti: string;
}

export interface Category {
  id: string;
  name: string | I18nField;  // Can be JSON object or string
  name_display?: string;      // Localized display string from API
  slug: string;
  description?: string | I18nField | null;
  description_display?: string;
  image?: string | null;
  parent?: string | null;
  lft?: number;
  rght?: number;
  tree_id?: number;
  level?: number;
  children?: Category[]; // 👈 added so frontend can access subcategories
  ancestors?: { slug: string; name_display: string }[];
}
