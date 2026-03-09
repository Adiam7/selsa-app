"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';
import Link from "next/link";

export default function ReturnsPage() {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <section style={{ paddingTop: "20px", paddingBottom: "20px", paddingLeft: "24px", paddingRight: "24px", borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/service" style={{ textDecoration: "none" }}>
            <ArrowLeft style={{ width: "24px", height: "24px", color: "#000000", cursor: "pointer" }} />
          </Link>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#000000", margin: 0, letterSpacing: "-1px" }}>{t('Returns & Exchanges')}</h1>
        </div>
      </section>
      {/* Content */}
      <section style={{ paddingTop: "60px", paddingBottom: "60px", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "18px", color: "#666666", lineHeight: "1.8", marginBottom: "40px" }}>{t(
            'Complete peace of mind with our hassle-free return policy backed by our guarantee.'
          )}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "60px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "20px", letterSpacing: "-0.5px" }}>{t('Return Policy')}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {[
                  { title: "📅 Return Window", desc: "30 days from purchase date" },
                  { title: "✨ Condition", desc: "Original packaging, tags attached, unused" },
                  { title: "📦 Return Shipping", desc: "Prepaid labels included" },
                  { title: "💰 Refund Timeline", desc: "5-7 business days after receipt" },
                ].map((item, i) => (
                  <div key={i}>
                    <h4 style={{ fontWeight: "700", color: "#000000", margin: "0 0 6px 0" }}>{item.title}</h4>
                    <p style={{ color: "#666666", margin: 0, fontSize: "14px" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "20px", letterSpacing: "-0.5px" }}>{t('Why Choose Us?')}</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  "✅ 30-day money-back guarantee",
                  "✅ Free return shipping labels",
                  "✅ No questions asked policy",
                  "✅ Instant exchange processing",
                  "✅ Full refund guarantee",
                  "✅ Easy online return requests",
                ].map((item, i) => (
                  <li key={i} style={{ color: "#555555", fontSize: "16px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ backgroundColor: "#000000", color: "#ffffff", padding: "40px", textAlign: "center", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>{t('Start a Return')}</h3>
            <p style={{ color: "#cccccc", marginBottom: "24px", fontSize: "16px" }}>{t('Process your return easily through your account')}</p>
            <button style={{ backgroundColor: "#ffffff", color: "#000000", paddingLeft: "40px", paddingRight: "40px", paddingTop: "12px", paddingBottom: "12px", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase" }}>{t('Initiate Return')}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
