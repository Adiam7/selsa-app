"use client";

import { AccountLayout } from "@/components/account/AccountLayout";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function CompliancePage() {
  const { t } = useTranslation();
  const complianceItems = [
    { name: "GDPR", status: "compliant", lastAudit: "Dec 15, 2025" },
    { name: "SOC 2 Type II", status: "compliant", lastAudit: "Nov 30, 2025" },
    { name: "HIPAA", status: "compliant", lastAudit: "Oct 20, 2025" },
    { name: "ISO 27001", status: "pending", lastAudit: "In progress" },
  ];

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Compliance & Certifications')}</h1>
          <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('View our compliance status and certifications')}</p>
        </div>

        {/* Compliance Status Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {complianceItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{item.name}</h3>
                {item.status === 'compliant' ? (
                  <CheckCircle style={{ width: '24px', height: '24px', color: '#000000' }} />
                ) : (
                  <AlertCircle style={{ width: '24px', height: '24px', color: '#666666' }} />
                )}
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{t('Last Audit')}</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0' }}>{item.lastAudit}</p>
              </div>

              <div style={{
                padding: '8px 12px',
                backgroundColor: item.status === 'compliant' ? '#d1fae5' : '#fef3c7',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: item.status === 'compliant' ? '#065f46' : '#92400e',
                textAlign: 'center'
              }}>
                {item.status === 'compliant' ? 'Compliant' : 'Pending Certification'}
              </div>
            </div>
          ))}
        </div>

        {/* Data Protection */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>{t('Data Protection Measures')}</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#111827' }}>
              <CheckCircle style={{ width: '18px', height: '18px', color: '#000000', flexShrink: 0 }} />{t('End-to-end encryption for all data transfers')}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#111827' }}>
              <CheckCircle style={{ width: '18px', height: '18px', color: '#000000', flexShrink: 0 }} />{t('Regular security audits and penetration testing')}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#111827' }}>
              <CheckCircle style={{ width: '18px', height: '18px', color: '#000000', flexShrink: 0 }} />{t('Automated backup and disaster recovery')}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#111827' }}>
              <CheckCircle style={{ width: '18px', height: '18px', color: '#000000', flexShrink: 0 }} />{t('Data retention and deletion policies in place')}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#111827' }}>
              <CheckCircle style={{ width: '18px', height: '18px', color: '#000000', flexShrink: 0 }} />
              Incident response procedures and monitoring
            </li>
          </ul>
        </div>

        {/* Certifications & Documents */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>{t('Download Certifications')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="#" style={{ padding: '12px 16px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: '#374151', fontWeight: '500', fontSize: '14px', display: 'block' }}>{t('📄 SOC 2 Type II Report (PDF)')}</a>
            <a href="#" style={{ padding: '12px 16px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: '#374151', fontWeight: '500', fontSize: '14px', display: 'block' }}>{t('📄 GDPR Data Processing Agreement (PDF)')}</a>
            <a href="#" style={{ padding: '12px 16px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: '#374151', fontWeight: '500', fontSize: '14px', display: 'block' }}>{t('📄 ISO 27001 Certification (PDF)')}</a>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
