import { apiClient } from "@/lib/api/client";
import type { ReturnRefundRequest } from "@/types/order";

export async function adminApproveReturnRefundRequest(
  requestId: number,
  adminNote?: string
): Promise<ReturnRefundRequest> {
  const response = await apiClient.post(
    `/orders/admin-return-refund-requests/${requestId}/approve/`,
    { admin_note: adminNote || "" }
  );
  return response.data;
}

export async function adminRejectReturnRefundRequest(
  requestId: number,
  adminNote?: string
): Promise<ReturnRefundRequest> {
  const response = await apiClient.post(
    `/orders/admin-return-refund-requests/${requestId}/reject/`,
    { admin_note: adminNote || "" }
  );
  return response.data;
}

export async function adminMarkReturnRefundRequestReceived(
  requestId: number
): Promise<ReturnRefundRequest> {
  const response = await apiClient.post(
    `/orders/admin-return-refund-requests/${requestId}/mark-received/`,
    {}
  );
  return response.data;
}
