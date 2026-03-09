"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Order } from "@/types/order";
import { getOrder } from "@/features/order/hooks/useOrders";
import { cancelCustomerOrder, refundCustomerOrder, requestCustomerReturn, downloadOrderInvoice, downloadOrderReceipt } from "@/lib/api/orders";
import { useTranslation } from "react-i18next";

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

const formatAddress = (value?: Record<string, any> | null) => {
  if (!value) {
    return "-";
  }
  return [
    value.full_name,
    value.address_line_1,
    value.address_line_2,
    value.city,
    value.state,
    value.postal_code,
    value.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const getItemName = (item: any) => {
  if (item.product?.name) {
    return item.product.name;
  }
  if (typeof item.product_name_snapshot === "string") {
    return item.product_name_snapshot;
  }
  if (item.product_name_snapshot?.en) {
    return item.product_name_snapshot.en;
  }
  return "Product";
};

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [refundReasonCode, setRefundReasonCode] = useState<"DAMAGED" | "WRONG_ITEM">("DAMAGED");
  const [refundReasonText, setRefundReasonText] = useState("");
  const [returnReasonCode, setReturnReasonCode] = useState<"DAMAGED" | "WRONG_ITEM">("DAMAGED");
  const [returnReasonText, setReturnReasonText] = useState("");

  const canCancel = useMemo(() => {
    if (!order) {
      return false;
    }
    return [
      "CREATED",
      "PAYMENT_PENDING",
      "FULFILLMENT_PENDING",
    ].includes(order.status);
  }, [order]);

  const canRefund = useMemo(() => {
    if (!order) {
      return false;
    }
    return (
      order.payment_status === "SUCCESS" &&
      order.status !== "REFUNDED" &&
      !order.active_refund_request
    );
  }, [order]);

  const canRequestReturn = useMemo(() => {
    if (!order) {
      return false;
    }
    return (
      ["SHIPPED", "DELIVERED"].includes(order.status) &&
      order.payment_status === "SUCCESS" &&
      !order.active_return_request &&
      order.status !== "REFUNDED"
    );
  }, [order]);

  const canDownloadDocuments = useMemo(() => {
    if (!order) {
      return false;
    }
    return order.payment_status === "SUCCESS";
  }, [order]);

  const handleDownloadInvoice = async () => {
    if (!order) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await downloadOrderInvoice(order.id, order.invoice_number ? `${order.invoice_number}.pdf` : undefined);
    } catch (err: any) {
      setActionError(err?.message || "Failed to download invoice.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!order) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await downloadOrderReceipt(order.id, order.receipt_number ? `${order.receipt_number}.pdf` : undefined);
    } catch (err: any) {
      setActionError(err?.message || "Failed to download receipt.");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getOrder(Number(id))
        .then(setOrder)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleCancel = async () => {
    if (!order) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await cancelCustomerOrder(order.id, cancelReason || undefined);
      setOrder(updated);
      setCancelReason("");
    } catch (err: any) {
      setActionError(err?.message || "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!order) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await refundCustomerOrder(order.id, refundReasonCode, refundReasonText || undefined);
      setOrder(updated);
      setRefundReasonText("");
    } catch (err: any) {
      setActionError(err?.message || "Failed to request refund.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnRequest = async () => {
    if (!order) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await requestCustomerReturn(order.id, returnReasonCode, returnReasonText || undefined);
      setOrder(updated);
      setReturnReasonText("");
    } catch (err: any) {
      setActionError(err?.message || "Failed to request return.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !order) return <p>{t('Loading order details...')}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">{t('Order')} {order.order_number || `#${order.id}`}</h1>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
          order.status === 'DELIVERED' || order.status === 'PAID' ? 'bg-green-100 text-green-800' :
          order.status === 'BACKORDERED' ? 'bg-orange-100 text-orange-800' :
          order.status === 'LOST' || order.status === 'RETURNED_TO_SENDER' ? 'bg-rose-100 text-rose-800' :
          order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
          order.status === 'CANCELLED' || order.status === 'REFUNDED' || order.status === 'PAYMENT_FAILED' ? 'bg-red-100 text-red-800' :
          order.status === 'FULFILLMENT_PENDING' || order.status === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-800' :
          'bg-slate-100 text-slate-800'
        }`}>{order.status.replace(/_/g, ' ')}</span>
        {order.status === 'BACKORDERED' && (
          <p className="text-sm text-orange-700 mt-1">{t('Your order is backordered. We\'ll notify you when it ships.')}</p>
        )}
        {order.status === 'LOST' && (
          <p className="text-sm text-rose-700 mt-1">{t('This shipment appears to be lost in transit. Our team is investigating.')}</p>
        )}
        {order.status === 'RETURNED_TO_SENDER' && (
          <p className="text-sm text-rose-700 mt-1">{t('This package was returned to sender. Please contact support for a re-shipment or refund.')}</p>
        )}
      </div>

      {actionError && (
        <p className="text-sm text-red-600 mb-4">{actionError}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">{t('Order Summary')}</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{t('Subtotal: $')}{formatMoney(order.subtotal_amount)}</p>
            <p>{t('Shipping: $')}{formatMoney(order.shipping_amount)}</p>
            <p>{t('Tax: $')}{formatMoney(order.tax_amount)}</p>
            <p className="text-base font-semibold text-gray-900">{t('Total: $')}{formatMoney(order.total_amount)}</p>
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">{t('Payment')}</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{t('Provider:')}{order.payment_provider || t('Pending')}</p>
            <p>{t('Status:')}{order.payment_status || t('Pending')}</p>
            <p>{t('Reference:')}{order.payment_reference || '-'}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleDownloadInvoice}
              disabled={!canDownloadDocuments || actionLoading}
              className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? t('Processing...') : t('Download Invoice')}
            </button>
            <button
              onClick={handleDownloadReceipt}
              disabled={!canDownloadDocuments || actionLoading}
              className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? t('Processing...') : t('Download Receipt')}
            </button>
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">{t('Shipping Address')}</h2>
          <p className="text-sm text-gray-600">{formatAddress(order.shipping_address_snapshot)}</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">{t('Billing Address')}</h2>
          <p className="text-sm text-gray-600">{formatAddress(order.billing_address_snapshot)}</p>
        </div>
      </div>

      <div className="mt-6 border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-3">{t('Items')}</h2>
        {order.items.map((item) => (
          <div key={item.id} className="border-b py-3 last:border-b-0">
            <p className="font-medium">{getItemName(item)}</p>
            <p className="text-sm text-gray-600">{t('Qty:')}{item.quantity}</p>
            <p className="text-sm text-gray-600">{t('Price: $')}{formatMoney(item.price)} {t('each')}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">{t('Cancel Order')}</h2>
          <textarea
            placeholder={t('Reason (optional)')}
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={handleCancel}
            disabled={!canCancel || actionLoading}
            className="mt-3 w-full rounded-md border border-red-300 bg-red-50 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading ? t('Processing...') : t('Cancel Order')}
          </button>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">{t('Request Refund')}</h2>
          {order.active_refund_request ? (
            <p className="text-sm text-gray-600 mb-3">
              {t('Refund request status:')} {order.active_refund_request.status}
            </p>
          ) : null}
          <label htmlFor="refund-reason" className="block text-sm text-gray-600 mb-1">{t('Reason')}</label>
          <select
            id="refund-reason"
            value={refundReasonCode}
            onChange={(event) => setRefundReasonCode(event.target.value as "DAMAGED" | "WRONG_ITEM")}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="DAMAGED">{t('Damaged item')}</option>
            <option value="WRONG_ITEM">{t('Wrong item')}</option>
          </select>
          <textarea
            placeholder={t('Details (optional)')}
            value={refundReasonText}
            onChange={(event) => setRefundReasonText(event.target.value)}
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={handleRefund}
            disabled={!canRefund || actionLoading}
            className="mt-3 w-full rounded-md border border-amber-300 bg-amber-50 py-2 text-sm font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading ? t('Processing...') : t('Request Refund')}
          </button>
        </div>
      </div>

      <div className="mt-4 border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-3">{t('Request Return')}</h2>
        {order.active_return_request ? (
          <p className="text-sm text-gray-600 mb-3">
            {t('Return request status:')} {order.active_return_request.status}
          </p>
        ) : null}
        <label htmlFor="return-reason" className="block text-sm text-gray-600 mb-1">{t('Reason')}</label>
        <select
          id="return-reason"
          value={returnReasonCode}
          onChange={(event) => setReturnReasonCode(event.target.value as "DAMAGED" | "WRONG_ITEM")}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="DAMAGED">{t('Damaged item')}</option>
          <option value="WRONG_ITEM">{t('Wrong item')}</option>
        </select>
        <textarea
          placeholder={t('Details (optional)')}
          value={returnReasonText}
          onChange={(event) => setReturnReasonText(event.target.value)}
          rows={2}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <button
          onClick={handleReturnRequest}
          disabled={!canRequestReturn || actionLoading}
          className="mt-3 w-full rounded-md border border-slate-300 bg-slate-50 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLoading ? t('Processing...') : t('Request Return')}
        </button>
      </div>
    </div>
  );
}
