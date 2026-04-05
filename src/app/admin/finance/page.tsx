"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  buildExportUrl,
  createRefund,
  getFinanceOverview,
  getReconciliationMissingItems,
  importProviderEvents,
  listChargebacks,
  listProviderEvents,
  listRefunds,
  listReconciliationRuns,
  runReconciliation,
  setChargebackStatus,
  type ChargebackCase,
  type ReconciliationMissingItems,
  type PaymentRefund,
  type ProviderEvent,
  type ReconciliationRun,
} from "@/lib/api/adminFinance";

const formatMoney = (value?: string | number | null) => {
  if (value === null || value === undefined) return "0.00";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return n.toFixed(2);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const PROVIDERS = ["stripe", "paypal"]; // aligned with backend enum values

export default function AdminFinancePage() {
  const { status: sessionStatus } = useSession();
  const { t } = useTranslation();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [provider, setProvider] = useState<string>("");
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");

  const [overview, setOverview] = useState<any>(null);

  const [providerEvents, setProviderEvents] = useState<ProviderEvent[]>([]);
  const [eventImportJson, setEventImportJson] = useState<string>(
    JSON.stringify(
      {
        provider: "stripe",
        events: [
          {
            provider_event_id: "evt_1",
            kind: "charge",
            currency: "USD",
            amount: "0.00",
            fee_amount: "0.00",
            net_amount: "0.00",
            provider_created_at: new Date().toISOString(),
            provider_payment_intent_id: "",
            provider_charge_id: "",
            raw_data: { source: "backoffice" },
          },
        ],
      },
      null,
      2
    )
  );

  const [runs, setRuns] = useState<ReconciliationRun[]>([]);
  const [runProvider, setRunProvider] = useState<string>("stripe");
  const [periodStart, setPeriodStart] = useState<string>(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  const [periodEnd, setPeriodEnd] = useState<string>(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

  const [chargebacks, setChargebacks] = useState<ChargebackCase[]>([]);
  const [chargebackStatusEdits, setChargebackStatusEdits] = useState<Record<number, string>>({});
  const [chargebackNoteEdits, setChargebackNoteEdits] = useState<Record<number, string>>({});
  const [chargebackEvidenceEdits, setChargebackEvidenceEdits] = useState<Record<number, string>>({});

  const [refunds, setRefunds] = useState<PaymentRefund[]>([]);
  const [refundOrderId, setRefundOrderId] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState<string>("admin_refund");

  const [selectedRun, setSelectedRun] = useState<ReconciliationRun | null>(null);
  const [missingItems, setMissingItems] = useState<ReconciliationMissingItems | null>(null);
  const [missingLoading, setMissingLoading] = useState(false);

  const overviewParams = useMemo(() => {
    const params: any = {};
    if (provider.trim()) params.provider = provider.trim();
    if (rangeStart.trim()) params.start = rangeStart.trim();
    if (rangeEnd.trim()) params.end = rangeEnd.trim();
    return params;
  }, [provider, rangeStart, rangeEnd]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, events, reconRuns, cases] = await Promise.all([
        getFinanceOverview(overviewParams),
        listProviderEvents({ provider: provider.trim() || undefined, page_size: 25 }),
        listReconciliationRuns({ page_size: 25 }),
        listChargebacks({ page_size: 25 }),
      ]);
      setOverview(ov);
      setProviderEvents(events);
      setRuns(reconRuns);
      setChargebacks(cases);
      const refundList = await listRefunds({ page_size: 25, provider: provider.trim() || undefined });
      setRefunds(refundList);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Failed to load finance dashboard.");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  useEffect(() => {
    if (!selectedRun) {
      setMissingItems(null);
      return;
    }

    let cancelled = false;
    setMissingLoading(true);
    setMissingItems(null);
    getReconciliationMissingItems(selectedRun.id, { limit: 200 })
      .then((data) => {
        if (cancelled) return;
        setMissingItems(data);
      })
      .catch((err: any) => {
        if (cancelled) return;
        const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || t("Failed to load drilldown.");
        setError(message);
        showError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setMissingLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRun?.id]);

  const handleImportEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(eventImportJson);
      const result = await importProviderEvents(parsed);
      success(t("Imported provider events (created: {{created}}, updated: {{updated}}).").replace("{{created}}", String(result.created)).replace("{{updated}}", String(result.updated)));
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || t("Import failed.");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunReconciliation = async () => {
    if (!runProvider || !periodStart || !periodEnd) {
      setError(t("Provider, period_start and period_end are required."));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await runReconciliation({ provider: runProvider, period_start: periodStart, period_end: periodEnd });
      success(t("Reconciliation run #{{id}} created ({{status}}).").replace("{{id}}", String(created.id)).replace("{{status}}", created.status));
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || t("Reconciliation failed.");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetChargebackStatus = async (caseId: number) => {
    const status = (chargebackStatusEdits[caseId] || "").trim();
    if (!status) return;

    setLoading(true);
    setError(null);
    try {
      await setChargebackStatus(caseId, {
        status,
        resolution_note: (chargebackNoteEdits[caseId] || "").trim() || undefined,
        evidence_reference: (chargebackEvidenceEdits[caseId] || "").trim() || undefined,
      });
      success(t("Chargeback updated."));
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || t("Update failed.");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRefund = async () => {
    const orderId = Number(refundOrderId);
    if (!orderId || Number.isNaN(orderId)) {
      setError(t("Valid order_id is required."));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createRefund({
        order_id: orderId,
        amount: refundAmount.trim() ? refundAmount.trim() : undefined,
        reason: (refundReason || "").trim() || undefined,
      });
      success(t("Refund submitted."));
      setRefundAmount("");
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || t("Refund failed.");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">{t("Finance")}</CardTitle>
              <CardDescription>{t("Provider events, reconciliation runs, and chargebacks.")}</CardDescription>
            </div>
            <CardAction>
              <Button onClick={refresh} disabled={loading}>
                {t("Refresh")}
              </Button>
            </CardAction>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-foreground">
              <span className="font-semibold">{t("Error:")} </span> {error}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("Provider (optional)")}</label>
            <Select
              value={provider || "__all__"}
              onValueChange={(value) => setProvider(value === "__all__" ? "" : value)}
            >
              <SelectTrigger aria-label={t("Provider")}>
                <SelectValue placeholder={t("All")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("All")}</SelectItem>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("Start (ISO datetime, optional)")}</label>
            <Input
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              placeholder={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("End (ISO datetime, optional)")}</label>
            <Input
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              placeholder={new Date().toISOString()}
            />
          </div>
        </div>

          {overview ? (
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">{t("Transactions")}</div>
                <div className="text-lg font-semibold text-foreground">{overview.transactions?.count ?? 0}</div>
                <div className="text-xs text-muted-foreground">{t("Gross:")} ${formatMoney(overview.transactions?.gross_amount)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">{t("Provider events")}</div>
                <div className="text-lg font-semibold text-foreground">{overview.provider_events?.count ?? 0}</div>
                <div className="text-xs text-muted-foreground">{t("Net:")} ${formatMoney(overview.provider_events?.net_amount)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">{t("Disputes")}</div>
                <div className="text-lg font-semibold text-foreground">{overview.disputes?.count ?? 0}</div>
                <div className="text-xs text-muted-foreground">{t("Amount:")} ${formatMoney(overview.disputes?.amount)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">{t("Chargebacks")}</div>
                <div className="text-lg font-semibold text-foreground">{overview.chargebacks?.count ?? 0}</div>
                <div className="text-xs text-muted-foreground">{t("Open:")} {overview.chargebacks?.by_status?.open ?? 0}</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle>{t("Refunds")}</CardTitle>
          <CardDescription>{t("Issue full or partial refunds by order ID.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("Order ID")}</label>
            <Input
              value={refundOrderId}
              onChange={(e) => setRefundOrderId(e.target.value)}
              placeholder={t("e.g. 123")}
              disabled={loading}
              aria-label={t("Refund order id")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("Amount (optional)")}</label>
            <Input
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder={t("Leave blank for remaining balance")}
              disabled={loading}
              aria-label={t("Refund amount")}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("Reason")}</label>
            <Input
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder={t("admin_refund")}
              disabled={loading}
              aria-label={t("Refund reason")}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button onClick={handleCreateRefund} disabled={loading}>
            {loading ? t("Working...") : t("Create refund")}
          </Button>
          <Button asChild variant="outline">
            <a
              href={buildExportUrl("/api/payments/admin-refunds/export/", {
                provider: provider.trim() || undefined,
                start: rangeStart.trim() || undefined,
                end: rangeEnd.trim() || undefined,
              })}
            >
              {t("Export refunds CSV")}
            </a>
          </Button>
        </div>

        <div className="mt-4 overflow-auto rounded-2xl border border-border">
          <div className="px-4 py-3 text-sm font-semibold">{t("Recent refunds")}</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left">{t("ID")}</th>
                <th className="px-4 py-2 text-left">{t("Order")}</th>
                <th className="px-4 py-2 text-left">{t("Provider")}</th>
                <th className="px-4 py-2 text-left">{t("Amount")}</th>
                <th className="px-4 py-2 text-left">{t("Created")}</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-2">#{r.id}</td>
                  <td className="px-4 py-2">{r.order_id}</td>
                  <td className="px-4 py-2">{r.provider}</td>
                  <td className="px-4 py-2">${formatMoney(r.amount)} {r.currency}</td>
                  <td className="px-4 py-2">{formatDateTime(r.created_at)}</td>
                </tr>
              ))}
              {!refunds.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-muted-foreground">
                    {t("No refunds.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{t("Provider events")}</CardTitle>
              <CardDescription>{t("Latest events (up to 25).")}</CardDescription>
            </div>
            <CardAction>
              <Button asChild variant="outline">
                <a
                  href={buildExportUrl("/api/payments/admin-provider-events/export/", {
                    provider: provider.trim() || undefined,
                  })}
                >
                  {t("Export provider events CSV")}
                </a>
              </Button>
            </CardAction>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-4">
            <div className="mb-2 text-sm font-semibold">{t("Import events (JSON)")}</div>
            <Textarea
              value={eventImportJson}
              onChange={(e) => setEventImportJson(e.target.value)}
              className="min-h-48 font-mono text-xs"
              aria-label={t("Import events JSON")}
            />
            <Button onClick={handleImportEvents} className="mt-3" disabled={loading}>
              {loading ? t("Working...") : t("Import")}
            </Button>
          </div>

          <div className="overflow-auto rounded-2xl border border-border">
            <div className="px-4 py-3 text-sm font-semibold">{t("Recent events")}</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 text-left">{t("Provider")}</th>
                  <th className="px-4 py-2 text-left">{t("Kind")}</th>
                  <th className="px-4 py-2 text-left">{t("Amount")}</th>
                  <th className="px-4 py-2 text-left">{t("Created")}</th>
                </tr>
              </thead>
              <tbody>
                {providerEvents.map((e) => (
                  <tr key={e.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-2">{e.provider}</td>
                    <td className="px-4 py-2">{e.kind}</td>
                    <td className="px-4 py-2">${formatMoney(e.net_amount || e.amount)}</td>
                    <td className="px-4 py-2">{formatDateTime(e.provider_created_at || e.created_at)}</td>
                  </tr>
                ))}
                {!providerEvents.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-muted-foreground">
                      {t("No events.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle>{t("Reconciliation")}</CardTitle>
          <CardDescription>{t("Create a reconciliation run for a provider + date range.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("Provider")}</label>
            <Select value={runProvider} onValueChange={setRunProvider}>
              <SelectTrigger aria-label={t("Reconciliation provider")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("Period start (ISO)")}</label>
            <Input
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              aria-label={t("Reconciliation period start")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("Period end (ISO)")}</label>
            <Input
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              aria-label={t("Reconciliation period end")}
            />
          </div>
        </div>

        <Button onClick={handleRunReconciliation} className="mt-3" disabled={loading}>
          {loading ? t("Working...") : t("Run reconciliation")}
        </Button>

        <div className="mt-4 overflow-auto rounded-2xl border border-border">
          <div className="px-4 py-3 text-sm font-semibold">{t("Recent runs")}</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left">{t("ID")}</th>
                <th className="px-4 py-2 text-left">{t("Provider")}</th>
                <th className="px-4 py-2 text-left">{t("Status")}</th>
                <th className="px-4 py-2 text-left">{t("Period")}</th>
                <th className="px-4 py-2 text-right">{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-2">#{r.id}</td>
                  <td className="px-4 py-2">{r.provider}</td>
                  <td className="px-4 py-2">{r.status}</td>
                  <td className="px-4 py-2">
                    {formatDateTime(r.period_start)} → {formatDateTime(r.period_end)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      onClick={() => setSelectedRun(r)}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      {t("View")}
                    </Button>
                  </td>
                </tr>
              ))}
              {!runs.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-muted-foreground">
                    {t("No runs.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedRun && (
          <div className="mt-4 rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{t("Run #")} {selectedRun.id}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedRun.provider} • {formatDateTime(selectedRun.period_start)} → {formatDateTime(selectedRun.period_end)}
                </div>
              </div>
              <Button onClick={() => setSelectedRun(null)} variant="outline" size="sm">
                {t("Close")}
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={buildExportUrl(`/api/payments/admin-reconciliation-runs/${selectedRun.id}/export/`)}>
                  {t("Export run CSV")}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href={buildExportUrl(`/api/payments/admin-reconciliation-runs/${selectedRun.id}/missing-items/export/`, {
                    limit: 200,
                  })}
                >
                  {t("Export missing items CSV")}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href={buildExportUrl("/api/payments/admin-transactions/export/", {
                    provider: selectedRun.provider,
                    start: selectedRun.period_start,
                    end: selectedRun.period_end,
                    include_refunded: 1,
                  })}
                >
                  {t("Export internal transactions CSV")}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href={buildExportUrl("/api/payments/admin-refunds/export/", {
                    provider: selectedRun.provider,
                    start: selectedRun.period_start,
                    end: selectedRun.period_end,
                  })}
                >
                  {t("Export internal refunds CSV")}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href={buildExportUrl("/api/payments/admin-provider-events/export/", {
                    provider: selectedRun.provider,
                  })}
                >
                  {t("Export provider events CSV")}
                </a>
              </Button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">{t("Internal summary")}</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedRun.internal_summary, null, 2)}</pre>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">{t("Provider summary")}</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedRun.provider_summary, null, 2)}</pre>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">{t("Mismatch summary")}</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedRun.mismatch_summary, null, 2)}</pre>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="overflow-auto rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{t("Missing internal transactions")}</div>
                    <div className="text-xs text-muted-foreground">{t("Charges with no matching imported provider charge event.")}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {missingLoading ? t("Loading...") : `${missingItems?.missing_transactions?.count ?? 0}`}
                  </div>
                </div>

                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="text-left py-2">{t("Txn")}</th>
                      <th className="text-left py-2">{t("Order")}</th>
                      <th className="text-left py-2">{t("Amount")}</th>
                      <th className="text-left py-2">{t("Created")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(missingItems?.missing_transactions?.items || []).map((txn) => (
                      <tr key={txn.payment_transaction_id} className="border-t border-border">
                        <td className="py-2">#{txn.payment_transaction_id}</td>
                        <td className="py-2">{txn.order_id}</td>
                        <td className="py-2">${formatMoney(txn.amount)} {txn.currency}</td>
                        <td className="py-2">{formatDateTime(txn.created_at)}</td>
                      </tr>
                    ))}
                    {!missingLoading && !(missingItems?.missing_transactions?.items || []).length && (
                      <tr>
                        <td colSpan={4} className="py-3 text-muted-foreground">
                          {t("None.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="overflow-auto rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{t("Missing internal refunds")}</div>
                    <div className="text-xs text-muted-foreground">{t("Refunds with no matching imported provider refund event.")}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {missingLoading ? t("Loading...") : `${missingItems?.missing_refunds?.count ?? 0}`}
                  </div>
                </div>

                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="text-left py-2">{t("Refund")}</th>
                      <th className="text-left py-2">{t("Order")}</th>
                      <th className="text-left py-2">{t("Amount")}</th>
                      <th className="text-left py-2">{t("Created")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(missingItems?.missing_refunds?.items || []).map((r) => (
                      <tr key={r.payment_refund_id} className="border-t border-border">
                        <td className="py-2">#{r.payment_refund_id}</td>
                        <td className="py-2">{r.order_id}</td>
                        <td className="py-2">${formatMoney(r.amount)} {r.currency}</td>
                        <td className="py-2">{formatDateTime(r.created_at)}</td>
                      </tr>
                    ))}
                    {!missingLoading && !(missingItems?.missing_refunds?.items || []).length && (
                      <tr>
                        <td colSpan={4} className="py-3 text-muted-foreground">
                          {t("None.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle>{t("Chargebacks")}</CardTitle>
          <CardDescription>{t("Update status and attach evidence reference / notes.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
          {chargebacks.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-semibold">{t("Case")} #{c.id} • {c.provider} • {c.status}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("Dispute:")} {c.provider_dispute_id} • {t("reason:")} {c.reason} • {t("amount:")} ${formatMoney(c.amount)} {c.currency}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t("Order:")} {c.order_id ?? "-"} • {t("user:")} {c.user_id ?? "-"} • {t("created:")} {formatDateTime(c.created_at)}
                  </div>
                </div>

                <div className="grid gap-2 md:w-96">
                  <Select
                    value={chargebackStatusEdits[c.id] ?? c.status}
                    onValueChange={(value) => setChargebackStatusEdits((p) => ({ ...p, [c.id]: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger aria-label={`Chargeback status ${c.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">open</SelectItem>
                      <SelectItem value="investigating">investigating</SelectItem>
                      <SelectItem value="evidence_submitted">evidence_submitted</SelectItem>
                      <SelectItem value="won">won</SelectItem>
                      <SelectItem value="lost">lost</SelectItem>
                      <SelectItem value="closed">closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={chargebackEvidenceEdits[c.id] ?? c.evidence_reference ?? ""}
                    onChange={(e) => setChargebackEvidenceEdits((p) => ({ ...p, [c.id]: e.target.value }))}
                    placeholder={t("Evidence reference (optional)")}
                    disabled={loading}
                  />
                  <Input
                    value={chargebackNoteEdits[c.id] ?? c.resolution_note ?? ""}
                    onChange={(e) => setChargebackNoteEdits((p) => ({ ...p, [c.id]: e.target.value }))}
                    placeholder={t("Resolution note (optional)")}
                    disabled={loading}
                  />
                  <Button onClick={() => handleSetChargebackStatus(c.id)} disabled={loading}>
                    {t("Update")}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {!chargebacks.length && <div className="text-sm text-muted-foreground">{t("No chargebacks.")}</div>}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
