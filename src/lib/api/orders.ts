import type { Order } from '@/types/order';
import { apiClient } from '@/lib/api/client';
import { getSession } from 'next-auth/react';

export type OrderRecipient = {
  country_code: string;
  state_code?: string;
  zip: string;
};

export type OrderExpectedTotals = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

export type OrderAddressSnapshot = {
  full_name?: string;
  phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

export type OrderVerificationPayload = {
  recipient: OrderRecipient;
  shipping_method: string;
  expected_totals: OrderExpectedTotals;
  currency?: string;
  payment_provider?: string;
  payment_reference?: string;
  payment_status?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: OrderAddressSnapshot;
  billing_address?: OrderAddressSnapshot;
  coupon_code?: string;
};

export type CheckoutErrorCode =
  | 'cart_empty'
  | 'inventory_unavailable'
  | 'checkout_failed'
  | 'price_changed'
  | 'idempotency_in_progress'
  | 'internal_error';

type CreateOrderInput = {
  cartId: number;
  verification?: OrderVerificationPayload;
  idempotencyKey?: string;
};

export type CustomerOrderListFilters = {
  status?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export type PaginatedOrders = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
};

export type CheckoutError = Error & {
  code?: CheckoutErrorCode;
  step?: string;
  details?: Array<{ variant_id: number; sku?: string; available: number; requested: number }>;
  totals?: Record<string, string>;
  status?: number;
};

export const createOrder = async (
  input: CreateOrderInput
): Promise<Order> => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const url = `${base}/cart/${input.cartId}/checkout/`;
  console.log('[createOrder] cartId=', input.cartId, 'url=', url, 'verification=', JSON.stringify(input.verification)?.slice(0, 200));

  // Get the session token to authenticate the checkout request
  const session = await getSession();
  const accessToken = (session?.user as any)?.accessToken;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      ...(input.idempotencyKey ? { 'Idempotency-Key': input.idempotencyKey } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(input.verification ?? {}),
  });

  if (!res.ok) {
    let data: any = {};
    try { data = await res.json(); } catch { /* ignore */ }
    const message = data.error || data.message || 'Failed to create order.';
    console.error('[createOrder] FAILED status=', res.status, 'code=', data.code, 'error=', message);

    const err = new Error(message) as CheckoutError;
    err.code = data.code;
    err.step = data.step;
    err.details = data.details;
    err.totals = data.totals;
    err.status = res.status;
    throw err;
  }

  const order: Order = await res.json();
  console.log('[createOrder] SUCCESS order=', order?.id, order?.order_number);
  return order;
};

export const getCustomerOrders = async (
  filters: CustomerOrderListFilters = {}
): Promise<PaginatedOrders> => {
  const res = await apiClient.get('/orders/orders/', { params: filters });
  // Support both paginated {results, count, ...} and plain array responses
  if (res.data.results) return res.data as PaginatedOrders;
  return { count: res.data.length, next: null, previous: null, results: res.data };
};

export const getCustomerOrder = async (orderId: number): Promise<Order> => {
  const res = await apiClient.get(`/orders/orders/${orderId}/`);
  return res.data;
};

export const cancelCustomerOrder = async (
  orderId: number,
  reason?: string
): Promise<Order> => {
  const res = await apiClient.post(`/orders/orders/${orderId}/cancel/`, {
    reason: reason || '',
  });
  return res.data;
};

export const refundCustomerOrder = async (
  orderId: number,
  reasonCode: string,
  reasonText?: string
): Promise<Order> => {
  const res = await apiClient.post(`/orders/orders/${orderId}/refund/`, {
    reason_code: reasonCode,
    reason_text: reasonText || '',
  });
  return res.data;
};

export const requestCustomerReturn = async (
  orderId: number,
  reasonCode: string,
  reasonText?: string
): Promise<Order> => {
  const res = await apiClient.post(`/orders/orders/${orderId}/return-request/`, {
    reason_code: reasonCode,
    reason_text: reasonText || '',
  });
  return res.data;
};

export const cancelCustomerRequest = async (
  orderId: number,
  kind: 'REFUND' | 'RETURN'
): Promise<Order> => {
  const res = await apiClient.post(`/orders/orders/${orderId}/cancel-request/`, { kind });
  return res.data;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadOrderInvoice = async (orderId: number, filename?: string) => {
  const res = await apiClient.get(`/orders/orders/${orderId}/invoice/`, {
    responseType: 'blob',
  });
  const name = filename || `invoice-order-${orderId}.pdf`;
  downloadBlob(res.data as Blob, name);
};

export const downloadOrderReceipt = async (orderId: number, filename?: string) => {
  const res = await apiClient.get(`/orders/orders/${orderId}/receipt/`, {
    responseType: 'blob',
  });
  const name = filename || `receipt-order-${orderId}.pdf`;
  downloadBlob(res.data as Blob, name);
};
