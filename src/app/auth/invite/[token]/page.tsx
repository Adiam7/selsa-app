"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/Toast";

export default function AcceptInvitePage() {
  const params = useParams();
  const rawToken = (params as any)?.token as string | string[] | undefined;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  const router = useRouter();
  const { t } = useTranslation();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!token) {
      setError(t("Invalid invite"));
      return;
    }
    if (!password) {
      setError(t("Password is required."));
      return;
    }
    if (password !== confirm) {
      setError(t("Passwords do not match."));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post(`/api/accounts/invites/${token}/accept-with-password/`, {
        password,
        ...(username.trim() ? { username: username.trim() } : {}),
      });
      success(t("Invite accepted. You can now log in."));
      setDone(true);
      const email = res?.data?.email;
      const callback = encodeURIComponent("/staff/welcome");
      router.push(
        email
          ? `/auth/login?callbackUrl=${callback}&email=${encodeURIComponent(email)}`
          : `/auth/login?callbackUrl=${callback}`
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        t("Failed to accept invite.");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white border rounded-lg p-6">
        <h1 className="text-2xl font-bold">{t("Accept Invite")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("Set your password to activate your staff account.")}
        </p>
        <p className="text-xs text-gray-400 mt-2 break-all">{t("Invite token:")} {token || ""}</p>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="text"
            placeholder={t("Username (optional)")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
            aria-label={t("Username")}
            title={t("Username")}
          />
          <input
            type="password"
            placeholder={t("Password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
            aria-label={t("Password")}
            title={t("Password")}
          />
          <input
            type="password"
            placeholder={t("Confirm password")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
            aria-label={t("Confirm password")}
            title={t("Confirm password")}
          />
          <button
            onClick={submit}
            disabled={loading || done}
            className="px-4 py-2 rounded-md border text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? t("Submitting...") : t("Accept invite")}
          </button>
        </div>
      </div>
    </div>
  );
}
