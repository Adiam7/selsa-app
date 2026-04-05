/**
 * Geo-detection Service for Payment Methods
 * Detects user location and returns appropriate payment methods
 */

import { PaymentRegion, GeoLocationData } from './types';
import { getPaymentMethodsForRegion, PAYMENT_METHOD_CONFIGS } from './config';

// IP-based geolocation API (using ipapi.co as fallback)
const GEO_API_URL = 'https://ipapi.co/json/';

// Country code to region mapping
export const COUNTRY_TO_REGION: Record<string, PaymentRegion> = {
  // Netherlands
  'NL': 'netherlands',
  
  // Germany & Austria  
  'DE': 'germany',
  'AT': 'germany', // Austria uses same methods as Germany
  
  // Belgium
  'BE': 'belgium',
  
  // United Kingdom
  'GB': 'uk',
  'UK': 'uk',
  
  // United States
  'US': 'us',
  
  // European Union countries (general Europe)
  'FR': 'europe', 
  'IT': 'europe',
  'ES': 'europe', 
  'PT': 'europe',
  'SE': 'europe',
  'DK': 'europe',
  'NO': 'europe',
  'FI': 'europe',
  'PL': 'europe',
  'CZ': 'europe',
  'HU': 'europe',
  'RO': 'europe',
  'BG': 'europe',
  'HR': 'europe',
  'SI': 'europe',
  'SK': 'europe',
  'LT': 'europe',
  'LV': 'europe',
  'EE': 'europe',
  'CY': 'europe',
  'MT': 'europe',
  'LU': 'europe',
  'IE': 'europe',
  'GR': 'europe',
  
  // Default to global for other countries
};

// Currency mapping by country
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  'US': 'USD',
  'GB': 'GBP', 
  'UK': 'GBP',
  
  // Eurozone countries
  'DE': 'EUR',
  'FR': 'EUR',
  'IT': 'EUR', 
  'ES': 'EUR',
  'NL': 'EUR',
  'BE': 'EUR',
  'AT': 'EUR',
  'PT': 'EUR',
  'FI': 'EUR',
  'IE': 'EUR',
  'LU': 'EUR',
  'SI': 'EUR',
  'CY': 'EUR',
  'MT': 'EUR',
  'SK': 'EUR',
  'EE': 'EUR',
  'LV': 'EUR',
  'LT': 'EUR',
  'GR': 'EUR',
  
  // Non-Eurozone EU countries
  'SE': 'SEK',
  'DK': 'DKK', 
  'PL': 'PLN',
  'CZ': 'CZK',
  'HU': 'HUF',
  'RO': 'RON',
  'BG': 'BGN',
  'HR': 'HRK',
};

/**
 * Detect user's geographical location and payment preferences
 */
export async function detectGeoLocation(): Promise<GeoLocationData> {
  try {
    // Try browser geolocation first (for better UX)
    const browserGeo = await detectLocationFromBrowser();
    if (browserGeo) return browserGeo;
    
    // Fallback to IP-based detection
    const ipGeo = await detectLocationFromIP();
    if (ipGeo) return ipGeo;
    
    // Final fallback to US
    return getDefaultLocation();
    
  } catch (error) {
    console.warn('Geo-detection failed, using US default:', error);
    return getDefaultLocation();
  }
}

/**
 * Detect location from browser navigator API 
 */
