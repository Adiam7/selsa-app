import { CartItem } from '@/types/cart';
import { useTranslation } from 'react-i18next';
import { getDisplayName } from '@/utils/i18nDisplay';
import { resolveBackendAssetUrl } from '@/lib/utils/utils';

type Props = {
  item: CartItem;
};



export const CartItemSummary = ({ item }: Props) => {
  const { t } = useTranslation();

  const price = Number(item.variant_detail?.price ?? item.product_price ?? 0);
  const quantity = item.quantity ?? 1;
  const total = price * quantity;

  const imageUrl =
    resolveBackendAssetUrl(item.product_image) ||
    resolveBackendAssetUrl(item.image_url) ||
    '';

  const sku = String(item.product_sku || item.variant_detail?.sku || '');
  const isBook = sku.startsWith('Book-');
  const productName =
    getDisplayName(item.variant?.product) ||
    getDisplayName({ name: item.product_name }) ||
    'Product';
  console.log('CART ITEM:', item);

  return (
    <div
      key={item.id}
      className="flex items-center justify-between py-3 border-b last:border-none"
    >
      {/* Image + name */}
      <div className="flex items-center gap-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={productName}
            className={`w-16 h-16 ${isBook ? 'object-contain' : 'object-cover'} rounded`}
            height={80}
            width={80}
          />
        )}
        <div>
          <p className="font-medium">{productName}</p>
          <p className="text-sm text-gray-500">{t('Price:$')}{price.toFixed(2)}{t('×')}{quantity}
          </p>
        </div>
      </div>
      {/* Line total */}
      <p className="font-semibold">{t('Total price:$')}{total.toFixed(2)}</p>
    </div>
  );
};
