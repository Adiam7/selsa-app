"use client";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Mail, MessageSquare, Phone, Clock } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function ContactSupportPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    priority: "normal",
    message: "",
    name: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Support request submitted. Our team will contact you within 24 hours.");
    setFormData({
      subject: "",
      category: "general",
      priority: "normal",
      message: "",
      name: "",
      email: "",
    });
  };

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Contact Support')}</h1>
          <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Get help from our support team. We typically respond within 24 hours')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {[
            { icon: Clock, label: "Response Time", value: "Within 24 hours" },
            { icon: Mail, label: "Email Support", value: "support@selsa.com" },
            { icon: Phone, label: "Priority Support", value: "Enterprise Only" },
            { icon: MessageSquare, label: "Live Chat", value: "Business Plan+" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <Icon style={{ width: '24px', height: '24px', color: '#374151', marginBottom: '12px' }} />
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 24px 0' }}>{t('Submit a Support Request')}</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Name and Email Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{t('Full Name')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{t('Email Address')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Category and Priority Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{t('Category')}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="general">{t('General Question')}</option>
                  <option value="billing">{t('Billing Issue')}</option>
                  <option value="technical">{t('Technical Issue')}</option>
                  <option value="account">{t('Account Access')}</option>
                  <option value="security">{t('Security Concern')}</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{t('Priority')}</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="low">{t('Low - General Question')}</option>
                  <option value="normal">{t('Normal - Can Wait')}</option>
                  <option value="high">{t('High - Urgent')}</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{t('Subject')}</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of your issue"
                required
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Message */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{t('Message')}</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please provide as much detail as possible to help us assist you better..."
                required
                rows={6}
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1f2937')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
            >{t('Submit Support Request')}</button>
          </form>
        </div>

        {/* Support Tier Info */}
        <div style={{ marginTop: '32px', backgroundColor: '#f3f4f6', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>{t('Support Tiers')}</h3>
          <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', lineHeight: '1.6' }}>{t(
            'Response times and priority levels vary based on your plan. Free plan users receive email support within 48-72 hours. \n            Pro users within 24 hours. Business plan users get priority support and live chat. Enterprise customers have dedicated support managers with 1-hour response SLA.'
          )}</p>
        </div>
      </div>
    </AccountLayout>
  );
}
