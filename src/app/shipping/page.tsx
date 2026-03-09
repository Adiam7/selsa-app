"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';
import Link from "next/link";

export default function ShippingPage() {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <section style={{ paddingTop: "20px", paddingBottom: "20px", paddingLeft: "24px", paddingRight: "24px", borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/service" style={{ textDecoration: "none" }}>
            <ArrowLeft style={{ width: "24px", height: "24px", color: "#000000", cursor: "pointer" }} />
          </Link>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#000000", margin: 0, letterSpacing: "-1px" }}>{t('Shipping & Delivery')}</h1>
        </div>
      </section>
      {/* Content */}
      <section style={{ paddingTop: "60px", paddingBottom: "60px", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "18px", color: "#666666", lineHeight: "1.8", marginBottom: "40px" }}>
            Fast, reliable delivery with real-time tracking to your preferred location worldwide.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "60px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "20px", letterSpacing: "-0.5px" }}>{t('Shipping Options')}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { name: "Local Shipping", time: "2-5 business days", cost: "Free on $50+" },
                  { name: "Domestic Express", time: "1-2 business days", cost: "$15.99" },
                  { name: "International Std", time: "7-14 business days", cost: "Calculated" },
                  { name: "International Express", time: "3-5 business days", cost: "Calculated" },
                ].map((option, i) => (
                  <div key={i} style={{ border: "1px solid #e5e5e5", padding: "16px", borderRadius: "6px" }}>
                    <h4 style={{ fontWeight: "700", color: "#000000", margin: "0 0 8px 0" }}>{option.name}</h4>
                    <p style={{ color: "#666666", margin: "0 0 4px 0", fontSize: "14px" }}>{t('⏱️')}{option.time}</p>
                    <p style={{ color: "#000000", margin: 0, fontSize: "14px", fontWeight: "600" }}>{t('💰')}{option.cost}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "20px", letterSpacing: "-0.5px" }}>{t('Our Promise')}</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  "✅ Real-time tracking on all orders",
                  "✅ Transparent, competitive pricing",
                  "✅ Multiple delivery speed options",
                  "✅ 150+ countries covered",
                  "✅ Professional packaging",
                  "✅ Signature confirmation available",
                ].map((item, i) => (
                  <li key={i} style={{ color: "#555555", fontSize: "16px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e5e5", padding: "40px", textAlign: "center", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "16px" }}>{t('Track Your Order')}</h3>
            <p style={{ color: "#666666", marginBottom: "24px", fontSize: "16px" }}>{t('Enter your tracking number to see real-time delivery updates')}</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <input type="text" placeholder={t('Enter tracking number')} style={{ padding: "12px 16px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", width: "300px" }} />
              <button style={{ backgroundColor: "#000000", color: "#ffffff", paddingLeft: "24px", paddingRight: "24px", fontWeight: "700", border: "none", cursor: "pointer", borderRadius: "4px", fontSize: "14px", textTransform: "uppercase" }}>{t('Track')}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
