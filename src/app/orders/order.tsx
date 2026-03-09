"use client";

import { useMemo, useState } from "react";
import { useOrders } from "@/features/order/hooks/useOrders";
import Link from "next/link";
import { Order } from "@/types/order";
import { useTranslation } from "react-i18next";

const STATUS_OPTIONS = [
  "ALL",
  "CREATED",
  "PAYMENT_PENDING",
  "PAID",
  "PAYMENT_FAILED",
  "FULFILLMENT_PENDING",
  "BACKORDERED",
  "SHIPPED",
  "DELIVERED",
  "LOST",
  "RETURNED_TO_SENDER",
  "CANCELLED",
  "REFUNDED",
];

const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
};

const formatMoney = (value?: string) => {
  if (!value) {
    return "0.00";
  }
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return value;
  }
  return numberValue.toFixed(2);
};

const getStatusTone = (status: string) => {
  switch (status) {
    case "PAID":
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "PAYMENT_PENDING":
    case "FULFILLMENT_PENDING":
      return "bg-amber-100 text-amber-800";
    case "BACKORDERED":
      return "bg-orange-100 text-orange-800";
    case "LOST":
    case "RETURNED_TO_SENDER":
      return "bg-rose-100 text-rose-800";
    case "PAYMENT_FAILED":
    case "CANCELLED":
    case "REFUNDED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const filters = useMemo(
    () => ({
      ordering: "-created_at",
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    }),
    [statusFilter]
  );
  const { orders, loading, error, refreshOrders } = useOrders(filters);

  const filteredOrders = useMemo(() => {
    if (!search) {
      return orders;
    }
    return orders.filter((order) =>
      String(order.id).includes(search.trim()) ||
      (order.order_number || '').toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [orders, search]);

  if (loading) return <p>{t('Loading your orders...')}</p>;
  if (error) {
    const is401 = error.includes('401') || error.toLowerCase().includes('authentication');
    if (is401) {
      return (
        <div className="max-w-md mx-auto p-6 text-center">
          <h2 className="text-xl font-bold mb-2">{t('Sign in to view your orders')}</h2>
          <p className="text-gray-500 mb-4">{t('You need to be logged in to see your order history.')}</p>
          <Link href="/auth/login?callbackUrl=/orders" className="inline-block px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            {t('Sign In')}
          </Link>
        </div>
      );
    }
    return <p className="text-red-600">{error}</p>;
  }
  if (orders.length === 0) return <p>{t('You have no orders yet.')}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('Your Orders')}</h1>
          <p className="text-sm text-gray-500">{t('Track order status, totals, and updates.')}</p>
        </div>
        <button
          onClick={refreshOrders}
          className="px-4 py-2 rounded-md border text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {t('Refresh')}
        </button>
      </div>

      <div className="bg-white border rounded-lg p-4 mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          placeholder={t('Search by order number')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="border rounded-md px-3 py-2 text-sm w-full md:w-64"
        />
          <select
            aria-label={t('Order status filter')}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="border rounded-md px-3 py-2 text-sm w-full md:w-56"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status === "ALL" ? t('All statuses') : status}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order: Order) => (
          <div key={order.id} className="border p-4 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('Order')}</p>
                <p className="text-lg font-semibold">{order.order_number || `#${order.id}`}</p>
                <p className="text-sm text-gray-500">{t('Placed')}: {formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusTone(order.status)}`}>
                  {order.status}
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{t('Total')}</p>
                  <p className="text-base font-semibold">${formatMoney(order.total_amount)}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <div>
                {order.payment_provider ? `${t('Payment')}: ${order.payment_provider}` : t('Payment pending')}
              </div>
              <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                {t('View Details')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
