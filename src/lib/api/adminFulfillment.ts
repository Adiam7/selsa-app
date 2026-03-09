/**
 * Admin Fulfillment API — maps to the backend AdminFulfillmentViewSet
 * at /orders/admin-fulfillment/
 */
import { apiClient } from '@/lib/api/client';
import type { Order } from '@/types/order';

// ── Types ────────────────────────────────────────────────────────────────────

export type FulfillmentPipeline = {
  fulfillment_pipeline: Record<string, number>;
  printful_sync: Record<string, number>;
  total_in_pipeline: number;
};

export type FulfillmentOrdersResponse = {
  items: Order[];
  count: number;
  next: string | null;
  previous: string | null;
};

export type PrintfulStatusResponse = {
  printful_status: string;
  printful_order_id?: number | null;
  fulfillment_status?: string;
  tracking_number?: string;
  carrier?: string;
  sent_at?: string | null;
  retry_count?: number;
  error_message?: string;
  events?: Array<{
    type: string;
    created_at: string;
    details: Record<string, any>;
  }>;
};

export type PrintfulSubmitResult = {
  status: string;
  printful_order_id?: number;
  error?: string;
};

// ── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch orders in the fulfillment pipeline (PAID, FULFILLMENT_PENDING, BACKORDERED, SHIPPED).
 */
export async function getFulfillmentOrders(filters: {
  stage?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<FulfillmentOrdersResponse> {
  const params: Record<string, string> = {};
  if (filters.stage && filters.stage !== 'ALL') params.stage = filters.stage;
  if (filters.page) params.page = String(filters.page);
  if (filters.pageSize) params.page_size = String(filters.pageSize);

  const response = await apiClient.get('/orders/admin-fulfillment/', { params });
  const data = response.data;

  if (Array.isArray(data)) {
    return { items: data, count: data.length, next: null, previous: null };
  }
  const items = data.results || data;
  return {
    items,
    count: data.count ?? items.length,
    next: data.next ?? null,
    previous: data.previous ?? null,
  };
}

/**
 * Get fulfillment pipeline counts by stage + Printful sync stats.
 */
export async function getFulfillmentPipeline(): Promise<FulfillmentPipeline> {
  const response = await apiClient.get('/orders/admin-fulfillment/pipeline/');
  return response.data;
}

/**
 * Submit a single order to Printful for fulfillment.
 */
export async function submitToPrintful(orderId: number): Promise<PrintfulSubmitResult> {
  const response = await apiClient.post(`/orders/admin-fulfillment/${orderId}/submit-to-printful/`);
  return response.data;
}

/**
 * Retry a failed Printful submission.
 */
export async function retryPrintful(orderId: number): Promise<PrintfulSubmitResult> {
  const response = await apiClient.post(`/orders/admin-fulfillment/${orderId}/retry-printful/`);
  return response.data;
}

/**
 * Manually mark an order as shipped (non-Printful fulfillment).
 */
export async function markOrderShipped(orderId: number, payload: {
  tracking_number?: string;
  carrier?: string;
  message?: string;
}): Promise<{ status: string; order_id: number }> {
  const response = await apiClient.post(
    `/orders/admin-fulfillment/${orderId}/mark-shipped/`, payload,
  );
  return response.data;
}

/**
 * Manually mark an order as delivered.
 */
export async function markOrderDelivered(orderId: number): Promise<{ status: string; order_id: number }> {
  const response = await apiClient.post(`/orders/admin-fulfillment/${orderId}/mark-delivered/`);
  return response.data;
}

/**
 * Mark an order as backordered.
 */
export async function markOrderBackordered(orderId: number, reason?: string): Promise<{ status: string; order_id: number }> {
  const response = await apiClient.post(
    `/orders/admin-fulfillment/${orderId}/mark-backordered/`,
    { reason: reason || '' },
  );
  return response.data;
}

/**
 * Get Printful sync status for a specific order.
 */
export async function getPrintfulStatus(orderId: number): Promise<PrintfulStatusResponse> {
  const response = await apiClient.get(`/orders/admin-fulfillment/${orderId}/printful-status/`);
  return response.data;
}
