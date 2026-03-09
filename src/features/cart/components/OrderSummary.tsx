import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Cart } from '@/types/cart';
import { getDisplayName } from '@/utils/i18nDisplay';
import { resolveBackendAssetUrl } from '@/lib/utils/utils';

interface OrderSummaryProps {
  cart: Cart;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ cart }) => {
  const { t } = useTranslation();
  if (!cart?.items?.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{t('Order Summary')}</h2>
      {cart.items.map((item) => {
        const productName =
          getDisplayName(item.product_variant?.product) ||
          getDisplayName({ name: item.product_name }) ||
          'Product';

        return (
        <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-none">
          <div>
            <p className="font-medium">{productName}</p>
            <p className="text-sm text-gray-500">{t('SKU:')}{item.product_variant?.sku}</p>
            {(item as any)?.option_values?.length > 0 && (
              <div className="text-sm text-gray-500">
                {(item as any).option_values.map((opt: any) => (
                  <span key={opt.id} className="mr-2">
                    {getDisplayName(opt.option)}{t(':')}{getDisplayName(opt)}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500">{t('Qty:')}{item.quantity}</p>
          </div>
          <div className="text-right">
            <img
              src={
                resolveBackendAssetUrl(item.image_url) ||
                resolveBackendAssetUrl(item.product_image) ||
                "/placeholder.png"
              }
              alt={productName}
              className="w-14 h-14 object-cover rounded-md mb-1"
            />
            <p className="font-semibold">${((item as any).total_price || 0).toFixed(2)}</p>
          </div>
        </div>
      );
      })}
      <div className="mt-6 flex justify-between text-lg font-semibold">
        <span>{t('Total:')}</span>
        <span>${((cart as any).total || 0).toFixed(2)}</span>
      </div>
    </div>
  );
};
