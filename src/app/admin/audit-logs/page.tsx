"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/Toast";
import { getAdminAuditLogs, type AdminAuditLog } from "@/lib/api/adminOrders";
import {
  listInventoryAuditEventsPaginated,
  type InventoryAuditEvent,
} from "@/lib/api/adminInventory";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

function summarizeMetadata(meta: Record<string, any> | null | undefined): string {
  if (!meta) return "";
  try {
    const keys = Object.keys(meta);
    if (keys.length === 0) return "";
    return keys.slice(0, 3).join(", ") + (keys.length > 3 ? "…" : "");
  } catch {
    return "";
  }
}

export default function AdminAuditLogsPage() {
  const { t } = useTranslation();
  const { error: showError } = useToast();

  const [tab, setTab] = useState<"orders" | "inventory">("orders");

  // Orders audit
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersCount, setOrdersCount] = useState(0);
  const [orderLogs, setOrderLogs] = useState<AdminAuditLog[]>([]);
  const [orderId, setOrderId] = useState("");
  const [orderAction, setOrderAction] = useState("");
  const [orderActorEmail, setOrderActorEmail] = useState("");

  const ordersParams = useMemo(() => {
    return {
      orderId: orderId.trim() || undefined,
      action: orderAction.trim() || undefined,
      actorEmail: orderActorEmail.trim() || undefined,
      page: ordersPage,
      pageSize: 25,
    };
  }, [orderAction, orderActorEmail, orderId, ordersPage]);

  const loadOrderLogs = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await getAdminAuditLogs(ordersParams);
      setOrderLogs(res.items);
      setOrdersCount(res.count);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || t("Failed to load order audit logs.");
      setOrdersError(message);
      setOrderLogs([]);
      setOrdersCount(0);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    void loadOrderLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersParams]);

  const ordersTotalPages = Math.max(1, Math.ceil(ordersCount / 25));

  // Inventory audit
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [inventoryEvents, setInventoryEvents] = useState<InventoryAuditEvent[]>([]);

  const [invSku, setInvSku] = useState("");
  const [invVariantId, setInvVariantId] = useState("");
  const [invEventType, setInvEventType] = useState("");

  const inventoryParams = useMemo(() => {
    const variantId = Number(invVariantId);
    return {
      sku: invSku.trim() || undefined,
      variant_id: Number.isFinite(variantId) && invVariantId.trim() ? variantId : undefined,
      event_type: invEventType.trim() || undefined,
      page: inventoryPage,
      page_size: 25,
    };
  }, [invEventType, invSku, invVariantId, inventoryPage]);

  const loadInventoryEvents = async () => {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const res = await listInventoryAuditEventsPaginated(inventoryParams);
      setInventoryEvents(res.items);
      setInventoryCount(res.count);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || t("Failed to load inventory audit events.");
      setInventoryError(message);
      setInventoryEvents([]);
      setInventoryCount(0);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    void loadInventoryEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryParams]);

  const inventoryTotalPages = Math.max(1, Math.ceil(inventoryCount / 25));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("Audit Logs")}</h1>
          <p className="text-sm text-muted-foreground">{t("A unified trail of important actions across Orders and Inventory.")}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="w-fit justify-start border border-input bg-transparent">
          <TabsTrigger value="orders">{t("Orders")}</TabsTrigger>
          <TabsTrigger value="inventory">{t("Inventory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4 space-y-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">{t("Order audit logs")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="space-y-1">
                  <Label htmlFor="orderId">{t("Order ID")}</Label>
                  <Input
                    id="orderId"
                    value={orderId}
                    onChange={(e) => {
                      setOrdersPage(1);
                      setOrderId(e.target.value);
                    }}
                    placeholder={t("e.g. 123")}
                    className="w-40"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="orderAction">{t("Action")}</Label>
                  <Input
                    id="orderAction"
                    value={orderAction}
                    onChange={(e) => {
                      setOrdersPage(1);
                      setOrderAction(e.target.value);
                    }}
                    placeholder={t("e.g. cancel, refund")}
                    className="w-56"
                  />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <Label htmlFor="orderActor">{t("Actor email")}</Label>
                  <Input
                    id="orderActor"
                    value={orderActorEmail}
                    onChange={(e) => {
                      setOrdersPage(1);
                      setOrderActorEmail(e.target.value);
                    }}
                    placeholder={t("e.g. staff@company.com")}
                  />
                </div>

                <Button variant="outline" onClick={loadOrderLogs} disabled={ordersLoading}>
                  {ordersLoading ? t("Loading...") : t("Refresh")}
                </Button>
              </div>

              {ordersError ? <div className="text-sm text-destructive">{ordersError}</div> : null}

              {orderLogs.length === 0 ? (
                <div className="text-sm text-muted-foreground">{ordersLoading ? t("Loading...") : t("No audit logs found.")}</div>
              ) : (
                <div className="divide-y rounded-lg border">
                  {orderLogs.map((log) => {
                    const status = log.status_to || log.status_from || "";
                    const meta = summarizeMetadata(log.metadata);
                    return (
                      <div key={log.id} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {log.action}{status ? ` · ${status}` : ""}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {t("Order")} #{log.order_id} · {log.actor_email || t("System")} · {formatDateTime(log.created_at)}{meta ? ` · ${t("meta")}: ${meta}` : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-muted-foreground">
                  {t("Showing page")} {ordersPage} {t("of")} {ordersTotalPages} ({ordersCount} {t("total")})
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={ordersLoading || ordersPage <= 1}
                    onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                  >
                    {t("Previous")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={ordersLoading || ordersPage >= ordersTotalPages}
                    onClick={() => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))}
                  >
                    {t("Next")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4 space-y-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">{t("Inventory audit events")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="space-y-1">
                  <Label htmlFor="invSku">{t("SKU")}</Label>
                  <Input
                    id="invSku"
                    value={invSku}
                    onChange={(e) => {
                      setInventoryPage(1);
                      setInvSku(e.target.value);
                    }}
                    placeholder={t("e.g. ABC-123")}
                    className="w-56"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="invVariant">{t("Variant ID")}</Label>
                  <Input
                    id="invVariant"
                    value={invVariantId}
                    onChange={(e) => {
                      setInventoryPage(1);
                      setInvVariantId(e.target.value);
                    }}
                    placeholder={t("e.g. 456")}
                    className="w-40"
                  />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <Label htmlFor="invType">{t("Event type")}</Label>
                  <Input
                    id="invType"
                    value={invEventType}
                    onChange={(e) => {
                      setInventoryPage(1);
                      setInvEventType(e.target.value);
                    }}
                    placeholder={t("e.g. adjustment, reconciliation")}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await loadInventoryEvents();
                    } catch (err: any) {
                      showError(err?.message || t("Failed to refresh."));
                    }
                  }}
                  disabled={inventoryLoading}
                >
                  {inventoryLoading ? t("Loading...") : t("Refresh")}
                </Button>
              </div>

              {inventoryError ? <div className="text-sm text-destructive">{inventoryError}</div> : null}

              {inventoryEvents.length === 0 ? (
                <div className="text-sm text-muted-foreground">{inventoryLoading ? t("Loading...") : t("No audit events found.")}</div>
              ) : (
                <div className="divide-y rounded-lg border">
                  {inventoryEvents.map((ev) => {
                    const delta = ev.delta ?? 0;
                    const deltaText = Number.isFinite(delta) ? (delta > 0 ? `+${delta}` : String(delta)) : "-";
                    const actor = ev.actor_email || t("System");
                    const meta = summarizeMetadata(ev.metadata);
                    return (
                      <div key={ev.id} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {ev.event_type} · {ev.sku} · {t("Δ")} {deltaText}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {t("Before")} {ev.stock_before ?? "-"} → {t("After")} {ev.stock_after ?? "-"} · {actor} · {formatDateTime(ev.created_at)}{meta ? ` · ${t("meta")}: ${meta}` : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-muted-foreground">
                  {t("Showing page")} {inventoryPage} {t("of")} {inventoryTotalPages} ({inventoryCount} {t("total")})
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={inventoryLoading || inventoryPage <= 1}
                    onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                  >
                    {t("Previous")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={inventoryLoading || inventoryPage >= inventoryTotalPages}
                    onClick={() => setInventoryPage((p) => Math.min(inventoryTotalPages, p + 1))}
                  >
                    {t("Next")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
