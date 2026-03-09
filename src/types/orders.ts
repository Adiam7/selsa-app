import { ProductVariant } from './cart';

export type OrderStatus = 'pending' | 'completed' | 'canceled' | 'refunded';
export type PaymentStatus = 'succeeded' | 'failed';

export type OrderItem = {
  id: number;
  product_variant: ProductVariant;
  quantity: number;
  price: number;
  total_price: number; // computed as price * quantity
};

export type Order = {
  id: number;
  user?: number | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  total_amount: number;
  items: OrderItem[];
  payment?: Payment;
};

export type Payment = {
  id: number;
  order: number;
  stripe_payment_intent: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
};
