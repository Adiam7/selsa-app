"use client";

import { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Check,
  Palette,
  Headphones,
  Truck,
  RotateCcw,
  Mail,
  Clock,
  Shield,
  ArrowRight,
  MessageSquare,
  Phone,
  Gift,
} from "lucide-react";

interface Service {
  id: number;
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface SupportChannel {
  icon: React.ReactNode;
  name: string;
  description: string;
  availability: string;
}

const ServicePage = () => {
  const { t } = useTranslation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const mainServices: Service[] = [
    {
      id: 1,
      title: t("Customization & Special Services"),
      description: t("Craft your perfect experience with personalized solutions designed exclusively for your needs."),
      features: [
        t("Custom designs tailored to your preferences"),
        t("Bulk order discounts available"),
        t("Premium gift packaging options"),
        t("Limited edition exclusive collections"),
      ],
      icon: <Palette className="w-6 h-6" />,
    },
    {
      id: 2,
      title: t("Customer Support"),
      description: t("Premium human support available around the clock. Your success is our priority."),
      features: [
        t("Multiple support channels available"),
        t("Average response time: Under 2 hours"),
        t("Available 24/7 for urgent matters"),
        t("Dedicated support team"),
      ],
      icon: <Headphones className="w-6 h-6" />,
    },
    {
      id: 3,
      title: t("Shipping & Delivery"),
      description: t("Fast, reliable delivery with real-time tracking to your preferred location worldwide."),
      features: [
        t("Local & international shipping available"),
        t("Real-time tracking on all orders"),
        t("Transparent shipping costs"),
        t("Multiple delivery speed options"),
      ],
      icon: <Truck className="w-6 h-6" />,
    },
    {
      id: 4,
      title: t("Returns & Exchanges"),
      description: t("Complete peace of mind with our hassle-free return policy backed by our guarantee."),
      features: [
        t("30-day money-back guarantee"),
        t("Exchanges on any item"),
        t("Prepaid return shipping labels"),
        t("Condition requirements clearly stated"),
      ],
      icon: <RotateCcw className="w-6 h-6" />,
    },
    {
      id: 5,
      title: t("FAQ's"),
      description: t("Quick answers to common questions about shipping, returns, and orders."),
      features: [
        t("How long does shipping take?"),
        t("Can I change or cancel my order?"),
        t("What about international shipping?"),
        t("How do I contact support?"),
      ],
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      id: 6,
      title: t("Arrange Gift & Surprise Events"),
      description: t("Perfect gifts and special surprises for every occasion. Make moments memorable."),
      features: [
        t("Personalized gift wrapping and packaging"),
        t("Custom gift messages and cards"),
        t("Surprise bundle boxes and curated collections"),
        t("Special occasion themed selections"),
      ],
      icon: <Gift className="w-6 h-6" />,
    },
  ];

  const supportChannels: SupportChannel[] = [
    {
      icon: <Mail className="w-6 h-6" />,
      name: "Email Support",
      description: "support@selsa.com",
      availability: "Response within 24 hours",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      name: "Live Chat",
      description: "Chat with us in real-time",
      availability: "9 AM - 9 PM EST",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      name: "WhatsApp Support",
      description: "+1 (555) 123-4567",
      availability: "24/7 availability",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      name: "Phone Support",
      description: "+1 (800) SELSA-01",
      availability: "9 AM - 6 PM EST",
    },
  ];

  const shippingInfo = [
    {
      region: "Local Shipping",
      time: "2-5 business days",
      cost: "Free on orders over $50",
    },
    {
      region: "Domestic Express",
      time: "1-2 business days",
      cost: "$15.99",
    },
    {
      region: "International Standard",
      time: "7-14 business days",
      cost: "Calculated at checkout",
    },
    {
      region: "International Express",
      time: "3-5 business days",
      cost: "Calculated at checkout",
    },
  ];

  const returnPolicy = [
    {
      title: "Return Window",
      description: "30 days from purchase date",
      icon: "\ud83d\udcc5",
    },
    {
      title: "Condition Requirements",
      description: "Original packaging, tags attached, unworn/unused",
      icon: "\u2728",
    },
    {
      title: "Return Shipping",
      description: "Prepaid labels included for all returns",
      icon: "\ud83d\udce6",
    },
    {
      title: "Refund Process",
      description: "Refunded within 5-7 business days after receipt",
      icon: "\ud83d\udcb0",
    },
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "How long does shipping take?",
      answer:
        "Shipping times vary by location. Local orders typically arrive in 2-5 business days. Domestic express takes 1-2 business days. International orders take 7-14 business days (standard) or 3-5 days (express). You will receive a tracking number via email once your order ships.",
    },
    {
      id: 2,
      question: "Can I change or cancel my order?",
      answer:
        "Yes! You can modify or cancel your order within 1 hour of purchase. After that window, contact our support team immediately. If your order has already shipped, you can still return it within 30 days for a full refund.",
    },
    {
      id: 3,
      question: "What if my item does not fit or is not what I expected?",
      answer:
        "No problem! We offer hassle-free exchanges and returns within 30 days. Items must be unused and in original condition. Simply initiate a return through your account, and we will send you a prepaid return shipping label. Refunds are processed within 5-7 business days.",
    },
    {
      id: 4,
      question: "Do you ship internationally?",
      answer:
        "Absolutely! We ship to over 150 countries worldwide. International shipping costs and delivery times are calculated at checkout based on your location. You can view exact rates before completing your purchase. All international orders include tracking.",
    },
    {
      id: 5,
      question: "How do I contact customer support?",
      answer:
        "We offer multiple support channels for your convenience: email (support@selsa.com), live chat (9 AM - 9 PM EST), WhatsApp (+1 (555) 123-4567), and phone (+1 (800) SELSA-01). We aim to respond to all inquiries within 2 hours during business hours.",
    },
    {
      id: 6,
      question: "What customization options are available?",
      answer:
        "We offer custom design services for most products. You can choose custom colors, add personalization, request bulk orders with special pricing, and explore our limited edition collections. Contact our team with your specific requirements for a personalized quote.",
    },
    {
      id: 7,
      question: "Is my payment information secure?",
      answer:
        "Yes, absolutely. We use industry-leading SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers and is processed securely through trusted payment gateways like Stripe and PayPal.",
    },
    {
      id: 8,
      question: "Do you offer bulk order discounts?",
      answer:
        "Yes! We offer special pricing for bulk orders. The discount percentage increases based on order volume. Contact our sales team at bulk@selsa.com or through our live chat for a custom quote on your specific order.",
    },
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Hero Section - Premium */}
      <section style={{ paddingTop: "20px", paddingBottom: "10px", paddingLeft: "24px", paddingRight: "24px", borderBottom: "1px solid #f0f0f0", background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: "720px", margin: "0 auto", padding: "0" }}>
            <h1 style={{ fontSize: "72px", fontWeight: "900", color: "#000000", marginBottom: "12px", lineHeight: "1.1", letterSpacing: "-2px" }}>{t('Our Services')}</h1>
          </div>
        </div>
      </section>
      {/* Main Services Grid - Premium */}
      <section style={{ paddingTop: "32px", paddingBottom: "32px", paddingLeft: "24px", paddingRight: "24px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "28px" }}>
            {mainServices.map((service, idx) => (
              <div
                key={service.id}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
                style={{
                  position: "relative",
                  padding: "32px",
                  border: "1px solid #e5e5e5",
                  backgroundColor: hoveredService === service.id ? "#fafafa" : "#ffffff",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: hoveredService === service.id ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: hoveredService === service.id ? "0 20px 40px rgba(0, 0, 0, 0.08)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ marginBottom: "20px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #000000", color: "#000000", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "#000000", opacity: hoveredService === service.id ? 0.08 : 0, transition: "opacity 0.4s ease" }}></div>
                  <span style={{ position: "relative" }}>{service.icon}</span>
                </div>

                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#000000", marginBottom: "10px", letterSpacing: "-0.5px" }}>
                  {service.title}
                </h3>

                <p style={{ color: "#666666", marginBottom: "18px", fontSize: "14px", lineHeight: "1.6", fontWeight: "400" }}>{service.description}</p>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {service.features.map((feature, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px" }}>
                      <Check style={{ width: "16px", height: "16px", color: "#000000", flexShrink: 0, marginTop: "2px", fontWeight: "bold" }} />
                      <span style={{ color: "#555555", lineHeight: "1.4" }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: "18px", paddingTop: "18px", borderTop: "1px solid #e5e5e5" }}>
                  <a href={
                    service.id === 1 ? "/customization" :
                    service.id === 2 ? "/customer-support" :
                    service.id === 3 ? "/shipping" :
                    service.id === 4 ? "/returns" :
                    service.id === 5 ? "/faq" :
                    "/gift-events"
                  } style={{ color: "#000000", fontSize: "12px", fontWeight: "700", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.8px", display: "inline-flex", alignItems: "center", gap: "6px", opacity: hoveredService === service.id ? 1 : 0.6, transition: "opacity 0.3s ease" }}>{t('Learn More')}<ArrowRight style={{ width: "14px", height: "14px" }} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
      `}</style>
    </div>
  );
};

export default ServicePage;
