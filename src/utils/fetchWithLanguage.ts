// utils/fetchWithLanguage.ts
import i18n from '@/i18n';

/**
 * Enhanced fetch wrapper that automatically includes Accept-Language header
 * for backend i18n support
 */
export async function fetchWithLanguage(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const currentLanguage = i18n.language || 'en';
  
  // Merge headers with Accept-Language
  const headers = {
    'Accept-Language': currentLanguage,
    ...init?.headers,
  };
  
  return fetch(input, {
    ...init,
    headers,
  });
}

/**
 * Get current language for manual header construction
 */
export function getCurrentLanguage(): string {
  return i18n.language || 'en';
}
