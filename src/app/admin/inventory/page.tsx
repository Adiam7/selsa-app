"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  applyReconciliation,
  createReconciliation,
  createInventoryAdjustment,
  exportInventoryAuditEventsCsv,
  exportReconciliationCsv,
  getInventorySummary,
  getReconciliation,
  listInventoryAuditEvents,
  listInventoryHealth,
  listReconciliations,
  listSkuHistory,
  type InventoryAuditEvent,
  type InventoryHealthVariant,
  type InventoryReconciliation,
  type VariantSkuHistory,
} from "@/lib/api/adminInventory";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

type DraftLine = { sku: string; counted_quantity: string };

export default function AdminInventoryPage() {
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<any>(null);
  const [reconciliations, setReconciliations] = useState<InventoryReconciliation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<InventoryReconciliation | null>(null);

  const [notes, setNotes] = useState<string>("");
  const [applyNow, setApplyNow] = useState<boolean>(false);
  const [lines, setLines] = useState<DraftLine[]>([{ sku: "", counted_quantity: "" }]);

  const [healthLevel, setHealthLevel] = useState<"low" | "zero" | "negative">("low");
  const [healthRows, setHealthRows] = useState<InventoryHealthVariant[]>([]);

  const [lookupSku, setLookupSku] = useState<string>("");
  const [auditEvents, setAuditEvents] = useState<InventoryAuditEvent[]>([]);
  const [skuHistory, setSkuHistory] = useState<VariantSkuHistory[]>([]);

  const [auditDateFrom, setAuditDateFrom] = useState<string>("");
  const [auditDateTo, setAuditDateTo] = useState<string>("");

  const [adjustMode, setAdjustMode] = useState<"set" | "delta">("set");
  const [adjustValue, setAdjustValue] = useState<string>("");
  const [adjustReason, setAdjustReason] = useState<string>("");

  const canCreate = useMemo(() => {
    const validLines = lines
      .map((l) => ({ sku: l.sku.trim(), qty: l.counted_quantity.trim() }))
      .filter((l) => l.sku && l.qty);
    return validLines.length > 0;
  }, [lines]);

  const refresh = async (opts?: { keepSelection?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const [s, recs] = await Promise.all([getInventorySummary(), listReconciliations({ page_size: 25 })]);
      setSummary(s);
      setReconciliations(recs);

      if (opts?.keepSelection && selectedId) {
        const fresh = await getReconciliation(selectedId);
        setSelected(fresh);
      }
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Failed to load inventory.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHealth = async (level: "low" | "zero" | "negative") => {
    setHealthLevel(level);
    setLoading(true);
    setError(null);
    try {
      const rows = await listInventoryHealth({ level, threshold: 5, page_size: 50 });
      setHealthRows(rows);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Failed to load inventory drilldown.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const lookup = async () => {
    const sku = lookupSku.trim();
    if (!sku) {
      setError("Enter a SKU to lookup history.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [events, history] = await Promise.all([
        listInventoryAuditEvents({ sku, page_size: 50 }),
        listSkuHistory({ sku, page_size: 50 }),
      ]);
      setAuditEvents(events);
      setSkuHistory(history);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Lookup failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditCsv = async () => {
    const sku = lookupSku.trim();
    if (!sku) {
      setError("Enter a SKU to export.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const blob = await exportInventoryAuditEventsCsv({
        sku,
        date_from: auditDateFrom || undefined,
        date_to: auditDateTo || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const suffix = [auditDateFrom, auditDateTo].filter(Boolean).join("_") || "all";
      a.download = `inventory_audit_${sku}_${suffix}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      success("Export started.");
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Export failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const adjust = async () => {
    const sku = lookupSku.trim();
    const value = Number(adjustValue);
    if (!sku) {
      setError("Enter a SKU to adjust.");
      return;
    }
    if (!Number.isFinite(value)) {
      setError("Adjustment value must be a number.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createInventoryAdjustment({
        sku,
        source: "local",
        mode: adjustMode,
        value,
        reason: adjustReason.trim() || undefined,
      });
      success(`Stock updated: ${res.sku} → ${res.stock_quantity}`);
      setAdjustValue("");
      setAdjustReason("");
      await refresh({ keepSelection: true });
      await lookup();
      if (healthRows.length) {
        await loadHealth(healthLevel);
      }
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Adjustment failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const select = async (id: number) => {
    setSelectedId(id);
    setLoading(true);
    setError(null);
    try {
      const data = await getReconciliation(id);
      setSelected(data);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Failed to load reconciliation.";
      setError(message);
      showError(message);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const updateLine = (index: number, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const addLine = () => setLines((p) => [...p, { sku: "", counted_quantity: "" }]);
  const removeLine = (index: number) => setLines((p) => p.filter((_, i) => i !== index));

  const handleCreate = async () => {
    if (!canCreate) {
      setError("Add at least one line with SKU and counted quantity.");
      return;
    }

    const payloadLines = lines
      .map((l) => ({ sku: l.sku.trim(), counted_quantity: Number(l.counted_quantity) }))
      .filter((l) => l.sku && Number.isFinite(l.counted_quantity) && l.counted_quantity >= 0)
      .map((l) => ({ sku: l.sku, counted_quantity: l.counted_quantity, source: "local" }));

    if (!payloadLines.length) {
      setError("Lines are invalid. counted_quantity must be a non-negative number.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await createReconciliation({
        notes: notes.trim() || undefined,
        apply: applyNow,
        lines: payloadLines,
      });
      success(`Reconciliation #${created.id} created.`);
      setNotes("");
      setApplyNow(false);
      setLines([{ sku: "", counted_quantity: "" }]);
      await refresh();
      await select(created.id);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Create failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await applyReconciliation(selectedId);
      setSelected(updated);
      success("Reconciliation applied.");
      await refresh({ keepSelection: true });
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Apply failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await exportReconciliationCsv(selectedId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory_reconciliation_${selectedId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      success("Export started.");
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Export failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Inventory</h1>
            <p className="text-sm text-gray-500">Stock health and inventory reconciliations.</p>
          </div>
          <Button onClick={() => refresh({ keepSelection: true })} variant="outline" disabled={loading}>
            Refresh
          </Button>
        </div>

        {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div>}

        {summary && (
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Local finite variants</div>
              <div className="text-lg font-semibold">{summary.local_finite_variants}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Negative stock</div>
              <div className="text-lg font-semibold">{summary.negative_stock_variants}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Zero stock</div>
              <div className="text-lg font-semibold">{summary.zero_stock_variants}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Low stock (≤ 5)</div>
              <div className="text-lg font-semibold">{summary.low_stock_variants}</div>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="text-xs font-semibold text-gray-600">Drilldowns</div>
          <Button
            onClick={() => loadHealth("low")}
            variant="outline"
            className={healthLevel === "low" ? "border-foreground" : ""}
            disabled={loading}
          >
            Low stock
          </Button>
          <Button
            onClick={() => loadHealth("zero")}
            variant="outline"
            className={healthLevel === "zero" ? "border-foreground" : ""}
            disabled={loading}
          >
            Zero stock
          </Button>
          <Button
            onClick={() => loadHealth("negative")}
            variant="outline"
            className={healthLevel === "negative" ? "border-foreground" : ""}
            disabled={loading}
          >
            Negative stock
          </Button>
        </div>

        {!!healthRows.length && (
          <div className="mt-4 overflow-auto rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50">
                  <th className="text-left py-2 px-3">SKU</th>
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Qty</th>
                  <th className="text-left py-2 px-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {healthRows.map((r) => (
                  <tr key={r.variant_id} className="border-t">
                    <td className="py-2 px-3 font-mono text-xs">{r.sku}</td>
                    <td className="py-2 px-3">{r.name}</td>
                    <td className="py-2 px-3">{r.stock_quantity}</td>
                    <td className="py-2 px-3 text-xs text-gray-500">{formatDateTime(r.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Audit & SKU history</h2>
        <p className="text-sm text-gray-500">Lookup per-SKU stock adjustments and SKU changes. Adjust stock if needed.</p>

        <div className="mt-4 grid gap-3">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">SKU</label>
              <Input
                value={lookupSku}
                onChange={(e) => setLookupSku(e.target.value)}
                placeholder="SKU"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={lookup} className="w-full" disabled={loading}>
                {loading ? "Working..." : "Lookup"}
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">From (optional)</label>
              <input
                type="date"
                value={auditDateFrom}
                onChange={(e) => setAuditDateFrom(e.target.value)}
                aria-label="Audit export from date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">To (optional)</label>
              <input
                type="date"
                value={auditDateTo}
                onChange={(e) => setAuditDateTo(e.target.value)}
                aria-label="Audit export to date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={exportAuditCsv} className="w-full" variant="outline" disabled={loading}>
                Export audit CSV
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Adjustment mode</label>
              <Select
                value={adjustMode}
                onValueChange={(value) => setAdjustMode(value as any)}
                disabled={loading}
              >
                <SelectTrigger aria-label="Adjustment mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set to quantity</SelectItem>
                  <SelectItem value="delta">Add / subtract delta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Value</label>
              <Input
                value={adjustValue}
                onChange={(e) => setAdjustValue(e.target.value)}
                placeholder={adjustMode === "set" ? "e.g. 10" : "e.g. -2"}
                inputMode="numeric"
                disabled={loading}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reason (optional)</label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Damage, found inventory, correction, etc."
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={adjust} variant="outline" disabled={loading}>
              Apply adjustment
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 overflow-auto">
              <div className="px-3 py-2 text-sm font-semibold border-b">Audit events</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 bg-gray-50">
                    <th className="text-left py-2 px-3">When</th>
                    <th className="text-left py-2 px-3">Type</th>
                    <th className="text-left py-2 px-3">Δ</th>
                    <th className="text-left py-2 px-3">Before→After</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEvents.map((ev) => (
                    <tr key={ev.id} className="border-t">
                      <td className="py-2 px-3 text-xs text-gray-500">{formatDateTime(ev.created_at)}</td>
                      <td className="py-2 px-3">{ev.event_type}</td>
                      <td className="py-2 px-3">{ev.delta ?? "-"}</td>
                      <td className="py-2 px-3">
                        {ev.stock_before ?? "-"} → {ev.stock_after ?? "-"}
                      </td>
                    </tr>
                  ))}
                  {!auditEvents.length && (
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-gray-500">
                        No audit events.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-md border overflow-auto">
              <div className="px-3 py-2 text-sm font-semibold border-b">SKU history</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 bg-gray-50">
                    <th className="text-left py-2 px-3">When</th>
                    <th className="text-left py-2 px-3">Old</th>
                    <th className="text-left py-2 px-3">New</th>
                  </tr>
                </thead>
                <tbody>
                  {skuHistory.map((h) => (
                    <tr key={h.id} className="border-t">
                      <td className="py-2 px-3 text-xs text-gray-500">{formatDateTime(h.created_at)}</td>
                      <td className="py-2 px-3 font-mono text-xs">{h.old_sku}</td>
                      <td className="py-2 px-3 font-mono text-xs">{h.new_sku}</td>
                    </tr>
                  ))}
                  {!skuHistory.length && (
                    <tr>
                      <td colSpan={3} className="py-3 px-3 text-gray-500">
                        No SKU history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold">New reconciliation</h2>
        <p className="text-sm text-gray-500">Add SKU counts, then create (optionally apply if permitted).</p>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Cycle count / adjustment reason"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={applyNow} onChange={(e) => setApplyNow(e.target.checked)} disabled={loading} />
            Apply immediately (requires permission)
          </label>

          <div className="rounded-2xl border border-gray-200 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50">
                  <th className="text-left py-2 px-3">SKU</th>
                  <th className="text-left py-2 px-3">Counted qty</th>
                  <th className="text-left py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 px-3">
                      <input
                        value={l.sku}
                        onChange={(e) => updateLine(idx, { sku: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="SKU"
                        disabled={loading}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        value={l.counted_quantity}
                        onChange={(e) => updateLine(idx, { counted_quantity: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="0"
                        inputMode="numeric"
                        disabled={loading}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => removeLine(idx)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                        disabled={loading || lines.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button onClick={addLine} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50" disabled={loading}>
              Add line
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-md bg-black text-white text-sm font-semibold"
              disabled={loading}
            >
              {loading ? "Working..." : "Create reconciliation"}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Recent reconciliations</div>
              <div className="text-xs text-gray-500">{reconciliations.length}</div>
            </div>

            <div className="grid gap-2 max-h-130 overflow-auto">
              {reconciliations.map((r) => (
                <button
                  key={r.id}
                  onClick={() => select(r.id)}
                  className={`text-left rounded-xl border border-gray-200 p-3 hover:bg-gray-50 ${r.id === selectedId ? "border-black" : ""}`}
                  disabled={loading}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">#{r.id} • {r.status}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDateTime(r.created_at)}</div>
                    </div>
                    <div className="text-xs text-gray-500">lines: {r.total_lines}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    mismatched: {r.mismatched_lines} • variance: {r.total_variance}
                  </div>
                </button>
              ))}
              {!reconciliations.length && <div className="text-sm text-gray-500">No reconciliations yet.</div>}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500">Reconciliation</div>
                <div className="text-lg font-semibold">
                  {selected ? `#${selected.id} • ${selected.status}` : "Select a reconciliation"}
                </div>
                {selected && (
                  <div className="text-xs text-gray-500 mt-1">
                    Created: {formatDateTime(selected.created_at)} • by: {selected.created_by_email || "-"}
                  </div>
                )}
              </div>

              {selected && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 rounded-md border text-sm font-semibold"
                    disabled={loading}
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 rounded-md bg-black text-white text-sm font-semibold"
                    disabled={loading}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {selected && (
              <div className="mt-4 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 bg-gray-50">
                      <th className="text-left py-2 px-3">SKU</th>
                      <th className="text-left py-2 px-3">System</th>
                      <th className="text-left py-2 px-3">Counted</th>
                      <th className="text-left py-2 px-3">Variance</th>
                      <th className="text-left py-2 px-3">Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines?.map((l) => (
                      <tr key={l.id} className="border-t">
                        <td className="py-2 px-3">{l.sku}</td>
                        <td className="py-2 px-3">{l.system_quantity}</td>
                        <td className="py-2 px-3">{l.counted_quantity}</td>
                        <td className="py-2 px-3">{l.variance}</td>
                        <td className="py-2 px-3">{l.applied ? "yes" : "no"}</td>
                      </tr>
                    ))}
                    {!selected.lines?.length && (
                      <tr>
                        <td colSpan={5} className="py-3 text-gray-500">
                          No lines.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
