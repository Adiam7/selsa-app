"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toAbsoluteAppUrl } from "@/lib/appUrl";
import {
  listAdminStaff,
  listBackofficeGroups,
  setStaffBackofficeGroups,
  inviteStaff,
  removeStaffAccess,
  type AdminStaffUser,
} from "@/lib/api/adminStaff";

export default function AdminStaffPage() {
  const { status: sessionStatus } = useSession();
  const { success, error: showError } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [staff, setStaff] = useState<AdminStaffUser[]>([]);
  const [groups, setGroups] = useState<string[]>(["BackofficeAdmin", "BackofficeSupport", "BackofficeFulfillment"]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStoreId, setInviteStoreId] = useState("");
  const [inviteGroups, setInviteGroups] = useState<Set<string>>(new Set(["BackofficeFulfillment"]));
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ email: string; accept_app_url: string; token: string } | null>(null);

  const [draftGroups, setDraftGroups] = useState<Record<string, Set<string>>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffResponse, availableGroups] = await Promise.all([
        listAdminStaff({ search: search.trim() || undefined, pageSize: 50 }),
        listBackofficeGroups().catch(() => []),
      ]);

      const nextGroups = availableGroups.length > 0 ? availableGroups : groups;
      setGroups(nextGroups);
      setStaff(staffResponse.items);

      const nextDraft: Record<string, Set<string>> = {};
      for (const user of staffResponse.items) {
        nextDraft[user.id] = new Set(user.backoffice_groups || []);
      }
      setDraftGroups(nextDraft);
    } catch (err: any) {
      setError(err?.message || t("Failed to load staff."));
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  const filtered = useMemo(() => {
    if (!search.trim()) return staff;
    const q = search.toLowerCase().trim();
    return staff.filter((u) => (u.email || "").toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q));
  }, [staff, search]);

  const toggleGroup = (userId: string, groupName: string) => {
    setDraftGroups((prev) => {
      const current = new Set(prev[userId] || []);
      if (current.has(groupName)) current.delete(groupName);
      else current.add(groupName);
      return { ...prev, [userId]: current };
    });
  };

  const isDirty = (user: AdminStaffUser) => {
    const current = draftGroups[user.id] || new Set<string>();
    const original = new Set(user.backoffice_groups || []);
    if (current.size !== original.size) return true;
    for (const g of current) if (!original.has(g)) return true;
    return false;
  };

  const saveUser = async (user: AdminStaffUser) => {
    const selected = Array.from(draftGroups[user.id] || []);
    setSaving((prev) => ({ ...prev, [user.id]: true }));
    setError(null);
    try {
      const updated = await setStaffBackofficeGroups(user.id, selected);
      setStaff((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      setDraftGroups((prev) => ({ ...prev, [user.id]: new Set(updated.backoffice_groups || []) }));
      success(t("Updated staff access."));
    } catch (err: any) {
      const message = err?.message || t("Failed to update staff access.");
      setError(message);
      showError(message);
    } finally {
      setSaving((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const toggleInviteGroup = (groupName: string) => {
    setInviteGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const runInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      setError(t("Email is required."));
      return;
    }
    setInviteLoading(true);
    setError(null);
    setInviteResult(null);
    try {
      const res = await inviteStaff({
        email,
        groups: Array.from(inviteGroups),
        ...(inviteStoreId.trim() ? { store_id: inviteStoreId.trim() } : {}),
      });

      const relativeOrAbsolute = res.accept_app_url || `/auth/invite/${res.token}`;
      const absolute = toAbsoluteAppUrl(relativeOrAbsolute);
      setInviteResult({ email: res.email, accept_app_url: absolute, token: res.token });
      success(t("Invite created."));
      await load();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.detail || err?.message || t("Failed to invite staff.");
      setError(message);
      showError(message);
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteResult) return;
    const text = inviteResult.accept_app_url;
    try {
      await navigator.clipboard.writeText(text);
      success(t("Copied invite link."));
    } catch {
      // fallback: keep visible in UI
      success(t("Invite link ready."));
    }
  };

  const removeAccess = async (user: AdminStaffUser) => {
    const ok = window.confirm(
      t("Remove backoffice access for this user?") + `\n\n${user.email}`
    );
    if (!ok) return;

    setRemoving((prev) => ({ ...prev, [user.id]: true }));
    setError(null);
    try {
      await removeStaffAccess(user.id);
      success(t("Access removed."));
      await load();
    } catch (err: any) {
      const message = err?.message || t("Failed to remove access.");
      setError(message);
      showError(message);
    } finally {
      setRemoving((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("Staff & Access")}</h1>
          <p className="text-sm text-gray-500">{t("Assign backoffice roles to staff users.")}</p>
        </div>
        <Button onClick={load} variant="outline" disabled={loading}>
          {loading ? t("Loading...") : t("Refresh")}
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-col gap-3 md:flex-row md:items-center shadow-sm">
        <Input
          type="text"
          placeholder={t("Search by email or username")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full md:w-96"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="text-sm font-semibold text-gray-900 mb-3">{t("Invite staff")}</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            type="email"
            placeholder={t("Staff email")}
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            className="w-full md:w-80"
          />
          <Input
            type="text"
            placeholder={t("Store ID (optional)")}
            value={inviteStoreId}
            onChange={(event) => setInviteStoreId(event.target.value)}
            className="w-full md:w-64"
          />
          <Button onClick={runInvite} disabled={inviteLoading} variant="outline">
            {inviteLoading ? t("Creating...") : t("Create invite")}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {groups.map((g) => {
            const checked = inviteGroups.has(g);
            return (
              <label key={g} className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleInviteGroup(g)}
                  aria-label={g}
                  title={g}
                />
                <span>{g.replace("Backoffice", "")}</span>
              </label>
            );
          })}
        </div>

        {inviteResult && (
          <div className="mt-3 flex flex-col gap-2">
            <div className="text-xs text-gray-500">{t("Send this link to the staff member:")}</div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Input
                type="text"
                readOnly
                value={inviteResult.accept_app_url}
                className="w-full text-xs"
                aria-label={t("Invite link")}
                title={t("Invite link")}
              />
              <Button onClick={copyInvite} variant="outline">
                {t("Copy")}
              </Button>
              <Button
                onClick={() => window.open(inviteResult.accept_app_url, "_blank", "noopener,noreferrer")}
                variant="outline"
              >
                {t("Open")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">{t("User")}</th>
              <th className="px-4 py-3">{t("Status")}</th>
              <th className="px-4 py-3">{t("Backoffice Groups")}</th>
              <th className="px-4 py-3 text-right">{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{user.email}</div>
                  {user.username && <div className="text-xs text-gray-500">{user.username}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">{user.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    {groups.map((g) => {
                      const checked = (draftGroups[user.id] || new Set()).has(g);
                      return (
                        <label key={g} className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleGroup(user.id, g)}
                            aria-label={g}
                            title={g}
                          />
                          <span>{g.replace("Backoffice", "")}</span>
                        </label>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => removeAccess(user)}
                      disabled={Boolean(removing[user.id]) || loading}
                      variant="outline"
                    >
                      {removing[user.id] ? t("Removing...") : t("Remove access")}
                    </Button>
                    <Button
                      onClick={() => saveUser(user)}
                      disabled={Boolean(saving[user.id]) || loading || !isDirty(user)}
                      variant="outline"
                    >
                      {saving[user.id] ? t("Saving...") : t("Save")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={4}>
                  {t("No staff users found.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
