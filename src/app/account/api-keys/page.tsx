"use client";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Key, Copy, Eye, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function APIKeysPage() {
  const { t } = useTranslation();
  const [apiKeys] = useState([
    { id: 1, name: "Production Key", key: "sk_live_••••••••••••••••", created: "Jan 15, 2026", lastUsed: "Today at 2:45 PM", active: true },
    { id: 2, name: "Development Key", key: "sk_test_••••••••••••••••", created: "Jan 10, 2026", lastUsed: "3 days ago", active: true },
  ]);

  const [showNewKeyForm, setShowNewKeyForm] = useState(false);

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('API Keys')}</h1>
            <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Manage your API keys for programmatic access')}</p>
          </div>
          <button
            onClick={() => setShowNewKeyForm(!showNewKeyForm)}
            style={{
              padding: '10px 20px',
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
            <Plus style={{ width: '16px', height: '16px' }} />{t('Create Key')}</button>
        </div>

        {/* Create New Key Form */}
        {showNewKeyForm && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>{t('Create New API Key')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Key Name')}</label>
                <input
                  type="text"
                  placeholder={t('e.g., Production Key')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#000000',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >{t('Create Key')}</button>
                <button
                  onClick={() => setShowNewKeyForm(false)}
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
            </div>
          </div>
        )}

        {/* API Keys List */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {apiKeys.map((apiKey, idx) => (
              <div
                key={apiKey.id}
                style={{
                  padding: '20px 24px',
                  borderBottom: idx < apiKeys.length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Key style={{ width: '20px', height: '20px', color: '#374151' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{apiKey.name}</h3>
                    <span style={{ padding: '2px 8px', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: '600', borderRadius: '4px' }}>{t('Active')}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0', fontFamily: 'monospace' }}>{apiKey.key}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0' }}>{t('Created')}{apiKey.created}{t('• Last used')}{apiKey.lastUsed}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    title={t('Copy key')}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Copy style={{ width: '16px', height: '16px', color: '#374151' }} />
                  </button>
                  <button
                    title={t('Revoke key')}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentation */}
        <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '24px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a8a', margin: '0 0 8px 0' }}>{t('📚 API Documentation')}</h3>
          <p style={{ fontSize: '14px', color: '#1e40af', margin: '0 0 12px 0' }}>{t('Learn how to use the Selsa API with our comprehensive documentation.')}</p>
          <a href="#" style={{ color: '#374151', fontWeight: '600', textDecoration: 'none' }}>{t('View API Docs →')}</a>
        </div>
      </div>
    </AccountLayout>
  );
}
