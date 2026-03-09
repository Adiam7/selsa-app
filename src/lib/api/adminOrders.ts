import { apiClient } from '@/lib/api/client';
import type { Order } from '@/types/order';

export type AdminAuditLog = {
  id: number;
  order_id: number;
  actor: number | null;
  actor_email: string | null;
  action: string;
  status_from: string | null;
  status_to: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
};

export type AdminAuditLogFilters = {
  orderId?: number | string;
  action?: string;
  actorId?: number | string;
  actorEmail?: string;
  page?: number;
  pageSize?: number;
};

export type AdminAuditLogResponse = {
  items: AdminAuditLog[];
  count: number;
  next: string | null;
  previous: string | null;
};

export type AdminOrderFilters = {
  limit?: number;
  ordering?: string;
  page?: number;
  pageSize?: number;
  status?: string;
};

export type AdminOrdersResponse = {
  items: Order[];
  count: number;
  next: string | null;
  previous: string | null;
};

export async function getAdminAuditLogs(filters: AdminAuditLogFilters = {}): Promise<AdminAuditLogResponse> {
  const params: Record<string, string> = {};

  if (filters.orderId) {
    params.order_id = String(filters.orderId);
  }
  if (filters.action) {
    params.action = filters.action;
  }
  if (filters.actorId) {
    params.actor = String(filters.actorId);
  }
  if (filters.actorEmail) {
    params.actor_email = filters.actorEmail;
  }
  if (filters.page) {
    params.page = String(filters.page);
  }
  if (filters.pageSize) {
    params.page_size = String(filters.pageSize);
  }

  const response = await apiClient.get('/orders/admin-audit-logs/', { params });
  const data = response.data;
  if (Array.isArray(data)) {
    return {
      items: data,
      count: data.length,
      next: null,
      previous: null,
    };
  }

  const items = data.results || data;
  return {
    items,
    count: data.count ?? items.length,
    next: data.next ?? null,
    previous: data.previous ?? null,
  };
}

export async function getAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminOrdersResponse> {
  const params: Record<string, string> = {};
  if (filters.limit) {
    params.limit = String(filters.limit);
  }
  if (filters.ordering) {
    params.ordering = filters.ordering;
  }
  if (filters.page) {
    params.page = String(filters.page);
  }
  if (filters.pageSize) {
    params.page_size = String(filters.pageSize);
  }
  if (filters.status) {
    params.status = filters.status;
  }

  const response = await apiClient.get('/orders/admin-orders/', { params });
  const data = response.data;
  if (Array.isArray(data)) {
    return {
      items: data,
      count: data.length,
      next: null,
      previous: null,
    };
  }

  const items = data.results || data;
  return {
    items,
    count: data.count ?? items.length,
    next: data.next ?? null,
    previous: data.previous ?? null,
  };
}

export async function getAdminOrder(orderId: number): Promise<Order> {
  const response = await apiClient.get(`/orders/admin-orders/${orderId}/`);
  return response.data;
}

export async function adminUpdateOrderStatus(orderId: number, payload: {
  status: string;
  tracking_number?: string;
  carrier?: string;
  carrier_url?: string;
  location?: string;
  message?: string;
}): Promise<Order> {
  const response = await apiClient.post(`/orders/admin-orders/${orderId}/update-status/`, payload);
  return response.data;
}

export async function adminCancelOrder(orderId: number, reason?: string): Promise<Order> {
  const response = await apiClient.post(`/orders/admin-orders/${orderId}/cancel/`, {
    reason: reason || '',
  });
  return response.data;
}

export async function adminRefundOrder(orderId: number, reason?: string): Promise<Order> {
  const response = await apiClient.post(`/orders/admin-orders/${orderId}/refund/`, {
    reason: reason || '',
  });
  return response.data;
}

export async function adminResendShippingEmail(orderId: number): Promise<{ success: boolean }> {
  const response = await apiClient.post(`/orders/admin-orders/${orderId}/resend-shipping/`, {});
  return response.data;
}

export type AdminBulkResult = {
  order_id: number;
  success: boolean;
  error?: string | null;
};

export async function adminBulkUpdateStatus(payload: {
  order_ids: number[];
  status: string;
  tracking_number?: string;
  carrier?: string;
  carrier_url?: string;
  location?: string;
  message?: string;
}): Promise<AdminBulkResult[]> {
  const response = await apiClient.post('/orders/admin-orders/bulk-update-status/', payload);
  return response.data.results || [];
}

export async function adminBulkCancel(payload: {
  order_ids: number[];
  reason?: string;
}): Promise<AdminBulkResult[]> {
  const response = await apiClient.post('/orders/admin-orders/bulk-cancel/', payload);
  return response.data.results || [];
}

export async function adminBulkRefund(payload: {
  order_ids: number[];
  reason?: string;
}): Promise<AdminBulkResult[]> {
  const response = await apiClient.post('/orders/admin-orders/bulk-refund/', payload);
  return response.data.results || [];
}
