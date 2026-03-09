import { apiClient } from "@/lib/api/client";

export type FinanceOverview = {
  provider: string | null;
  range: { start: string | null; end: string | null };
  transactions: { count: number; gross_amount: string };
  provider_events: { count: number; amount: string; fee_amount: string; net_amount: string };
  disputes: { count: number; amount: string };
  chargebacks: { count: number; by_status: Record<string, number> };
};

export type ProviderEvent = {
  id: number;
  provider: string;
  provider_event_id: string;
  kind: string;
  currency: string;
  amount: string;
  fee_amount: string;
  net_amount: string;
  provider_created_at: string | null;
  provider_available_on: string | null;
  provider_payment_intent_id: string;
  provider_charge_id: string;
  provider_payout_id: string;
  order: number | null;
  payment_transaction: number | null;
  created_at: string;
};

export type ReconciliationRun = {
  id: number;
  provider: string;
  period_start: string;
  period_end: string;
  status: string;
  internal_summary: any;
  provider_summary: any;
  mismatch_summary: any;
  created_by: number | null;
  created_at: string;
};

export type ChargebackCase = {
  id: number;
  status: string;
  provider: string;
  provider_dispute_id: string;
  dispute_status: string;
  reason: string;
  amount: string;
  currency: string;
  order_id: number | null;
  user_id: string | null;
  evidence_reference: string;
  evidence_submitted_at: string | null;
  resolution_note: string;
  created_at: string;
  updated_at: string;
};

export type PaymentRefund = {
  id: number;
  provider: string;
  provider_refund_id: string;
  amount: string;
  currency: string;
  reason: string;
  status: string;
  order_id: number;
  payment_transaction_id: number | null;
  actor_email: string | null;
  created_at: string;
};

export type MissingTransactionItem = {
  payment_transaction_id: number;
  order_id: number;
  user_email: string;
  created_at: string | null;
  status: string;
  amount: string;
  currency: string;
  provider_payment_id: string;
  provider_charge_id: string | null;
};

export type MissingRefundItem = {
  payment_refund_id: number;
  order_id: number;
  payment_transaction_id: number | null;
  created_at: string | null;
  amount: string;
  currency: string;
  provider_refund_id: string;
  reason: string;
};

export type ReconciliationMissingItems = {
  run: { id: number; provider: string; period_start: string | null; period_end: string | null };
  missing_transactions: { count: number; items: MissingTransactionItem[]; note?: string };
  missing_refunds: { count: number; items: MissingRefundItem[]; note?: string };
};

const unwrapList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export async function getFinanceOverview(params?: {
  provider?: string;
  start?: string;
  end?: string;
}): Promise<FinanceOverview> {
  const res = await apiClient.get("/api/payments/admin-finance/overview/", { params });
  return res.data;
}

export async function listProviderEvents(params?: {
  provider?: string;
  kind?: string;
  payout_id?: string;
  page?: number;
  page_size?: number;
}): Promise<ProviderEvent[]> {
  const res = await apiClient.get("/api/payments/admin-provider-events/", { params });
  return unwrapList<ProviderEvent>(res.data);
}

export async function importProviderEvents(payload: {
  provider: string;
  events: Array<Record<string, any>>;
}): Promise<{ created: number; updated: number }> {
  const res = await apiClient.post("/api/payments/admin-provider-events/import/", payload);
  return res.data;
}

export async function listReconciliationRuns(params?: {
  provider?: string;
  page?: number;
  page_size?: number;
}): Promise<ReconciliationRun[]> {
  const res = await apiClient.get("/api/payments/admin-reconciliation-runs/", { params });
  return unwrapList<ReconciliationRun>(res.data);
}

export async function runReconciliation(payload: {
  provider: string;
  period_start: string;
  period_end: string;
}): Promise<ReconciliationRun> {
  const res = await apiClient.post("/api/payments/admin-reconciliation-runs/", payload);
  return res.data;
}

export async function listChargebacks(params?: {
  status?: string;
  provider?: string;
  page?: number;
  page_size?: number;
}): Promise<ChargebackCase[]> {
  const res = await apiClient.get("/api/payments/admin-chargebacks/", { params });
  return unwrapList<ChargebackCase>(res.data);
}

export async function setChargebackStatus(
  caseId: number,
  payload: { status: string; resolution_note?: string; evidence_reference?: string }
): Promise<ChargebackCase> {
  const res = await apiClient.post(`/api/payments/admin-chargebacks/${caseId}/set-status/`, payload);
  return res.data;
}

export async function listRefunds(params?: {
  provider?: string;
  order_id?: number;
  payment_transaction_id?: number;
  start?: string;
  end?: string;
  page?: number;
  page_size?: number;
}): Promise<PaymentRefund[]> {
  const res = await apiClient.get("/api/payments/admin-refunds/", { params });
  return unwrapList<PaymentRefund>(res.data);
}

export async function createRefund(payload: {
  order_id?: number;
  payment_transaction_id?: number;
  amount?: string;
  reason?: string;
  allow_manual?: boolean;
}): Promise<PaymentRefund> {
  const res = await apiClient.post("/api/payments/admin-refunds/", payload);
  return res.data;
}

export function buildExportUrl(path: string, params?: Record<string, string | number | undefined | null>) {
  const url = new URL(path, window.location.origin);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || String(v).trim() === "") return;
    url.searchParams.set(k, String(v));
  });
  return url.pathname + url.search;
}

export async function getReconciliationMissingItems(runId: number, params?: { limit?: number }): Promise<ReconciliationMissingItems> {
  const res = await apiClient.get(`/api/payments/admin-reconciliation-runs/${runId}/missing-items/`, { params });
  return res.data;
}
