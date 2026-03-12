"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Order, OrderItem } from "@/types/order";
import { getOrder } from "@/features/order/hooks/useOrders";
import { cancelCustomerOrder, refundCustomerOrder, requestCustomerReturn, downloadOrderInvoice, downloadOrderReceipt } from "@/lib/api/orders";
import { useTranslation } from "react-i18next";
import { Package, CreditCard, MapPin, FileText, Truck, Download } from "lucide-react";
import styles from "./page.module.css";

/* ─── helpers ─── */
const fmt = (v?: string | number | null) => (v == null ? "0.00" : Number(v).toFixed(2));

const formatAddress = (value?: Record<string, any> | null) => {
  if (!value) return null;
  return { parts: [value.full_name, value.address_line_1, value.address_line_2, value.city, value.state, value.postal_code, value.country].filter(Boolean) };
};

const getItemName = (item: any): string => {
  if (item.product?.name_display) return item.product.name_display;
  if (item.product?.name) {
    if (typeof item.product.name === "string") return item.product.name;
    return item.product.name.en || Object.values(item.product.name)[0] || "Product";
  }
  if (typeof item.product_name_snapshot === "string") return item.product_name_snapshot;
  if (item.product_name_snapshot?.en) return item.product_name_snapshot.en;
  return item.variant_sku || "Product";
};

