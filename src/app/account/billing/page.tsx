"use client";

import { AccountLayout } from "@/components/account/AccountLayout";
import { CreditCard, Download, AlertCircle, CheckCircle, Zap, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

interface Subscription {
  plan: "free" | "pro" | "enterprise";
  price: number;
  billingCycle: "monthly" | "annual";
  renewDate: string;
  status: "active" | "cancelled";
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending";
  downloadUrl: string;
}

export default function BillingPage() {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<Subscription>({
    plan: "pro",
    price: 29.99,
    billingCycle: "monthly",
    renewDate: "Feb 24, 2026",
    status: "active",
  });

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-001",
      date: "Jan 24, 2026",
      amount: 29.99,
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-002",
      date: "Dec 24, 2025",
      amount: 29.99,
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-003",
      date: "Nov 24, 2025",
      amount: 29.99,
      status: "paid",
      downloadUrl: "#",
    },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "1",
      type: "credit_card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
    },
  ]);

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Billing & Subscription')}</h1>
          <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Manage your subscription, payment methods, and invoices')}</p>
        </div>

        {/* Current Subscription */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Zap style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Current Plan')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>
                  {subscription.plan === "pro" ? "Pro Plan" : "Enterprise Plan"}{t('·')}{subscription.billingCycle === "monthly" ? "Billed Monthly" : "Billed Annually"}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#000000', color: 'white', fontSize: '12px', fontWeight: '600', borderRadius: '20px' }}>
              <CheckCircle style={{ width: '16px', height: '16px' }} />{t('Active')}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>{t('Price')}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0' }}>{t('$')}{subscription.price}
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('/mo')}</span>
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>{t('Cycle')}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0' }}>
                {subscription.billingCycle === "monthly" ? "Monthly" : "Annual"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>{t('Renewal')}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0' }}>{subscription.renewDate}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>{t('Status')}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#000000', margin: '0' }}>{t('Active')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ padding: '10px 24px', backgroundColor: '#e5e7eb', color: '#111827', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>{t('Change Plan')}<ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
            <button style={{ padding: '10px 24px', backgroundColor: '#fee2e2', color: '#8b5cf6', fontWeight: '600', borderRadius: '8px', border: '1px solid #fecaca', cursor: 'pointer' }}>{t('Cancel')}</button>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CreditCard style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Payment Methods')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Manage how you pay for your subscription')}</p>
              </div>
            </div>
            <button style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#111827', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>{t('Add Card')}</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  border: '2px solid #dbeafe',
                  backgroundColor: '#eff6ff',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CreditCard style={{ width: '20px', height: '20px', color: '#374151' }} />
                  <div>
                    <span style={{ fontWeight: '600', color: '#111827', display: 'block' }}>
                      {method.brand}{t('••••')}{method.last4}
                    </span>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: '4px 0 0 0' }}>{t('Expires')}{method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {method.isDefault && (
                    <span style={{ padding: '4px 12px', backgroundColor: '#000000', color: 'white', fontSize: '12px', fontWeight: '600', borderRadius: '4px' }}>{t('Default')}</span>
                  )}
                  <button style={{ padding: '4px 12px', color: '#8b5cf6', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>{t('Remove')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Download style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Invoices')}</h2>
              <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Download your billing invoices')}</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Invoice ID
                  </th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('Date')}</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('Amount')}</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('Status')}</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('Action')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>{invoice.id}</td>
                    <td style={{ padding: '12px 20px', fontSize: '14px', color: '#4b5563' }}>{invoice.date}</td>
                    <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{t('$')}{invoice.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '14px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: invoice.status === "paid" ? '#d1fae5' : '#fef3c7',
                          color: invoice.status === "paid" ? '#065f46' : '#92400e'
                        }}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '14px' }}>
                      <a
                        href={invoice.downloadUrl}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#374151',
                          textDecoration: 'none',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <Download style={{ width: '16px', height: '16px' }} />{t('Download')}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing Address */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Billing Address')}</h2>
            <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Update your billing information')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Full Name')}</label>
              <input
                type="text"
                placeholder="Your Name"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                defaultValue="Alina"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Address Line 1')}</label>
                <input
                  type="text"
                  placeholder="123 Main St"
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Address Line 2')}</label>
                <input
                  type="text"
                  placeholder="Apt, Suite, etc (optional)"
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('City')}</label>
                <input
                  type="text"
                  placeholder="City"
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('State / Province')}</label>
                <input
                  type="text"
                  placeholder="State"
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="Postal Code"
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
            </div>

            <button style={{ padding: '10px 24px', backgroundColor: '#000000', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', width: 'fit-content', marginTop: '8px' }}>{t('Save Address')}</button>
          </div>
        </div>

        {/* Info Box */}
        <div style={{ padding: '16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', color: '#1e3a8a', margin: '0' }}>{t('💳')}<strong>{t('Note:')}</strong>{t('Your payment information is secure and encrypted.')}</p>
        </div>
      </div>
    </AccountLayout>
  );
}
