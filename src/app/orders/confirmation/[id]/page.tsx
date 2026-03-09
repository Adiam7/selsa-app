/**
 * Order Confirmation Page
 * Displays success confirmation after order completion
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Truck, Mail, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/enhanced-feedback';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

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
  items: Array<{
    id: number;
    product?: { name?: string } | null;
    product_name_snapshot?: Record<string, string> | string | null;
    variant_sku?: string | null;
    quantity: number;
    price: string;
    line_total?: string;
  }>;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const orderId = params.id as string;
  
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
        if (response.status === 404) {
          setError('Order not found');
        } else {
          setError('Failed to load order details');
        }
        return;
      }

      const orderData = await response.json();
      setOrder(orderData);
    } catch (err) {
      setError('Unable to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingState
      loading={loading}
      error={error}
      retry={fetchOrder}
      loadingMessage="Loading your order confirmation..."
      errorTitle="Unable to load order"
    >
      {order && (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('Order Confirmed!')}
              </h1>
              <p className="text-lg text-gray-600">
                {t('Thank you for your purchase. Your order #{{orderNumber}} has been successfully placed.', { orderNumber: order.order_number || orderId })}
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('Order Details')}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {t('Order placed on')} {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${Number(order.total_amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('Total amount')}
                  </p>
                </div>
              </div>

              {/* Order Items */}  
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-4">{t('Items Ordered')}</h3>
                <div className="space-y-3">
                  {order.items.map((item) => {
                    const name = item.product?.name
                      || (typeof item.product_name_snapshot === 'string' ? item.product_name_snapshot : item.product_name_snapshot?.en)
                      || item.variant_sku
                      || 'Product';
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{name}</p>
                          <p className="text-sm text-gray-500">{t('Quantity:')} {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">
                          ${item.line_total ? Number(item.line_total).toFixed(2) : (Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address_snapshot && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">{t('Shipping Address')}</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.shipping_address_snapshot.full_name}</p>
                    <p>{order.shipping_address_snapshot.address_line_1}</p>
                    {order.shipping_address_snapshot.address_line_2 && <p>{order.shipping_address_snapshot.address_line_2}</p>}
                    <p>{order.shipping_address_snapshot.city}, {order.shipping_address_snapshot.state} {order.shipping_address_snapshot.postal_code}</p>
                    <p>{order.shipping_address_snapshot.country}</p>
                  </div>
                </div>
              )}
            </div>

            {/* What's Next Section */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                {t("What's next?")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      {t('Order confirmation email sent')}
                    </p>
                    <p className="text-blue-700">
                      {t('Check your email at')} {order.customer_email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      {t('Processing your order')}
                    </p>
                    <p className="text-blue-700">
                      {t("We'll prepare your items for shipping")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      {t('Shipping notification')}
                    </p>
                    <p className="text-blue-700">
                      {t('Tracking information will be emailed when your order ships')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push(`/orders/${orderId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Package className="w-4 h-4 mr-2" />
                {t('Track Order Status')}
              </Button>
              
              <Button 
                onClick={() => window.print()}
                variant="outline"
                className="border-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('Print Receipt')}
              </Button>
              
              <Button 
                onClick={() => router.push('/shop')}
                variant="outline"
                className="border-gray-300"
              >
                {t('Continue Shopping')}
              </Button>
            </div>

            {/* Back to Orders */}
            <div className="text-center mt-8">
              <Link 
                href="/orders" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('View All Orders')}
              </Link>
            </div>
            
          </div>
        </div>
      )}
    </LoadingState>
  );
}