import { apiClient } from "@/lib/api/client";

export type AdminCustomer = {
  id: string;
  email: string;
  username: string | null;
  status: string;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  orders_count: number;
  total_spent: string;
};

export type AdminCustomersResponse = {
  items: AdminCustomer[];
  count: number;
  next: string | null;
  previous: string | null;
};

export type AdminCustomerFilters = {
  page?: number;
  pageSize?: number;
  ordering?: string;
  search?: string;
  status?: string;
};

export type AdminCustomerOrder = {
  id: number;
  status: string;
  payment_status: string | null;
  total_amount: string;
  currency: string;
  created_at: string;
};

export type AdminCustomerNote = {
  id: number;
  user: string;
  kind: string;
  note: string;
  actor: string | null;
  actor_email: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminCustomerTimelineEvent = {
  kind: string;
  at: string;
  title: string;
  payload: Record<string, any>;
};

export async function getAdminCustomers(filters: AdminCustomerFilters = {}): Promise<AdminCustomersResponse> {
  const params: Record<string, string> = {};
  if (filters.page) params.page = String(filters.page);
  if (filters.pageSize) params.page_size = String(filters.pageSize);
  if (filters.ordering) params.ordering = filters.ordering;
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;

  const response = await apiClient.get("/api/accounts/admin-customers/", { params });
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

export async function getAdminCustomer(customerId: string): Promise<AdminCustomer> {
  const response = await apiClient.get(`/api/accounts/admin-customers/${customerId}/`);
  return response.data;
}

export async function getAdminCustomerOrders(customerId: string): Promise<AdminCustomerOrder[]> {
  const response = await apiClient.get(`/api/accounts/admin-customers/${customerId}/orders/`);
  return response.data?.orders || [];
}

export async function setAdminCustomerStatus(customerId: string, status: string): Promise<AdminCustomer> {
  const response = await apiClient.post(`/api/accounts/admin-customers/${customerId}/set-status/`, { status });
  return response.data;
}

export async function getAdminCustomerNotes(customerId: string): Promise<AdminCustomerNote[]> {
  const response = await apiClient.get(`/api/accounts/admin-customers/${customerId}/notes/`);
  return response.data?.notes || [];
}

export async function createAdminCustomerNote(customerId: string, payload: { kind?: string; note: string }): Promise<AdminCustomerNote> {
  const response = await apiClient.post(`/api/accounts/admin-customers/${customerId}/notes/`, payload);
  return response.data;
}

export async function updateAdminCustomerNote(
  customerId: string,
  noteId: number,
  payload: { kind?: string; note?: string }
): Promise<AdminCustomerNote> {
  const response = await apiClient.patch(`/api/accounts/admin-customers/${customerId}/notes/${noteId}/`, payload);
  return response.data;
}

export async function deleteAdminCustomerNote(customerId: string, noteId: number): Promise<void> {
  await apiClient.delete(`/api/accounts/admin-customers/${customerId}/notes/${noteId}/`);
}

export async function getAdminCustomerTimeline(customerId: string): Promise<AdminCustomerTimelineEvent[]> {
  const response = await apiClient.get(`/api/accounts/admin-customers/${customerId}/timeline/`);
  return response.data?.events || [];
}
