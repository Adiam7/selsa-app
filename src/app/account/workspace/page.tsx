"use client";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Building2, Globe, Users, Lock, Save } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function WorkspacePage() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [workspaceData, setWorkspaceData] = useState({
    name: "Selsa Shop",
    website: "https://selsa.example.com",
    description: "Premium e-commerce platform",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWorkspaceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Workspace Settings')}</h1>
          <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Manage your workspace information and general settings')}</p>
        </div>

        {/* Workspace Info */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Building2 style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Workspace Information')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Basic details about your workspace')}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e5e7eb',
                  color: '#111827',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >{t('Edit')}</button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Workspace Name */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Workspace Name')}</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={workspaceData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#111827', fontWeight: '500' }}>
                  {workspaceData.name}
                </div>
              )}
            </div>

            {/* Website */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Website')}</label>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={workspaceData.website}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <a href={workspaceData.website} style={{ color: '#374151', textDecoration: 'none', fontWeight: '500' }}>
                  {workspaceData.website}
                </a>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Description')}</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={workspaceData.description}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              ) : (
                <p style={{ color: '#111827', margin: '0' }}>{workspaceData.description}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#000000',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >{t('Save Changes')}</button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'white',
                  color: '#111827',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >{t('Cancel')}</button>
            </div>
          )}
        </div>

        {/* Workspace Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0' }}>{t('Total Members')}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '8px 0 0 0' }}>12</p>
              </div>
              <Users style={{ width: '32px', height: '32px', color: '#dbeafe', opacity: 0.6 }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0' }}>{t('Workspace Plan')}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '8px 0 0 0' }}>{t('Pro')}</p>
              </div>
              <Globe style={{ width: '32px', height: '32px', color: '#e9d5ff', opacity: 0.6 }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0' }}>{t('Created On')}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '8px 0 0 0' }}>{t('Jan 24, 2026')}</p>
              </div>
              <Lock style={{ width: '32px', height: '32px', color: '#dcfce7', opacity: 0.6 }} />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', padding: '32px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#7f1d1d', margin: '0 0 8px 0' }}>{t('Danger Zone')}</h3>
          <p style={{ fontSize: '14px', color: '#8b5cf6', margin: '0 0 16px 0' }}>{t('These actions cannot be undone. Please proceed with caution.')}</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>{t('Delete Workspace')}</button>
        </div>

        {/* Info Box */}
        <div style={{ padding: '16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', color: '#1e3a8a', margin: '0' }}>{t('👥')}<strong>{t('Admin Only:')}</strong>{t('These settings affect all members of your workspace.')}</p>
        </div>
      </div>
    </AccountLayout>
  );
}
