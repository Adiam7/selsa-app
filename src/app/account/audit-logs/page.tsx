"use client";

import { AccountLayout } from "@/components/account/AccountLayout";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { listMyAccountAuditLogs, type AccountAuditLog } from "@/lib/api/accountAuditLogs";

const isStaffOrAdmin = (session: any) => {
  const user = session?.user as any;
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.is_staff || user.isAdmin || user.is_superuser) return true;
  return false;
};

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AccountAuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (isStaffOrAdmin(session)) {
      router.replace("/admin/audit-logs");
    }
  }, [router, session, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (isStaffOrAdmin(session)) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listMyAccountAuditLogs({ page, page_size: 20 });
        setItems(res.items);
        setCount(res.count);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.response?.data?.error || err?.message || t("Failed to load audit logs."));
        setItems([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [page, session, status, t]);

  const totalPages = Math.max(1, Math.ceil(count / 20));

  const formatAt = (value: string) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  };

  const formatAction = (action: string) => {
    switch (action) {
      case "auth.login":
        return t("Signed in");
      case "auth.login_failed":
        return t("Sign-in failed");
      case "auth.logout":
        return t("Signed out");
      case "auth.session_refreshed":
        return t("Session refreshed");
      case "auth.session_revoked":
        return t("Session revoked");
      case "auth.sessions_revoked_other":
        return t("Signed out of other sessions");
      case "auth.password_reset_requested":
        return t("Password reset requested");
      case "auth.password_reset":
        return t("Password reset completed");
      case "auth.password_changed":
        return t("Password changed");
      case "auth.password_change_failed":
        return t("Password change failed");
      case "auth.profile_updated":
        return t("Profile updated");
      default:
        return action;
    }
  };

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Audit Logs')}</h1>
            <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Track important account security events')}</p>
          </div>
        </div>

        {/* Customer Account Security Events */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', color: '#111827', fontWeight: 700, marginBottom: '6px' }}>
              {t('Account security events')}
            </div>
            {error ? (
              <div style={{ fontSize: '14px', color: '#b91c1c' }}>{error}</div>
            ) : null}

            {items.length === 0 ? (
              <div style={{ fontSize: '14px', color: '#4b5563' }}>
                {loading ? t("Loading...") : t("No events to show yet.")}
              </div>
            ) : (
              <div style={{ marginTop: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                {items.map((row) => (
                  <div key={row.id} style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{formatAction(row.action)}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{row.action}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {formatAt(row.created_at)}{row.ip_address ? ` · ${row.ip_address}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {t("Showing page")} {page} {t("of")} {totalPages} ({count} {t("total")})
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading || page <= 1}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    cursor: loading || page <= 1 ? 'not-allowed' : 'pointer',
                    color: '#111827',
                    fontWeight: 600,
                  }}
                >
                  {t("Previous")}
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={loading || page >= totalPages}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    cursor: loading || page >= totalPages ? 'not-allowed' : 'pointer',
                    color: '#111827',
                    fontWeight: 600,
                  }}
                >
                  {t("Next")}
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Info Box */}
        <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '24px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a8a', margin: '0 0 8px 0' }}>{t('🔐 Enterprise Security Feature')}</h3>
          <p style={{ fontSize: '14px', color: '#1e40af', margin: '0' }}>{t(
            'Audit logs are retained for 90 days. Logs beyond this period are archived and can be exported from your security dashboard.'
          )}</p>
        </div>
      </div>
    </AccountLayout>
  );
}
