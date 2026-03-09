'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useToast } from '@/components/Toast';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, User, Calendar, Save, Upload, Shield, CheckCircle } from 'lucide-react';
import apiClient from '@/lib/api/client';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  useEffect(() => {
    if (!session?.user) return;
    if (isEditing) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await apiClient.get('/api/accounts/me/profile/');
        if (cancelled) return;
        const data = res as any;
        setFormData((prev) => ({
          ...prev,
          name: data?.username ?? prev.name,
          email: data?.email ?? prev.email,
        }));
      } catch {
        // ignore; fallback to session values
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [isEditing, session?.user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch('/api/accounts/me/profile/', {
        name: formData.name,
      });
      success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      const message =
        (err as any)?.response?.data?.name?.[0] ||
        (err as any)?.response?.data?.detail ||
        (err as any)?.response?.data?.error ||
        'Failed to update profile';
      error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <AccountLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#111827', margin: '0' }}>{t('Profile Settings')}</h1>
          <p style={{ color: '#4b5563', marginTop: '8px', fontSize: '15px' }}>{t('Manage your personal information and account details')}</p>
        </div>

        {/* Profile Avatar Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', transition: 'box-shadow 0.3s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb', alignItems: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: '96px', height: '96px', borderRadius: '24px', background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '36px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
                {getInitials(formData.name || '')}
              </div>
              <button title="Upload photo" style={{ position: 'absolute', bottom: '0', right: '0', padding: '8px', backgroundColor: 'white', borderRadius: '9999px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                <Upload style={{ width: '16px', height: '16px', color: '#374151' }} />
              </button>
            </div>
            {/* User Info */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0' }}>{formData.name || 'User'}</h2>
              <p style={{ color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', fontSize: '14px' }}>
                <CheckCircle style={{ width: '16px', height: '16px', color: '#000000' }} />{t('Account verified')}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>{t('Member since January 24, 2026')}</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{ padding: '8px 24px', backgroundColor: '#000000', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s' }}
              >{t('Edit Profile')}</button>
            )}
          </div>

          {/* Form Fields */}
          <div style={{ paddingTop: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Name Field */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <User style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />{t('Full Name')}</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Your name"
                  />
                ) : (
                  <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#374151', fontWeight: '500', fontSize: '14px' }}>
                    {formData.name || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <Mail style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />{t('Email Address')}</label>
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                      style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      placeholder="your@email.com"
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{t('This is the email linked to your account')}</p>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#374151', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#000000', flexShrink: 0 }} />
                      {formData.email}
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{t('This is the email linked to your account')}</p>
                  </>
                )}
              </div>
            </div>

            {/* Joined Date */}
            <div style={{ marginTop: '24px', padding: '16px', background: 'linear-gradient(to right, #dbeafe 0%, #e9d5ff 100%)', borderRadius: '8px', border: '1px solid #93c5fd', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar style={{ width: '20px', height: '20px', color: '#374151', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Member Since')}</p>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0' }}>{t('January 24, 2026')}</p>
              </div>
            </div>

            {/* Account Status */}
            <div style={{ marginTop: '16px', padding: '16px', background: 'linear-gradient(to right, #dcfce7 0%, #d1fae5 100%)', borderRadius: '8px', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield style={{ width: '20px', height: '20px', color: '#000000', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Account Status')}</p>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0' }}>{t('Your account is verified and secure')}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', marginTop: '24px' }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{ padding: '8px 24px', backgroundColor: '#000000', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: session?.user?.name || '',
                    email: session?.user?.email || '',
                  });
                }}
                style={{ padding: '8px 24px', backgroundColor: '#e5e7eb', color: '#111827', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s' }}
              >{t('Cancel')}</button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div style={{ padding: '16px', backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', color: '#1e40af', margin: '0' }}>{t('💡')}<strong>{t('Tip:')}</strong>{t(
            'Keep your information up to date to ensure smooth account management and communication.'
          )}</p>
        </div>
      </div>
    </AccountLayout>
  );
}
