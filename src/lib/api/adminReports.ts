import { apiClient } from "@/lib/api/client";

export type DashboardStats = {
  total_revenue: string;
  revenue_change: number;
  total_orders: number;
  orders_change: number;
  active_customers: number;
  customers_change: number;
  avg_order_value: string;
  aov_change: number;
  conversion_rate: number;
  conversion_change: number;
  pending_orders: number;
  pending_change: number;
  completed_orders: number;
  refunded_orders: number;
  new_customers: number;
  returning_customers: number;
  vip_customers: number;
  avg_customer_lifetime_value: string;
  repeat_purchase_rate: number;
  avg_satisfaction_score: number;
};

export async function getDashboardStats(params?: {
  date_range?: string;
  start_date?: string;
  end_date?: string;
}): Promise<DashboardStats> {
  const res = await apiClient.get("/api/dashboard/stats/", { params });
  return res.data;
}

export async function exportDashboardReport(params: {
  format: "csv" | "pdf";
  date_range?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Blob> {
  const res = await apiClient.get("/api/dashboard/export/", {
    params,
    responseType: "blob",
  });
  return res.data;
}
