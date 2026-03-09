'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '@/features/favourites/hooks/useFavorite';
import { removeFavoriteByType } from '@/lib/api/favorites';
import { getSafeImageUrl } from '@/lib/utils/utils';

interface FavoriteProductWithData {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  availability: boolean;
}

export default function FavoritesFavoritesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { favorites, isLoading, error } = useFavorites();
  
  const [products, setProducts] = useState<FavoriteProductWithData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/favourites');
    }
  }, [status, router]);

  // Load product data from favorites
  useEffect(() => {
    const loadProductsFromFavorites = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      try {
        setLoadingProducts(true);
        // Extract product IDs from favorites
        const productIds = favorites
          .filter((fav) => fav.content_type_name === 'product')
          .map((fav) => fav.object_id);

        if (productIds.length === 0) {
          setProducts([]);
          return;
        }

        // Fetch products by IDs
        // Note: You'll need to implement a batch fetch endpoint on your backend
        // or fetch individually
        const productsData = await Promise.all(
          productIds.map((id) =>
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/products/${id}/`)
              .then((res) => res.json())
              .catch(() => null)
          )
        );

        const validProducts = productsData
          .filter((p) => p !== null)
          .map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name_display || p.name,
            price: p.price,
            image: p.image || p.featured_image,
            availability: p.availability,
          }));

        setProducts(validProducts);
      } catch (err) {
        console.error('Error loading products:', err);
        toast.error('Failed to load favorite products');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProductsFromFavorites();
  }, [favorites]);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      setRemovingId(productId);
      await removeFavoriteByType('products.product', productId);
      toast.success('Removed from favorites');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove from favorites';
      toast.error(errorMsg);
    } finally {
      setRemovingId(null);
    }
  };

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-gray-600">{t('Loading your favorites...')}</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Favorites</h3>
            <p className="text-red-700 text-sm mt-1">
              {error instanceof Error ? error.message : 'Failed to load your favorites'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0 && !loadingProducts) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('No Favorites Yet')}</h1>
          <p className="text-gray-600 mb-6">{t('Heart your favorite products to save them here for later.')}</p>
          <Link
            href="/shop"
            className="inline-block bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >{t('Browse Products')}</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Your Favorites')}</h1>
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? 'item' : 'items'}{t('saved')}</p>
      </div>
      {loadingProducts ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition duration-200"
            >
              {/* Product Image */}
              <Link href={`/product/${product.slug}`} className="block relative">
                <div className="aspect-square bg-gray-100 overflow-hidden relative group">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">{t('No Image')}</span>
                    </div>
                  )}
                  {!product.availability && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">{t('Out of Stock')}</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/product/${product.slug}`} className="block mb-2">
                  <h3 className="font-semibold text-gray-900 hover:text-red-600 transition line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-lg font-bold text-gray-900 mb-4">{t('$')}{parseFloat(String(product.price)).toFixed(2)}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/product/${product.slug}`}
                    className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('View')}</span>
                  </Link>

                  <button
                    onClick={() => handleRemoveFavorite(product.id)}
                    disabled={removingId === product.id}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50 flex items-center justify-center"
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                  >
                    {removingId === product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
