"use client";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function SSOPage() {
  const { t } = useTranslation();
  const [ssoEnabled, setSsoEnabled] = useState(false);

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Single Sign-On (SSO)')}</h1>
          <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Configure enterprise single sign-on for your team')}</p>
        </div>

        {/* SSO Configuration */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Shield style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px' }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('SAML 2.0 Configuration')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>Configure your identity provider for secure authentication</p>
              </div>
            </div>
            <button
              onClick={() => setSsoEnabled(!ssoEnabled)}
              style={{
                padding: '8px 16px',
                backgroundColor: ssoEnabled ? '#8b5cf6' : '#e5e7eb',
                color: ssoEnabled ? 'white' : '#111827',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {ssoEnabled ? 'Disable SSO' : 'Enable SSO'}
            </button>
          </div>

          {ssoEnabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                  Identity Provider URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-idp.com/metadata"
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

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Certificate (PEM format)')}</label>
                <textarea
                  placeholder={t('-----BEGIN CERTIFICATE-----')}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  padding: '10px 24px',
                  backgroundColor: '#000000',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}>{t('Save Configuration')}</button>
              </div>
            </div>
          )}
        </div>

        {/* Assertion Consumer Service URL */}
        <div style={{ backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>Service Provider Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div>
              <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>{t('Assertion Consumer Service (ACS) URL:')}</p>
              <p style={{ color: '#111827', fontFamily: 'monospace', margin: '0', backgroundColor: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>{t('https://selsa.com/auth/saml/acs')}</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>Entity ID:</p>
              <p style={{ color: '#111827', fontFamily: 'monospace', margin: '0', backgroundColor: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>{t('https://selsa.com')}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{
          backgroundColor: ssoEnabled ? '#d1fae5' : '#fee2e2',
          borderRadius: '16px',
          border: ssoEnabled ? '1px solid #6ee7b7' : '1px solid #fecaca',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {ssoEnabled ? (
            <>
              <CheckCircle style={{ width: '20px', height: '20px', color: '#059669' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', margin: '0' }}>{t('SSO is enabled')}</p>
                <p style={{ fontSize: '13px', color: '#047857', margin: '0', marginTop: '2px' }}>Team members can now log in using your identity provider</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#7f1d1d', margin: '0' }}>{t('SSO is not configured')}</p>
                <p style={{ fontSize: '13px', color: '#991b1b', margin: '0', marginTop: '2px' }}>Enable SSO above to allow team members to log in with your identity provider</p>
              </div>
            </>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
