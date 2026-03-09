"use client";

import { useMemo, useState } from "react";
import {
  approveReturnRefundRequest,
  markReturnReceived,
  rejectReturnRefundRequest,
  supportCustomerLookup,
  type SupportLookupResponse,
} from "@/lib/api/adminSupport";
import { useToast } from "@/components/Toast";
import { SupportTicketsPanel } from "@/app/admin/support/SupportTicketsPanel";

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function AdminSupportPage() {
  const { success, error: showError } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SupportLookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const queryMode = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("+")) return "phone";
    if (/^\d+$/.test(trimmed)) {
      // Heuristic: short numeric input is likely an order id; longer is likely a phone.
      return trimmed.length <= 8 ? "order_id" : "phone";
    }
    if (trimmed.includes("@")) return "email";
    return "phone";
  }, [query]);

  const runLookup = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Enter an email, phone, or an order id.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data =
        queryMode === "order_id"
          ? await supportCustomerLookup({ orderId: trimmed })
          : queryMode === "phone"
            ? await supportCustomerLookup({ phone: trimmed })
            : await supportCustomerLookup({ email: trimmed });
      setResult(data);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Lookup failed.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!result?.email && !query.trim()) return;
    await runLookup();
  };

  const handleApprove = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await approveReturnRefundRequest(id, adminNote || undefined);
      success("Request approved.");
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Approve failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await rejectReturnRefundRequest(id, adminNote || undefined);
      success("Request rejected.");
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Reject failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReceived = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await markReturnReceived(id);
      success("Return marked received (refund executed when applicable).");
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Mark received failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-sm text-gray-500">
            Customer lookup by email, phone, or order id. View orders, addresses, shipments, messages, returns, and disputes.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email, Phone, or Order ID</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="customer@example.com, +1 555 123 4567, or 1234"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={runLookup}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold"
            disabled={loading}
          >
            {loading ? "Loading..." : "Lookup"}
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin note (optional)</label>
          <input
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Visible on approvals/rejections"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div>
        )}

        {result && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">Customer</div>
            <div className="mt-1 font-semibold">
              {result.customer
                ? `${result.customer.email} (id: ${result.customer.id})`
                : result.email || result.phone || "Unknown"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Addresses</h2>
              <div className="text-sm text-gray-500">{result.addresses?.length || 0}</div>
            </div>
            {result.addresses?.length ? (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {result.addresses.map((addr: any) => (
                  <div key={addr.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="text-sm font-semibold">{addr.full_name_display || addr.full_name?.en || "-"}</div>
                    <div className="text-sm text-gray-700 mt-1">{addr.full_address || "-"}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {addr.phone_number} • {addr.address_type} {addr.is_default ? "• default" : ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-500">No addresses found.</div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Orders</h2>
              <div className="text-sm text-gray-500">{result.orders?.length || 0}</div>
            </div>

            {result.orders?.length ? (
              <div className="mt-4 space-y-4">
                {result.orders.map((order: any) => (
                  <div key={order.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold">Order #{order.id}</div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email || "-"} • {formatDateTime(order.created_at)}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">{order.status}</span>
                        <span className="text-gray-500"> • payment: {order.payment_status || "-"}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="text-xs font-semibold text-gray-600">Shipping</div>
                        <div className="text-sm mt-1">
                          {order.shipping_address_detail?.full_address ||
                            order.shipping_address_snapshot?.address_line_1 ||
                            "-"}
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="text-xs font-semibold text-gray-600">Billing</div>
                        <div className="text-sm mt-1">
                          {order.billing_address_detail?.full_address ||
                            order.billing_address_snapshot?.address_line_1 ||
                            "-"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold">Shipments</div>
                      {order.shipping_labels?.length ? (
                        <div className="mt-2 grid gap-2">
                          {order.shipping_labels.map((label: any) => (
                            <div
                              key={label.id}
                              className="flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-gray-200 p-3"
                            >
                              <div className="text-sm">
                                <span className="font-semibold">{label.carrier || "Carrier"}</span>
                                <span className="text-gray-500"> • {label.tracking_number || "-"}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {label.status} • {formatDateTime(label.created_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-gray-500">No shipping labels found.</div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold">Messages</div>
                      {order.status_history?.length ? (
                        <div className="mt-2 space-y-2">
                          {order.status_history.slice(0, 8).map((h: any, idx: number) => (
                            <div key={`${order.id}-${idx}`} className="rounded-xl border border-gray-200 p-3">
                              <div className="text-xs text-gray-500">{formatDateTime(h.timestamp)} • {h.updated_by}</div>
                              <div className="text-sm font-semibold mt-1">{h.status}</div>
                              <div className="text-sm text-gray-700 mt-1">
                                {h.message_en || h.message?.en || "-"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-gray-500">No status messages found.</div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold">Returns / RMA</div>
                      {order.return_refund_requests?.length ? (
                        <div className="mt-2 space-y-2">
                          {order.return_refund_requests.map((req: any) => (
                            <div key={req.id} className="rounded-xl border border-gray-200 p-3">
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="text-sm font-semibold">{req.kind} • {req.status}</div>
                                  <div className="text-xs text-gray-500">created: {formatDateTime(req.created_at)}</div>
                                  {req.reason_text ? (
                                    <div className="text-sm text-gray-700 mt-1">{req.reason_text}</div>
                                  ) : null}
                                </div>
                                <div className="flex gap-2">
                                  {req.status === "REQUESTED" ? (
                                    <>
                                      <button
                                        className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold"
                                        onClick={() => handleApprove(req.id)}
                                        disabled={loading}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50"
                                        onClick={() => handleReject(req.id)}
                                        disabled={loading}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : null}
                                  {req.kind === "RETURN" && req.status === "APPROVED" ? (
                                    <button
                                      className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold"
                                      onClick={() => handleMarkReceived(req.id)}
                                      disabled={loading}
                                    >
                                      Mark Received
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-gray-500">No return/refund requests.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-500">No orders found.</div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Disputes / Chargebacks</h2>
              <div className="text-sm text-gray-500">{result.disputes?.length || 0}</div>
            </div>
            {result.disputes?.length ? (
              <div className="mt-3 space-y-2">
                {result.disputes.map((d: any) => (
                  <div key={d.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div className="text-sm font-semibold">
                        {d.provider} • {d.status || "-"}
                      </div>
                      <div className="text-xs text-gray-500">{formatDateTime(d.created_at)}</div>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">{d.reason || "-"}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {d.amount ?? "-"} {d.currency || ""} • id: {d.provider_dispute_id}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-500">No disputes found.</div>
            )}
          </div>
        </div>
      )}
      </section>

      <SupportTicketsPanel />
    </div>
  );
}
