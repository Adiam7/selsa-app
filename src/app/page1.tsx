// src/app/Home/page.tsx
'use client';

import Link from 'next/link';
import React from 'react';
import styles from './home.module.css';

export default function Home() {
  return (
    <div>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {/* Elevate Your Style */}{t('Discover Selsa Store')}</h1>
          <p className={styles.heroDescription}>
            Discover curated collections designed for the modern individual. Premium quality, timeless design, accessible luxury.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/category" className={styles.ctaPrimary}>{t('Explore Collections')}</Link>
            <Link href="/shop" className={styles.ctaSecondary}>{t('Shop All')}</Link>
          </div>
        </div>
      </section>
      {/* FEATURED CATEGORIES */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('Featured Collections')}</h2>
          <div className={styles.sectionUnderline} />
        </div>
        
        <div className={styles.collectionsGrid}>
          {[
            { title: "New Arrivals", desc: "Fresh designs, latest trends", emoji: "👕" },
            { title: "Best Sellers", desc: "Customer favorites, proven quality", emoji: "👔" },
            { title: "Limited Edition", desc: "Exclusive pieces, exclusive you", emoji: "👗" }
          ].map((item, idx) => (
            <Link
              key={idx}
              href="/category"
              className={styles.collectionCard}
            >
              <div className={styles.collectionImageWrapper}>
                {item.emoji}
              </div>
              <h3 className={styles.collectionTitle}>
                {item.title}
              </h3>
              <p className={styles.collectionDesc}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
      {/* HIGHLIGHTS */}
      <section className={styles.highlightsSection}>
        <div className={styles.highlightsContainer}>
          {[
            { icon: "✓", title: "Premium Quality", desc: "Sourced from trusted makers" },
            { icon: "→", title: "Fast Shipping", desc: "Delivered in 3-5 business days" },
            { icon: "↩", title: "Easy Returns", desc: "30-day return guarantee" }
          ].map((item, idx) => (
            <div key={idx} className={styles.highlightItem}>
              <div className={styles.highlightIcon}>{item.icon}</div>
              <h3 className={styles.highlightTitle}>{item.title}</h3>
              <p className={styles.highlightDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* NEWSLETTER */}
      {/* <section className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterTitle}>Stay In The Loop</h2>
          <p className={styles.newsletterDesc}>Get early access to new collections and exclusive offers</p>
          
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email"
              className={styles.newsletterInput}
              required
            />
            <button
              type="submit"
              className={styles.newsletterButton}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section> */}
      {/* CTA SECTION */}
      {/* <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready to Transform?</h2>
          <p className={styles.ctaDescription}>
            Browse our complete catalog and find pieces that resonate with your style
          </p>
          <Link
            href="/category"
            className={styles.ctaButton}
          >
            Start Shopping
          </Link>
        </div>
      </section> */}
    </div>
  );
}

