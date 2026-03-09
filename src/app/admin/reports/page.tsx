"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportDashboardReport, getDashboardStats, type DashboardStats } from "@/lib/api/adminReports";
import { getInventorySummary, type InventorySummary } from "@/lib/api/adminInventory";
import { listSupportTickets, type SupportTicket } from "@/lib/api/supportTooling";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const { success, error: showError } = useToast();

  const [dateRange, setDateRange] = useState<string>("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, inv, tix] = await Promise.all([
        getDashboardStats({ date_range: dateRange }),
        getInventorySummary(),
        listSupportTickets().catch(() => []),
      ]);
      setStats(s);
      setInventory(inv);
      setTickets(tix);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Failed to load reports.");
      setError(message);
      showError(message);
      setStats(null);
      setInventory(null);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const supportSummary = useMemo(() => {
    const openTickets = tickets.filter((x) => x.status !== "closed" && x.status !== "resolved");
    const firstResponseBreached = tickets.filter((x) => x.sla_first_response_status === "breached");
    const resolutionBreached = tickets.filter((x) => x.sla_resolution_status === "breached");

    const responseMins: number[] = [];
    for (const x of tickets) {
      if (!x.first_response_at) continue;
      const created = new Date(x.created_at).getTime();
      const first = new Date(x.first_response_at).getTime();
      if (!Number.isFinite(created) || !Number.isFinite(first) || first < created) continue;
      responseMins.push((first - created) / (60 * 1000));
    }
    const avgFirstResponseMins = responseMins.length
      ? Math.round(responseMins.reduce((a, b) => a + b, 0) / responseMins.length)
      : null;

    return {
      total: tickets.length,
      open: openTickets.length,
      firstResponseBreached: firstResponseBreached.length,
      resolutionBreached: resolutionBreached.length,
      avgFirstResponseMins,
    };
  }, [tickets]);

  const exportCsv = async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await exportDashboardReport({ format: "csv", date_range: dateRange });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard_report_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      success(t("Export started."));
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Export failed.");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("Reports")}</h1>
          <p className="text-sm text-muted-foreground">{t("Sales and operational KPIs across the platform.")}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-55">
              <SelectValue placeholder={t("Date range")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t("Last 7 days")}</SelectItem>
              <SelectItem value="month">{t("This month")}</SelectItem>
              <SelectItem value="quarter">{t("This quarter")}</SelectItem>
              <SelectItem value="year">{t("This year")}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refresh} variant="outline" disabled={loading}>
            {loading ? t("Loading...") : t("Refresh")}
          </Button>
          <Button onClick={exportCsv} variant="outline" disabled={loading}>
            {t("Export CSV")}
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-destructive">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("Sales")}</CardTitle>
            <CardDescription>{t("Total revenue")}</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ${toNumber(stats?.total_revenue).toFixed(2)}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("Orders")}</CardTitle>
            <CardDescription>{t("Total orders")}</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.total_orders ?? 0}</CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("Inventory")}</CardTitle>
            <CardDescription>{t("Low stock variants")}</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{inventory?.low_stock_variants ?? 0}</CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("Support")}</CardTitle>
            <CardDescription>{t("Open tickets")}</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{supportSummary.open}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("Support SLA")}</CardTitle>
            <CardDescription>{t("Breaches and response time from recent tickets")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>{t("First response breached")}</span><span className="font-semibold">{supportSummary.firstResponseBreached}</span></div>
            <div className="flex justify-between"><span>{t("Resolution breached")}</span><span className="font-semibold">{supportSummary.resolutionBreached}</span></div>
            <div className="flex justify-between"><span>{t("Avg first response (mins)")}</span><span className="font-semibold">{supportSummary.avgFirstResponseMins ?? "-"}</span></div>
            <div className="pt-2">
              <Link className="text-sm underline" href="/admin/support">{t("Go to Support")}</Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>{t("Risk")}</CardTitle>
            <CardDescription>{t("Security monitoring and suspicious patterns")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-muted-foreground">{t("Review current alerts and suspicious login patterns.")}</div>
            <Link className="text-sm underline" href="/admin/risk-monitoring">{t("Go to Risk Monitoring")}</Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
