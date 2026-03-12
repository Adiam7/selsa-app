/**
 * Real-time stock & price freshness API
 *
 * Polls GET /api/catalog/stock-prices/?variant_ids=...&product_id=...
 * and returns the latest stock/price data.
 */

import { apiClient } from "./client";

export interface VariantStockPrice {
  id: number;
  external_id: string | null;
  price: string;
  stock_quantity: number;
  stock_control: "finite" | "infinite" | "preorder";
  is_available: boolean;
  in_stock: boolean;
}

export interface StockPriceResponse {
  variants: VariantStockPrice[];
  timestamp: string;
}

/** Fetch live stock/price for a set of variant IDs */
export async function fetchStockPrices(
  variantIds: number[]
): Promise<StockPriceResponse> {
  const res = await apiClient.get<StockPriceResponse>(
    "/catalog/stock-prices/",
    { params: { variant_ids: variantIds.join(",") } }
  );
  return res.data;
}

/** Fetch live stock/price for all variants of a product */
export async function fetchStockPricesByProduct(
  productId: number
): Promise<StockPriceResponse> {
  const res = await apiClient.get<StockPriceResponse>(
    "/catalog/stock-prices/",
    { params: { product_id: productId } }
  );
  return res.data;
}
