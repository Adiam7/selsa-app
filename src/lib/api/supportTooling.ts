import { apiClient } from "@/lib/api/client";

export type SupportTag = {
  id: number;
  name: string;
};

export type SupportMacro = {
  id: number;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SupportMessage = {
  id: number;
  author_type: "customer" | "agent" | "system";
  author_user: number | null;
  author_email?: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
};

export type SupportTicket = {
  id: number;
  subject: string;
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  source: "contact_form" | "manual";
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  order_id: number | null;
  assigned_to_id: string | null;
  assigned_to_email?: string | null;
  tags: SupportTag[];
  first_response_at: string | null;
  resolved_at: string | null;
  sla_first_response_due_at: string | null;
  sla_resolution_due_at: string | null;
  sla_first_response_status: "on_track" | "breached" | "met" | null;
  sla_resolution_status: "on_track" | "breached" | "met" | null;
  created_at: string;
  updated_at: string;
  messages?: SupportMessage[];
};

export type SupportAgent = {
  id: string;
  email: string;
  username: string | null;
};

export async function listSupportAgents(): Promise<SupportAgent[]> {
  const res = await apiClient.get("/api/support/agents/");
  const data = res.data;
  return data?.items || [];
}

export async function listSupportTickets(): Promise<SupportTicket[]> {
  const res = await apiClient.get("/api/support/tickets/");
  // DRF pagination may wrap results
  return Array.isArray(res.data) ? res.data : res.data?.results || [];
}

export async function getSupportTicket(ticketId: number): Promise<SupportTicket> {
  const res = await apiClient.get(`/api/support/tickets/${ticketId}/`);
  return res.data;
}

export async function createSupportTicket(payload: {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  order_id?: number;
  subject: string;
  message: string;
  priority?: SupportTicket["priority"];
  tags?: string[];
}): Promise<SupportTicket> {
  const res = await apiClient.post("/api/support/tickets/", payload);
  return res.data;
}

export async function addSupportTicketMessage(ticketId: number, payload: { body: string; is_internal?: boolean }) {
  const res = await apiClient.post(`/api/support/tickets/${ticketId}/messages/`, payload);
  return res.data as SupportMessage;
}

export async function setSupportTicketStatus(ticketId: number, status: SupportTicket["status"]): Promise<SupportTicket> {
  const res = await apiClient.post(`/api/support/tickets/${ticketId}/status/`, { status });
  return res.data;
}

export async function setSupportTicketTags(ticketId: number, tags: string[]): Promise<SupportTicket> {
  const res = await apiClient.post(`/api/support/tickets/${ticketId}/tags/`, { tags });
  return res.data;
}

export async function claimSupportTicket(ticketId: number): Promise<SupportTicket> {
  const res = await apiClient.post(`/api/support/tickets/${ticketId}/claim/`, {});
  return res.data;
}

export async function assignSupportTicket(ticketId: number, assignedToId: string | null): Promise<SupportTicket> {
  const res = await apiClient.post(`/api/support/tickets/${ticketId}/assign/`, { assigned_to_id: assignedToId });
  return res.data;
}

export async function listSupportMacros(): Promise<SupportMacro[]> {
  const res = await apiClient.get("/api/support/macros/");
  return Array.isArray(res.data) ? res.data : res.data?.results || [];
}

export async function createSupportMacro(payload: { title: string; body: string; is_active?: boolean }): Promise<SupportMacro> {
  const res = await apiClient.post("/api/support/macros/", payload);
  return res.data;
}

export async function listSupportTags(): Promise<SupportTag[]> {
  const res = await apiClient.get("/api/support/tags/");
  return Array.isArray(res.data) ? res.data : res.data?.results || [];
}

export async function createSupportTag(payload: { name: string }): Promise<SupportTag> {
  const res = await apiClient.post("/api/support/tags/", payload);
  return res.data;
}

export async function submitContactIntake(payload: {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<{ ticket_id: number }> {
  const res = await apiClient.post("/api/support/contact/", payload);
  return res.data;
}
