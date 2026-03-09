import { apiClient } from "@/lib/api/client";

export type AdminStaffUser = {
  id: string;
  email: string;
  username: string | null;
  status: string;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  groups: string[];
  backoffice_groups: string[];
};

export type AdminStaffListResponse = {
  items: AdminStaffUser[];
  count: number;
  next: string | null;
  previous: string | null;
};

export async function listAdminStaff(filters: {
  search?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<AdminStaffListResponse> {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = String(filters.page);
  if (filters.pageSize) params.page_size = String(filters.pageSize);

  const response = await apiClient.get("/api/accounts/admin-staff/", { params });
  const data = response.data;
  if (Array.isArray(data)) {
    return { items: data, count: data.length, next: null, previous: null };
  }
  const items = data.results || data;
  return {
    items,
    count: data.count ?? items.length,
    next: data.next ?? null,
    previous: data.previous ?? null,
  };
}

export async function listBackofficeGroups(): Promise<string[]> {
  const response = await apiClient.get("/api/accounts/admin-staff/backoffice-groups/");
  return response.data?.groups || [];
}

export async function setStaffBackofficeGroups(staffUserId: string, groups: string[]): Promise<AdminStaffUser> {
  const response = await apiClient.post(`/api/accounts/admin-staff/${staffUserId}/set-backoffice-groups/`, {
    groups,
  });
  return response.data;
}

export type StaffInviteResponse = {
  invite_id: string;
  email: string;
  store_id: string;
  role: "STAFF";
  token: string;
  accept_api_url: string;
  accept_with_password_api_url: string;
  accept_app_url: string;
};

export async function inviteStaff(payload: {
  email: string;
  groups: string[];
  store_id?: string;
}): Promise<StaffInviteResponse> {
  const response = await apiClient.post("/api/accounts/admin-staff/invite/", payload);
  return response.data;
}

export async function removeStaffAccess(staffUserId: string): Promise<{ success: boolean }> {
  const response = await apiClient.post(`/api/accounts/admin-staff/${staffUserId}/remove-access/`, {});
  return response.data;
}
