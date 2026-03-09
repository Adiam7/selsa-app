"use client";

import { ArrowLeft, Mail, MessageCircle, Phone, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function CustomerSupportPage() {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const supportChannels = [
    {
      id: "email",
      title: t("Email Support"),
      description: "support@selsa.com",
      availability: t("24/7 Support"),
      details: t("Send us an email and we'll respond within 24 hours with solutions."),
      icon: <Mail size={24} />,
    },
    {
      id: "chat",
      title: t("Live Chat"),
      description: t("Instant messaging"),
      availability: t("Mon - Fri, 9AM - 6PM"),
      details: t("Connect with our team immediately for quick answers."),
      icon: <MessageCircle size={24} />,
    },
    {
      id: "whatsapp",
      title: t("WhatsApp"),
      description: "+1 (555) 123-4567",
      availability: t("24/7 Support"),
      details: t("Message us directly on WhatsApp for quick assistance."),
      icon: <MessageSquare size={24} />,
    },
    {
      id: "phone",
      title: t("Phone Support"),
      description: "+1 (555) 987-6543",
      availability: t("Mon - Fri, 10AM - 8PM"),
      details: t("Call our support team for immediate assistance."),
      icon: <Phone size={24} />,
    },
    {
      id: "emergency",
      title: t("Emergency Support"),
      description: t("Urgent issues only"),
      availability: t("24/7 Critical Only"),
      details: t("For critical issues affecting your business operations."),
      icon: <AlertCircle size={24} />,
    },
  ];

  const features = [
    {
      title: t("Expert Team"),
      desc: t("Our support specialists are trained to handle any issue quickly and professionally."),
      icon: null,
    },
    {
      title: t("Multiple Channels"),
      desc: t("Choose your preferred way to contact us - email, chat, phone, or WhatsApp."),
      icon: null,
    },
    {
      title: t("Fast Response"),
      desc: t("Most inquiries are resolved within hours, not days."),
      icon: null,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <section style={{ paddingTop: "20px", paddingBottom: "20px", paddingLeft: "24px", paddingRight: "24px", borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/service" style={{ textDecoration: "none" }}>
            <ArrowLeft style={{ width: "24px", height: "24px", color: "#000000", cursor: "pointer" }} />
          </Link>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#000000", margin: 0, letterSpacing: "-1px" }}>{t('Customer Support')}</h1>
        </div>
      </section>
      {/* Support Channels - Card Based */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "1200", color: "#000000", marginBottom: "12px", letterSpacing: "-1px", textAlign: "center" }}>{t('Contact Us')}</h2>
          <p style={{ fontSize: "16px", color: "#666666", textAlign: "center", marginBottom: "60px" }}>{t('Choose your preferred way to reach us')}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "60px" }}>
            {supportChannels.map((channel) => (
              <div
                key={channel.id}
                onMouseEnter={() => setHoveredCard(channel.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: hoveredCard === channel.id ? "#000000" : "#ffffff",
                  border: "2px solid #e5e5e5",
                  borderColor: hoveredCard === channel.id ? "#000000" : "#e5e5e5",
                  padding: "24px 20px",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: hoveredCard === channel.id ? "translateY(-6px)" : "translateY(0)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background gradient on hover */}
                <div style={{ position: "absolute", inset: 0, opacity: hoveredCard === channel.id ? 0.95 : 0, transition: "opacity 0.4s ease", pointerEvents: "none" }}></div>

                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Icon */}
                  <div style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: hoveredCard === channel.id ? "#ffffff" : "#f0f0f0", border: "2px solid #000000", borderRadius: "6px", marginBottom: "16px", color: "#000000" }}>
                    {channel.icon}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: hoveredCard === channel.id ? "#ffffff" : "#000000", marginBottom: "6px", letterSpacing: "-0.5px" }}>
                    {channel.title}
                  </h3>

                  {/* Contact Info */}
                  <p style={{ fontSize: "14px", fontWeight: "600", color: hoveredCard === channel.id ? "#e5e5e5" : "#000000", marginBottom: "8px" }}>
                    {channel.description}
                  </p>

                  {/* Availability */}
                  <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", color: hoveredCard === channel.id ? "#cccccc" : "#666666", marginBottom: "12px" }}>
                    {channel.availability}
                  </p>

                  {/* Details */}
                  <p style={{ fontSize: "13px", lineHeight: "1.5", color: hoveredCard === channel.id ? "#e5e5e5" : "#666666", marginBottom: "16px" }}>
                    {channel.details}
                  </p>

                  {/* CTA Button */}
                  <button style={{ backgroundColor: hoveredCard === channel.id ? "#ffffff" : "#000000", color: hoveredCard === channel.id ? "#000000" : "#ffffff", border: "none", padding: "8px 16px", fontWeight: "700", cursor: "pointer", fontSize: "11px", letterSpacing: "0.8px", textTransform: "uppercase", transition: "all 0.3s ease" }}>{t('Get Started')}</button>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "60px" }}>
            {features.map((feature, i) => (
              <div key={i} style={{ backgroundColor: "#f5f5f5", border: "1px solid #e5e5e5", padding: "32px", textAlign: "center", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#000000"; e.currentTarget.style.color = "#ffffff"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f5f5f5"; e.currentTarget.style.color = "#000000"; }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", color: "#000000" }}>
                  {feature.icon}
                </div>
                <h4 style={{ fontSize: "18px", fontWeight: "800", color: "inherit", marginBottom: "8px" }}>
                  {feature.title}
                </h4>
                <p style={{ fontSize: "14px", color: "inherit", opacity: 0.8 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Response Times Table */}
          <div style={{ backgroundColor: "#fafafa", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "40px", marginBottom: "60px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#000000", marginBottom: "32px", letterSpacing: "-0.5px" }}>{t('Support Response Times')}</h3>
            <div style={{ display: "grid", gap: "16px" }}>
              {[
                { channel: "Email Support", time: "Within 24 hours", priority: "Standard" },
                { channel: "Live Chat", time: "Under 5 minutes", priority: "High" },
                { channel: "WhatsApp", time: "Under 10 minutes", priority: "High" },
                { channel: "Phone", time: "Immediate", priority: "Urgent" },
                { channel: "Emergency (24/7)", time: "Within 1 hour", priority: "Critical" },
              ].map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", paddingBottom: "16px", borderBottom: "1px solid #e5e5e5", alignItems: "center" }}>
                  <span style={{ fontWeight: "600", color: "#000000" }}>{item.channel}</span>
                  <span style={{ color: "#666666", fontSize: "14px" }}>{item.time}</span>
                  <span style={{ backgroundColor: "#000000", color: "#ffffff", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div style={{ backgroundColor: "#000000", color: "#ffffff", padding: "60px 40px", textAlign: "center", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "16px", letterSpacing: "-0.5px" }}>{t('Ready to Connect?')}</h3>
            <p style={{ fontSize: "16px", color: "#cccccc", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>{t(
              'Our dedicated support team is standing by to assist you with any questions or concerns.'
            )}</p>
            <button style={{ backgroundColor: "#ffffff", color: "#000000", paddingLeft: "48px", paddingRight: "48px", paddingTop: "14px", paddingBottom: "14px", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>{t('Contact Support Now')}</button>
          </div>
        </div>
      </section>
    </div>
  );
}


