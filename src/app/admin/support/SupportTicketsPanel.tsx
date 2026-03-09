"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addSupportTicketMessage,
  assignSupportTicket,
  claimSupportTicket,
  createSupportMacro,
  createSupportTag,
  createSupportTicket,
  getSupportTicket,
  listSupportAgents,
  listSupportMacros,
  listSupportTags,
  listSupportTickets,
  setSupportTicketStatus,
  setSupportTicketTags,
  type SupportAgent,
  type SupportMacro,
  type SupportTag,
  type SupportTicket,
} from "@/lib/api/supportTooling";
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
import { Textarea } from "@/components/ui/textarea";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

function joinCustomer(ticket: SupportTicket) {
  const parts = [ticket.customer_email || "", ticket.customer_phone || ""].filter(Boolean);
  return parts.join(" • ") || "-";
}

export function SupportTicketsPanel() {
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [assigneeId, setAssigneeId] = useState<string>("");

  const [tags, setTags] = useState<SupportTag[]>([]);
  const [macros, setMacros] = useState<SupportMacro[]>([]);

  const [intake, setIntake] = useState({
    customer_email: "",
    customer_phone: "",
    subject: "",
    message: "",
    priority: "normal" as SupportTicket["priority"],
    tags: "",
  });

  const [replyBody, setReplyBody] = useState("");
  const [replyInternal, setReplyInternal] = useState(false);
  const [macroId, setMacroId] = useState<string>("");

  const [newTagName, setNewTagName] = useState("");
  const [newMacro, setNewMacro] = useState({ title: "", body: "" });

  const selectedTagNames = useMemo(() => new Set((selected?.tags || []).map((t) => t.name)), [selected]);

  const refresh = async (opts?: { keepSelection?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const [tix, tagList, macroList, agentList] = await Promise.all([
        listSupportTickets(),
        listSupportTags(),
        listSupportMacros(),
        listSupportAgents().catch(() => []),
      ]);
      setTickets(tix);
      setTags(tagList);
      setMacros(macroList.filter((m) => m.is_active));
      setAgents(agentList);

      if (opts?.keepSelection && selectedId) {
        const fresh = await getSupportTicket(selectedId);
        setSelected(fresh);
        setAssigneeId(fresh.assigned_to_id ? String(fresh.assigned_to_id) : "");
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to load support tooling.";
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

  const selectTicket = async (id: number) => {
    setSelectedId(id);
    setLoading(true);
    setError(null);
    try {
      const data = await getSupportTicket(id);
      setSelected(data);
      setAssigneeId(data.assigned_to_id ? String(data.assigned_to_id) : "");
      setReplyBody("");
      setReplyInternal(false);
      setMacroId("");
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to load ticket.";
      setError(message);
      showError(message);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!intake.subject.trim() || !intake.message.trim()) {
      setError("Subject and message are required.");
      return;
    }
    if (!intake.customer_email.trim() && !intake.customer_phone.trim()) {
      setError("Provide at least an email or a phone.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const tagsList = intake.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await createSupportTicket({
        customer_email: intake.customer_email.trim() || undefined,
        customer_phone: intake.customer_phone.trim() || undefined,
        subject: intake.subject.trim(),
        message: intake.message.trim(),
        priority: intake.priority,
        tags: tagsList.length ? tagsList : undefined,
      });

      success(`Ticket #${created.id} created.`);
      setIntake({ customer_email: "", customer_phone: "", subject: "", message: "", priority: "normal", tags: "" });
      await refresh();
      await selectTicket(created.id);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Create ticket failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedId || !replyBody.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await addSupportTicketMessage(selectedId, { body: replyBody.trim(), is_internal: replyInternal });
      success(replyInternal ? "Internal note added." : "Reply sent.");
      setReplyBody("");
      setReplyInternal(false);
      await refresh({ keepSelection: true });
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Reply failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMacro = () => {
    const selectedMacro = macros.find((m) => String(m.id) === macroId);
    if (!selectedMacro) return;
    setReplyBody((prev) => (prev ? prev + "\n\n" : "") + selectedMacro.body);
  };

  const handleStatusChange = async (value: SupportTicket["status"]) => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await setSupportTicketStatus(selectedId, value);
      setSelected(updated);
      success("Status updated.");
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Status update failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = async (tagName: string) => {
    if (!selectedId || !selected) return;

    const next = new Set((selected.tags || []).map((t) => t.name));
    if (next.has(tagName)) next.delete(tagName);
    else next.add(tagName);

    setLoading(true);
    setError(null);
    try {
      const updated = await setSupportTicketTags(selectedId, Array.from(next));
      setSelected(updated);
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Tag update failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await claimSupportTicket(selectedId);
      setSelected(updated);
      setAssigneeId(updated.assigned_to_id ? String(updated.assigned_to_id) : "");
      success("Ticket claimed.");
      await refresh({ keepSelection: true });
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Claim failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedId) return;
    const nextId = assigneeId || null;

    setLoading(true);
    setError(null);
    try {
      const updated = await assignSupportTicket(selectedId, nextId);
      setSelected(updated);
      setAssigneeId(updated.assigned_to_id ? String(updated.assigned_to_id) : "");
      success(nextId ? "Assignee updated." : "Ticket unassigned.");
      await refresh({ keepSelection: true });
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Assign failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    try {
      await createSupportTag({ name });
      setNewTagName("");
      success("Tag created.");
      await refresh({ keepSelection: true });
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Create tag failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMacro = async () => {
    const title = newMacro.title.trim();
    const body = newMacro.body.trim();
    if (!title || !body) return;

    setLoading(true);
    setError(null);
    try {
      await createSupportMacro({ title, body, is_active: true });
      setNewMacro({ title: "", body: "" });
      success("Macro created.");
      await refresh({ keepSelection: true });
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Create macro failed.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Tickets</h2>
        <button
          onClick={() => refresh({ keepSelection: true })}
          className="px-3 py-1.5 rounded-md border text-sm font-semibold"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div>}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border p-3">
          <div className="text-sm font-semibold mb-3">New ticket</div>
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Customer email</label>
                <Input
                  value={intake.customer_email}
                  onChange={(e) => setIntake((p) => ({ ...p, customer_email: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Customer phone</label>
                <Input
                  value={intake.customer_phone}
                  onChange={(e) => setIntake((p) => ({ ...p, customer_phone: e.target.value }))}
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
              <Input
                value={intake.subject}
                onChange={(e) => setIntake((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Refund request / Shipping issue"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                <Select
                  value={intake.priority}
                  onValueChange={(value) => setIntake((p) => ({ ...p, priority: value as any }))}
                >
                  <SelectTrigger aria-label="Ticket priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Issue tags (comma-separated)</label>
                <Input
                  value={intake.tags}
                  onChange={(e) => setIntake((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="shipping, refund, damaged"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
              <Textarea
                value={intake.message}
                onChange={(e) => setIntake((p) => ({ ...p, message: e.target.value }))}
                className="min-h-27.5"
                placeholder="Customer reported..."
              />
            </div>

            <Button onClick={handleCreateTicket} disabled={loading}>
              {loading ? "Working..." : "Create ticket"}
            </Button>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-sm font-semibold mb-3">Macros</div>
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New macro title</label>
                <Input
                  value={newMacro.title}
                  onChange={(e) => setNewMacro((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Shipping delay apology"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Actions</label>
                <Button onClick={handleCreateMacro} className="w-full" variant="outline" disabled={loading}>
                  Create macro
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Macro body</label>
              <Textarea
                value={newMacro.body}
                onChange={(e) => setNewMacro((p) => ({ ...p, body: e.target.value }))}
                className="min-h-27.5"
                placeholder="Hi {name}, thanks for reaching out..."
              />
            </div>

            <div className="mt-2 border-t pt-3">
              <div className="text-xs font-semibold text-gray-600 mb-1">Create tag</div>
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="billing"
                />
                <Button onClick={handleCreateTag} variant="outline" disabled={loading}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-md border p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Queue</div>
            <div className="text-xs text-gray-500">{tickets.length}</div>
          </div>

          <div className="grid gap-2 max-h-130 overflow-auto">
            {tickets.map((t) => {
              const active = t.id === selectedId;
              const fr = t.sla_first_response_status;
              const rr = t.sla_resolution_status;

              const badgeClass = (s: any) =>
                s === "breached"
                  ? "text-foreground bg-background border-foreground"
                  : s === "met"
                    ? "text-foreground bg-muted/40 border-gray-200"
                    : "text-muted-foreground bg-background border-gray-200";

              return (
                <button
                  key={t.id}
                  onClick={() => selectTicket(t.id)}
                  className={`text-left rounded-md border p-3 hover:bg-gray-50 ${active ? "border-black" : ""}`}
                  disabled={loading}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">#{t.id} • {t.subject}</div>
                      <div className="text-xs text-gray-500 mt-1">{joinCustomer(t)}</div>
                      <div className="text-xs text-gray-500 mt-1">Assigned: {t.assigned_to_email || "Unassigned"}</div>
                    </div>
                    <div className="text-xs font-semibold text-gray-700">{t.status}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs rounded border px-2 py-0.5 text-gray-700 bg-white">{t.priority}</span>
                    <span className={`text-xs rounded border px-2 py-0.5 ${badgeClass(fr)}`}>FR: {fr || "-"}</span>
                    <span className={`text-xs rounded border px-2 py-0.5 ${badgeClass(rr)}`}>RES: {rr || "-"}</span>
                  </div>
                </button>
              );
            })}
            {!tickets.length && <div className="text-sm text-gray-500">No tickets yet.</div>}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-md border p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-gray-500">Ticket</div>
              <div className="text-lg font-semibold">{selected ? `#${selected.id} • ${selected.subject}` : "Select a ticket"}</div>
              {selected && <div className="text-xs text-gray-500 mt-1">Created: {formatDateTime(selected.created_at)}</div>}
            </div>

            {selected && (
              <div className="grid gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <Select
                    value={selected.status}
                    onValueChange={(value) => handleStatusChange(value as any)}
                    disabled={loading}
                  >
                    <SelectTrigger aria-label="Ticket status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Assignee</label>
                  <div className="flex gap-2">
                    <Select
                      value={assigneeId || "__unassigned__"}
                      onValueChange={(value) => setAssigneeId(value === "__unassigned__" ? "" : value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="flex-1" aria-label="Ticket assignee">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__unassigned__">Unassigned</SelectItem>
                        {agents.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.email || a.username || a.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAssign}
                      variant="outline"
                      disabled={loading}
                      aria-label="Assign ticket"
                      title="Assign"
                    >
                      Assign
                    </Button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      onClick={handleClaim}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      aria-label="Claim ticket"
                      title="Claim"
                    >
                      Claim
                    </Button>
                    <Button
                      onClick={() => void (async () => {
                        if (!selectedId) return;
                        setAssigneeId("");

                        setLoading(true);
                        setError(null);
                        try {
                          const updated = await assignSupportTicket(selectedId, null);
                          setSelected(updated);
                          setAssigneeId(updated.assigned_to_id ? String(updated.assigned_to_id) : "");
                          success("Ticket unassigned.");
                          await refresh({ keepSelection: true });
                        } catch (err: any) {
                          const message = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Unassign failed.";
                          setError(message);
                          showError(message);
                        } finally {
                          setLoading(false);
                        }
                      })()}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      aria-label="Unassign ticket"
                      title="Unassign"
                    >
                      Unassign
                    </Button>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Current: {selected.assigned_to_email || "Unassigned"}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  FR due: {formatDateTime(selected.sla_first_response_due_at)} • {selected.sla_first_response_status || "-"}
                  <br />
                  RES due: {formatDateTime(selected.sla_resolution_due_at)} • {selected.sla_resolution_status || "-"}
                </div>
              </div>
            )}
          </div>

          {selected && (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-md bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-600">Customer</div>
                  <div className="text-sm mt-1">{joinCustomer(selected)}</div>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-600">Tags</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2 text-xs border rounded px-2 py-1 bg-white">
                        <input
                          type="checkbox"
                          checked={selectedTagNames.has(tag.name)}
                          onChange={() => toggleTag(tag.name)}
                          disabled={loading}
                        />
                        {tag.name}
                      </label>
                    ))}
                    {!tags.length && <div className="text-sm text-gray-500">No tags defined.</div>}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-md border p-3 max-h-75 overflow-auto">
                <div className="text-sm font-semibold mb-2">Conversation</div>
                <div className="grid gap-2">
                  {(selected.messages || []).map((m) => (
                    <div key={m.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div>
                          {m.author_type}
                          {m.is_internal ? " • internal" : ""}
                          {m.author_email ? ` • ${m.author_email}` : ""}
                        </div>
                        <div>{formatDateTime(m.created_at)}</div>
                      </div>
                      <div className="text-sm mt-2 whitespace-pre-wrap">{m.body}</div>
                    </div>
                  ))}
                  {!selected.messages?.length && <div className="text-sm text-gray-500">No messages yet.</div>}
                </div>
              </div>

              <div className="mt-4 rounded-md border p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Macro</label>
                    <div className="flex gap-2">
                      <Select
                        value={macroId || "__none__"}
                        onValueChange={(value) => setMacroId(value === "__none__" ? "" : value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="flex-1" aria-label="Reply macro">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Select...</SelectItem>
                          {macros.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleApplyMacro}
                        variant="outline"
                        disabled={loading || !macroId}
                      >
                        Insert
                      </Button>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={replyInternal} onChange={(e) => setReplyInternal(e.target.checked)} disabled={loading} />
                    Internal note
                  </label>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Reply</label>
                  <Textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    className="min-h-30"
                    placeholder="Write a response..."
                    disabled={loading}
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <Button onClick={handleSendReply} disabled={loading || !replyBody.trim()}>
                    {loading ? "Working..." : replyInternal ? "Add note" : "Send reply"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {!selected && <div className="mt-4 text-sm text-gray-500">Pick a ticket from the queue to view messages, tags, SLA, and reply.</div>}
        </div>
      </div>
    </div>
  );
}
