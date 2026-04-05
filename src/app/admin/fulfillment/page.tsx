"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Send,
  Eye,
  Loader2,
} from "lucide-react";

import type {
  FulfillmentPipeline,
  PrintfulStatusResponse,
} from "@/lib/api/adminFulfillment";
import {
  getFulfillmentOrders,
  getFulfillmentPipeline,
  submitToPrintful,
  retryPrintful,
  markOrderShipped,
  markOrderDelivered,
  markOrderBackordered,
  getPrintfulStatus,
} from "@/lib/api/adminFulfillment";

// ── Status helpers ───────────────────────────────────────────────────────────

const STAGE_OPTIONS = [
  { value: "ALL", label: "All Stages" },
  { value: "PAID", label: "Paid (awaiting fulfillment)" },
  { value: "FULFILLMENT_PENDING", label: "Fulfillment Pending" },
  { value: "BACKORDERED", label: "Backordered" },
  { value: "SHIPPED", label: "Shipped" },
];

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-blue-100 text-blue-800",
  FULFILLMENT_PENDING: "bg-yellow-100 text-yellow-800",
  BACKORDERED: "bg-orange-100 text-orange-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
};

const PRINTFUL_SYNC_COLORS: Record<string, string> = {
  not_sent: "bg-gray-100 text-gray-700",
  confirmed: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

// ── Pipeline Card ────────────────────────────────────────────────────────────

function PipelineCard({
  label,
  count,
  icon: Icon,
  color,
  onClick,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Ship Dialog (inline) ─────────────────────────────────────────────────────

function ShipForm({
  orderId,
  onSubmit,
  onCancel,
}: {
  orderId: number;
  onSubmit: (data: { tracking_number: string; carrier: string }) => void;
  onCancel: () => void;
}) {
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("");
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 p-3 bg-muted rounded-md mt-2">
      <p className="text-sm font-medium">{t("Ship Order")} #{orderId}</p>
      <Input
        placeholder={t("Tracking number")}
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        className="h-8 text-sm"
      />
      <Input
        placeholder={t("Carrier (e.g., USPS, FedEx, UPS)")}
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onSubmit({ tracking_number: tracking, carrier })}
        >
          {t("Confirm Ship")}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          {t("Cancel")}
        </Button>
      </div>
    </div>
  );
}

// ── Printful Detail Panel ────────────────────────────────────────────────────

function PrintfulDetail({ data }: { data: PrintfulStatusResponse }) {
  const { t } = useTranslation();
  return (
    <div className="p-3 bg-muted rounded-md mt-2 text-sm space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-muted-foreground">{t("Sync Status:")} </span>{" "}
          <Badge
            className={`${PRINTFUL_SYNC_COLORS[data.printful_status] || "bg-gray-100"} text-xs`}
          >
            {data.printful_status}
          </Badge>
        </div>
        {data.printful_order_id && (
          <div>
            <span className="text-muted-foreground">{t("Printful ID:")} </span>{" "}
            {data.printful_order_id}
          </div>
        )}
        {data.fulfillment_status && (
          <div>
            <span className="text-muted-foreground">{t("Fulfillment:")} </span>{" "}
            {data.fulfillment_status}
          </div>
        )}
        {data.tracking_number && (
          <div>
            <span className="text-muted-foreground">{t("Tracking:")} </span>{" "}
            {data.tracking_number}
          </div>
        )}
        {data.carrier && (
          <div>
            <span className="text-muted-foreground">{t("Carrier:")} </span>{" "}
            {data.carrier}
          </div>
        )}
        {data.error_message && (
          <div className="col-span-2 text-red-600">
            <span className="text-muted-foreground">{t("Error:")} </span>{" "}
            {data.error_message}
          </div>
        )}
        {data.retry_count != null && data.retry_count > 0 && (
          <div>
            <span className="text-muted-foreground">{t("Retries:")} </span>{" "}
            {data.retry_count}
          </div>
        )}
      </div>
      {data.events && data.events.length > 0 && (
        <div>
          <p className="font-medium mt-2 mb-1">{t("Recent Events")}</p>
          <div className="space-y-1">
            {data.events.slice(0, 5).map((ev, i) => (
              <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {ev.type}
                </Badge>
                <span>{new Date(ev.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Order row type from our API ──────────────────────────────────────────────

interface FulfillmentOrder {
  id: number;
  order_number?: string;
  customer_email?: string;
  total_amount?: number;
  status: string;
  created_at: string;
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminFulfillmentPage() {
  const { status: sessionStatus } = useSession();
  const { t } = useTranslation();
  const { success, error: showError } = useToast();

  // Pipeline
  const [pipeline, setPipeline] = useState<FulfillmentPipeline | null>(null);

  // Orders list
  const [orders, setOrders] = useState<FulfillmentOrder[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [stage, setStage] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Loading / error
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Inline panels
  const [shipFormOrder, setShipFormOrder] = useState<number | null>(null);
  const [printfulDetail, setPrintfulDetail] = useState<{
    orderId: number;
    data: PrintfulStatusResponse;
  } | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const refreshPipeline = useCallback(async () => {
    if (sessionStatus !== 'authenticated') return;
    try {
      const data = await getFulfillmentPipeline();
      setPipeline(data);
    } catch {
      // Silent — pipeline is optional enhancement
    }
  }, [sessionStatus]);

  const refreshOrders = useCallback(async () => {
    if (sessionStatus !== 'authenticated') return;
    setLoading(true);
    try {
      const data = await getFulfillmentOrders({ stage, page, pageSize });
      setOrders(data.items as unknown as FulfillmentOrder[]);
      setOrderCount(data.count);
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.detail ||
        (err as Error)?.message ||
        t("Failed to load orders.");
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [stage, page, pageSize, showError, sessionStatus]);

  useEffect(() => {
    void refreshPipeline();
  }, [refreshPipeline]);

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  const refreshAll = () => {
    void refreshPipeline();
    void refreshOrders();
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleSubmitPrintful = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const result = await submitToPrintful(orderId);
      if (result.status === "submitted") {
        success(
          t("Order #{{id}} submitted to Printful").replace("{{id}}", String(orderId)),
        );
      } else {
        showError(result.error || t("Printful submission failed"));
      }
      refreshAll();
    } catch (err: unknown) {
      showError(
        (err as any)?.response?.data?.error ||
          (err as Error)?.message ||
          t("Submission failed"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetryPrintful = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const result = await retryPrintful(orderId);
      if (result.status === "retried" || result.status === "already_confirmed") {
        success(t("Printful retry successful for order #{{id}}").replace("{{id}}", String(orderId)));
      } else {
        showError(result.error || t("Retry failed"));
      }
      refreshAll();
    } catch (err: unknown) {
      showError(
        (err as any)?.response?.data?.error ||
          (err as Error)?.message ||
          t("Retry failed"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleShip = async (
    orderId: number,
    data: { tracking_number: string; carrier: string },
  ) => {
    setActionLoading(orderId);
    try {
      await markOrderShipped(orderId, data);
      success(t("Order #{{id}} marked as shipped").replace("{{id}}", String(orderId)));
      setShipFormOrder(null);
      refreshAll();
    } catch (err: unknown) {
      showError(
        (err as any)?.response?.data?.error ||
          (err as Error)?.message ||
          t("Ship failed"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      await markOrderDelivered(orderId);
      success(t("Order #{{id}} marked as delivered").replace("{{id}}", String(orderId)));
      refreshAll();
    } catch (err: unknown) {
      showError(
        (err as any)?.response?.data?.error ||
          (err as Error)?.message ||
          t("Delivery update failed"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleBackorder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      await markOrderBackordered(orderId, t("Marked via admin dashboard"));
      success(t("Order #{{id}} marked as backordered").replace("{{id}}", String(orderId)));
      refreshAll();
    } catch (err: unknown) {
      showError(
        (err as any)?.response?.data?.error ||
          (err as Error)?.message ||
          t("Backorder update failed"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewPrintful = async (orderId: number) => {
    if (printfulDetail?.orderId === orderId) {
      setPrintfulDetail(null);
      return;
    }
    setActionLoading(orderId);
    try {
      const data = await getPrintfulStatus(orderId);
      setPrintfulDetail({ orderId, data });
    } catch (err: unknown) {
      showError(
        (err as any)?.response?.data?.error ||
          (err as Error)?.message ||
          t("Failed to fetch Printful status"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ── Pagination ─────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(orderCount / pageSize);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("Fulfillment Pipeline")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Manage order fulfillment — submit to Printful, track shipments, handle exceptions.",
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("Refresh")}
        </Button>
      </div>

      {/* Pipeline cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PipelineCard
          label={t("Paid (awaiting)")}
          count={pipeline?.fulfillment_pipeline?.PAID ?? 0}
          icon={Clock}
          color="bg-blue-50 text-blue-600"
          onClick={() => {
            setStage("PAID");
            setPage(1);
          }}
        />
        <PipelineCard
          label={t("Fulfillment Pending")}
          count={pipeline?.fulfillment_pipeline?.FULFILLMENT_PENDING ?? 0}
          icon={Package}
          color="bg-yellow-50 text-yellow-600"
          onClick={() => {
            setStage("FULFILLMENT_PENDING");
            setPage(1);
          }}
        />
        <PipelineCard
          label={t("Backordered")}
          count={pipeline?.fulfillment_pipeline?.BACKORDERED ?? 0}
          icon={AlertTriangle}
          color="bg-orange-50 text-orange-600"
          onClick={() => {
            setStage("BACKORDERED");
            setPage(1);
          }}
        />
        <PipelineCard
          label={t("Shipped")}
          count={pipeline?.fulfillment_pipeline?.SHIPPED ?? 0}
          icon={Truck}
          color="bg-purple-50 text-purple-600"
          onClick={() => {
            setStage("SHIPPED");
            setPage(1);
          }}
        />
      </div>

      {/* Printful sync summary */}
      {pipeline?.printful_sync &&
        Object.keys(pipeline.printful_sync).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {t("Printful Sync Status")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 flex-wrap">
              {Object.entries(pipeline.printful_sync).map(([status, count]) => (
                <Badge
                  key={status}
                  className={`${PRINTFUL_SYNC_COLORS[status] || "bg-gray-100"} text-xs`}
                >
                  {status}: {count}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={stage}
          onValueChange={(v) => {
            setStage(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder={t("Filter by stage")} />
          </SelectTrigger>
          <SelectContent>
            {STAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          {orderCount} {t("orders")}
        </span>
      </div>

      {/* Orders table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("No orders in this stage.")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">
                      {t("Order")}
                    </th>
                    <th className="text-left p-3 font-medium">
                      {t("Customer")}
                    </th>
                    <th className="text-left p-3 font-medium">
                      {t("Total")}
                    </th>
                    <th className="text-left p-3 font-medium">
                      {t("Status")}
                    </th>
                    <th className="text-left p-3 font-medium">
                      {t("Date")}
                    </th>
                    <th className="text-right p-3 font-medium">
                      {t("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const isActionLoading = actionLoading === order.id;
                    return (
                      <tr
                        key={order.id}
                        className="border-b hover:bg-muted/30"
                      >
                        <td className="p-3">
                          <span className="font-mono text-xs">
                            {order.order_number || `#${order.id}`}
                          </span>
                        </td>
                        <td className="p-3">
                          {order.customer_email || "—"}
                        </td>
                        <td className="p-3 font-medium">
                          $
                          {Number(order.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`${STATUS_COLORS[order.status] || "bg-gray-100"} text-xs`}
                          >
                            {t(order.status)}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1 flex-wrap">
                            {/* Printful status */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleViewPrintful(order.id)}
                              disabled={isActionLoading}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {t("Printful")}
                            </Button>

                            {/* Submit to Printful (PAID or FULFILLMENT_PENDING) */}
                            {(order.status === "PAID" ||
                              order.status === "FULFILLMENT_PENDING") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  handleSubmitPrintful(order.id)
                                }
                                disabled={isActionLoading}
                              >
                                {isActionLoading ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Send className="h-3 w-3 mr-1" />
                                )}
                                {t("Send to Printful")}
                              </Button>
                            )}

                            {/* Retry Printful */}
                            {order.status === "FULFILLMENT_PENDING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  handleRetryPrintful(order.id)
                                }
                                disabled={isActionLoading}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                {t("Retry")}
                              </Button>
                            )}

                            {/* Ship (FULFILLMENT_PENDING) */}
                            {order.status === "FULFILLMENT_PENDING" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  setShipFormOrder(
                                    shipFormOrder === order.id
                                      ? null
                                      : order.id,
                                  )
                                }
                                disabled={isActionLoading}
                              >
                                <Truck className="h-3 w-3 mr-1" />
                                {t("Ship")}
                              </Button>
                            )}

                            {/* Mark delivered (SHIPPED) */}
                            {order.status === "SHIPPED" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                onClick={() => handleDeliver(order.id)}
                                disabled={isActionLoading}
                              >
                                {isActionLoading ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                {t("Delivered")}
                              </Button>
                            )}

                            {/* Backorder (FULFILLMENT_PENDING) */}
                            {order.status === "FULFILLMENT_PENDING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-orange-600 border-orange-300"
                                onClick={() => handleBackorder(order.id)}
                                disabled={isActionLoading}
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {t("Backorder")}
                              </Button>
                            )}
                          </div>

                          {/* Inline ship form */}
                          {shipFormOrder === order.id && (
                            <ShipForm
                              orderId={order.id}
                              onSubmit={(data) =>
                                handleShip(order.id, data)
                              }
                              onCancel={() => setShipFormOrder(null)}
                            />
                          )}

                          {/* Inline Printful detail */}
                          {printfulDetail?.orderId === order.id && (
                            <PrintfulDetail data={printfulDetail.data} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t("Page")} {page} {t("of")} {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("Previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("Next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
