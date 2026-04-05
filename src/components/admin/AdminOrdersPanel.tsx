"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { Order } from "@/types/order";
import {
  adminBulkCancel,
  adminBulkRefund,
  adminBulkUpdateStatus,
  adminResendShippingEmail,
  adminUpdateOrderStatus,
  getAdminOrders,
} from "@/lib/api/adminOrders";
import { useToast } from "@/components/Toast";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface AdminOrdersPanelProps {
  showHeader?: boolean;
  title?: string;
  description?: string;
  initialStatusFilter?: string;
  statusOptions?: string[];
  allowedBulkActions?: Array<"update-status" | "cancel" | "refund">;
  initialBulkAction?: "none" | "update-status" | "cancel" | "refund";
  initialBulkStatus?: string;
  enableRowShip?: boolean;
  rowShipTargetStatus?: "SHIPPED";
  rowShipEligibleStatuses?: string[];
  enableRowResendShippingEmail?: boolean;
  rowResendShippingEligibleStatuses?: string[];
}

export function AdminOrdersPanel({
  showHeader = true,
  title,
  description,
  initialStatusFilter,
  statusOptions,
  allowedBulkActions,
  initialBulkAction,
  initialBulkStatus,
  enableRowShip,
  rowShipTargetStatus = "SHIPPED",
  rowShipEligibleStatuses,
  enableRowResendShippingEmail,
  rowResendShippingEligibleStatuses,
}: AdminOrdersPanelProps) {
  const { success, warning, error: showError } = useToast();
  const { t } = useTranslation();
  const { status: sessionStatus } = useSession();
  const effectiveStatusOptions = statusOptions && statusOptions.length > 0 ? statusOptions : STATUS_OPTIONS;
  const effectiveBulkActions = allowedBulkActions && allowedBulkActions.length > 0
    ? allowedBulkActions
    : ["update-status", "cancel", "refund"] as const;
  const effectiveRowShipEligibleStatuses = rowShipEligibleStatuses && rowShipEligibleStatuses.length > 0
    ? rowShipEligibleStatuses
    : ["FULFILLMENT_PENDING"];
  const effectiveRowResendShippingEligibleStatuses = rowResendShippingEligibleStatuses && rowResendShippingEligibleStatuses.length > 0
    ? rowResendShippingEligibleStatuses
    : ["SHIPPED", "DELIVERED"];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || "ALL");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState(initialBulkAction || "none");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkStatus, setBulkStatus] = useState(initialBulkStatus || "");
  const [rowShipInputs, setRowShipInputs] = useState<Record<number, { carrier: string; tracking_number: string }>>({});
  const [rowShipLoading, setRowShipLoading] = useState<Record<number, boolean>>({});
  const [rowResendLoading, setRowResendLoading] = useState<Record<number, boolean>>({});
  const [bulkTracking, setBulkTracking] = useState({
    tracking_number: "",
    carrier: "",
    carrier_url: "",
    location: "",
    message: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  const filteredOrders = useMemo(() => {
    if (!search) {
      return orders;
    }
    const query = search.toLowerCase().trim();
    return orders.filter((order) => {
      const idMatch = String(order.id).includes(query);
      const emailMatch = (order.customer_email || "").toLowerCase().includes(query);
      return idMatch || emailMatch;
    });
  }, [orders, search]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrders({
        ordering: "-created_at",
        page,
        pageSize,
        ...(statusFilter === "ALL" ? {} : { status: statusFilter }),
      });
      const statusFiltered = statusFilter === "ALL"
        ? data.items
        : data.items.filter((order) => order.status === statusFilter);
      setOrders(statusFiltered);
      setSelectedOrders([]);
      setPageInfo({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to load orders.");
      setOrders([]);
      setPageInfo({ count: 0, next: null, previous: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    if (initialBulkAction) {
      setBulkAction(initialBulkAction);
    }
  }, [initialBulkAction]);

  useEffect(() => {
    if (typeof initialBulkStatus === "string") {
      setBulkStatus(initialBulkStatus);
    }
  }, [initialBulkStatus]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    loadOrders();
  }, [statusFilter, page, pageSize, sessionStatus]);

  const totalPages = Math.max(1, Math.ceil(pageInfo.count / pageSize));
  const hasNext = pageInfo.next ? true : page < totalPages;
  const hasPrevious = pageInfo.previous ? true : page > 1;

  const exportCsv = () => {
    const header = ["order_id", "customer_email", "status", "total", "created_at"];
    const rows = filteredOrders.map((order) => [
      order.id,
      order.customer_email || "",
      order.status,
      order.total_amount,
      order.created_at,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleOrder = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
      return;
    }
    setSelectedOrders(filteredOrders.map((order) => order.id));
  };

  const runBulkAction = async () => {
    if (selectedOrders.length === 0) {
      setError(t("Select at least one order."));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let results: { order_id: number; success: boolean; error?: string | null }[] = [];
      if (bulkAction === "update-status") {
        if (!bulkStatus) {
          setError(t("Select a status for the bulk update."));
          setLoading(false);
          return;
        }

        if (bulkStatus === "SHIPPED") {
          if (!bulkTracking.tracking_number || !bulkTracking.carrier) {
            setError(t("Carrier and tracking number are required to mark orders as SHIPPED."));
            setLoading(false);
            return;
          }
        }

        results = await adminBulkUpdateStatus({
          order_ids: selectedOrders,
          status: bulkStatus,
          ...bulkTracking,
        });
      }
      if (bulkAction === "cancel") {
        results = await adminBulkCancel({ order_ids: selectedOrders, reason: bulkReason || undefined });
      }
      if (bulkAction === "refund") {
        results = await adminBulkRefund({ order_ids: selectedOrders, reason: bulkReason || undefined });
      }

      const successCount = results.filter((item) => item.success).length;
      const failureCount = results.filter((item) => !item.success).length;

      if (failureCount === 0) {
        success(
          t("Bulk action completed for {{count}} orders.").replace(
            "{{count}}",
            String(successCount)
          )
        );
      } else if (successCount > 0) {
        warning(
          t("Bulk action completed with {{success}} successes and {{failed}} failures.")
            .replace("{{success}}", String(successCount))
            .replace("{{failed}}", String(failureCount))
        );
      } else {
        showError(t("Bulk action failed for all selected orders."));
      }

      await loadOrders();
    } catch (err: any) {
      setError(err?.message || t("Bulk action failed."));
      showError(err?.message || t("Bulk action failed."));
    } finally {
      setLoading(false);
    }
  };

  const setRowShipField = (orderId: number, field: "carrier" | "tracking_number", value: string) => {
    setRowShipInputs((prev) => ({
      ...prev,
      [orderId]: {
        carrier: prev[orderId]?.carrier || "",
        tracking_number: prev[orderId]?.tracking_number || "",
        [field]: value,
      },
    }));
  };

  const canRowShip = (order: Order) => {
    if (!enableRowShip) return false;
    return effectiveRowShipEligibleStatuses.includes(order.status);
  };

  const canRowResendShipping = (order: Order) => {
    if (!enableRowResendShippingEmail) return false;
    return effectiveRowResendShippingEligibleStatuses.includes(order.status);
  };

  const runRowShip = async (order: Order) => {
    const carrier = (rowShipInputs[order.id]?.carrier || "").trim();
    const trackingNumber = (rowShipInputs[order.id]?.tracking_number || "").trim();

    if (!carrier || !trackingNumber) {
      setError(t("Carrier and tracking number are required to mark an order as SHIPPED."));
      return;
    }

    setRowShipLoading((prev) => ({ ...prev, [order.id]: true }));
    setError(null);
    try {
      await adminUpdateOrderStatus(order.id, {
        status: rowShipTargetStatus,
        carrier,
        tracking_number: trackingNumber,
      });
      success(t("Order marked as shipped.") + ` (#${order.id})`);
      await loadOrders();
    } catch (err: any) {
      const message = err?.message || t("Failed to mark order as shipped.");
      setError(message);
      showError(message);
    } finally {
      setRowShipLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  const runRowResendShippingEmail = async (order: Order) => {
    setRowResendLoading((prev) => ({ ...prev, [order.id]: true }));
    setError(null);
    try {
      const result = await adminResendShippingEmail(order.id);
      if (result?.success) {
        success(t("Shipping email resent.") + ` (#${order.id})`);
      } else {
        showError(t("Failed to resend shipping email."));
      }
    } catch (err: any) {
      const message = err?.message || t("Failed to resend shipping email.");
      setError(message);
      showError(message);
    } finally {
      setRowResendLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  return (
    <Card className="shadow-none">
      {showHeader && (
        <CardHeader className="border-b">
          <CardTitle className="text-3xl">{title || t("Admin Orders")}</CardTitle>
          <CardDescription>
            {description || t("Manage order lifecycle, shipping, and overrides.")}
          </CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <Button onClick={exportCsv}>
                {t("Export CSV")}
              </Button>
              <Button onClick={loadOrders} disabled={loading}>
                {loading ? t("Loading...") : t("Refresh")}
              </Button>
            </div>
          </CardAction>
        </CardHeader>
      )}

      <CardContent className="space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            type="text"
            placeholder={t("Search by order ID or email")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full md:w-72"
          />
          <div className="w-full md:w-56">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label={t("Status filter")} title={t("Status filter")} className="w-full">
                <SelectValue placeholder={t("All statuses")} />
              </SelectTrigger>
              <SelectContent>
                {effectiveStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "ALL" ? t("All statuses") : t(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-none">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full md:w-52">
              <Select
                value={bulkAction}
                onValueChange={(value) =>
                  setBulkAction(value as "none" | "update-status" | "cancel" | "refund")
                }
              >
                <SelectTrigger aria-label={t("Bulk action")} title={t("Bulk action")} className="w-full">
                  <SelectValue placeholder={t("Bulk action")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("Bulk action")}</SelectItem>
                  {effectiveBulkActions.includes("update-status") && (
                    <SelectItem value="update-status">{t("Update status")}</SelectItem>
                  )}
                  {effectiveBulkActions.includes("cancel") && (
                    <SelectItem value="cancel">{t("Cancel orders")}</SelectItem>
                  )}
                  {effectiveBulkActions.includes("refund") && (
                    <SelectItem value="refund">{t("Refund orders")}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {bulkAction === "update-status" && (
              <div className="w-full md:w-56">
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger aria-label={t("Bulk status")} title={t("Bulk status")} className="w-full">
                    <SelectValue placeholder={t("Select status")} />
                  </SelectTrigger>
                  <SelectContent>
                    {effectiveStatusOptions
                      .filter((status) => status !== "ALL")
                      .map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(status)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(bulkAction === "cancel" || bulkAction === "refund") && (
              <Input
                type="text"
                placeholder={t("Reason (required for override)")}
                value={bulkReason}
                onChange={(event) => setBulkReason(event.target.value)}
                className="w-full md:w-72"
              />
            )}
            {bulkAction === "update-status" && (
              <div className="flex flex-wrap gap-2">
                <Input
                  type="text"
                  placeholder={t("Tracking #")}
                  value={bulkTracking.tracking_number}
                  onChange={(event) =>
                    setBulkTracking((prev) => ({
                      ...prev,
                      tracking_number: event.target.value,
                    }))
                  }
                  className="w-44"
                />
                <Input
                  type="text"
                  placeholder={t("Carrier")}
                  value={bulkTracking.carrier}
                  onChange={(event) =>
                    setBulkTracking((prev) => ({
                      ...prev,
                      carrier: event.target.value,
                    }))
                  }
                  className="w-36"
                />
                <Input
                  type="text"
                  placeholder={t("Carrier URL")}
                  value={bulkTracking.carrier_url}
                  onChange={(event) =>
                    setBulkTracking((prev) => ({
                      ...prev,
                      carrier_url: event.target.value,
                    }))
                  }
                  className="w-56"
                />
                <Input
                  type="text"
                  placeholder={t("Location")}
                  value={bulkTracking.location}
                  onChange={(event) =>
                    setBulkTracking((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                  className="w-44"
                />
                <Input
                  type="text"
                  placeholder={t("Message")}
                  value={bulkTracking.message}
                  onChange={(event) =>
                    setBulkTracking((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  className="w-56"
                />
              </div>
            )}
            <Button onClick={runBulkAction} disabled={bulkAction === "none" || loading}>
              {loading ? t("Processing...") : t("Apply")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("Selected")}: {selectedOrders.length}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="rounded-xl border bg-card overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-background text-left text-muted-foreground">
              <tr className="border-b">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      selectedOrders.length === filteredOrders.length
                    }
                    onChange={toggleAll}
                    aria-label={t("Select all orders")}
                    title={t("Select all orders")}
                  />
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">{t("Order")}</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">{t("Customer")}</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">{t("Status")}</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">{t("Total")}</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">{t("Placed")}</th>
                {enableRowShip && (
                  <>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">{t("Carrier")}</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap">{t("Tracking #")}</th>
                  </>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide whitespace-nowrap">{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t odd:bg-muted/10 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      aria-label={t("Select order") + ` #${order.id}`}
                      title={t("Select order") + ` #${order.id}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">#{order.id}</td>
                  <td className="px-4 py-3">{order.customer_email || t("Guest")}</td>
                  <td className="px-4 py-3">{t(order.status)}</td>
                  <td className="px-4 py-3">${formatMoney(order.total_amount)}</td>
                  <td className="px-4 py-3">{formatDate(order.created_at)}</td>
                  {enableRowShip && (
                    <>
                      <td className="px-4 py-3">
                        {canRowShip(order) ? (
                          <Input
                            type="text"
                            placeholder={t("Carrier")}
                            aria-label={t("Carrier")}
                            title={t("Carrier")}
                            value={rowShipInputs[order.id]?.carrier || ""}
                            onChange={(event) =>
                              setRowShipField(order.id, "carrier", event.target.value)
                            }
                            className="h-8 w-36"
                          />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {canRowShip(order) ? (
                          <Input
                            type="text"
                            placeholder={t("Tracking #")}
                            aria-label={t("Tracking number")}
                            title={t("Tracking number")}
                            value={rowShipInputs[order.id]?.tracking_number || ""}
                            onChange={(event) =>
                              setRowShipField(order.id, "tracking_number", event.target.value)
                            }
                            className="h-8 w-44"
                          />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {canRowShip(order) && (
                        <Button
                          onClick={() => runRowShip(order)}
                          disabled={Boolean(rowShipLoading[order.id]) || loading}
                          variant="outline"
                          size="sm"
                          aria-label={t("Mark shipped") + ` #${order.id}`}
                          title={t("Mark shipped")}
                        >
                          {rowShipLoading[order.id]
                            ? t("Saving...")
                            : t("Mark shipped")}
                        </Button>
                      )}
                      {canRowResendShipping(order) && (
                        <Button
                          onClick={() => runRowResendShippingEmail(order)}
                          disabled={Boolean(rowResendLoading[order.id]) || loading}
                          variant="outline"
                          size="sm"
                          aria-label={t("Resend shipping email") + ` #${order.id}`}
                          title={t("Resend shipping email")}
                        >
                          {rowResendLoading[order.id]
                            ? t("Sending...")
                            : t("Resend shipping")}
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/orders/${order.id}`}>{t("View")}</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td
                    className="px-4 py-6 text-muted-foreground"
                    colSpan={enableRowShip ? 9 : 7}
                  >
                    {t("No orders found.")}
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>
            {t("Page")} {page} {t("of")} {totalPages} · {pageInfo.count} {t("total")}
          </div>
          <div className="flex items-center gap-2">
            <div className="min-w-30">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger aria-label={t("Page size")} title={t("Page size")} size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / {t("page")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={!hasPrevious || loading}
              variant="outline"
              size="sm"
            >
              {t("Previous")}
            </Button>
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!hasNext || loading}
              variant="outline"
              size="sm"
            >
              {t("Next")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
