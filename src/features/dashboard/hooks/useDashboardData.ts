import { useEffect, useState, useCallback } from 'react';
import { dashboardAPI } from '@/lib/api/dashboard';
import type { DashboardStats, DashboardCharts, Order, Product } from '../types';
import { getSession } from 'next-auth/react';

interface UseDashboardDataParams {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface UseDashboardDataReturn {
  stats: DashboardStats | null;
  orders: Order[];
  products: Product[];
  charts: DashboardCharts | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useDashboardData(params: UseDashboardDataParams): UseDashboardDataReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🟡 Fetching dashboard data...');
        setIsLoading(true);
        setError(null);

        const session = await getSession();
        if (!session?.user) {
          throw new Error('Not authenticated');
        }

        // Fetch all data in parallel
        const [statsData, ordersData, productsData, chartsData] = await Promise.all([
          dashboardAPI.getStats(params),
          dashboardAPI.getOrders(params),
          dashboardAPI.getTopProducts(params),
          dashboardAPI.getCharts(params),
        ]);

        console.log('🟢 Dashboard data fetched successfully');
        setStats(statsData);
        setOrders(ordersData);
        setProducts(productsData);
        setCharts(chartsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
        console.error('❌ Dashboard fetch error:', errorMessage);
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    // Only fetch if not already initialized
    if (!hasInitialized) {
      fetchData();
    }
  }, [hasInitialized]);

  const refetch = useCallback(async () => {
    try {
      console.log('🔄 Refetching dashboard data...');
      setIsLoading(true);
      setError(null);

      const session = await getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const [statsData, ordersData, productsData, chartsData] = await Promise.all([
        dashboardAPI.getStats(params),
        dashboardAPI.getOrders(params),
        dashboardAPI.getTopProducts(params),
        dashboardAPI.getCharts(params),
      ]);

      console.log('🟢 Dashboard data refetched successfully');
      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData);
      setCharts(chartsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('❌ Dashboard refetch error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  return {
    stats,
    orders,
    products,
    charts,
    isLoading,
    error,
    refetch,
  };
}
