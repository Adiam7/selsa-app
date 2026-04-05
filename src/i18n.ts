'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Languages
import translationEN from '../public/locales/en/translation.json';
import translationTI from '../public/locales/ti/translation.json';

const resources = {
  en: { translation: translationEN },
  ti: { translation: translationTI },
};

// Initialize i18n
if (!i18n.isInitialized) {
  i18n
    .use(HttpApi as any)
    .use(LanguageDetector)
    .use(initReactI18next)
    // @ts-expect-error — cookieName exists at runtime but is missing from DetectorOptions type
    .init({
      resources,
      fallbackLng: 'en',
      lng: typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') || 'en' : 'en',
      debug: false, // Disable debug logs
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'cookie', 'querystring', 'navigator', 'htmlTag', 'path', 'subdomain'],
        caches: ['localStorage', 'cookie'],
        cookieName: 'i18nextLng',
      },
      react: {
        useSuspense: false, // Prevents SSR issues
      },
    });
}

export default i18n;
