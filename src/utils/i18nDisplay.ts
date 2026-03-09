// utils/i18nDisplay.ts

/**
 * Utility functions to safely access i18n display fields from API responses
 * Falls back to raw JSON field if display field is not available
 */

/**
 * Get the current language from localStorage (client-side only)
 */
function getCurrentLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('i18nextLng') || 'en';
}

function getLanguageCandidates(lang: string): string[] {
  const normalized = (lang || 'en').toLowerCase();
  const base = normalized.split('-')[0];
  return Array.from(new Set([normalized, base, 'en', 'ti']));
}

/**
 * Extract string from i18n object or return as-is if already a string
 */
function extractI18nString(value: any, preferredLanguage?: string): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const lang = preferredLanguage || getCurrentLanguage();
    const candidates = getLanguageCandidates(lang);
    for (const code of candidates) {
      if (value[code]) return value[code];
      const matchedKey = Object.keys(value).find((key) => key.toLowerCase() === code);
      if (matchedKey && value[matchedKey]) return value[matchedKey];
    }
    const firstValue = Object.values(value).find((v) => typeof v === 'string' && v.trim().length > 0);
    return (firstValue as string) || '';
  }
  return String(value);
}

/**
 * Get the display name from a product/category/etc object
 * Uses name_display if available, falls back to name
 */
export function getDisplayName(obj: any): string {
  if (!obj) return '';
  const nameValue = obj.name_display || obj.name || '';
  return extractI18nString(nameValue);
}

/**
 * Get the display description from an object
 * Uses description_display if available, falls back to description
 */
export function getDisplayDescription(obj: any): string {
  if (!obj) return '';
  const descValue = obj.description_display || obj.description || '';
  return extractI18nString(descValue);
}

/**
 * Get product name display (handles product_name_display for variants)
 */
export function getProductName(obj: any, preferredLanguage?: string): string {
  if (!obj) return '';

  const objectCandidates = [obj.product_name, obj.name].filter(
    (value) => value && typeof value === 'object'
  );

  for (const candidate of objectCandidates) {
    const localized = extractI18nString(candidate, preferredLanguage);
    if (localized) return localized;
  }

  const fallbackCandidates = [
    obj.product_name_display,
    obj.name_display,
    obj.product_name,
    obj.name,
  ];

  for (const candidate of fallbackCandidates) {
    const localized = extractI18nString(candidate, preferredLanguage);
    if (localized) return localized;
  }

  return '';
}

/**
 * Get option value display
 */
export function getValueDisplay(obj: any): string {
  if (!obj) return '';
  const valueStr = obj.value_display || obj.value || '';
  return extractI18nString(valueStr);
}

/**
 * Get address field display
 */
export function getAddressDisplay(obj: any, field: string): string {
  if (!obj) return '';
  const displayField = `${field}_display`;
  return obj[displayField] || obj[field] || '';
}

/**
 * Get full address display
 */
export function getFullAddress(addressObj: any): string {
  if (!addressObj) return '';
  return addressObj.full_address || '';
}

/**
 * Get role name display
 */
export function getRoleNameDisplay(roleObj: any): string {
  if (!roleObj) return '';
  return roleObj.role_name_display || roleObj.name_display || roleObj.name || '';
}

/**
 * Get tracking location display
 */
export function getLocationDisplay(obj: any): string {
  if (!obj) return '';
  return obj.location_display || obj.current_location_display || obj.location || obj.current_location || '';
}

/**
 * Get tracking message/notes display
 */
export function getMessageDisplay(obj: any): string {
  if (!obj) return '';
  return obj.message_display || obj.notes_display || obj.message || obj.notes || '';
}
