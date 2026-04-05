"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";

import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function FAQPage() {
  const { t } = useTranslation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: t("How long does shipping take?"),
      answer: t("Shipping times vary by location. Local orders typically arrive in 2-5 business days. Domestic express takes 1-2 business days. International orders take 7-14 business days (standard) or 3-5 days (express). You will receive a tracking number via email once your order ships."),
    },
    {
      id: 2,
      question: t("Can I change or cancel my order?"),
      answer: t("Yes! You can modify or cancel your order within 1 hour of purchase. After that window, contact our support team immediately. If your order has already shipped, you can still return it within 30 days for a full refund."),
    },
    {
      id: 3,
      question: t("What if my item does not fit or is not what I expected?"),
      answer: t("No problem! We offer hassle-free exchanges and returns within 30 days. Items must be unused and in original condition. Simply initiate a return through your account, and we will send you a prepaid return shipping label. Refunds are processed within 5-7 business days."),
    },
    {
      id: 4,
      question: t("Do you ship internationally?"),
      answer: t("Absolutely! We ship to over 150 countries worldwide. International shipping costs and delivery times are calculated at checkout based on your location. You can view exact rates before completing your purchase. All international orders include tracking."),
    },
    {
      id: 5,
      question: t("How do I contact customer support?"),
      answer: t("We offer multiple support channels for your convenience: email (support@selsa.com), live chat (9 AM - 9 PM EST), WhatsApp (+1 (555) 123-4567), and phone (+1 (800) SELSA-01). We aim to respond to all inquiries within 2 hours during business hours."),
    },
    {
      id: 6,
      question: t("What customization options are available?"),
      answer: t("We offer custom design services for most products. You can choose custom colors, add personalization, request bulk orders with special pricing, and explore our limited edition collections. Contact our team with your specific requirements for a personalized quote."),
    },
    {
      id: 7,
      question: t("Is my payment information secure?"),
      answer: t("Yes, absolutely. We use industry-leading SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers and is processed securely through trusted payment gateways like Stripe and PayPal."),
    },
    {
      id: 8,
      question: t("Do you offer bulk order discounts?"),
      answer: t("Yes! We offer special pricing for bulk orders. The discount percentage increases based on order volume. Contact our sales team at bulk@selsa.com or through our live chat for a custom quote on your specific order."),
    },
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <section style={{ paddingTop: "20px", paddingBottom: "20px", paddingLeft: "24px", paddingRight: "24px", borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/service" style={{ textDecoration: "none" }}>
            <ArrowLeft style={{ width: "24px", height: "24px", color: "#000000", cursor: "pointer" }} />
          </Link>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#000000", margin: 0, letterSpacing: "-1px" }}>{t('Frequently Asked Questions')}</h1>
        </div>
      </section>
      {/* Content */}
      <section style={{ paddingTop: "60px", paddingBottom: "60px", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "18px", color: "#666666", lineHeight: "1.8", marginBottom: "40px" }}>{t(
            'Find comprehensive answers to all your questions about our services, products, and policies.'
          )}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                style={{
                  border: "1px solid #e5e5e5",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  backgroundColor: expandedFAQ === faq.id ? "#fafafa" : "#ffffff",
                }}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  style={{
                    width: "100%",
                    padding: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#000000", textAlign: "left", margin: 0, letterSpacing: "-0.3px" }}>
                    {faq.question}
                  </h3>
                  <ChevronDown
                    style={{
                      width: "20px",
                      height: "20px",
                      color: "#000000",
                      transition: "transform 0.3s ease",
                      flexShrink: 0,
                      marginLeft: "16px",
                      transform: expandedFAQ === faq.id ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {expandedFAQ === faq.id && (
                  <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "0px", paddingBottom: "24px", backgroundColor: "#fafafa", borderTop: "1px solid #e5e5e5" }}>
                    <p style={{ color: "#555555", lineHeight: "1.8", fontSize: "15px", margin: 0, fontWeight: "400" }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e5e5", padding: "40px", textAlign: "center", marginTop: "40px", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "16px" }}>{t('Still Have Questions?')}</h3>
            <p style={{ color: "#666666", marginBottom: "24px", fontSize: "16px" }}>{t('Our support team is here to help')}</p>
            <button style={{ backgroundColor: "#000000", color: "#ffffff", paddingLeft: "40px", paddingRight: "40px", paddingTop: "12px", paddingBottom: "12px", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase" }}>{t('Contact Support')}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
