import type { Metadata } from 'next';

const SITE_NAME = 'Selsa';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://selsa.com';

/**
 * Generate standard metadata for a page.
 * Usage: export const metadata = pageMetadata({ title: 'About', description: '...' });
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = path ? `${BASE_URL}${path}` : undefined;

  return {
    title: fullTitle,
    description,
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      type: 'website',
      ...(url && { url }),
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description,
    },
    ...(url && {
      alternates: {
        canonical: url,
      },
    }),
  };
}
