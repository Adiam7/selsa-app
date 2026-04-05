'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LOCALES = ['en', 'ti'] as const;

/**
 * Syncs the <html lang> attribute with the current i18n language
 * and injects hreflang <link> tags for multilingual SEO.
 */
export default function LangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language || 'en';
    document.documentElement.lang = lang;

    // Inject / update hreflang alternate links
    for (const locale of SUPPORTED_LOCALES) {
      const id = `hreflang-${locale}`;
      let link = document.getElementById(id) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'alternate';
        link.hreflang = locale;
        document.head.appendChild(link);
      }
      link.href = window.location.href;
    }

    // x-default hreflang
    const xId = 'hreflang-x-default';
    let xLink = document.getElementById(xId) as HTMLLinkElement | null;
    if (!xLink) {
      xLink = document.createElement('link');
      xLink.id = xId;
      xLink.rel = 'alternate';
      xLink.setAttribute('hreflang', 'x-default');
      document.head.appendChild(xLink);
    }
    xLink.href = window.location.href;
  }, [i18n.language]);

  return null;
}
