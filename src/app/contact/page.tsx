"use client";

import { ArrowLeft, Mail, Phone, MapPin, Send, ArrowRight } from "lucide-react";
import Link from "next/link";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { submitContactIntake } from "@/lib/api/supportTooling";

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdTicketId, setCreatedTicketId] = useState<number | null>(null);
  const [hoveredButton, setHoveredButton] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setCreatedTicketId(null);
    try {
      const res = await submitContactIntake({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      setCreatedTicketId(res.ticket_id);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setCreatedTicketId(null);
      }, 5000);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to submit. Please try again.";
      setSubmitError(message);
    }
  };

  const contactMethods = [
    {
      icon: <Mail size={28} />,
      title: t("Email"),
      value: "hello@selsa.com",
      description: t("Reach out via email anytime"),
    },
    {
      icon: <Phone size={28} />,
      title: t("Phone"),
      value: "+1 (555) 123-4567",
      description: t("Call us for immediate assistance"),
    },
    {
      icon: <MapPin size={28} />,
      title: t("Address"),
      value: "123 Design Street, NY 10001",
      description: t("Visit our headquarters"),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Hero Section */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "48px", fontWeight: "900", color: "#000000", marginBottom: "20px", letterSpacing: "-1px", lineHeight: "1.2" }}>{t('Let\'s Start a Conversation')}</h2>
          <p style={{ fontSize: "18px", color: "#666666", maxWidth: "600px", margin: "0 auto 60px", lineHeight: "1.6" }}>{t(
            'Have questions or ready to transform your brand? We\'re here to help. Reach out to us through any channel that works best for you.'
          )}</p>

          {/* Contact Methods Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px" }}>
            {contactMethods.map((method, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #e5e5e5",
                  padding: "40px 28px",
                  textAlign: "center",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#000000";
                  e.currentTarget.style.borderColor = "#000000";
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
                  e.currentTarget.querySelectorAll<HTMLElement>('.contact-icon, .contact-title, .contact-value').forEach(el => { el.style.color = '#ffffff'; });
                  e.currentTarget.querySelectorAll<HTMLElement>('.contact-desc').forEach(el => { el.style.color = '#e5e5e5'; });
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#e5e5e5";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.querySelectorAll<HTMLElement>('.contact-icon, .contact-title, .contact-value').forEach(el => { el.style.color = '#000000'; });
                  e.currentTarget.querySelectorAll<HTMLElement>('.contact-desc').forEach(el => { el.style.color = '#666666'; });
                }}
              >
                <div style={{ color: "#000000", marginBottom: "16px", display: "flex", justifyContent: "center" }} className="contact-icon">
                  {method.icon}
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#000000", marginBottom: "8px", letterSpacing: "-0.5px" }} className="contact-title">
                  {method.title}
                </h3>
                <p style={{ fontSize: "16px", fontWeight: "700", color: "#000000", marginBottom: "8px" }} className="contact-value">
                  {method.value}
                </p>
                <p style={{ fontSize: "13px", color: "#666666", letterSpacing: "0.5px" }} className="contact-desc">
                  {method.description}
                </p>


              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Contact Form Section */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: "900", color: "#000000", marginBottom: "16px", letterSpacing: "-1px" }}>{t('Send us a Message')}</h2>
            <p style={{ fontSize: "16px", color: "#666666" }}>{t('Fill out the form below and we\'ll get back to you within 24 hours')}</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "24px" }}>
            {/* Name & Email Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#000000", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{t('Full Name')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e5e5e5",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#000000";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e5e5e5";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#000000", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{t('Email Address')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e5e5e5",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#000000";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e5e5e5";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Phone & Subject Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#000000", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{t('Phone Number')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e5e5e5",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#000000";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e5e5e5";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#000000", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{t('Subject')}</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e5e5e5",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#000000";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e5e5e5";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="How can we help?"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#000000", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{t('Message')}</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "2px solid #e5e5e5",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#000000";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e5e5";
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="Tell us more about your project or inquiry..."
              />
            </div>

            {submitError && (
              <div style={{ backgroundColor: "#ffffff", border: "2px solid #000000", padding: "16px 20px", borderRadius: "4px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#000000", margin: 0 }}>{submitError}</p>
              </div>
            )}

            {/* Success Message */}
            {submitted && (
              <div style={{ backgroundColor: "#f0f0f0", border: "2px solid #000000", padding: "16px 20px", borderRadius: "4px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#000000", margin: 0 }}>
                  {t('✓ Thank you! We\'ve received your message and will respond shortly.')}
                  {createdTicketId ? ` Ticket ID: #${createdTicketId}.` : ""}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "16px 48px",
                border: "2px solid #000000",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "1px",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                width: "100%",
              }}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
            >
              <Send size={18} style={{ transition: "transform 0.3s ease", transform: hoveredButton ? "translateX(4px)" : "translateX(0)" }} />{t('Send Message')}</button>
          </form>
        </div>
      </section>
      {/* CTA Section */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "#000000", color: "#ffffff", padding: "60px 48px", textAlign: "center", borderRadius: "8px" }}>
            <h3 style={{color: "#fffff0", fontSize: "36px", fontWeight: "900", marginBottom: "16px", letterSpacing: "-1px" }}>{t('Prefer to Browse First?')}</h3>
            <p style={{ fontSize: "16px", color: "#cccccc", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>{t(
              'Explore our services and learn more about what we offer before reaching out.'
            )}</p>
            <Link href="/service" style={{ textDecoration: "none" }}>
              <button
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  paddingLeft: "48px",
                  paddingRight: "48px",
                  paddingTop: "14px",
                  paddingBottom: "14px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >{t('View All Services')}<ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
