"use client";

import { useTranslation } from 'react-i18next';
import { AccountLayout } from "@/components/account/AccountLayout";
import { BarChart3, Database, Users, Zap } from "lucide-react";

export default function UsagePage() {
  const { t } = useTranslation();
  const usageMetrics = [
    { label: "Storage Used", value: "2.5 GB", limit: "10 GB", percentage: 25 },
    { label: "API Calls", value: "45,230", limit: "100,000", percentage: 45 },
    { label: "Active Users", value: "12", limit: "50", percentage: 24 },
    { label: "Monthly Bandwidth", value: "156 GB", limit: "500 GB", percentage: 31 },
  ];

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Usage & Limits')}</h1>
          <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Monitor your resource usage and plan limits')}</p>
        </div>

        {/* Usage Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {usageMetrics.map((metric, idx) => (
            <div key={idx} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0' }}>{metric.label}</h3>
                <BarChart3 style={{ width: '20px', height: '20px', color: '#374151' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '4px' }}>{metric.value}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>{t('of')}{metric.limit}</p>
              </div>

              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${metric.percentage}%`,
                    backgroundColor: metric.percentage > 80 ? '#8b5cf6' : metric.percentage > 60 ? '#666666' : '#374151',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                {metric.percentage}{t('% used')}</p>
            </div>
          ))}
        </div>

        {/* Current Plan */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Current Plan: Pro')}</h2>
            <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Billed Monthly • $29.99/month')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('Renewal Date')}</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Feb 24, 2026')}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('Days Left')}</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#000000', margin: '0' }}>{t('31 days')}</p>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div style={{ backgroundColor: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', borderRadius: '16px', padding: '32px', color: 'white', textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>{t('Need more capacity?')}</h3>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 20px 0' }}>{t('Upgrade to Enterprise for unlimited resources and priority support')}</p>
          <button style={{
            padding: '12px 32px',
            backgroundColor: 'white',
            color: '#374151',
            fontWeight: '600',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}>{t('Explore Enterprise Plan')}</button>
        </div>
      </div>
    </AccountLayout>
  );
}
