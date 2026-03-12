'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useTranslation } from 'react-i18next';
import { resolveBackendAssetUrl } from "@/lib/utils/utils";
import { updateCartItem as updateCartItemAPI } from '@/lib/api/cart/updateCartItem';
import { removeCartItem as removeCartItemAPI } from '@/lib/api/cart/removeCartItem';
import { addToCart as addToCartAPI } from '@/lib/api/cart';
import { name_option } from '@/lib/utils/utils';
import { getColorTranslation } from '@/utils/colorTranslations';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { Cart as CartType, CartItem as CartItemType } from '@/types/cart';
import { QuantitySelector } from "@/components/QuantitySelector";
import "@/components/QuantitySelector.css";
import { ShoppingBag, Truck, Lock, ShoppingCart, ShoppingBasket, ShoppingCartIcon, CheckCircle2, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import styles from './page.module.css';
import { useStockPrice } from '@/lib/hooks/useStockPrice';
import { StockPriceBadge } from '@/components/StockPriceBadge';
import type { VariantStockPrice } from '@/lib/api/stockPrice';



export default function CartPage() {
  // All hooks MUST be called at the top, before any conditional returns
  const { t } = useTranslation();
  const { cart, loading, mutate, refreshCart } = useCart();
  const router = useRouter();
  const [pendingItemIds, setPendingItemIds] = useState<Record<number, boolean>>({});
  const [globalPending, setGlobalPending] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  // ── Real-time stock & price polling for cart items ──
  const cartVariantIds = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items
      .map((it) => it.variant_detail?.id ?? it.variant?.id)
      .filter((id): id is number => typeof id === 'number');
  }, [cart?.items]);

  const { getVariant: getLiveVariant } = useStockPrice({
    variantIds: cartVariantIds,
    intervalMs: 30_000,
    enabled: cartVariantIds.length > 0,
  });

  const total = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((s, it) => s + ((it.product_price || 0) * (it.quantity || 0)), 0);
  }, [cart]);

  const subtotal = total;
  // Tax and shipping are calculated at checkout with real Printful pricing

  const setItemPending = useCallback((id: number, v: boolean) =>
    setPendingItemIds((s) => ({ ...s, [id]: v })), []);

  const handleQuantityChange = useCallback(async (item: CartItemType, newQty: number) => {
    if (newQty < 1 || newQty === item.quantity) return;
    setItemPending(item.id, true);

    const optimisticCart: CartType = {
      ...cart!,
      items: cart!.items.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i)),
    };

    try {
      await mutate(
        async () => {
          const updated = await updateCartItemAPI({ cartId: cart!.id, itemId: item.id, quantity: newQty });
          return updated;
        },
        { optimisticData: optimisticCart, revalidate: false, rollbackOnError: true }
      );
      toast.success('Quantity updated');
    } catch (err: unknown) {
      console.error('Failed update quantity', err);
      const axiosErr = err as { response?: { status?: number }; message?: string };
      if (axiosErr?.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
      } else {
        toast.error(axiosErr?.message || 'Failed to update quantity');
      }
      try { await refreshCart(); } catch { }
    } finally {
      setItemPending(item.id, false);
    }
  }, [cart, mutate, refreshCart, router]);

  const handleRemove = useCallback(async (item: CartItemType) => {
    setItemPending(item.id, true);

    const optimisticCart: CartType = {
      ...cart!,
      items: cart!.items.filter((i) => i.id !== item.id),
    };

    try {
      await mutate(
        async () => {
          const updated = await removeCartItemAPI({ cartId: cart!.id, itemId: item.id });
          return updated;
        },
        { optimisticData: optimisticCart, revalidate: false, rollbackOnError: true }
      );
      toast.success('Item removed');
    } catch (err: unknown) {
      console.error('Failed remove item', err);
      const axiosErr = err as { response?: { status?: number }; message?: string };
      if (axiosErr?.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
      } else {
        toast.error(axiosErr?.message || 'Failed to remove item');
      }
      try { await refreshCart(); } catch { }
    } finally {
      setItemPending(item.id, false);
    }
  }, [cart, mutate, refreshCart, router]);

  // Example add-to-cart demonstration (if you need a local add UI)
  // You may already have a product page calling addToCart; included to show usage.
  const handleAddLocal = useCallback(async (variantId: number, qty = 1, imageUrl = '/placeholder.jpg') => {
    if (!cart) return;
    setGlobalPending(true);
    const optimisticCart: CartType = {
      ...cart,
      items: [
        ...cart.items,
        {
          id: Date.now(), // temporary client id
          quantity: qty,
          variant: { id: variantId } as any,
          product_name: '…',
          product_price: 0,
        } as CartItemType,
      ],
    };

    try {
      await mutate(
        async () => {
          const updated = await addToCartAPI({
            cartId: cart.id,
            variant: { id: variantId },
            image: imageUrl,
            quantity: qty,
          });
          return updated;
        },
        { optimisticData: optimisticCart, revalidate: false }
      );
      toast.success('Added to cart');
    } catch (err: unknown) {
      console.error('Add to cart failed', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to add to cart';
      toast.error(errMsg);
      try { await refreshCart(); } catch { }
    } finally {
      setGlobalPending(false);
    }
  }, [cart, mutate, refreshCart]);

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>
            <ShoppingCart size={36} strokeWidth={1.5} />
            {/* <img src="/icons/Selsa-cart.svg" 
            alt="Selsa Logo" 
            // size={36} strokeWidth={1.5}
            width={120} height={140} /> */}{t('Shopping Cart')}</h1>
          <p className={styles.headerSubtitle}>{t('Review your items')}</p>
        </div>

        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
        )}

        {!loading && (!cart || !cart.items || cart.items.length === 0) && (
          <div className={styles.emptyCart}>
            <ShoppingBag size={80} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>{t('Your cart is empty')}</h2>
            <p className={styles.emptyText}>{t('Start exploring our collection and add items to your cart')}</p>
            <button 
              onClick={() => router.push('/store')} 
              className={styles.primaryButton}
            >
              <ShoppingBag size={18} style={{ display: 'inline' }} />{t('Continue Shopping')}</button>
          </div>
        )}

        {!loading && cart && cart.items && cart.items.length > 0 && (
          <div className={styles.grid}>
            {/* Cart Items */}
            <div className={styles.cartItems}>
              <div className={styles.cartHeader}>
                <h2 className={styles.cartHeaderTitle}>
                  <ShoppingBasket size={20} style={{ display: 'inline', marginRight: '10px' }} />{t('Items')}<span>({cart.items.length})</span>
                </h2>
              </div>
              <div>
                {cart.items.map((item, index) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onIncrease={() => handleQuantityChange(item, item.quantity + 1)}
                    onDecrease={() => handleQuantityChange(item, Math.max(1, item.quantity - 1))}
                    onRemove={() => handleRemove(item)}
                    pending={!!pendingItemIds[item.id]}
                    index={index}
                    liveData={getLiveVariant(item.variant_detail?.id ?? item.variant?.id ?? 0)}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className={styles.summary}>
              <h2 className={styles.summaryHeader}>{t('Order Summary')}</h2>
              
              <div className={styles.summaryContent}>
                {/* Coupon Section */}
                <div className={styles.couponSection}>
                  <label className={styles.label}>{t('🎉 PROMO CODE')}</label>
                  <div className={styles.flexRow}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder={t('Enter promo code')}
                      className={styles.input}
                    />
                    <button className={styles.applyButton}>{t('Apply')}</button>
                  </div>
                </div>



                {/* Price Breakdown */}
                <div className={styles.priceBreakdown}>
                  <div className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel}>{t('Subtotal')}</span>
                    <span className={styles.breakdownValue}>${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total - Will be calculated at checkout */}
                <div className={styles.totalSection}>
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>{t('Subtotal')}</span>
                    <span className={styles.totalAmount}>${subtotal.toFixed(2)}</span>
                  </div>
                  <p className={styles.checkoutNote}>{t('✓ Shipping & tax calculated at checkout')}</p>
                </div>

                {/* Buttons */}
                <div className={styles.flexColumn}>
                  <button
                    onClick={() => router.push('/checkout')}
                    disabled={globalPending}
                    className={styles.checkoutButton}
                  >
                    {globalPending ? t('Processing...') : t('Proceed to Checkout')}
                    {!globalPending && <ArrowRight size={18} />}
                  </button>

                  <button
                    onClick={() => router.push('/store')}
                    disabled={globalPending}
                    className={styles.continueShoppingButton}
                  >{t('Continue Shopping')}</button>
                </div>

                {/* Trust Badges */}
                <div className={styles.trustBadges}>
                  <div className={styles.badgeItem}>
                    <Lock size={16} />
                    <span>{t('Secure checkout with SSL encryption')}</span>
                  </div>
                  <div className={styles.badgeItem}>
                    <Truck size={16} />
                    <span>{t('Free returns within 30 days')}</span>
                  </div>
                  <div className={styles.badgeItem}>
                    <CheckCircle2 size={16} />
                    <span>{t('100% money-back guarantee')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  pending,
  index = 0,
  liveData,
}: {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  pending: boolean;
  index?: number;
  liveData?: VariantStockPrice;
}) {
  const { t, i18n } = useTranslation();

  function extractColorSizeFromSku(sku?: string) {
    if (!sku || !sku.includes('_')) return {};

    const [, variantPart] = sku.split('_'); // Pale-Pink-XS
    if (!variantPart) return {};

    const parts = variantPart.split('-');
    if (parts.length < 2) return {};

    const size = parts.pop(); // XS
    const color = parts.join(' '); // Pale Pink

    return { color, size };
  }

  // Get image from payload: prefer image_url from cart item, fallback to variant_detail
  let imageUrl = '/placeholder.jpg';
  if (item.image_url) {
    imageUrl = resolveBackendAssetUrl(item.image_url) || item.image_url;
  } else if (item.variant_detail?.image_url) {
    imageUrl = resolveBackendAssetUrl(item.variant_detail.image_url) || item.variant_detail.image_url;
  } else if (item.product_image) {
    imageUrl = resolveBackendAssetUrl(item.product_image) || item.product_image;
  }

  // Get product name from payload
  const rawName = item.product_name || item.variant_detail?.product_name || item.variant?.product?.name || 'Product';
  let name = 'Product'; // Default fallback
  
  if (typeof rawName === 'string') {
    name = rawName;
  } else if (rawName && typeof rawName === 'object') {
    // Handle i18n object or option values
    name = name_option(rawName);
  }
  
  let price = item.product_price ?? item.variant?.product?.price ?? 0;
  // Ensure price is a number
  price = Number(price) || 0;
  console.log("Cart Item Variant Detail:", item.variant_detail);

  const { color, size } = extractColorSizeFromSku(
    item.product_sku || item.variant_detail?.sku
  );

  const sku = String(item.product_sku || item.variant_detail?.sku || '');
  const isBook = sku.startsWith('Book-');

  return (
    <div className={styles.cartItem}>
      <div className={styles.itemImageWrapper}>
        <img
          src={imageUrl}
          alt={name}
          width={120}
          height={120}
          className={`${styles.itemImage} ${isBook ? styles.itemImageBook : ''}`}
        />
      </div>
      {/* Details */}
      <div className={styles.itemDetails}>
        <h3 className={styles.itemName}>{name}</h3>
        
        {/* Attributes */}
        {(color || size) && (
          <div className={styles.itemAttributes}>
            {color && (
              <span className={styles.attribute}>
                <strong>{t('Color:')}</strong> {getColorTranslation(color, i18n.language)}
              </span>
            )}
            {size && (
              <span className={styles.attribute}>
                <strong>{t('Size:')}</strong> {size}
              </span>
            )}
          </div>
        )}

        {/* Live stock/price badge */}
        <StockPriceBadge live={liveData} displayedPrice={price} compact />

        {/* Quantity Selector */}
        <div className={styles.quantityControl}>
          <button
            onClick={onDecrease}
            disabled={pending}
            className={styles.quantityButton}
            aria-label="Decrease quantity"
          >{t('−')}</button>
          <span className={styles.quantityValue}>{item.quantity}</span>
          <button
            onClick={onIncrease}
            disabled={pending}
            className={styles.quantityButton}
            aria-label="Increase quantity"
          >{t('+')}</button>
        </div>
      </div>
      {/* Price and Remove */}
      <div className={styles.itemPricing}>
        <div>
          <p className={styles.priceLabel}>{t('Unit Price')}</p>
          <p className={styles.price}>${price.toFixed(2)}</p>
        </div>
        <div>
          <p className={styles.priceLabel}>{t('Subtotal')}</p>
          <p className={styles.subtotalPrice}>${(price * item.quantity).toFixed(2)}</p>
        </div>
        <button
          onClick={onRemove}
          disabled={pending}
          className={styles.removeButton}
          title="Remove item from cart"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
