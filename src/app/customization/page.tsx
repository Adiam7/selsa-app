
"use client";
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CustomizationPage() {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <section style={{ paddingTop: "20px", paddingBottom: "20px", paddingLeft: "24px", paddingRight: "24px", borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/service" style={{ textDecoration: "none" }}>
            <ArrowLeft style={{ width: "24px", height: "24px", color: "#000000", cursor: "pointer" }} />
          </Link>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#000000", margin: 0, letterSpacing: "-1px" }}>{t('Customization & Special Services')}</h1>
        </div>
      </section>
      {/* Content */}
      <section style={{ paddingTop: "60px", paddingBottom: "60px", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "18px", color: "#666666", lineHeight: "1.8", marginBottom: "40px" }}>{t(
            'Craft your perfect experience with personalized solutions designed exclusively for your needs.'
          )}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "60px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "20px", letterSpacing: "-0.5px" }}>{t('What We Offer')}</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  t("Custom design services tailored to your vision"),
                  t("Bulk order discounts depending on amounts and product items."),
                  t("Premium gift packaging."),
                  t("Limited edition exclusive collections"),
                  t("Rush customization available"),
                  t("Design consultation included"),
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span style={{ display: "inline-block", width: "6px", height: "6px", backgroundColor: "#000000", marginTop: "8px", borderRadius: "50%" }}></span>
                    <span style={{ color: "#555555", fontSize: "16px" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "20px", letterSpacing: "-0.5px" }}>{t('How It Works')}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {[
                  { step: "1", title: t("Consultation"), desc: t("Discuss your vision with our design team") },
                  { step: "2", title: t("Design"), desc: t("We create custom designs for your approval") },
                  { step: "3", title: t("Production"), desc: t("Expert craftspeople bring designs to life") },
                  { step: "4", title: t("Delivery"), desc: t("Your custom items delivered with care") },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px" }}>
                    <div style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", color: "#ffffff", fontWeight: "bold", borderRadius: "50%" }}>
                      {item.step}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: "700", color: "#000000", margin: "0 0 4px 0" }}>{item.title}</h4>
                      <p style={{ color: "#666666", margin: 0, fontSize: "14px" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e5e5", padding: "40px", textAlign: "center", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "16px" }}>{t('Ready to Create Something Special?')}</h3>
            <p style={{ color: "#666666", marginBottom: "24px", fontSize: "16px" }}>{t('Contact our design team today for a free consultation')}</p>
            <button style={{ backgroundColor: "#000000", color: "#ffffff", paddingLeft: "40px", paddingRight: "40px", paddingTop: "12px", paddingBottom: "12px", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase" }}>{t('Get Started')}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
