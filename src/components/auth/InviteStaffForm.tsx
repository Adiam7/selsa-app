"use client"; 

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useTranslation } from "react-i18next";

export default function InviteStaffForm({ storeId }: { storeId: string }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await apiClient.post(`/api/accounts/admin-staff/invite/`, {
        email,
        store_id: storeId,
        groups: [],
      });
      const acceptUrl = res.data?.accept_app_url || res.data?.accept_api_url;
      setMessage(acceptUrl ? t('Invite sent!') + ` ${acceptUrl}` : t('Invite sent!'));
      setEmail("");
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Error sending invite");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">{t('Invite')}</button>
      {message && <p>{message}</p>}
    </form>
  );
}
