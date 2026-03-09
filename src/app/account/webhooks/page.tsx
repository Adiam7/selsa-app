"use client";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Webhook, Plus, Check, X, Eye, Settings } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function WebhooksPage() {
  const [webhooks] = useState([
    { id: 1, event: "order.created", url: "https://example.com/webhooks/order", active: true, deliveries: 145, failures: 2 },
    { id: 2, event: "payment.completed", url: "https://example.com/webhooks/payment", active: true, deliveries: 89, failures: 0 },
  ]);

  const { t } = useTranslation();
  const [showNewWebhookForm, setShowNewWebhookForm] = useState(false);

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Webhooks')}</h1>
            <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Configure webhooks to receive real-time notifications')}</p>
          </div>
          <button
            onClick={() => setShowNewWebhookForm(!showNewWebhookForm)}
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
            <Plus style={{ width: '16px', height: '16px' }} />{t('Add Webhook')}</button>
        </div>

        {/* Create New Webhook Form */}
        {showNewWebhookForm && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>{t('Add New Webhook')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Event Type')}</label>
                <select style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}>
                  <option>{t('Select an event...')}</option>
                  <option>{t('order.created')}</option>
                  <option>{t('order.updated')}</option>
                  <option>{t('payment.completed')}</option>
                  <option>{t('customer.created')}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Webhook URL')}</label>
                <input
                  type="url"
                  placeholder={t('https://example.com/webhook')}
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
                >{t('Create Webhook')}</button>
                <button
                  onClick={() => setShowNewWebhookForm(false)}
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

        {/* Webhooks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Webhook style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{webhook.event}</h3>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: '4px 0 0 0', fontFamily: 'monospace' }}>{webhook.url}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {webhook.active ? (
                    <span style={{ padding: '4px 12px', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: '600', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check style={{ width: '14px', height: '14px' }} />{t('Active')}</span>
                  ) : (
                    <span style={{ padding: '4px 12px', backgroundColor: '#fee2e2', color: '#8b5cf6', fontSize: '12px', fontWeight: '600', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <X style={{ width: '14px', height: '14px' }} />{t('Inactive')}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>{t('Deliveries')}</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{webhook.deliveries}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>{t('Failures')}</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: webhook.failures > 0 ? '#8b5cf6' : '#000000', margin: '0' }}>{webhook.failures}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  <Eye style={{ width: '16px', height: '16px' }} />{t('View Logs')}</button>
                <button style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  <Settings style={{ width: '16px', height: '16px' }} />{t('Edit')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountLayout>
  );
}
