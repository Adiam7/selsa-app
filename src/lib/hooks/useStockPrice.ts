"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchStockPrices,
  fetchStockPricesByProduct,
  type VariantStockPrice,
} from "@/lib/api/stockPrice";

interface UseStockPriceOptions {
  /** Variant IDs to track (mutually exclusive with productId) */
  variantIds?: number[];
  /** Product ID to track all variants (mutually exclusive with variantIds) */
  productId?: number | null;
  /** Polling interval in ms. 0 = no polling. Default 30 000 (30s) */
  intervalMs?: number;
  /** Whether to start polling immediately. Default true */
  enabled?: boolean;
}

interface StockPriceState {
  /** Map of variant ID → latest data */
  variants: Map<number, VariantStockPrice>;
  /** Last server timestamp */
  timestamp: string | null;
  /** First load is pending */
  loading: boolean;
  /** Detected changes since last poll (variant IDs that changed) */
  changedIds: number[];
}

/**
 * Hook that polls the stock-prices endpoint and exposes live data.
 *
 * Returns helpers to check a specific variant and detect changes so
 * the UI can show warnings like "Price changed" or "Only 2 left".
 */
export function useStockPrice({
  variantIds,
  productId,
  intervalMs = 30_000,
  enabled = true,
}: UseStockPriceOptions) {
  const [state, setState] = useState<StockPriceState>({
    variants: new Map(),
    timestamp: null,
    loading: true,
    changedIds: [],
  });

  const prevRef = useRef<Map<number, VariantStockPrice>>(new Map());

  const poll = useCallback(async () => {
    try {
      const res =
        variantIds && variantIds.length > 0
          ? await fetchStockPrices(variantIds)
          : productId
          ? await fetchStockPricesByProduct(productId)
          : null;

      if (!res) return;

      const newMap = new Map<number, VariantStockPrice>();
      const changed: number[] = [];

      for (const v of res.variants) {
        newMap.set(v.id, v);
        const prev = prevRef.current.get(v.id);
        if (
          prev &&
          (prev.price !== v.price ||
            prev.is_available !== v.is_available ||
            prev.stock_quantity !== v.stock_quantity)
        ) {
          changed.push(v.id);
        }
      }

      prevRef.current = newMap;
      setState({
        variants: newMap,
        timestamp: res.timestamp,
        loading: false,
        changedIds: changed,
      });
    } catch {
      // Silent fail — stale data is still shown; next poll will retry
      setState((s) => ({ ...s, loading: false }));
    }
  }, [variantIds, productId]);

  useEffect(() => {
    if (!enabled) return;
    // Initial fetch
    poll();

    if (intervalMs <= 0) return;
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [poll, intervalMs, enabled]);

  /** Get live data for a single variant */
  const getVariant = useCallback(
    (id: number): VariantStockPrice | undefined => state.variants.get(id),
    [state.variants]
  );

  /** Clear the changedIds after the UI has shown a warning */
  const clearChanges = useCallback(() => {
    setState((s) => ({ ...s, changedIds: [] }));
  }, []);

  return {
    ...state,
    getVariant,
    clearChanges,
    refresh: poll,
  };
}
