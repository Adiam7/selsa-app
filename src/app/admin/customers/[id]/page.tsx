"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminCustomerNote,
  deleteAdminCustomerNote,
  getAdminCustomer,
  getAdminCustomerNotes,
  getAdminCustomerOrders,
  getAdminCustomerTimeline,
  setAdminCustomerStatus,
  updateAdminCustomerNote,
  type AdminCustomer,
  type AdminCustomerNote,
  type AdminCustomerOrder,
  type AdminCustomerTimelineEvent,
} from "@/lib/api/adminCustomers";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = String((params as any)?.id || "");
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [orders, setOrders] = useState<AdminCustomerOrder[]>([]);
  const [notes, setNotes] = useState<AdminCustomerNote[]>([]);
  const [noteKind, setNoteKind] = useState("internal");
  const [noteText, setNoteText] = useState("");

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timeline, setTimeline] = useState<AdminCustomerTimelineEvent[]>([]);

  const load = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const [c, o] = await Promise.all([
        getAdminCustomer(customerId),
        getAdminCustomerOrders(customerId),
      ]);
      setCustomer(c);
      setOrders(o);
      const n = await getAdminCustomerNotes(customerId);
      setNotes(n);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Failed to load customer.");
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async () => {
    if (!customerId) return;
    setTimelineLoading(true);
    try {
      const events = await getAdminCustomerTimeline(customerId);
      setTimeline(events);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Failed to load timeline.");
      showError(message);
    } finally {
      setTimelineLoading(false);
    }
  };

  const setStatus = async (status: string) => {
    if (!customerId) return;
    if (customer?.status === status) return;
    setLoading(true);
    try {
      const updated = await setAdminCustomerStatus(customerId, status);
      setCustomer(updated);
      showSuccess(t("Customer status updated."));
      loadTimeline();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Failed to update status.");
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!customerId) return;
    if (!noteText.trim()) {
      showError(t("Note text is required."));
      return;
    }
    try {
      await createAdminCustomerNote(customerId, { kind: noteKind, note: noteText.trim() });
      setNoteText("");
      const n = await getAdminCustomerNotes(customerId);
      setNotes(n);
      showSuccess(t("Note added."));
      loadTimeline();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Failed to add note.");
      showError(message);
    }
  };

  const removeNote = async (noteId: number) => {
    if (!customerId) return;
    try {
      await deleteAdminCustomerNote(customerId, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setEditingNoteText("");
      }
      showSuccess(t("Note deleted."));
      loadTimeline();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Failed to delete note.");
      showError(message);
    }
  };

  const startEditNote = (note: AdminCustomerNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.note);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const saveNote = async (noteId: number) => {
    if (!customerId) return;
    const next = editingNoteText.trim();
    if (!next) {
      showError(t("Note text is required."));
      return;
    }

    setSavingNote(true);
    try {
      const updated = await updateAdminCustomerNote(customerId, noteId, { note: next });
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      showSuccess(t("Note updated."));
      cancelEditNote();
      loadTimeline();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Failed to update note.");
      showError(message);
    } finally {
      setSavingNote(false);
    }
  };

  const renderTimelineDetails = (event: AdminCustomerTimelineEvent) => {
    const payload = event.payload || {};
    if (event.kind === "note" && payload.note) {
      return <div className="mt-2 whitespace-pre-wrap text-sm text-gray-900">{String(payload.note)}</div>;
    }
    if (event.kind === "audit") {
      const actor = payload.actor_email ? String(payload.actor_email) : null;
      const ip = payload.ip_address ? String(payload.ip_address) : null;
      return (
        <div className="mt-2 text-xs text-gray-600">
          {actor ? <span>{actor}</span> : null}
          {actor && ip ? <span> · </span> : null}
          {ip ? <span>{ip}</span> : null}
        </div>
      );
    }
    if (payload.order_id) {
      return (
        <div className="mt-2 text-sm">
          <Link href={`/admin/orders/${payload.order_id}`} className="text-blue-600 hover:underline">
            {t("View order")} #{String(payload.order_id)}
          </Link>
        </div>
      );
    }
    if (event.kind === "return_refund_request") {
      const status = payload.status ? String(payload.status) : "";
      const amount = payload.refund_amount ? String(payload.refund_amount) : null;
      return (
        <div className="mt-2 text-xs text-gray-600">
          {status ? <span>{status}</span> : null}
          {status && amount ? <span> · </span> : null}
          {amount ? <span>{t("Refund")}: {amount}</span> : null}
        </div>
      );
    }
    if (event.kind === "payment") {
      const status = payload.status ? String(payload.status) : "";
      const amount = payload.amount ? String(payload.amount) : null;
      const currency = payload.currency ? String(payload.currency) : null;
      return (
        <div className="mt-2 text-xs text-gray-600">
          {status ? <span>{status}</span> : null}
          {status && amount ? <span> · </span> : null}
          {amount ? (
            <span>
              {t("Amount")}: {amount}{currency ? ` ${currency}` : ""}
            </span>
          ) : null}
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    load();
    loadTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-gray-600">
            <Link href="/admin/customers" className="hover:underline">
              {t("Customers")}
            </Link>
            <span className="px-2">/</span>
            <span className="text-gray-900">{customer?.email || customerId}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold">{t("Customer")}</h1>
        </div>
        <Button
          onClick={async () => {
            await load();
            await loadTimeline();
          }}
          variant="outline"
          disabled={loading}
        >
          {loading ? t("Loading...") : t("Refresh")}
        </Button>
      </div>

      {customer && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("Email")}</div>
              <div className="mt-1 font-medium text-gray-900">{customer.email}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("Status")}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className="font-medium text-gray-900">{customer.status}</div>
                <Button
                  onClick={() => setStatus("ACTIVE")}
                  variant="outline"
                  size="sm"
                  disabled={loading || customer.status === "ACTIVE"}
                >
                  {t("Activate")}
                </Button>
                <Button
                  onClick={() => setStatus("SUSPENDED")}
                  variant="outline"
                  size="sm"
                  disabled={loading || customer.status === "SUSPENDED"}
                >
                  {t("Suspend")}
                </Button>
                <Button
                  onClick={() => setStatus("DEACTIVATED")}
                  variant="outline"
                  size="sm"
                  disabled={loading || customer.status === "DEACTIVATED"}
                >
                  {t("Deactivate")}
                </Button>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("Username")}</div>
              <div className="mt-1 font-medium text-gray-900">{customer.username || "-"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("Last login")}</div>
              <div className="mt-1 font-medium text-gray-900">{formatDate(customer.last_login)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">{t("Internal notes")}</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <Select value={noteKind} onValueChange={setNoteKind}>
              <SelectTrigger className="md:w-40" aria-label={t("Note kind")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">internal</SelectItem>
                <SelectItem value="risk">risk</SelectItem>
                <SelectItem value="support">support</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t("Add a note...")}
              className="min-h-20"
            />
            <Button onClick={createNote} disabled={loading} className="md:self-stretch">
              {t("Add")}
            </Button>
          </div>

          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {n.kind} · {n.actor_email || t("Unknown")} · {formatDate(n.created_at)}
                    </div>
                    {editingNoteId === n.id ? (
                      <Textarea
                        aria-label={t("Edit note")}
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        placeholder={t("Edit note...")}
                        className="mt-2 min-h-20"
                      />
                    ) : (
                      <div className="mt-2 whitespace-pre-wrap text-sm text-gray-900">{n.note}</div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {editingNoteId === n.id ? (
                      <>
                        <Button
                          onClick={cancelEditNote}
                          variant="outline"
                          size="sm"
                          disabled={loading || savingNote}
                        >
                          {t("Cancel")}
                        </Button>
                        <Button
                          onClick={() => saveNote(n.id)}
                          variant="outline"
                          size="sm"
                          disabled={loading || savingNote}
                        >
                          {savingNote ? t("Saving...") : t("Save")}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => startEditNote(n)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        {t("Edit")}
                      </Button>
                    )}

                    <Button
                      onClick={() => removeNote(n.id)}
                      variant="outline"
                      size="sm"
                      disabled={loading || savingNote}
                    >
                      {t("Delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && notes.length === 0 && (
              <div className="text-sm text-gray-500">{t("No notes yet.")}</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">{t("Timeline")}</h2>
        </div>
        <div className="p-4 space-y-3">
          {timelineLoading && <div className="text-sm text-gray-500">{t("Loading timeline...")}</div>}

          {!timelineLoading && timeline.length === 0 && (
            <div className="text-sm text-gray-500">{t("No timeline events yet.")}</div>
          )}

          {!timelineLoading &&
            [...timeline].reverse().map((event, idx) => (
              <div key={`${event.kind}-${event.at}-${idx}`} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {event.kind} · {formatDate(event.at)}
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-900">{event.title}</div>
                    {renderTimelineDetails(event)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">{t("Orders")}</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("Order")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("Status")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("Payment")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("Total")}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">{t("Placed")}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">{t("Action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">#{order.id}</td>
                <td className="px-4 py-3 text-gray-700">{order.status}</td>
                <td className="px-4 py-3 text-gray-700">{order.payment_status || "-"}</td>
                <td className="px-4 py-3 text-gray-700">
                  {order.total_amount} {order.currency}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    {t("View")}
                  </Link>
                </td>
              </tr>
            ))}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {t("No orders found.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
