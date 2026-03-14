"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
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
      const message = err?.response?.data?.error || err?.message || "Failed to load finance dashboard.";
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
        const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Failed to load drilldown.";
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
      success(`Imported provider events (created: ${result.created}, updated: ${result.updated}).`);
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Import failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunReconciliation = async () => {
    if (!runProvider || !periodStart || !periodEnd) {
      setError("Provider, period_start and period_end are required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await runReconciliation({ provider: runProvider, period_start: periodStart, period_end: periodEnd });
      success(`Reconciliation run #${created.id} created (${created.status}).`);
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Reconciliation failed.";
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
      success("Chargeback updated.");
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Update failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRefund = async () => {
    const orderId = Number(refundOrderId);
    if (!orderId || Number.isNaN(orderId)) {
      setError("Valid order_id is required.");
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
      success("Refund submitted.");
      setRefundAmount("");
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Refund failed.";
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
              <CardTitle className="text-3xl">Finance</CardTitle>
              <CardDescription>Provider events, reconciliation runs, and chargebacks.</CardDescription>
            </div>
            <CardAction>
              <Button onClick={refresh} disabled={loading}>
                Refresh
              </Button>
            </CardAction>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-foreground">
              <span className="font-semibold">Error:</span> {error}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Provider (optional)</label>
            <Select
              value={provider || "__all__"}
              onValueChange={(value) => setProvider(value === "__all__" ? "" : value)}
            >
              <SelectTrigger aria-label="Provider">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Start (ISO datetime, optional)</label>
            <Input
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              placeholder={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">End (ISO datetime, optional)</label>
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
                <div className="text-xs text-muted-foreground">Transactions</div>
                <div className="text-lg font-semibold text-foreground">{overview.transactions?.count ?? 0}</div>
                <div className="text-xs text-muted-foreground">Gross: ${formatMoney(overview.transactions?.gross_amount)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">Provider events</div>
                <div className="text-lg font-semibold text-foreground">{overview.provider_events?.count ?? 0}</div>
                <div className="text-xs text-muted-foreground">Net: ${formatMoney(overview.provider_events?.net_amount)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">Disputes</div>
                <div className="text-lg font-semibold text-foreground">{overview.disputes?.count ?? 0}</div>
                <div className="text-xs text-muted-foreground">Amount: ${formatMoney(overview.disputes?.amount)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">Chargebacks</div>
                <div className="text-lg font-semibold text-foreground">{overview.chargebacks?.count ?? 0}</div>
                <div className="text-xs text-muted-foreground">Open: {overview.chargebacks?.by_status?.open ?? 0}</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle>Refunds</CardTitle>
          <CardDescription>Issue full or partial refunds by order ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Order ID</label>
            <Input
              value={refundOrderId}
              onChange={(e) => setRefundOrderId(e.target.value)}
              placeholder="e.g. 123"
              disabled={loading}
              aria-label="Refund order id"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount (optional)</label>
            <Input
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="Leave blank for remaining balance"
              disabled={loading}
              aria-label="Refund amount"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Reason</label>
            <Input
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="admin_refund"
              disabled={loading}
              aria-label="Refund reason"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button onClick={handleCreateRefund} disabled={loading}>
            {loading ? "Working..." : "Create refund"}
          </Button>
          <Button asChild variant="outline">
            <a
              href={buildExportUrl("/api/payments/admin-refunds/export/", {
                provider: provider.trim() || undefined,
                start: rangeStart.trim() || undefined,
                end: rangeEnd.trim() || undefined,
              })}
            >
              Export refunds CSV
            </a>
          </Button>
        </div>

        <div className="mt-4 overflow-auto rounded-2xl border border-border">
          <div className="px-4 py-3 text-sm font-semibold">Recent refunds</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Order</th>
                <th className="px-4 py-2 text-left">Provider</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Created</th>
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
                    No refunds.
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
              <CardTitle>Provider events</CardTitle>
              <CardDescription>Latest events (up to 25).</CardDescription>
            </div>
            <CardAction>
              <Button asChild variant="outline">
                <a
                  href={buildExportUrl("/api/payments/admin-provider-events/export/", {
                    provider: provider.trim() || undefined,
                  })}
                >
                  Export provider events CSV
                </a>
              </Button>
            </CardAction>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-4">
            <div className="mb-2 text-sm font-semibold">Import events (JSON)</div>
            <Textarea
              value={eventImportJson}
              onChange={(e) => setEventImportJson(e.target.value)}
              className="min-h-48 font-mono text-xs"
              aria-label="Import events JSON"
            />
            <Button onClick={handleImportEvents} className="mt-3" disabled={loading}>
              {loading ? "Working..." : "Import"}
            </Button>
          </div>

          <div className="overflow-auto rounded-2xl border border-border">
            <div className="px-4 py-3 text-sm font-semibold">Recent events</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 text-left">Provider</th>
                  <th className="px-4 py-2 text-left">Kind</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Created</th>
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
                      No events.
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
          <CardTitle>Reconciliation</CardTitle>
          <CardDescription>Create a reconciliation run for a provider + date range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Provider</label>
            <Select value={runProvider} onValueChange={setRunProvider}>
              <SelectTrigger aria-label="Reconciliation provider">
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
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Period start (ISO)</label>
            <Input
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              aria-label="Reconciliation period start"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Period end (ISO)</label>
            <Input
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              aria-label="Reconciliation period end"
            />
          </div>
        </div>

        <Button onClick={handleRunReconciliation} className="mt-3" disabled={loading}>
          {loading ? "Working..." : "Run reconciliation"}
        </Button>

        <div className="mt-4 overflow-auto rounded-2xl border border-border">
          <div className="px-4 py-3 text-sm font-semibold">Recent runs</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Provider</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Period</th>
                <th className="px-4 py-2 text-right">Action</th>
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
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {!runs.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-muted-foreground">
                    No runs.
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
                <div className="text-sm font-semibold">Run #{selectedRun.id}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedRun.provider} • {formatDateTime(selectedRun.period_start)} → {formatDateTime(selectedRun.period_end)}
                </div>
              </div>
              <Button onClick={() => setSelectedRun(null)} variant="outline" size="sm">
                Close
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={buildExportUrl(`/api/payments/admin-reconciliation-runs/${selectedRun.id}/export/`)}>
                  Export run CSV
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href={buildExportUrl(`/api/payments/admin-reconciliation-runs/${selectedRun.id}/missing-items/export/`, {
                    limit: 200,
                  })}
                >
                  Export missing items CSV
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
                  Export internal transactions CSV
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
                  Export internal refunds CSV
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href={buildExportUrl("/api/payments/admin-provider-events/export/", {
                    provider: selectedRun.provider,
                  })}
                >
                  Export provider events CSV
                </a>
              </Button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">Internal summary</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedRun.internal_summary, null, 2)}</pre>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">Provider summary</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedRun.provider_summary, null, 2)}</pre>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">Mismatch summary</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedRun.mismatch_summary, null, 2)}</pre>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="overflow-auto rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Missing internal transactions</div>
                    <div className="text-xs text-muted-foreground">Charges with no matching imported provider charge event.</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {missingLoading ? "Loading..." : `${missingItems?.missing_transactions?.count ?? 0}`}
                  </div>
                </div>

                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="text-left py-2">Txn</th>
                      <th className="text-left py-2">Order</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(missingItems?.missing_transactions?.items || []).map((t) => (
                      <tr key={t.payment_transaction_id} className="border-t border-border">
                        <td className="py-2">#{t.payment_transaction_id}</td>
                        <td className="py-2">{t.order_id}</td>
                        <td className="py-2">${formatMoney(t.amount)} {t.currency}</td>
                        <td className="py-2">{formatDateTime(t.created_at)}</td>
                      </tr>
                    ))}
                    {!missingLoading && !(missingItems?.missing_transactions?.items || []).length && (
                      <tr>
                        <td colSpan={4} className="py-3 text-muted-foreground">
                          None.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="overflow-auto rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Missing internal refunds</div>
                    <div className="text-xs text-muted-foreground">Refunds with no matching imported provider refund event.</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {missingLoading ? "Loading..." : `${missingItems?.missing_refunds?.count ?? 0}`}
                  </div>
                </div>

                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="text-left py-2">Refund</th>
                      <th className="text-left py-2">Order</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Created</th>
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
                          None.
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
          <CardTitle>Chargebacks</CardTitle>
          <CardDescription>Update status and attach evidence reference / notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
          {chargebacks.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-semibold">Case #{c.id} • {c.provider} • {c.status}</div>
                  <div className="text-sm text-muted-foreground">
                    Dispute: {c.provider_dispute_id} • reason: {c.reason} • amount: ${formatMoney(c.amount)} {c.currency}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Order: {c.order_id ?? "-"} • user: {c.user_id ?? "-"} • created: {formatDateTime(c.created_at)}
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
                    placeholder="Evidence reference (optional)"
                    disabled={loading}
                  />
                  <Input
                    value={chargebackNoteEdits[c.id] ?? c.resolution_note ?? ""}
                    onChange={(e) => setChargebackNoteEdits((p) => ({ ...p, [c.id]: e.target.value }))}
                    placeholder="Resolution note (optional)"
                    disabled={loading}
                  />
                  <Button onClick={() => handleSetChargebackStatus(c.id)} disabled={loading}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {!chargebacks.length && <div className="text-sm text-muted-foreground">No chargebacks.</div>}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
