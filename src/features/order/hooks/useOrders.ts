"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Order } from "@/types/order";
import {
  getCustomerOrder,
  getCustomerOrders,
  type CustomerOrderListFilters,
  type PaginatedOrders,
} from "@/lib/api/orders";

export function useOrders(filters: CustomerOrderListFilters = {}) {
  const { status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: PaginatedOrders = await getCustomerOrders(filters);
      setOrders(data.results);
      setTotalCount(data.count);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    // Only fetch once the session is confirmed — avoids 401 race on hydration.
    // AccountLayout already handles unauthenticated redirect, so we simply
    // keep loading=true until session resolves to "authenticated".
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [filterKey, status, fetchOrders]);

  return { orders, loading, error, totalCount, hasNext, hasPrev, refreshOrders: fetchOrders };
}

export async function getOrder(id: number): Promise<Order> {
  return getCustomerOrder(id);
}
