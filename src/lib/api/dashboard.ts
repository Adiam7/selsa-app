import type { DashboardStats, Order, Product, DashboardCharts, DashboardFilters } from '@/features/dashboard/types';
import { getSession } from 'next-auth/react';
import { getCurrentLanguage } from '@/utils/fetchWithLanguage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
const DASHBOARD_BASE = `${API_BASE}/dashboard`;

async function getAuthHeaders() {
  let token: string | null = null;
  try {
    const session = await getSession();
    token = (session?.user as any)?.accessToken ?? null;
  } catch {
    // ignore
  }
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    'Accept-Language': getCurrentLanguage(),
  } as Record<string, string>;
}

function buildQueryParams(filters: any): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export const dashboardAPI = {
  async getStats(filters: DashboardFilters): Promise<DashboardStats> {
    const queryString = buildQueryParams({
      date_range: filters.dateRange,
      start_date: filters.startDate,
      end_date: filters.endDate,
    });

    const url = `${DASHBOARD_BASE}/stats/?${queryString}`;
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async getOrders(filters: DashboardFilters): Promise<Order[]> {
    const queryString = buildQueryParams({
      date_range: filters.dateRange,
      status: filters.status,
      search: filters.search,
      ordering: `-${filters.sortBy || 'created_at'}`,
      limit: 50,
    });

    const url = `${API_BASE}/api/catalog/orders/?${queryString}`;
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    return data.results || data;
  },

  async getTopProducts(filters: DashboardFilters): Promise<Product[]> {
    const queryString = buildQueryParams({
      date_range: filters.dateRange,
      limit: 20,
    });

    const url = `${DASHBOARD_BASE}/top-products/?${queryString}`;
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return data.results || data;
  },

  async getCharts(filters: DashboardFilters): Promise<DashboardCharts> {
    const queryString = buildQueryParams({
      date_range: filters.dateRange,
      start_date: filters.startDate,
      end_date: filters.endDate,
    });

    const url = `${DASHBOARD_BASE}/charts/?${queryString}`;
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch charts');
    return response.json();
  },

  async exportReport(format: 'csv' | 'pdf', filters?: DashboardFilters & { report_type?: string }): Promise<Blob> {
    const queryString = buildQueryParams({
      format,
      report_type: filters?.report_type,
      ...filters,
    });

    const url = `${DASHBOARD_BASE}/export/?${queryString}`;
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to export report');
    return response.blob();
  },

  async getOrderDetails(orderId: number): Promise<any> {
    const response = await fetch(`${API_BASE}/api/catalog/orders/${orderId}/`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch order details');
    return response.json();
  },

  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    const response = await fetch(`${API_BASE}/api/catalog/orders/${orderId}/`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error('Failed to update order status');
    return response.json();
  },
};
