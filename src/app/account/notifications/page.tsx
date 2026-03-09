"use client";


import { useTranslation } from 'react-i18next';
import { AccountLayout } from "@/components/account/AccountLayout";
import { useEffect, useState } from "react";
import { Mail, Bell, MessageSquare, Save, Check } from "lucide-react";
import { getMarketingPreferences, setEmailMarketingOptIn } from "@/lib/api/growth";
import { toast } from "sonner";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
}
export default function NotificationsPage() {
  const { t } = useTranslation();
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "order-updates",
      title: "Order Updates",
      description: "Receive notifications about order status changes",
      enabled: true,
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "promotional",
      title: "Promotional Emails",
      description: "Get notified about new products, sales, and special offers",
      enabled: false,
      icon: <Mail className="w-5 h-5" />,
    },
    {
      id: "security",
      title: "Security Alerts",
      description: "Receive alerts about security events on your account",
      enabled: true,
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "product-review",
      title: "Product Reviews",
      description: "Get reminders to review purchased products",
      enabled: true,
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: "weekly-digest",
      title: "Weekly Digest",
      description: "Receive a weekly summary of your account activity",
      enabled: false,
      icon: <Mail className="w-5 h-5" />,
    },
  ]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const prefs = await getMarketingPreferences();
        if (!isMounted) return;

        setSettings((prev) =>
          prev.map((setting) =>
            setting.id === "promotional"
              ? { ...setting, enabled: Boolean(prefs.email_marketing_opt_in) }
              : setting
          )
        );
      } catch {
        // Best-effort: user may be signed out or backend unavailable.
      } finally {
        if (isMounted) setIsLoadingPrefs(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async (id: string) => {
    const current = settings.find((s) => s.id === id);
    if (!current) return;

    const nextEnabled = !current.enabled;

    // Optimistic update
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: nextEnabled } : s)));

    if (id !== "promotional") return;

    try {
      const updated = await setEmailMarketingOptIn(nextEnabled);
      setSettings((prev) =>
        prev.map((s) => (s.id === "promotional" ? { ...s, enabled: Boolean(updated.email_marketing_opt_in) } : s))
      );
      toast.success(updated.email_marketing_opt_in ? t("Promotional emails enabled") : t("Promotional emails disabled"));
    } catch {
      // Revert on failure
      setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: current.enabled } : s)));
      toast.error(t("Failed to update promotional email preference"));
    }
  };

  const handleSave = async () => {
    try {
      const payload = settings.reduce(
        (acc, s) => ({ ...acc, [s.id]: s.enabled }),
        {} as Record<string, boolean>
      );

      const res = await fetch("/api/account/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });

      if (res.ok) {
        toast.success(t("Notification preferences saved"));
      } else {
        toast.error(t("Failed to save notification preferences"));
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(t("Failed to save notification preferences"));
    }
  };

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Notification Preferences')}</h1>
          <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Choose how you want to be notified about your account activity')}</p>
        </div>

        {/* Email Notifications */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Bell style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Email Notifications')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Manage your notification preferences')}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0', flexDirection: 'column' }}>
            {settings.map((setting) => (
              <div
                key={setting.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  gap: '16px',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                  <div style={{ marginTop: '4px', color: '#374151', flexShrink: 0 }}>{setting.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: '600', color: '#111827', margin: '0' }}>{setting.title}</h3>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{setting.description}</p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(setting.id)}
                  disabled={setting.id === 'promotional' && isLoadingPrefs}
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    width: '48px',
                    height: '24px',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    backgroundColor: setting.enabled ? '#374151' : '#d1d5db',
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                    marginLeft: '16px',
                    padding: '2px'
                  }}
                  role="switch"
                  aria-checked={setting.enabled}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      height: '20px',
                      width: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      transition: 'transform 0.2s',
                      transform: setting.enabled ? 'translateX(24px)' : 'translateX(0)'
                    }}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div style={{ padding: '20px 0', borderTop: '1px solid #e5e7eb', marginTop: '16px' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px',
                backgroundColor: '#000000',
                color: 'white',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />{t('Save Preferences')}</button>
          </div>
        </div>

        {/* Notification Channels */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Mail style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Notification Channels')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Manage your communication channels')}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '2px solid #4ade80', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
              <div>
                <h3 style={{ fontWeight: '600', color: '#111827', margin: '0' }}>{t('Email')}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('alina.09me@gmail.com')}</p>
              </div>
              <span style={{ padding: '4px 12px', backgroundColor: '#000000', color: 'white', fontSize: '12px', fontWeight: '600', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check style={{ width: '14px', height: '14px' }} />{t('Verified')}</span>
            </div>

            {/* Future channels */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', opacity: 0.6 }}>
              <div>
                <h3 style={{ fontWeight: '600', color: '#111827', margin: '0' }}>SMS</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Coming soon')}</p>
              </div>
              <span style={{ padding: '4px 12px', backgroundColor: '#f3f4f6', color: '#374151', fontSize: '12px', fontWeight: '600', borderRadius: '20px' }}>{t('Coming Soon')}</span>
            </div>
          </div>
        </div>

        {/* Notification History */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MessageSquare style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Recent Notifications')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Your latest notification history')}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                title: "Order Confirmation",
                message: "Your order #12345 has been confirmed",
                time: "2 hours ago",
              },
              {
                title: "Shipment Update",
                message: "Your package has been shipped",
                time: "5 hours ago",
              },
              {
                title: "Security Alert",
                message: "New login from Chrome on macOS",
                time: "1 day ago",
              },
            ].map((notif, idx) => (
              <div key={idx} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: '600', color: '#111827', margin: '0' }}>{notif.title}</h3>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{notif.message}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0 }}>{notif.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #e5e7eb', marginTop: '16px' }}>
            <button style={{ fontSize: '14px', fontWeight: '600', color: '#374151', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>{t('View All Notifications →')}</button>
          </div>
        </div>

        {/* Info Box */}
        <div style={{ padding: '16px', background: 'linear-gradient(to right, #eff6ff, #faf5ff)', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', color: '#1e3a8a', margin: '0' }}>{t('🔒')}<strong>{t('Security Note:')}</strong>{t('Some notifications cannot be disabled to keep your account secure.')}</p>
        </div>
      </div>
    </AccountLayout>
  );
}
