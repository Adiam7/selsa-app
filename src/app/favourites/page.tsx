'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, AlertCircle, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { removeFavoriteByType } from '@/lib/api/favorites';
import type { Favorite } from '@/lib/api/favorites';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { getCatalogProductByExternalId } from '@/lib/api/catalog';
import styles from './page.module.css';
import { useTranslation } from 'react-i18next';

interface FavoriteProductData {
  id: string;
  externalId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  availability: boolean;
  createdAt: string;
}

export default function FavouritesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status } = useSession();
  
  // Use React Query hook for automatic refetching and cache alignment
  const { data, isLoading: isFavoritesLoading, isError: isFavoritesError } = useFavorites();
  const favorites: Favorite[] = data ?? [];

  const [products, setProducts] = useState<FavoriteProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/favourites');
      return;
    }
  }, [status, router]);

  // Update loading state based on React Query status
  useEffect(() => {
    setIsLoading(isFavoritesLoading);
  }, [isFavoritesLoading]);

  // Update error state based on React Query status
  useEffect(() => {
    if (isFavoritesError) {
      setError('Failed to load favorites');
    } else {
      setError(null);
    }
  }, [isFavoritesError]);

  // Load product data from favorites
  useEffect(() => {
    if (!favorites || favorites.length === 0) {
      setProducts([]);
      return;
    }

    const loadProductsFromFavorites = async () => {
      try {
        console.log('[Favorites] Starting product load for', favorites.length, 'favorites');
        
        // Map external product IDs from favorites
        const favoriteVariants = favorites
          .filter((fav) => fav.content_type_name === 'product')
          .map((fav) => ({ ...fav, externalId: fav.object_id }));

        console.log('[Favorites] Filtered variants:', favoriteVariants.length);

        if (favoriteVariants.length === 0) {
          console.warn('[Favorites] No product favorites found');
          setProducts([]);
          return;
        }

        // Fetch catalog products and find the matching variant
        const productsData = await Promise.all(
          favoriteVariants.map(async (favorite) => {
            try {

              // STEP 1: Fetch catalog product using external_product_id (e.g., 395266420)
              const catalogProduct = await getCatalogProductByExternalId(favorite.externalId);

              if (!catalogProduct) {
                console.warn(`[Favorites] No catalog product found for external_product_id: ${favorite.externalId}`);
                return null;
              }

              // STEP 2: Use first available variant or parent product
              let matchingVariant = null;
              
              if (catalogProduct.variants && catalogProduct.variants.length > 0) {
                // Use the first variant (all variants of the same product share the same product_id)
                matchingVariant = catalogProduct.variants[0];
                console.log('[Favorites] Step 2 ✅ MATCH FOUND! Using first variant:', {
                  sku: matchingVariant.sku,
                  price: matchingVariant.price,
                  external_id: matchingVariant.external_id,
                  image_url: matchingVariant.image_url,
                  is_available: matchingVariant.is_available,
                });
              } else {
                console.log('[Favorites] Step 2 ⚠️ No variants found, will use parent product data as fallback');
              }

              // STEP 3: If still no variant, use the parent product data
              if (!matchingVariant) {
                console.log('[Favorites] Step 3 ⚠️ Using parent product data as fallback');
                matchingVariant = {
                  price: catalogProduct.price,
                  image_url: catalogProduct.image_url || catalogProduct.featured_image,
                  is_available: catalogProduct.is_available,
                };
                console.log('[Favorites] Step 3 Fallback data:', matchingVariant);
              }

              // Prefer product-level image over variant design/mockup
              const preferredImage =
                catalogProduct.image_url ||
                catalogProduct.featured_image ||
                matchingVariant?.image_url ||
                (Array.isArray((matchingVariant as any)?.all_images)
                  ? (matchingVariant as any).all_images[0]
                  : null) ||
                (Array.isArray((catalogProduct as any)?.mockups)
                  ? (catalogProduct as any).mockups?.[0]?.url
                  : null);

              const productData = {
                id: favorite.id,
                externalId: favorite.externalId,
                slug: catalogProduct.slug || favorite.externalId,
                name: catalogProduct.name_display || catalogProduct.name,
                price: Number(matchingVariant.price || catalogProduct.price || 0),
                image: preferredImage || matchingVariant?.image || catalogProduct.image_url || catalogProduct.featured_image || undefined,
                availability: matchingVariant.is_available !== false && catalogProduct.is_available !== false,
                createdAt: favorite.created_at,
              };
              
              return productData;
            } catch (err) {
              console.error(`[Favorites] Failed to fetch product for external_id ${favorite.externalId}:`, err);
              return null;
            }
          })
        );

        const validProducts = productsData.filter((p) => p !== null) as FavoriteProductData[];
        console.log('[Favorites] Valid products loaded:', validProducts.length);
        setProducts(validProducts);

        if (validProducts.length === 0 && favoriteVariants.length > 0) {
          console.warn('[Favorites] All products failed to load');
          toast.error('Failed to load some favorite products');
        }
      } catch (err) {
        console.error('[Favorites] Error loading products:', err);
        toast.error('Failed to load favorite products');
      }
    };

    loadProductsFromFavorites();
  }, [favorites]);

  const sortProducts = (prods: FavoriteProductData[], sort: string): FavoriteProductData[] => {
    const copy = [...prods];
    switch (sort) {
      case 'price-low':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-high':
        return copy.sort((a, b) => b.price - a.price);
      case 'name':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent':
      default:
        return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  const handleRemove = async (favorite: FavoriteProductData) => {
    setRemovingId(favorite.externalId);
    try {
      await removeFavoriteByType('products.product', favorite.externalId);
      setProducts((prev) => prev.filter((p) => p.externalId !== favorite.externalId));
      toast.success('Removed from favorites');
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      toast.error('Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  const sortedProducts = sortProducts(products, sortBy);

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>
            <Heart size={36} strokeWidth={1.5} fill="currentColor" />{t('Favorites')}</h1>
          <p className={styles.headerSubtitle}>
            {favorites.length === 0
              ? 'Start adding items to favorites'
              : `${favorites.length} item${favorites.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>

        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>{t('Loading favorites...')}</p>
          </div>
        )}

        {!isLoading && error && (
          <div className={styles.errorContainer}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h2 className={styles.errorTitle}>{t('Unable to Load Favorites')}</h2>
            <p className={styles.errorText}>{error}</p>
            <button
              onClick={() => router.push('/store')}
              className={styles.primaryButton}
            >{t('Continue Shopping')}</button>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>
              <Heart size={80} strokeWidth={1} />
            </div>
            <h2 className={styles.emptyTitle}>{t('No Favorites Yet')}</h2>
            <p className={styles.emptyText}>{t('Explore our collection and add items to your favorites to see them here')}</p>
            <button
              onClick={() => router.push('/store')}
              className={styles.primaryButton}
            >
              <ShoppingBag size={18} style={{ display: 'inline', marginRight: '8px' }} />{t('Explore Collection')}</button>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className={styles.contentContainer}>
            {/* Favorites Grid */}
            <div className={styles.mainContent}>
              <div className={styles.favoritesHeader}>
                <div className={styles.headerStats}>
                  <h2 className={styles.favoritesTitle}>
                    <Heart size={20} style={{ display: 'inline', marginRight: '8px' }} fill="currentColor" />{t('Saved Items')}</h2>
                  <span className={styles.itemCount}>({sortedProducts.length})</span>
                </div>

                <div className={styles.sortContainer}>
                  <label className={styles.sortLabel}>{t('Sort by:')}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={styles.sortSelect}
                    aria-label="Sort favorites by"
                  >
                    <option value="recent">{t('Recently Added')}</option>
                    <option value="name">{t('Name')}</option>
                    <option value="price-low">{t('Price: Low to High')}</option>
                    <option value="price-high">{t('Price: High to Low')}</option>
                  </select>
                </div>
              </div>

              <div className={styles.productGrid}>
                {sortedProducts.map((product) => (
                  <Link
                    key={product.externalId}
                    href={`/shop/${product.externalId}`}
                    className={styles.productCard}
                  >
                    <div className={styles.imageContainer}>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className={styles.productImage}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={false}
                          onError={(error) => {
                            console.error(`[Favorites] Image failed to load for ${product.name}: ${product.image}`, error);
                          }}
                          onLoadingComplete={() => {
                            console.log(`[Favorites] Image loaded successfully for ${product.name}`);
                          }}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <ShoppingBag size={48} />
                        </div>
                      )}

                      {!product.availability && (
                        <div className={styles.unavailableBadge}>{t('Out of Stock')}</div>
                      )}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(product);
                        }}
                        disabled={removingId === product.externalId}
                        className={styles.removeButton}
                        title="Remove from favorites"
                        aria-label={`Remove ${product.name} from favorites`}
                      >
                        {removingId === product.externalId ? (
                          <div className={styles.miniSpinner}></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>

                    <div className={styles.productContent}>
                      <h3 className={styles.productName}>{product.name}</h3>

                      <div className={styles.productMeta}>
                        <p className={styles.productPrice}>${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</p>
                        <span className={`${styles.availabilityBadge} ${product.availability ? styles.inStock : styles.outOfStock}`}>
                          {product.availability ? '✓ In Stock' : '✗ Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