const getItemImage = (item: any): string | null => {
  if (item.image_url) return item.image_url;
  const imgs = item.product?.gallery_images;
  if (!imgs || imgs.length === 0) return null;
  const primary = imgs.find((i: any) => i.is_primary) || imgs[0];
  return primary.image_url || primary.image || null;
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
    if (!order) return false;
    return ["CREATED", "PAYMENT_PENDING", "FULFILLMENT_PENDING"].includes(order.status);
  }, [order]);

  const canRefund = useMemo(() => {
    if (!order) return false;
    const paid = ['SUCCESS', 'captured', 'completed', 'paid', 'succeeded'];
    return paid.includes(order.payment_status ?? '') && order.status !== "REFUNDED" && !order.active_refund_request;
  }, [order]);

  const canRequestReturn = useMemo(() => {
    if (!order) return false;
    const paid = ['SUCCESS', 'captured', 'completed', 'paid', 'succeeded'];
    return ["SHIPPED", "DELIVERED"].includes(order.status) && paid.includes(order.payment_status ?? '') && !order.active_return_request && order.status !== "REFUNDED";
  }, [order]);

  const canDownloadDocuments = useMemo(() => {
    if (!order) return false;
    const paid = ['SUCCESS', 'captured', 'completed', 'paid', 'succeeded'];
    return paid.includes(order.payment_status ?? '');
  }, [order]);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setActionLoading(true); setActionError(null);
    try { await downloadOrderInvoice(order.id, order.invoice_number ? `${order.invoice_number}.pdf` : undefined); }
    catch (err: any) { setActionError(err?.message || "Failed to download invoice."); }
    finally { setActionLoading(false); }
  };

  const handleDownloadReceipt = async () => {
    if (!order) return;
    setActionLoading(true); setActionError(null);
    try { await downloadOrderReceipt(order.id, order.receipt_number ? `${order.receipt_number}.pdf` : undefined); }
    catch (err: any) { setActionError(err?.message || "Failed to download receipt."); }
    finally { setActionLoading(false); }
  };

  useEffect(() => { if (id) { getOrder(Number(id)).then(setOrder).finally(() => setLoading(false)); } }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    setActionLoading(true); setActionError(null);
    try { const u = await cancelCustomerOrder(order.id, cancelReason || undefined); setOrder(u); setCancelReason(""); }
    catch (err: any) { setActionError(err?.message || "Failed to cancel order."); }
    finally { setActionLoading(false); }
  };

  const handleRefund = async () => {
    if (!order) return;
    setActionLoading(true); setActionError(null);
    try { const u = await refundCustomerOrder(order.id, refundReasonCode, refundReasonText || undefined); setOrder(u); setRefundReasonText(""); }
    catch (err: any) { setActionError(err?.message || "Failed to request refund."); }
    finally { setActionLoading(false); }
  };

  const handleReturnRequest = async () => {
    if (!order) return;
    setActionLoading(true); setActionError(null);
    try { const u = await requestCustomerReturn(order.id, returnReasonCode, returnReasonText || undefined); setOrder(u); setReturnReasonText(""); }
    catch (err: any) { setActionError(err?.message || "Failed to request return."); }
    finally { setActionLoading(false); }
  };

  if (loading || !order) {
    return (
      <div className={styles.loadingWrap}>
        <p className={styles.loadingText}>{t("Loading order details...")}</p>
      </div>
    );
  }

  const tone = getStatusTone(order.status);
  const shippingAddr = formatAddress(order.shipping_address_snapshot);
  const billingAddr = formatAddress(order.billing_address_snapshot);

  return (
    <div className={styles.page}>
      {/* ─── Header ─── */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>{t("Order")} {order.order_number || `#${order.id}`}</h1>
        <div className={styles.statusRow}>
          <span className={styles.badge} style={{ background: tone.bg, color: tone.text }}>
            <span className={styles.badgeDot} style={{ background: tone.dot }} />
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
        {order.status === "BACKORDERED" && <p className={`${styles.statusNote} ${styles.noteWarning}`}>{t("Your order is backordered. We'll notify you when it ships.")}</p>}
        {order.status === "LOST" && <p className={`${styles.statusNote} ${styles.noteDanger}`}>{t("This shipment appears to be lost in transit. Our team is investigating.")}</p>}
        {order.status === "RETURNED_TO_SENDER" && <p className={`${styles.statusNote} ${styles.noteDanger}`}>{t("This package was returned to sender. Please contact support.")}</p>}
      </div>

      {actionError && <div className={styles.errorBar}>{actionError}</div>}

      {/* ─── Summary + Payment (2-col) ─── */}
      <div className={styles.grid}>
        {/* Order Summary */}
        <div className={styles.card}>
          <div className={styles.sectionIcon}>
            <Package size={18} color="#0a0a0a" />
            <p className={styles.sectionTitle}>{t("Order Summary")}</p>
          </div>
          <div className={styles.summaryRow}><span className={styles.summaryLabel}>{t("Subtotal")}</span><span className={styles.summaryValue}>${fmt(order.subtotal_amount)}</span></div>
          <div className={styles.summaryRow}><span className={styles.summaryLabel}>{t("Shipping")}</span><span className={styles.summaryValue}>${fmt(order.shipping_amount)}</span></div>
          <div className={styles.summaryRow}><span className={styles.summaryLabel}>{t("Tax")}</span><span className={styles.summaryValue}>${fmt(order.tax_amount)}</span></div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>{t("Total")}</span>
            <span className={styles.totalValue}>${fmt(order.total_amount)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className={styles.card}>
          <div className={styles.sectionIcon}>
            <CreditCard size={18} color="#0a0a0a" />
            <p className={styles.sectionTitle}>{t("Payment")}</p>
          </div>
          <div className={styles.payRow}><span className={styles.payLabel}>{t("Provider")}</span><span>{order.payment_provider || t("Pending")}</span></div>
          <div className={styles.payRow}><span className={styles.payLabel}>{t("Status")}</span><span>{order.payment_status || t("Pending")}</span></div>
          <div className={styles.payRow}><span className={styles.payLabel}>{t("Reference")}</span><span>{order.payment_reference || "—"}</span></div>
          <div className={styles.docBtns}>
            <button onClick={handleDownloadInvoice} disabled={!canDownloadDocuments || actionLoading} className={styles.btnDoc}>
              <Download size={14} /> {actionLoading ? t("Processing...") : t("Invoice")}
            </button>
            <button onClick={handleDownloadReceipt} disabled={!canDownloadDocuments || actionLoading} className={styles.btnDoc}>
              <FileText size={14} /> {actionLoading ? t("Processing...") : t("Receipt")}
            </button>
          </div>
        </div>

        {/* Shipping Address */}
        <div className={styles.card}>
          <div className={styles.sectionIcon}>
            <Truck size={18} color="#0a0a0a" />
            <p className={styles.sectionTitle}>{t("Shipping Address")}</p>
          </div>
          {shippingAddr ? (
            <>
              <p className={styles.addrName}>{shippingAddr.parts[0]}</p>
              {shippingAddr.parts.slice(1).map((line, i) => <p key={i} className={styles.addrLine}>{line}</p>)}
            </>
          ) : <p className={styles.addrLine}>—</p>}
        </div>

        {/* Billing Address */}
        <div className={styles.card}>
          <div className={styles.sectionIcon}>
            <MapPin size={18} color="#0a0a0a" />
            <p className={styles.sectionTitle}>{t("Billing Address")}</p>
          </div>
          {billingAddr ? (
            <>
              <p className={styles.addrName}>{billingAddr.parts[0]}</p>
              {billingAddr.parts.slice(1).map((line, i) => <p key={i} className={styles.addrLine}>{line}</p>)}
            </>
          ) : <p className={styles.addrLine}>—</p>}
        </div>
      </div>

      {/* ─── Items ─── */}
      <div className={styles.cardFull}>
        <div className={styles.sectionIcon}>
          <Package size={18} color="#0a0a0a" />
          <p className={styles.sectionTitle}>{t("Items")}</p>
          <span className={styles.itemCount}>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
        </div>
        {order.items.map((item: OrderItem, idx: number) => {
          const name = getItemName(item);
          const imgUrl = getItemImage(item);
          const isLast = idx === order.items.length - 1;
          return (
            <div key={item.id} className={`${styles.itemRow} ${isLast ? "" : styles.itemRowBorder}`}>
              {imgUrl ? (
                <div className={styles.itemImg}>
                  <Image src={imgUrl} alt={name} fill sizes="64px" style={{ objectFit: "cover" }} />
                </div>
              ) : (
                <div className={styles.itemPlaceholder}><Package size={24} color="#d4d4d4" /></div>
              )}
              <div className={styles.itemDetails}>
                <p className={styles.itemName}>{name}</p>
                <p className={styles.itemMeta}>{t("Qty")}: {item.quantity} × ${fmt(item.price)}</p>
              </div>
              <span className={styles.itemPrice}>${item.line_total ? fmt(item.line_total) : fmt(Number(item.price) * item.quantity)}</span>
            </div>
          );
        })}
      </div>

      {/* ─── Actions (dark cards) ─── */}
      <div className={styles.actionGrid}>
        {/* Cancel */}
        <div className={styles.darkCard}>
          <p className={styles.darkTitle}>{t("Cancel Order")}</p>
          <textarea
            placeholder={t("Reason (optional)")}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={2}
            className={styles.textarea}
          />
          <button onClick={handleCancel} disabled={!canCancel || actionLoading} className={styles.btnDanger}>
            {actionLoading ? t("Processing...") : t("Cancel Order")}
          </button>
        </div>

        {/* Refund */}
        <div className={styles.darkCard}>
          <p className={styles.darkTitle}>{t("Request Refund")}</p>
          {order.active_refund_request && <p className={styles.statusText}>{t("Refund request status:")} {order.active_refund_request.status}</p>}
          <label className={styles.labelDark}>{t("Reason")}</label>
          <select aria-label={t("Refund reason")} value={refundReasonCode} onChange={(e) => setRefundReasonCode(e.target.value as any)} className={styles.selectDark}>
            <option value="DAMAGED">{t("Damaged item")}</option>
            <option value="WRONG_ITEM">{t("Wrong item")}</option>
          </select>
          <textarea placeholder={t("Details (optional)")} value={refundReasonText} onChange={(e) => setRefundReasonText(e.target.value)} rows={2} className={styles.textarea} />
          <button onClick={handleRefund} disabled={!canRefund || actionLoading} className={styles.btnAmber}>
            {actionLoading ? t("Processing...") : t("Request Refund")}
          </button>
        </div>

        {/* Return */}
        <div className={styles.returnCard}>
          <p className={styles.darkTitle}>{t("Request Return")}</p>
          {order.active_return_request && <p className={styles.statusText}>{t("Return request status:")} {order.active_return_request.status}</p>}
          <div className={styles.returnInner}>
            <div className={styles.returnLeft}>
              <label className={styles.labelDark}>{t("Reason")}</label>
              <select aria-label={t("Return reason")} value={returnReasonCode} onChange={(e) => setReturnReasonCode(e.target.value as any)} className={styles.selectDark}>
                <option value="DAMAGED">{t("Damaged item")}</option>
                <option value="WRONG_ITEM">{t("Wrong item")}</option>
              </select>
            </div>
            <div className={styles.returnRight}>
              <label className={styles.labelDark}>{t("Details (optional)")}</label>
              <textarea placeholder={t("Describe the issue...")} value={returnReasonText} onChange={(e) => setReturnReasonText(e.target.value)} rows={2} className={styles.textarea} />
            </div>
          </div>
          <button onClick={handleReturnRequest} disabled={!canRequestReturn || actionLoading} className={styles.btnWhite}>
            {actionLoading ? t("Processing...") : t("Request Return")}
          </button>
        </div>
      </div>
    </div>
  );
}
