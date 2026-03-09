'use client';

import { AccountLayout } from '@/components/account/AccountLayout';
import { useToast } from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Lock, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import apiClient from '@/lib/api/client';

type SessionRow = {
  id: string;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  is_current: boolean;
};

export default function SecurityPage() {
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await apiClient.get('/api/accounts/me/sessions/');
      const results = (res as any)?.results || (res as any)?.data?.results || [];
      setSessions(results);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatWhen = (value?: string | null) => {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  };

  const guessDeviceLabel = (ua: string) => {
    const s = (ua || '').toLowerCase();
    if (!s) return t('Unknown device');
    if (s.includes('iphone') || s.includes('ipad')) return t('iOS device');
    if (s.includes('android')) return t('Android device');
    if (s.includes('mac os') || s.includes('macintosh')) return t('macOS');
    if (s.includes('windows')) return t('Windows');
    if (s.includes('linux')) return t('Linux');
    return t('Browser session');
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await apiClient.post('/api/accounts/me/sessions/revoke/', { session_id: sessionId });
      success(t('Session revoked'));
      await loadSessions();
    } catch (err) {
      error((err as any)?.response?.data?.error || t('Failed to revoke session'));
    }
  };

  const revokeOtherSessions = async () => {
    try {
      await apiClient.post('/api/accounts/me/sessions/revoke-others/', {});
      success(t('Signed out of other sessions'));
      await loadSessions();
    } catch {
      error(t('Failed to revoke other sessions'));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError("");
  };

  const handlePasswordSave = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('New passwords do not match');
      error('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      error('Password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.post('/api/accounts/auth/change-password/', {
        old_password: passwordData.current,
        new_password: passwordData.new,
      });
      success('Password updated successfully');
      setShowPasswordForm(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      const message =
        (err as any)?.response?.data?.old_password?.[0] ||
        (err as any)?.response?.data?.new_password?.[0] ||
        (err as any)?.response?.data?.detail ||
        (err as any)?.response?.data?.error ||
        'Failed to change password';
      setPasswordError(message);
      error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AccountLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#111827', margin: '0' }}>{t('Security Settings')}</h1>
          <p style={{ color: '#4b5563', marginTop: '8px', fontSize: '15px' }}>{t('Manage your password and security preferences')}</p>
        </div>

        {/* Password Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Lock style={{ width: '20px', height: '20px', color: '#374151' }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Password')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Change your password regularly to keep your account secure')}</p>
              </div>
            </div>
          </div>

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              style={{ padding: '8px 24px', backgroundColor: '#e5e7eb', color: '#111827', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s' }}
            >{t('Change Password')}</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {passwordError && (
                <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle style={{ width: '16px', height: '16px' }} />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>{t('Current Password')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="current"
                    value={passwordData.current}
                    onChange={handlePasswordChange}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', paddingRight: '40px' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>{t('New Password')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="new"
                    value={passwordData.new}
                    onChange={handlePasswordChange}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', paddingRight: '40px' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('At least 8 characters recommended')}</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>{t('Confirm New Password')}</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwordData.confirm}
                  onChange={handlePasswordChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                <button
                  onClick={handlePasswordSave}
                  disabled={isSaving}
                  style={{ padding: '8px 24px', backgroundColor: '#000000', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s' }}
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ current: '', new: '', confirm: '' });
                    setPasswordError('');
                  }}
                  style={{ padding: '8px 24px', backgroundColor: '#e5e7eb', color: '#111827', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                >{t('Cancel')}</button>
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield style={{ width: '20px', height: '20px', color: '#374151' }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Active Sessions')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Manage devices that have access to your account')}</p>
              </div>
            </div>
          </div>

          {sessionsLoading ? (
            <div style={{ fontSize: '14px', color: '#4b5563' }}>{t('Loading...')}</div>
          ) : sessions.length === 0 ? (
            <div style={{ fontSize: '14px', color: '#4b5563' }}>{t('No sessions to show')}</div>
          ) : (
            <div>
              {sessions
                .filter((s) => !s.revoked_at)
                .map((s, idx, arr) => (
                  <div key={s.id} style={{ padding: '16px 0', borderBottom: idx < arr.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <CheckCircle style={{ width: '20px', height: '20px', color: '#000000' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontWeight: '500', color: '#111827', margin: '0' }}>{guessDeviceLabel(s.user_agent)}</h3>
                            {s.is_current ? (
                              <span style={{ padding: '4px 12px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{t('Current')}</span>
                            ) : null}
                          </div>
                          <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>
                            {t('Created:')} {formatWhen(s.created_at)}
                            {s.ip_address ? ` · ${s.ip_address}` : ''}
                          </p>
                        </div>
                      </div>
                      {!s.is_current ? (
                        <button
                          onClick={() => revokeSession(s.id)}
                          style={{ color: '#8b5cf6', cursor: 'pointer', fontSize: '14px', fontWeight: '500', backgroundColor: 'transparent', border: 'none' }}
                        >
                          {t('Revoke')}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
            </div>
          )}

          <button
            onClick={revokeOtherSessions}
            disabled={sessionsLoading}
            style={{ color: '#8b5cf6', cursor: sessionsLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500', backgroundColor: 'transparent', border: 'none', marginTop: '16px' }}
          >
            {t('Sign Out All Other Sessions')}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>{t('🔒 Security Tip:')}</strong>{t(
            'Never share your password with anyone. Always use a\n            strong, unique password.'
          )}</p>
        </div>
      </div>
    </AccountLayout>
  );
}
