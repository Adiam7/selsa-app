import { apiClient } from "@/lib/api/client";

export type AccountAuditLog = {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  actor_email: string | null;
  created_at: string;
};

export type AccountAuditLogResponse = {
  items: AccountAuditLog[];
  count: number;
  next: string | null;
  previous: string | null;
};

export async function listMyAccountAuditLogs(params?: {
  action?: string;
  page?: number;
  page_size?: number;
}): Promise<AccountAuditLogResponse> {
  const res = await apiClient.get("/api/accounts/me/audit-logs/", { params });
  const data = res.data;

  if (Array.isArray(data)) {
    return { items: data, count: data.length, next: null, previous: null };
  }

  const items = data?.results || data;
  return {
    items,
    count: data?.count ?? items.length,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  };
}
