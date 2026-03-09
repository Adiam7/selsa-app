export interface DashboardStats {
  total_revenue: number;
  revenue_change: number;
  total_orders: number;
  orders_change: number;
  active_customers: number;
  customers_change: number;
  avg_order_value: number;
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
  avg_customer_lifetime_value: number;
  repeat_purchase_rate: number;
  avg_satisfaction_score: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: string;
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'canceled';
  created_at: string;
  updated_at: string;
  items_count: number;
  payment_method: string;
}

export interface Product {
  id: number;
  name: string;
  sales_count: number;
  revenue: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  image_url?: string;
  trending: boolean;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  cumulative?: number;
}

export interface DashboardCharts {
  revenue_trend: ChartDataPoint[];
  order_trend: ChartDataPoint[];
  order_status_distribution: { status: string; count: number }[];
  customer_acquisition: ChartDataPoint[];
  top_categories: { name: string; value: number }[];
}

export interface DashboardFilters {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  status?: string;
  search?: string;
  sortBy?: 'date' | 'revenue' | 'orders';
  startDate?: string;
  endDate?: string;
}