async function detectLocationFromBrowser(): Promise<GeoLocationData | null> {
  // Browser location detection (requires user permission)
  // We'll use timezone as a hint for now
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryFromTz = inferCountryFromTimezone(timezone);
    
    if (countryFromTz) {
      return buildGeoData(countryFromTz);
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect location from IP address
 */
async function detectLocationFromIP(): Promise<GeoLocationData | null> {
  try {
    const response = await fetch(GEO_API_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.country_code) {
      return buildGeoData(data.country_code.toUpperCase(), data.country_name);
    }
    
    return null;
  } catch (error) {
    console.warn('IP geolocation failed:', error);
    return null;
  }
}

/**
 * Infer country from timezone (basic heuristics)
 */
function inferCountryFromTimezone(timezone: string): string | null {
  const tzToCountry: Record<string, string> = {
    'America/New_York': 'US',
    'America/Chicago': 'US', 
    'America/Denver': 'US',
    'America/Los_Angeles': 'US',
    'Europe/London': 'GB',
    'Europe/Berlin': 'DE',
    'Europe/Paris': 'FR',
    'Europe/Amsterdam': 'NL', 
    'Europe/Brussels': 'BE',
    'Europe/Vienna': 'AT',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Europe/Stockholm': 'SE',
    'Europe/Copenhagen': 'DK',
    'Europe/Oslo': 'NO',
    'Europe/Helsinki': 'FI',
    'Europe/Warsaw': 'PL',
    'Europe/Prague': 'CZ',
    'Europe/Budapest': 'HU',
  };
  
  return tzToCountry[timezone] || null;
}

/**
 * Build geo data object from country code
 */
function buildGeoData(countryCode: string, countryName?: string): GeoLocationData {
  const region = COUNTRY_TO_REGION[countryCode] || 'global';
  const currency = COUNTRY_TO_CURRENCY[countryCode] || 'USD';
  
  return {
    country: countryName || countryCode,
    countryCode, 
    region,
    currency
  };
}

/**
 * Get default location (US) 
 */
function getDefaultLocation(): GeoLocationData {
  return {
    country: 'United States',
    countryCode: 'US',
    region: 'us', 
    currency: 'USD'
  };
}

/**
 * Get available payment methods for user's location
 */
export async function getAvailablePaymentMethods(forceRegion?: PaymentRegion) {
  try {
    const geoData = forceRegion 
      ? { region: forceRegion, currency: COUNTRY_TO_CURRENCY['US'] || 'USD' } as GeoLocationData
      : await detectGeoLocation();
    
    const methods = getPaymentMethodsForRegion(geoData.region, geoData.currency);
    
    return {
      geoData,
      methods,
      recommendation: getRecommendedMethods(geoData.region)
    };
  } catch (error) {
    console.error('Failed to get payment methods:', error);
    
    // Fallback to global methods
    const fallbackGeo = getDefaultLocation();
    return {
      geoData: fallbackGeo,
      methods: getPaymentMethodsForRegion('global'),
      recommendation: ['card', 'paypal'] 
    };
  }
}

/**
 * Get recommended payment methods by region (prioritized list)
 */
function getRecommendedMethods(region: PaymentRegion): string[] {
  const recommendations: Record<PaymentRegion, string[]> = {
    global: ['card', 'paypal', 'apple-pay', 'google-pay'],
    
    europe: ['card', 'ideal', 'klarna', 'bancontact', 'sofort', 'paypal'],
    
    netherlands: ['ideal', 'card', 'klarna', 'paypal'], 
    
    germany: ['sofort', 'giropay', 'card', 'klarna', 'paypal'],
    
    belgium: ['bancontact', 'card', 'klarna', 'paypal'],
    
    us: ['card', 'apple-pay', 'google-pay', 'affirm', 'afterpay', 'paypal'],
    
    uk: ['card', 'faster-payments', 'paypal', 'apple-pay', 'klarna-uk']
  };
  
  return recommendations[region] || recommendations.global;
}

/**
 * Check if a payment method is available in user's region
 */
export function isPaymentMethodAvailable(
  methodId: string, 
  region: PaymentRegion, 
  currency: string
): boolean {
  const config = PAYMENT_METHOD_CONFIGS[methodId];
  
  if (!config || !config.enabled) return false;
  
  const regionMatches = config.regions.includes(region) || config.regions.includes('global');
  const currencyMatches = config.currencies.includes(currency);
  
  return regionMatches && currencyMatches;
}

/**
 * Get localized payment method names
 */
export function getLocalizedPaymentMethodName(methodId: string, locale: string = 'en'): string {
  const config = PAYMENT_METHOD_CONFIGS[methodId];
  if (!config) return methodId;
  
  // Basic localization - can be expanded with i18n
  const localizations: Record<string, Record<string, string>> = {
    'ideal': {
      'en': 'iDEAL',
      'nl': 'iDEAL', 
      'de': 'iDEAL'
    },
    'sofort': {
      'en': 'SOFORT Banking',
      'de': 'SOFORT Überweisung',
      'nl': 'SOFORT Banking'
    },
    'klarna': {
      'en': 'Klarna Pay Later',
      'de': 'Klarna Später bezahlen',
      'nl': 'Klarna Betaal Later',
      'sv': 'Klarna Köp nu betala senare'
    }
  };
  
  return localizations[methodId]?.[locale] || config.name;
}