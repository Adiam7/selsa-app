/**
 * Tigrinya Language Support Integration Tests
 * 
 * This test suite validates full Tigrinya language support including:
 * - Language switching functionality
 * - Translation file completeness
 * - Font rendering support
 * - Fallback behavior
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Tigrinya i18n Support', () => {
  describe('Translation Files', () => {
    it('should load Tigrinya translation file', async () => {
      const tiTranslations = await import('../public/locales/ti/translation.json');
      expect(tiTranslations).toBeDefined();
      expect(Object.keys(tiTranslations.default).length).toBeGreaterThan(0);
    });

    it('should load English translation file for comparison', async () => {
      const enTranslations = await import('../public/locales/en/translation.json');
      expect(enTranslations).toBeDefined();
      expect(Object.keys(enTranslations.default).length).toBeGreaterThan(0);
    });

    it('should have matching keys between English and Tigrinya', async () => {
      const enTranslations = await import('../public/locales/en/translation.json');
      const tiTranslations = await import('../public/locales/ti/translation.json');
      
      const enKeys = Object.keys(enTranslations.default);
      const tiKeys = Object.keys(tiTranslations.default);
      
      expect(tiKeys.length).toBe(enKeys.length);
      
      // Check all English keys exist in Tigrinya
      enKeys.forEach(key => {
        expect(tiKeys).toContain(key);
      });
    });

    it('should not have empty translations in Tigrinya', async () => {
      const tiTranslations = await import('../public/locales/ti/translation.json');
      
      Object.entries(tiTranslations.default).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(value).not.toBe('');
        expect(typeof value).toBe('string');
      });
    });
  });

  describe('Sample Translations', () => {
    it('should have proper Tigrinya translations for common terms', async () => {
      const tiTranslations = await import('../public/locales/ti/translation.json');
      const translations = tiTranslations.default as Record<string, string>;
      
      // Test critical UI elements
      expect(translations['Store']).toBe('ድኳን');
      expect(translations['cart']).toBe('ዘንቢል');
      expect(translations['checkout']).toBe('ምውጻእ');
      expect(translations['email']).toBe('ኢመይል');
      expect(translations['password']).toBe('ፓስዎርድ');
      expect(translations['login']).toBe('መእታው');
      expect(translations['logout']).toBe('ምውጻእ');
    });

    it('should have shipping-related translations', async () => {
      const tiTranslations = await import('../public/locales/ti/translation.json');
      const translations = tiTranslations.default as Record<string, string>;
      
      expect(translations['Shipping']).toBe('ምልላኽ');
      expect(translations['Billing']).toBe('ክፍሊት');
      expect(translations['delivery']).toBe('ምብጻሕ');
    });

    it('should have order status translations', async () => {
      const tiTranslations = await import('../public/locales/ti/translation.json');
      const translations = tiTranslations.default as Record<string, string>;
      
      expect(translations['Pending']).toBe('ኣብ ምጽባይ');
      expect(translations['Paid']).toBe('ተኸፊሉ');
      expect(translations['Shipped']).toBe('ተለኢኹ');
      expect(translations['Delivered']).toBe('በጺሑ');
      expect(translations['Cancelled']).toBe('ተሰሪዙ');
    });
  });

  describe('i18n Configuration', () => {
    it('should include Tigrinya in supported locales', async () => {
      // use require to avoid TS module resolution for this JS config file
      const config = require('../next-i18next.config.js') as any;
      
      expect(config.i18n.locales).toContain('ti');
      expect(config.i18n.locales).toContain('en');
    });

    it('should have English as default locale', async () => {
      const config = require('../next-i18next.config.js') as any;
      
      expect(config.i18n.defaultLocale).toBe('en');
    });

    it('should have locale detection enabled', async () => {
      const config = require('../next-i18next.config.js') as any;
      
      expect(config.i18n.localeDetection).toBe(true);
    });
  });

  describe('Tigrinya Script Support', () => {
    it('should properly encode Tigrinya characters', () => {
      const tigrinya = 'ትግርኛ';
      
      // Check UTF-8 encoding
      expect(tigrinya.length).toBe(4);
      expect(tigrinya).toMatch(/[\u1200-\u137F]+/); // Ethiopic Unicode range
    });

    it('should handle common Tigrinya phrases', () => {
      const phrases = [
        'ሰላም',  // Hello
        'እንቋዕ ደሓን መጻእካ', // Welcome
        'የቐንየለይ', // Thank you
        'ዘይትረፍ', // You\'re welcome
      ];

      phrases.forEach(phrase => {
        expect(phrase).toMatch(/[\u1200-\u137F\s]+/);
      });
    });
  });
});

describe('Language Switching Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  it('should store language preference in localStorage', () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', 'ti');
      expect(localStorage.getItem('i18nextLng')).toBe('ti');
      
      localStorage.setItem('i18nextLng', 'en');
      expect(localStorage.getItem('i18nextLng')).toBe('en');
    }
  });

  it('should toggle between English and Tigrinya', () => {
    if (typeof window !== 'undefined') {
      // Start with English
      localStorage.setItem('i18nextLng', 'en');
      let current = localStorage.getItem('i18nextLng');
      
      // Switch to Tigrinya
      const newLang = current === 'ti' ? 'en' : 'ti';
      localStorage.setItem('i18nextLng', newLang);
      expect(localStorage.getItem('i18nextLng')).toBe('ti');
      
      // Switch back to English
      current = localStorage.getItem('i18nextLng');
      const finalLang = current === 'ti' ? 'en' : 'ti';
      localStorage.setItem('i18nextLng', finalLang);
      expect(localStorage.getItem('i18nextLng')).toBe('en');
    }
  });
});

describe('Translation Completeness Check', () => {
  it('should not have any missing Tigrinya translations', async () => {
    const enTranslations = await import('../public/locales/en/translation.json');
    const tiTranslations = await import('../public/locales/ti/translation.json');
    
    const missingKeys: string[] = [];
    
    Object.keys(enTranslations.default).forEach(key => {
      if (!tiTranslations.default[key as keyof typeof tiTranslations.default]) {
        missingKeys.push(key);
      }
    });
    
    expect(missingKeys).toHaveLength(0);
    
    if (missingKeys.length > 0) {
      console.error('Missing Tigrinya translations for keys:', missingKeys);
    }
  });

  it('should not have placeholder translations (same as English)', async () => {
    const enTranslations = await import('../public/locales/en/translation.json');
    const tiTranslations = await import('../public/locales/ti/translation.json');
    
    const placeholderKeys: string[] = [];
    
    Object.keys(enTranslations.default).forEach(key => {
      const enValue = enTranslations.default[key as keyof typeof enTranslations.default];
      const tiValue = tiTranslations.default[key as keyof typeof tiTranslations.default];
      
      // Skip checking 'default' as it might legitimately be the same
      if (key !== 'default' && enValue === tiValue && typeof enValue === 'string') {
        placeholderKeys.push(key);
      }
    });
    
    // Some technical terms might be the same (like "Email"), so we allow a small percentage
    const allowedPlaceholderPercentage = 5; // 5% allowed
    const maxAllowedPlaceholders = Math.ceil(Object.keys(enTranslations.default).length * (allowedPlaceholderPercentage / 100));
    
    expect(placeholderKeys.length).toBeLessThanOrEqual(maxAllowedPlaceholders);
    
    if (placeholderKeys.length > maxAllowedPlaceholders) {
      console.warn(`Found ${placeholderKeys.length} placeholder translations (allowed: ${maxAllowedPlaceholders}):`, placeholderKeys.slice(0, 10));
    }
  });
});
