import { apiClient } from "@/lib/api/client";

export type InventorySummary = {
  local_finite_variants: number;
  negative_stock_variants: number;
  zero_stock_variants: number;
  low_stock_variants: number;
};

export type InventoryReconciliationLine = {
  id: number;
  source: string;
  sku: string;
  stock_control: string;
  system_quantity: number;
  counted_quantity: number;
  variance: number;
  applied: boolean;
  applied_delta: number | null;
  applied_at: string | null;
  metadata: Record<string, any> | null;
};

export type InventoryReconciliation = {
  id: number;
  status: string;
  notes: string;
  parameters: Record<string, any> | null;
  total_lines: number;
  mismatched_lines: number;
  total_variance: number;
  created_by_email: string | null;
  created_at: string;
  completed_at: string | null;
  applied_at: string | null;
  lines: InventoryReconciliationLine[];
};

export type InventoryHealthVariant = {
  variant_id: number;
  sku: string;
  source: string;
  stock_control: string;
  stock_quantity: number;
  is_available: boolean;
  updated_at: string;
  name: string;
};

export type InventoryAuditEvent = {
  id: string;
  created_at: string;
  event_type: string;
  variant_id: number;
  source: string;
  sku: string;
  stock_before: number | null;
  stock_after: number | null;
  delta: number | null;
  actor_email: string | null;
  reason: string;
  metadata: Record<string, any> | null;
  reconciliation: string | null;
  reconciliation_line: string | null;
};

export type VariantSkuHistory = {
  id: string;
  created_at: string;
  variant_id: number;
  source: string;
  old_sku: string;
  new_sku: string;
  changed_by_email: string | null;
  metadata: Record<string, any> | null;
};

const unwrapList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  return data?.results || [];
};

type PaginatedResponse<T> = {
  items: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

const unwrapPaginated = <T,>(data: any): PaginatedResponse<T> => {
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      count: data.length,
      next: null,
      previous: null,
    };
  }
  const items = (data?.results || data) as T[];
  return {
    items,
    count: data?.count ?? items.length,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  };
};

export async function getInventorySummary(): Promise<InventorySummary> {
  const res = await apiClient.get("/api/inventory/reconciliations/summary/");
  return res.data;
}

export async function listReconciliations(params?: {
  page?: number;
  page_size?: number;
}): Promise<InventoryReconciliation[]> {
  const res = await apiClient.get("/api/inventory/reconciliations/", { params });
  return unwrapList<InventoryReconciliation>(res.data);
}

export async function getReconciliation(id: number): Promise<InventoryReconciliation> {
  const res = await apiClient.get(`/api/inventory/reconciliations/${id}/`);
  return res.data;
}

export async function createReconciliation(payload: {
  notes?: string;
  apply?: boolean;
  parameters?: Record<string, any>;
  lines: Array<{ sku: string; source?: string; counted_quantity: number; metadata?: Record<string, any> }>;
}): Promise<InventoryReconciliation> {
  const res = await apiClient.post("/api/inventory/reconciliations/", payload);
  return res.data;
}

export async function applyReconciliation(id: number): Promise<InventoryReconciliation> {
  const res = await apiClient.post(`/api/inventory/reconciliations/${id}/apply/`, {});
  return res.data;
}

export async function exportReconciliationCsv(id: number): Promise<Blob> {
  const res = await apiClient.get(`/api/inventory/reconciliations/${id}/export/`, {
    params: { format: "csv" },
    responseType: "blob",
  });
  return res.data;
}

export async function listInventoryHealth(params: {
  level: "low" | "zero" | "negative";
  threshold?: number;
  page?: number;
  page_size?: number;
}): Promise<InventoryHealthVariant[]> {
  const res = await apiClient.get("/api/inventory/health/", { params });
  return unwrapList<InventoryHealthVariant>(res.data);
}

export async function listInventoryAuditEvents(params: {
  sku?: string;
  variant_id?: number;
  event_type?: string;
  reconciliation?: string;
  page?: number;
  page_size?: number;
}): Promise<InventoryAuditEvent[]> {
  const res = await apiClient.get("/api/inventory/audit-events/", { params });
  return unwrapList<InventoryAuditEvent>(res.data);
}

export async function listInventoryAuditEventsPaginated(params: {
  sku?: string;
  variant_id?: number;
  event_type?: string;
  reconciliation?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<InventoryAuditEvent>> {
  const res = await apiClient.get("/api/inventory/audit-events/", { params });
  return unwrapPaginated<InventoryAuditEvent>(res.data);
}

export async function listSkuHistory(params: {
  sku?: string;
  variant_id?: number;
  page?: number;
  page_size?: number;
}): Promise<VariantSkuHistory[]> {
  const res = await apiClient.get("/api/inventory/sku-history/", { params });
  return unwrapList<VariantSkuHistory>(res.data);
}

export async function createInventoryAdjustment(payload: {
  variant_id?: number;
  sku?: string;
  source?: "local";
  mode: "set" | "delta";
  value: number;
  reason?: string;
  metadata?: Record<string, any>;
}): Promise<{ variant_id: number; sku: string; source: string; stock_quantity: number; updated_at: string | null }> {
  const res = await apiClient.post("/api/inventory/adjustments/", payload);
  return res.data;
}

export async function exportInventoryAuditEventsCsv(params: {
  sku?: string;
  variant_id?: number;
  event_type?: string;
  date_from?: string; // ISO datetime or YYYY-MM-DD
  date_to?: string; // ISO datetime or YYYY-MM-DD
}): Promise<Blob> {
  const res = await apiClient.get("/api/inventory/audit-events/export-csv/", {
    params: { ...params, format: "csv" },
    responseType: "blob",
  });
  return res.data;
}
