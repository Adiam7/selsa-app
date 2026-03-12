export type OrderItem = {
  id: number;
  product?: any;
  quantity: number;
  price: string; // decimal
  line_total?: string;
  image_url?: string | null;
  product_name_snapshot?: Record<string, string> | string | null;
  variant_sku?: string | null;
  variant_external_id?: string | null;
  subtotal?: string;
};

export type ReturnRefundRequest = {
  id: number;
  order?: number;
  user?: number;
  kind: "RETURN" | "REFUND";
  status:
    | "REQUESTED"
    | "APPROVED"
    | "REJECTED"
    | "RECEIVED"
    | "REFUND_INITIATED"
    | "REFUNDED"
    | "CANCELLED";
  reason_code: "DAMAGED" | "WRONG_ITEM" | "CHANGED_MIND" | "INCORRECT_SIZE" | "NOT_AS_DESCRIBED" | "LATE_DELIVERY" | "OTHER";
  reason_text: string;
  refund_amount?: string | null;
  provider_refund_id?: string;
  approved_by?: number | null;
  approved_at?: string | null;
  resolved_by?: number | null;
  resolved_at?: string | null;
  admin_note?: string;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: number;
  order_number?: string;
  status:
    | 'CREATED'
    | 'PAYMENT_PENDING'
    | 'PAID'
    | 'PAYMENT_FAILED'
    | 'CANCELLED'
    | 'FULFILLMENT_PENDING'
    | 'BACKORDERED'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'LOST'
    | 'RETURNED_TO_SENDER'
    | 'REFUNDED';
  currency?: string;
  subtotal_amount?: string;
  shipping_amount?: string;
  tax_amount?: string;
  discount_amount?: string;
  created_at: string;
  updated_at: string;
  total_amount: string;
  shipping_method?: string | null;
  payment_provider?: string | null;
  payment_reference?: string | null;
  payment_status?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address_snapshot?: Record<string, any> | null;
  billing_address_snapshot?: Record<string, any> | null;
  items: OrderItem[];
  active_refund_request?: ReturnRefundRequest | null;
  active_return_request?: ReturnRefundRequest | null;
  return_instructions?: {
    message: string;
    address?: {
      company?: string;
      address_line_1?: string;
      address_line_2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  } | null;

  invoice_available?: boolean;
  receipt_available?: boolean;
  invoice_number?: string | null;
  receipt_number?: string | null;
};
