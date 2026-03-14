import { apiClient } from "@/lib/api/client";

export type SupportCustomer = {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
};

export type SupportLookupResponse = {
  customer: SupportCustomer | null;
  email: string | null;
  phone?: string | null;
  orders: any[];
  addresses: any[];
  disputes: any[];
};

export async function supportCustomerLookup(params: {
  email?: string;
  phone?: string;
  orderId?: string | number;
}): Promise<SupportLookupResponse> {
  const query: Record<string, string> = {};
  if (params.email) {
    query.email = String(params.email);
  }
  if (params.phone) {
    query.phone = String(params.phone);
  }
  if (params.orderId !== undefined && params.orderId !== null && String(params.orderId).trim()) {
    query.order_id = String(params.orderId);
  }

  const response = await apiClient.get("/orders/admin-support/customer-lookup/", {
    params: query,
  });
  return response.data;
}

export async function approveReturnRefundRequest(requestId: number, adminNote?: string) {
  const response = await apiClient.post(
    `/orders/admin-return-refund-requests/${requestId}/approve/`,
    adminNote ? { admin_note: adminNote } : {}
  );
  return response.data;
}

export async function rejectReturnRefundRequest(requestId: number, adminNote?: string) {
  const response = await apiClient.post(
    `/orders/admin-return-refund-requests/${requestId}/reject/`,
    adminNote ? { admin_note: adminNote } : {}
  );
  return response.data;
}

export async function markReturnReceived(requestId: number) {
  const response = await apiClient.post(
    `/orders/admin-return-refund-requests/${requestId}/mark-received/`,
    {}
  );
  return response.data;
}
