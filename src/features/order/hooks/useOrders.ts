"use client";

import { useMemo, useState, useEffect } from "react";
import { Order } from "@/types/order";
import {
  getCustomerOrder,
  getCustomerOrders,
  type CustomerOrderListFilters,
} from "@/lib/api/orders";

export function useOrders(filters: CustomerOrderListFilters = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerOrders(filters);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterKey]);

  return { orders, loading, error, refreshOrders: fetchOrders };
}

export async function getOrder(id: number): Promise<Order> {
  return getCustomerOrder(id);
}
