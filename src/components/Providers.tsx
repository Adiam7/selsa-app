// src/components/Providers.tsx
'use client';

// Ensure i18n is initialized before any translation hooks are used
import i18n from '../i18n';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/context/cart/CartContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import MergeCartClient from '@/features/cart/components/MergeCartClient';
import { ToastProvider } from '@/components/Toast';
import { useMemo, useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient once for the entire app
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            gcTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
    []
  );

  // After hydration, switch to the user's stored language
  useEffect(() => {
    const stored = localStorage.getItem('i18nextLng');
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  }, []);

  return (
    <SessionProvider basePath="/api/auth">
      <QueryClientProvider client={queryClient}>
        <FavouritesProvider>
          <CartProvider>
            <ToastProvider>
              <MergeCartClient />
              {children}
            </ToastProvider>
          </CartProvider>
        </FavouritesProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
