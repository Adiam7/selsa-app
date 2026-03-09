// src/lib/utils.ts
import type { Product } from '@/types/printful_product';
import type { Category } from '@/types/category';

export function getSafeImageUrl(product: Product): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';
  const base = apiBase.replace(/\/api\/?$/, '');

  const imagePath = product.image_url || product.gallery?.[0];

  // console.log('Image URL:', imagePath);

  if (!imagePath) {
    return '/placeholder.jpg';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  return `${base}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

export function resolveBackendAssetUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';
  const base = apiBase.replace(/\/api\/?$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function getImageAltText(product: Product): string {
  const name = product.name_display || product.name;
  if (typeof name === 'string') return name;
  return (name as any)?.en ?? (name as any)?.ti ?? '';
}

export function getSafeCategoryImageUrl(category: Category): string {
  const imageUrl = category.image;

  if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
    return imageUrl;
  }

  // fallback image
  return '/placeholder.jpg';
}

export function name_option(option_values: any): string {
  console.log("name_option called with:", option_values);

  // Handle if it's already a string
  if (typeof option_values === 'string') {
    return option_values;
  }

  // Handle if it's an object (i18n object)
  if (option_values && typeof option_values === 'object' && !Array.isArray(option_values)) {
    // Check if it has language keys (i18n object)
    if (option_values.en || option_values.ti) {
      // Try to get current language from localStorage
      const lang = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') || 'en' : 'en';
      return option_values[lang] || option_values.en || option_values.ti || String(option_values);
    }
    return String(option_values);
  }

  // Handle array
  if (!Array.isArray(option_values) || option_values.length === 0) {
    console.log("No valid option values provided");
    return "";
  }

  const valuesOnly = option_values.map((ov) => {
    if (ov?.value) {
      return ov.value;
    }
    console.log("Skipped invalid option value:", ov);
    return null;
  }).filter(Boolean);

  const result = valuesOnly.join(", ");
  console.log("Result string:", result);
  return result;
}

