"use client";




import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function GiftEventsPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.headerSection}>
        <div className={styles.headerInner}>
          <Link href="/service" style={{ textDecoration: "none" }}>
            <ArrowLeft style={{ width: "24px", height: "24px", color: "#000000", cursor: "pointer" }} />
          </Link>
          <h1 className={styles.title}>{t('Gift & Surprise Events')}</h1>
        </div>
      </section>
      {/* Content */}
      <section className={styles.contentSection}>
        <div className={styles.contentInner}>
          <p className={styles.introText}>{t(
            'Perfect gifts and special surprises for every occasion. Make moments memorable with our curated collections and personalized services.'
          )}</p>

          <div className={styles.grid}>
            <div>
              <h2 className={styles.giftServicesTitle}>{t('Our Gift Services')}</h2>
              <ul className={styles.giftServicesList}>
                {[
                  "🎁 Personalized gift wrapping options",
                  "💌 Custom gift messages and cards",
                  "📦 Surprise bundle boxes",
                  "🎉 Event-themed collections",
                  "🎨 Customization services available",
                  "⭐ Premium gift packaging",
                ].map((item, i) => (
                  <li key={i} className={styles.giftServiceItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className={styles.perfectForTitle}>{t('Perfect For')}</h2>
              <div className={styles.perfectForList}>
                {[
                  { event: "Birthdays", desc: "Celebrate special days" },
                  { event: "Anniversaries", desc: "Mark your milestones" },
                  { event: "Holidays", desc: "Seasonal celebrations" },
                  { event: "Corporate Gifts", desc: "Professional events" },
                ].map((item, i) => (
                  <div key={i} className={styles.perfectForItem}>
                    <h4 className={styles.perfectForEvent}>{item.event}</h4>
                    <p className={styles.perfectForDesc}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.wrappingBox}>
            <h2 className={styles.wrappingTitle}>{t('Gift Wrapping & Packaging Options')}</h2>
            <div className={styles.wrappingGrid}>
              {[
                { name: "Standard Wrapping", style: "Classic presentation", price: "Free" },
                { name: "Premium Wrapping", style: "Luxury packaging", price: "$5" },
              ].map((option, i) => (
                <div key={i} className={styles.wrappingOption}>
                  <h4 className={styles.wrappingOptionTitle}>{option.name}</h4>
                  <p className={styles.wrappingOptionStyle}>{t('🎨')}{option.style}</p>
                  <p className={styles.wrappingOptionPrice}>{t('💰')}{option.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.ctaBox}>
            <h3 className={styles.ctaTitle}>{t('Send the Perfect Gift Today')}</h3>
            <p className={styles.ctaText}>{t(
              'Browse our collections and create unforgettable moments for your loved ones'
            )}</p>
            <button className={styles.ctaButton}>{t('Explore Gifts')}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
