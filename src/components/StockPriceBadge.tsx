"use client";

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import type { VariantStockPrice } from "@/lib/api/stockPrice";

interface StockPriceBadgeProps {
  /** Live data for the selected variant (from useStockPrice) */
  live: VariantStockPrice | undefined;
  /** Previously-displayed price (from the static product data) */
  displayedPrice?: number | string;
  /** Compact mode for cart rows */
  compact?: boolean;
}

/**
 * Renders inline stock-quantity warnings and price-change banners.
 * Designed to be placed next to the stock-status label on the PDP
 * and in each cart row.
 */
export function StockPriceBadge({
  live,
  displayedPrice,
  compact = false,
}: StockPriceBadgeProps) {
  const { t } = useTranslation();
  const toastedRef = useRef(false);

  // Detect price drift
  const priceChanged =
    live &&
    displayedPrice != null &&
    Number(live.price) !== Number(displayedPrice);

  // Toast once when price changes
  useEffect(() => {
    if (priceChanged && !toastedRef.current) {
      toastedRef.current = true;
      toast(
        t("The price for this item has been updated. Please review before proceeding."),
        { icon: "💰", duration: 5000 }
      );
    }
  }, [priceChanged, t]);

  if (!live) return null;

  const lowStock =
    live.stock_control === "finite" &&
    live.in_stock &&
    live.stock_quantity <= 5;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      {/* Out of stock */}
      {!live.in_stock && live.stock_control === "finite" && (
        <span className="rounded bg-red-100 px-2 py-0.5 font-medium text-red-700">
          {t("Out of Stock")}
        </span>
      )}

      {/* Low stock warning */}
      {lowStock && (
        <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
          {t("Only {{count}} left", { count: live.stock_quantity })}
        </span>
      )}

      {/* Price changed */}
      {priceChanged && (
        <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
          {t("Price updated to {{price}}", {
            price: new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(Number(live.price)),
          })}
        </span>
      )}

      {/* Preorder */}
      {live.stock_control === "preorder" && (
        <span className="rounded bg-purple-100 px-2 py-0.5 font-medium text-purple-700">
          {t("Pre-order")}
        </span>
      )}
    </div>
  );
}
