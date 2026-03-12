"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useOrders } from "@/features/order/hooks/useOrders";
import Link from "next/link";
import { Order } from "@/types/order";
import { useTranslation } from "react-i18next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Package, RefreshCw, Search, ChevronRight, ChevronLeft } from "lucide-react";
import styles from "./page.module.css";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  "ALL", "CREATED", "PAYMENT_PENDING", "PAID", "PAYMENT_FAILED",
  "FULFILLMENT_PENDING", "BACKORDERED", "SHIPPED", "DELIVERED",
  "LOST", "RETURNED_TO_SENDER", "CANCELLED", "REFUNDED",
];

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const formatMoney = (value?: string) => {
  if (!value) return "0.00";
  const n = Number(value);
  return Number.isNaN(n) ? value : n.toFixed(2);
};

type StatusTone = { bg: string; text: string; dot: string };
const getStatusTone = (status: string): StatusTone => {
  switch (status) {
    case "PAID": case "DELIVERED": return { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" };
    case "PAYMENT_PENDING": case "FULFILLMENT_PENDING": return { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" };
    case "BACKORDERED": return { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" };
    case "LOST": case "RETURNED_TO_SENDER": return { bg: "#fff1f2", text: "#9f1239", dot: "#fb7185" };
    case "PAYMENT_FAILED": case "CANCELLED": case "REFUNDED": return { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" };
    case "SHIPPED": return { bg: "#f5f3ff", text: "#5b21b6", dot: "#8b5cf6" };
    default: return { bg: "#f8fafc", text: "#334155", dot: "#94a3b8" };
  }
};

export default function AccountOrdersPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Reset to page 1 when filter changes
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const filters = useMemo(
    () => ({
      ordering: "-created_at",
      page,
      page_size: PAGE_SIZE,
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    }),
    [statusFilter, page]
  );
  const { orders, loading, error, totalCount, hasNext, hasPrev, refreshOrders } = useOrders(filters);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const onFocus = useCallback(() => { refreshOrders(); }, [refreshOrders]);
  useEffect(() => {
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [onFocus]);

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    return orders.filter(
      (o) =>
        String(o.id).includes(search.trim()) ||
        (o.order_number || "").toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [orders, search]);

  // Build page numbers to display (max 5 visible with ellipsis)
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  if (loading) {
    return (
      <AccountLayout>
        <div className={styles.loadingWrap}>
          <p className={styles.loadingText}>{t("Loading your orders...")}</p>
        </div>
      </AccountLayout>
    );
  }

  if (error) {
    const is401 = error.includes("401") || error.toLowerCase().includes("authentication");
    if (is401) {
      return (
        <AccountLayout>
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon}><Package size={32} color="#a3a3a3" /></div>
            <h2 className={styles.emptyTitle}>{t("Sign in to view your orders")}</h2>
            <p className={styles.emptyText}>{t("You need to be logged in to see your order history.")}</p>
            <Link href="/auth/login?callbackUrl=/account/orders" className={styles.authBtn}>
              {t("Sign In")}
            </Link>
          </div>
        </AccountLayout>
      );
    }
    return (
      <AccountLayout>
        <div className={styles.errorWrap}>
          <p className={styles.errorText}>{error}</p>
        </div>
      </AccountLayout>
    );
  }

  if (totalCount === 0) {
    return (
      <AccountLayout>
        <div className={styles.emptyWrap}>
          <div className={styles.emptyIcon}><Package size={32} color="#a3a3a3" /></div>
          <h2 className={styles.emptyTitle}>{t("No orders yet")}</h2>
          <p className={styles.emptyText}>{t("When you place an order, it will appear here.")}</p>
          <Link href="/shop" className={styles.authBtn}>{t("Start Shopping")}</Link>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className={styles.wrapper}>
        {/* ─── Header ─── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{t("Your Orders")}</h1>
            <p className={styles.subtitle}>{t("Track order status, totals, and updates.")}</p>
          </div>
          <button onClick={refreshOrders} className={styles.refreshBtn}>
            <RefreshCw size={14} /> {t("Refresh")}
          </button>
        </div>

        {/* ─── Filter Bar ─── */}
        <div className={styles.filterBar}>
          <div className={styles.inputWrap}>
            <span className={styles.searchIcon}><Search size={15} /></span>
            <input
              type="text"
              placeholder={t("Search by order number")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            aria-label={t("Order status filter")}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={styles.statusSelect}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? t("All statuses") : s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {/* ─── Order Cards ─── */}
        <div className={styles.list}>
          {filteredOrders.map((order: Order) => {
            const tone = getStatusTone(order.status);
            return (
              <Link key={order.id} href={`/account/orders/${order.id}`} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <p className={styles.orderLabel}>{t("Order")}</p>
                    <p className={styles.orderNum}>{order.order_number || `#${order.id}`}</p>
                    <p className={styles.orderDate}>{t("Placed")} {formatDate(order.created_at)}</p>
                  </div>
                  <div className={styles.rightCol}>
                    <span className={styles.badge} style={{ background: tone.bg, color: tone.text }}>
                      <span className={styles.badgeDot} style={{ background: tone.dot }} />
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <div className={styles.totalBlock}>
                      <p className={styles.totalLabel}>{t("Total")}</p>
                      <p className={styles.totalValue}>${formatMoney(order.total_amount)}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.cardBottom}>
                  <p className={styles.paymentText}>
                    {order.payment_provider ? `${t("Payment")}: ${order.payment_provider}` : t("Payment pending")}
                  </p>
                  <span className={styles.viewLink}>
                    {t("View Details")} <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Orders pagination">
            <button
              className={styles.pageBtn}
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> {t("Previous")}
            </button>

            <div className={styles.pageNumbers}>
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              className={styles.pageBtn}
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("Next")} <ChevronRight size={16} />
            </button>
          </nav>
        )}

        {/* ─── Summary ─── */}
        <p className={styles.paginationInfo}>
          {t("Showing")} {filteredOrders.length} {t("of")} {totalCount} {t("orders")}
        </p>
      </div>
    </AccountLayout>
  );
}
