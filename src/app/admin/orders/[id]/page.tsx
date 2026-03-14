"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Order } from "@/types/order";
import { getDisplayName } from "@/utils/i18nDisplay";
import {
  adminCancelOrder,
  adminRefundOrder,
  adminUpdateOrderStatus,
  getAdminOrder,
} from "@/lib/api/adminOrders";
import {
  adminApproveReturnRefundRequest,
  adminMarkReturnRefundRequestReceived,
  adminRejectReturnRefundRequest,
} from "@/lib/api/adminReturnRefundRequests";

const STATUS_OPTIONS = [
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

const formatMoney = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return "0.00";
  }
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numberValue)) {
    return "0.00";
  }
  return numberValue.toFixed(2);
};

export default function AdminOrderDetailPage() {
  const { status: sessionStatus } = useSession();
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string | undefined;
  const orderId = useMemo(() => (id ? Number(id) : null), [id]);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [statusPayload, setStatusPayload] = useState({
    status: "",
    tracking_number: "",
    carrier: "",
    carrier_url: "",
    location: "",
    message: "",
  });
  const [cancelReason, setCancelReason] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const TERMINAL_STATUSES = ["CANCELLED", "DELIVERED", "REFUNDED", "PAYMENT_FAILED", "FAILED", "SHIPPED"];
  const isTerminal = order ? TERMINAL_STATUSES.includes(order.status) : false;
  const [requestAdminNote, setRequestAdminNote] = useState("");

  const loadOrder = async () => {
    if (!orderId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrder(orderId);
      setOrder(data);
      setStatusPayload((prev) => ({
        ...prev,
        status: data.status || prev.status,
      }));
    } catch (err: any) {
      setError(err?.message || "Failed to load order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    loadOrder();
  }, [orderId, sessionStatus]);

  const handleUpdateStatus = async () => {
    if (!orderId) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await adminUpdateOrderStatus(orderId, {
        status: statusPayload.status,
        tracking_number: statusPayload.tracking_number || undefined,
        carrier: statusPayload.carrier || undefined,
        carrier_url: statusPayload.carrier_url || undefined,
        location: statusPayload.location || undefined,
        message: statusPayload.message || undefined,
      });
      setOrder(updated);
    } catch (err: any) {
      setActionError(err?.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!orderId) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await adminCancelOrder(orderId, cancelReason || undefined);
      setOrder(updated);
      setCancelReason("");
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!orderId) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await adminRefundOrder(orderId, refundReason || undefined);
      setOrder(updated);
      setRefundReason("");
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || "Failed to refund order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await adminApproveReturnRefundRequest(requestId, requestAdminNote || undefined);
      setRequestAdminNote("");
      await loadOrder();
    } catch (err: any) {
      setActionError(err?.message || t("Failed to approve request."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await adminRejectReturnRefundRequest(requestId, requestAdminNote || undefined);
      setRequestAdminNote("");
      await loadOrder();
    } catch (err: any) {
      setActionError(err?.message || t("Failed to reject request."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReceived = async (requestId: number) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await adminMarkReturnRefundRequestReceived(requestId);
      await loadOrder();
    } catch (err: any) {
      setActionError(err?.message || t("Failed to mark return received."));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <p>{t("Loading order...")}</p>;
  }

  if (error || !order) {
    return <p>{error || t("Order not found.")}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("Admin Order")} #{order.id}
        </h1>
        <p className="text-gray-500">
          {t("Status:")} {order.status}
        </p>
      </div>

      {actionError && (
        <div className="mb-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <h2 className="text-base font-semibold mb-3">{t("Order Summary")}</h2>
          <div className="text-sm text-gray-700 grid gap-1.5">
            <div>{t("Customer:")} {order.customer_email || "Guest"}</div>
            <div>{t("Payment:")} {order.payment_provider || "-"}</div>
            <div>{t("Payment Status:")} {order.payment_status || "-"}</div>
            <div>{t("Subtotal:")} ${formatMoney(order.subtotal_amount)}</div>
            <div>{t("Shipping:")} ${formatMoney(order.shipping_amount)}</div>
            <div>{t("Tax:")} ${formatMoney(order.tax_amount)}</div>
            <div>{t("Total:")} ${formatMoney(order.total_amount)}</div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <h2 className="text-base font-semibold mb-3">{t("Update Status")}</h2>
          <div className="grid gap-2">
            <Select
              value={statusPayload.status || "__none__"}
              onValueChange={(value) => setStatusPayload((prev) => ({ ...prev, status: value === "__none__" ? "" : value }))}
            >
              <SelectTrigger aria-label={t("Order status")}>
                <SelectValue placeholder={t("Select status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{t("Select status")}</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder={t("Tracking number")}
              value={statusPayload.tracking_number}
              onChange={(event) => setStatusPayload((prev) => ({ ...prev, tracking_number: event.target.value }))}
            />
            <Input
              type="text"
              placeholder={t("Carrier")}
              value={statusPayload.carrier}
              onChange={(event) => setStatusPayload((prev) => ({ ...prev, carrier: event.target.value }))}
            />
            <Input
              type="text"
              placeholder={t("Carrier URL")}
              value={statusPayload.carrier_url}
              onChange={(event) => setStatusPayload((prev) => ({ ...prev, carrier_url: event.target.value }))}
            />
            <Input
              type="text"
              placeholder={t("Location")}
              value={statusPayload.location}
              onChange={(event) => setStatusPayload((prev) => ({ ...prev, location: event.target.value }))}
            />
            <Textarea
              placeholder={t("Message")}
              value={statusPayload.message}
              onChange={(event) => setStatusPayload((prev) => ({ ...prev, message: event.target.value }))}
              rows={3}
            />
            <Button onClick={handleUpdateStatus} disabled={actionLoading || !statusPayload.status}>
              {actionLoading ? t("Updating...") : t("Update Status")}
            </Button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <h2 className="text-base font-semibold mb-3">{t("Cancel Order")}</h2>
          <div className="grid gap-2">
            <Textarea
              placeholder={t("Reason (required for override)")}
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              rows={2}
            />
            <Button onClick={handleCancel} disabled={actionLoading || isTerminal} variant="outline">
              {actionLoading ? t("Processing...") : t("Cancel Order")}
            </Button>
            {isTerminal && (
              <p className="text-xs text-muted-foreground">{t("Order cannot be cancelled in its current status.")}</p>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <h2 className="text-base font-semibold mb-3">{t("Refund Order")}</h2>
          <div className="grid gap-2">
            <Textarea
              placeholder={t("Reason (required for override)")}
              value={refundReason}
              onChange={(event) => setRefundReason(event.target.value)}
              rows={2}
            />
            <Button onClick={handleRefund} disabled={actionLoading} variant="outline">
              {actionLoading ? t("Processing...") : t("Refund Order")}
            </Button>
          </div>
        </div>

        {(order.active_refund_request || order.active_return_request) && (
          <div className="border border-gray-200 rounded-xl p-4 bg-white">
            <h2 className="text-base font-semibold mb-3">{t("Return/Refund Requests")}</h2>

            <div className="text-sm text-gray-700 grid gap-2.5">
              {order.active_refund_request && (
                <div className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-bold">{t("Refund Request")} #{order.active_refund_request.id}</div>
                    <div className="text-gray-500">{order.active_refund_request.status}</div>
                  </div>
                  <div className="mt-1.5 text-gray-500">
                    {t("Reason:")} {order.active_refund_request.reason_code}
                    {order.active_refund_request.reason_text ? ` · ${order.active_refund_request.reason_text}` : ""}
                  </div>

                  <div className="mt-2.5 grid gap-2">
                    <textarea
                      aria-label={t("Admin note")}
                      placeholder={t("Admin note (optional)")}
                      value={requestAdminNote}
                      onChange={(event) => setRequestAdminNote(event.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      {order.active_refund_request.status === "REQUESTED" && (
                        <button
                          onClick={() => handleApproveRequest(order.active_refund_request!.id)}
                          disabled={actionLoading}
                          className="rounded-md px-4 py-2 text-sm font-semibold border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? t("Processing...") : t("Approve")}
                        </button>
                      )}
                      {(order.active_refund_request.status === "REQUESTED" ||
                        order.active_refund_request.status === "APPROVED") && (
                        <button
                          onClick={() => handleRejectRequest(order.active_refund_request!.id)}
                          disabled={actionLoading}
                          className="rounded-md px-4 py-2 text-sm font-semibold border border-red-500 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? t("Processing...") : t("Reject")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {order.active_return_request && (
                <div className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-bold">{t("Return Request")} #{order.active_return_request.id}</div>
                    <div className="text-gray-500">{order.active_return_request.status}</div>
                  </div>
                  <div className="mt-1.5 text-gray-500">
                    {t("Reason:")} {order.active_return_request.reason_code}
                    {order.active_return_request.reason_text ? ` · ${order.active_return_request.reason_text}` : ""}
                  </div>

                  <div className="mt-2.5 grid gap-2">
                    <textarea
                      aria-label={t("Admin note")}
                      placeholder={t("Admin note (optional)")}
                      value={requestAdminNote}
                      onChange={(event) => setRequestAdminNote(event.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      {order.active_return_request.status === "REQUESTED" && (
                        <button
                          onClick={() => handleApproveRequest(order.active_return_request!.id)}
                          disabled={actionLoading}
                          className="rounded-md px-4 py-2 text-sm font-semibold border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? t("Processing...") : t("Approve")}
                        </button>
                      )}
                      {(order.active_return_request.status === "REQUESTED" ||
                        order.active_return_request.status === "APPROVED") && (
                        <button
                          onClick={() => handleRejectRequest(order.active_return_request!.id)}
                          disabled={actionLoading}
                          className="rounded-md px-4 py-2 text-sm font-semibold border border-red-500 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? t("Processing...") : t("Reject")}
                        </button>
                      )}
                      {order.active_return_request.status === "APPROVED" && (
                        <button
                          onClick={() => handleMarkReceived(order.active_return_request!.id)}
                          disabled={actionLoading}
                          className="rounded-md px-4 py-2 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? t("Processing...") : t("Mark Received + Refund")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-white">
        <h2 className="text-base font-semibold mb-3">{t("Items")}</h2>
        {order.items.map((item) => (
          <div key={item.id} className="py-2 border-b border-gray-100">
            <div className="font-semibold">
              {typeof item.product_name_snapshot === 'object' && item.product_name_snapshot !== null
                ? (item.product_name_snapshot as Record<string, string>).en || Object.values(item.product_name_snapshot)[0] || "Product"
                : item.product?.name
                  ? (typeof item.product.name === 'object' ? getDisplayName(item.product) : item.product.name)
                  : item.product_name_snapshot || "Product"}
            </div>
            <div className="text-xs text-gray-500">
              {t("Qty:")} {item.quantity} · {t("Price:")} ${formatMoney(item.price)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
