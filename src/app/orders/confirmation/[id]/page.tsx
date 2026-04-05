/**
 * Order Confirmation Page
 * Premium post-checkout confirmation with Selsa's black & white design system
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Package, Truck, Mail, ArrowLeft, ChevronRight } from 'lucide-react';
import { LoadingState } from '@/components/ui/enhanced-feedback';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

interface GalleryImage {
  id: number;
  image: string;
  image_url?: string;
  is_primary: boolean;
  alt_text?: Record<string, string> | string | null;
}

interface OrderConfirmation {
  id: number;
  order_number?: string;
  status: string;
  total_amount: string;
  subtotal_amount?: string;
  shipping_amount?: string;
  tax_amount?: string;
  discount_amount?: string;
  created_at: string;
  customer_email: string | null;
  shipping_address_snapshot: Record<string, any> | null;
  billing_address_snapshot?: Record<string, any> | null;
  items: Array<{
    id: number;
    image_url?: string | null;
    product?: {
      name?: string | Record<string, string>;
      name_display?: string;
      gallery_images?: GalleryImage[];
    } | null;
    product_name_snapshot?: Record<string, string> | string | null;
    variant_sku?: string | null;
    quantity: number;
    price: string;
    line_total?: string;
  }>;
}

function getItemName(item: OrderConfirmation['items'][0]): string {
  if (item.product?.name_display) return item.product.name_display;
  if (item.product?.name) {
    if (typeof item.product.name === 'string') return item.product.name;
    return item.product.name.en || Object.values(item.product.name)[0] || 'Product';
  }
  if (typeof item.product_name_snapshot === 'string') return item.product_name_snapshot;
  if (item.product_name_snapshot?.en) return item.product_name_snapshot.en;
  return item.variant_sku || 'Product';
}

function getItemImage(item: OrderConfirmation['items'][0]): string | null {
  // 1. Use the top-level image_url from the serializer (variant → catalog_product chain)
  if (item.image_url) return item.image_url;
  // 2. Fallback to gallery_images from product
  const imgs = item.product?.gallery_images;
  if (!imgs || imgs.length === 0) return null;
  const primary = imgs.find(i => i.is_primary) || imgs[0];
  return primary.image_url || primary.image || null;
}

export default function OrderConfirmationPage() {
  return <OrderConfirmationContent embedded={false} />;
}

export function OrderConfirmationContent({ embedded = false }: { embedded?: boolean }) {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        setError(response.status === 404 ? 'Order not found' : 'Failed to load order details');
        return;
      }
      setOrder(await response.json());
    } catch {
      setError('Unable to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const fmt = (v?: string | number | null) => (v == null ? '0.00' : Number(v).toFixed(2));

  const steps = [
    { num: '01', title: t('Processing your order'), desc: t("We're preparing your items for production.") },
    { num: '02', title: t('Shipped & on its way'), desc: t("You'll receive a shipping confirmation with tracking info.") },
    { num: '03', title: t('Delivered'), desc: t('Enjoy your new items from Selsa.') },
  ];

  return (
    <LoadingState
      loading={loading}
      error={error ?? undefined}
      retry={fetchOrder}
      loadingMessage="Loading your order confirmation..."
      errorTitle="Unable to load order"
    >
      {order && (
        <div className={embedded ? styles.pageEmbedded : styles.page}>
          <div className={styles.container}>
            {/* ───── Hero ───── */}
            <div className={styles.hero}>
              <div className={styles.heroIcon}>
                <Check size={28} color="#fff" strokeWidth={3} />
              </div>
              <h1 className={styles.heroTitle}>{t('Order Confirmed')}</h1>
              <p className={styles.heroSubtitle}>
                {t('Thank you for your purchase. Your order')}{' '}
                <strong className={styles.heroOrderNum}>#{order.order_number || orderId}</strong>{' '}
                {t('has been placed successfully.')}
              </p>
            </div>

            {/* ───── Two-Column Grid ───── */}
            <div className={styles.grid}>
              {/* ===== LEFT ===== */}
              <div className={styles.leftCol}>
                {/* Items Card */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <Package size={18} color="#0a0a0a" />
                      <span className={styles.cardHeaderTitle}>{t('Items Ordered')}</span>
                    </div>
                    <span className={styles.cardHeaderCount}>
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {order.items.map((item, idx) => {
                    const name = getItemName(item);
                    const imgUrl = getItemImage(item);
                    const isLast = idx === order.items.length - 1;
                    return (
                      <div key={item.id} className={`${styles.itemRow} ${isLast ? '' : styles.itemRowBorder}`}>
                        <div className={styles.itemImage}>
                          {imgUrl ? (
                            <Image src={imgUrl} alt={name} fill sizes="64px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div className={styles.itemImagePlaceholder}>
                              <Package size={24} color="#d4d4d4" />
                            </div>
                          )}
                        </div>
                        <div className={styles.itemDetails}>
                          <p className={styles.itemName}>{name}</p>
                          <p className={styles.itemMeta}>Qty: {item.quantity} × ${fmt(item.price)}</p>
                        </div>
                        <span className={styles.itemPrice}>
                          ${item.line_total ? fmt(item.line_total) : fmt(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Shipping Address */}
                {order.shipping_address_snapshot && (
                  <div className={styles.shippingCard}>
                    <div className={styles.sectionHeader}>
                      <Truck size={18} color="#0a0a0a" />
                      <span className={styles.cardHeaderTitle}>{t('Shipping To')}</span>
                    </div>
                    <div className={styles.addressLines}>
                      {order.shipping_address_snapshot.full_name && (
                        <p className={styles.addressName}>{order.shipping_address_snapshot.full_name}</p>
                      )}
                      <p>{order.shipping_address_snapshot.address_line_1}</p>
                      {order.shipping_address_snapshot.address_line_2 && (
                        <p>{order.shipping_address_snapshot.address_line_2}</p>
                      )}
                      <p>
                        {order.shipping_address_snapshot.city}, {order.shipping_address_snapshot.state}{' '}
                        {order.shipping_address_snapshot.postal_code}
                      </p>
                      <p>{order.shipping_address_snapshot.country}</p>
                    </div>
                  </div>
                )}

                {/* What's Next */}
                <div className={styles.nextCard}>
                  <span className={styles.nextCardTitle}>{t('What Happens Next')}</span>
                  {steps.map((step, i) => (
                    <div key={i} className={`${styles.step} ${i < 2 ? styles.stepSpacing : ''}`}>
                      <div className={`${styles.stepCircle} ${i === 0 ? styles.stepCircleActive : styles.stepCircleInactive}`}>
                        <span className={`${styles.stepNum} ${i === 0 ? styles.stepNumActive : styles.stepNumInactive}`}>
                          {step.num}
                        </span>
                      </div>
                      <div>
                        <p className={styles.stepTitle}>{step.title}</p>
                        <p className={styles.stepDesc}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ===== RIGHT: Sidebar ===== */}
              <div className={styles.sidebar}>
                <span className={styles.sidebarLabel}>{t('Order Summary')}</span>
                <span className={styles.sidebarOrderMeta}>
                  #{order.order_number || orderId} · {formatDate(order.created_at)}
                </span>

                <div className={styles.totalsSection}>
                  {[
                    { label: 'Subtotal', value: order.subtotal_amount },
                    { label: 'Shipping', value: order.shipping_amount },
                    { label: 'Tax', value: order.tax_amount },
                  ].map((row) => (
                    <div key={row.label} className={styles.totalsRow}>
                      <span className={styles.totalsLabel}>{t(row.label)}</span>
                      <span className={styles.totalsValue}>${fmt(row.value)}</span>
                    </div>
                  ))}

                  {order.discount_amount && Number(order.discount_amount) > 0 && (
                    <div className={styles.totalsRow}>
                      <span className={styles.totalsLabel}>{t('Discount')}</span>
                      <span className={styles.totalsValue}>−${fmt(order.discount_amount)}</span>
                    </div>
                  )}
                </div>

                <div className={styles.grandTotal}>
                  <span className={styles.grandTotalLabel}>{t('Total')}</span>
                  <span className={styles.grandTotalValue}>${fmt(order.total_amount)}</span>
                </div>

                {order.customer_email && (
                  <div className={styles.emailNotice}>
                    <Mail size={16} color="#737373" />
                    <div>
                      <p className={styles.emailNoticeLabel}>{t('Confirmation sent to')}</p>
                      <p className={styles.emailNoticeValue}>{order.customer_email}</p>
                    </div>
                  </div>
                )}

                <div className={styles.sidebarButtons}>
                  <button className={styles.btnPrimary} onClick={() => router.push(`/account/orders/${orderId}`)}>
                    {t('Track Order')} <ChevronRight size={16} />
                  </button>
                  <button className={styles.btnSecondary} onClick={() => router.push('/shop')}>
                    {t('Continue Shopping')}
                  </button>
                </div>
              </div>
            </div>

            {/* ───── Back ───── */}
            <div className={styles.backLink}>
              <Link href="/account/orders" className={styles.backLinkAnchor}>
                <ArrowLeft size={16} /> {t('View All Orders')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </LoadingState>
  );
}