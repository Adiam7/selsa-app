
"use client";
import { useTranslation } from 'react-i18next';
import { AccountLayout } from "@/components/account/AccountLayout";
import { HelpCircle, BookOpen, MessageCircle, Search } from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    {
      title: t("Getting Started"),
      icon: BookOpen,
      articles: [
        t("How to create your first store"),
        t("Understanding the dashboard"),
        t("Setting up payment methods"),
        t("Configuring inventory"),
      ],
    },
    {
      title: t("Account & Security"),
      icon: HelpCircle,
      articles: [
        t("Managing your profile"),
        t("Two-factor authentication"),
        t("Resetting your password"),
        t("Account recovery options"),
      ],
    },
    {
      title: t("Billing & Subscription"),
      icon: HelpCircle,
      articles: [
        t("Updating your subscription"),
        t("Changing payment method"),
        t("Invoice management"),
        t("Refund policies"),
      ],
    },
    {
      title: t("Integrations"),
      icon: MessageCircle,
      articles: [
        t("API documentation"),
        t("Webhook configuration"),
        t("Third-party integrations"),
        t("Custom development"),
      ],
    },
  ];

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Help Center')}</h1>
          <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Find answers to common questions and learn how to use Selsa')}</p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '32px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '12px', width: '20px', height: '20px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder={t('Search for help articles...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Help Categories */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {helpCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Icon style={{ width: '24px', height: '24px', color: '#374151' }} />
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{category.title}</h2>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {category.articles.map((article, aidx) => (
                    <li key={aidx}>
                      <a href="#" style={{ fontSize: '14px', color: '#374151', textDecoration: 'none', fontWeight: '500' }}>{t('→')}{article}</a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: '40px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 20px 0' }}>{t('Frequently Asked Questions')}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                q: t("How do I cancel my subscription?"),
                a: t("You can cancel your subscription anytime from the Billing section. Your access will continue until the end of your current billing period.")
              },
              {
                q: t("Is my data secure with Selsa?"),
                a: t("Yes, we use enterprise-grade encryption and regularly audit our systems. Check our Compliance page for detailed security information.")
              },
              {
                q: t("What payment methods do you accept?"),
                a: t("We accept all major credit cards, PayPal, and bank transfers for enterprise customers.")
              }
            ].map((faq, idx) => (
              <div key={idx} style={{ paddingBottom: '16px', borderBottom: idx < 2 ? '1px solid #e5e7eb' : 'none' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>{t('Q:')}{faq.q}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', lineHeight: '1.5' }}>{t('A:')}{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
