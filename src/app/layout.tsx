import './globals.css';
import './layout.css';


import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Providers from '@/components/Providers'; 
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { BackendStatusAlert } from '@/components/BackendStatusAlert';
import { RouteAwareFrame } from '@/components/layout/RouteAwareFrame';
import { LegacyStylesheetManager } from '@/components/layout/LegacyStylesheetManager';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://selsa.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Selsa Store',
    template: '%s | Selsa Store',
  },
  description: 'Selsa Store — Premium custom apparel and accessories. Hoodies, hats, and more.',
  keywords: ['selsa', 'store', 'hoodies', 'hats', 'custom apparel', 'ecommerce'],
  authors: [{ name: 'Selsa' }],
  openGraph: {
    type: 'website',
    siteName: 'Selsa Store',
    title: 'Selsa Store',
    description: 'Premium custom apparel and accessories. Hoodies, hats, and more.',
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selsa Store',
    description: 'Premium custom apparel and accessories.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const interClass = inter.className;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Establish `@layer legacy` FIRST so it has the lowest cascade priority.
          Tailwind v4's build strips it from globals.css, so we declare it here
          (SSR-rendered, before the compiled CSS `<link>` tags).
          Layer order becomes: legacy < properties < theme < base < components < utilities
        */}
        <style dangerouslySetInnerHTML={{ __html: '@layer legacy;' }} />
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`bg-background text-foreground antialiased ${interClass} layout-root`} suppressHydrationWarning>
        {/* SEO: Organization + WebSite structured data (once per page) */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {/* Legacy CSS stylesheets — injected per route via client component */}
        <LegacyStylesheetManager />
        {/* Handle history & reload on back/forward */}
        <Script id="scroll-restoration" strategy="afterInteractive">{`
          window.onpopstate = function(event) {
            if (event.state) { window.location.reload(); }
          };
          window.history.scrollRestoration = 'auto';
        `}</Script>
        <Providers>
          <FavouritesProvider>
            <RouteAwareFrame header={<Header />} footer={<Footer />}>
              {children}
            </RouteAwareFrame>
            <BackendStatusAlert />
          </FavouritesProvider>
        </Providers>
        {/* JS scripts moved from <head> to here via Next.js Script */}
        {/* NOTE: These scripts are ES modules with external imports and are disabled for now */}
        {/* They would need to be properly bundled as UMD or compiled without external imports */}
        {/* 
        <div>
          <Script src="js/product.js" strategy="afterInteractive" />
          <Script src="js/form_add_rem.js" strategy="afterInteractive" />
          <Script src="js/changeImage.js" strategy="afterInteractive" />
          <Script src="js/changeImg.js" strategy="afterInteractive" />
          <Script src="js/ActionLink.js" strategy="afterInteractive" />
          <Script src="js/CoverTile.js" strategy="afterInteractive" />
          <Script src="js/CTATile.js" strategy="afterInteractive" />
          <Script src="js/HeaderTile.js" strategy="afterInteractive" />
          <Script src="js/i.min.js" strategy="afterInteractive" />
          <Script src="js/product_list.js" strategy="afterInteractive" />
          <Script src="js/website-icons.js" strategy="afterInteractive" />
          <Script src="js/website-app.js" strategy="afterInteractive" />
          <Script src="js/TextTile.js" strategy="afterInteractive" />
          <Script src="js/vendors.js" strategy="afterInteractive" />
        </div>
        */}
      </body>
    </html>
  );
}
