// src/app/Home/page.tsx

'use client';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

import Link from 'next/link';
import React from 'react';
import styles from './home.module.css';
import HeroCarousel from './components/HeroCarousel';

export default function Home() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <div>
      {/* HERO SECTION WITH CAROUSEL */}
      <section className={styles.hero}>
        <div className={styles.carouselTitleWrapper}>
          <h1 className={styles.carouselTitle}>{mounted ? t('Welcome !') : 'Welcome !'}</h1>
          <p className={styles.carouselDescription}>{mounted ? t('Discover Elegance & Explore our curated collections of premium products') : 'Discover Elegance & Explore our curated collections of premium products'}</p>
        </div>
        <HeroCarousel />
      </section>
      {/* FEATURED CATEGORIES */}
      {/* <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('Featured Collections')}</h2>
          <div className={styles.sectionUnderline} />
        </div>
        
        <div className={styles.collectionsGrid}>
          {[
            { title: t('New Arrivals'), desc: t('Fresh designs, latest trends'), emoji: '👕' },
            { title: t('Best Sellers'), desc: t('Customer favorites, proven quality'), emoji: '👔' },
            { title: t('Limited Edition'), desc: t('Exclusive pieces, exclusive you'), emoji: '👗' }
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
      </section> */}
      {/* HIGHLIGHTS */}
      {/* <section className={styles.highlightsSection}>
        <div className={styles.highlightsContainer}>
          {[
            { icon: '✓', title: t('Premium Quality'), desc: t('Sourced from trusted makers') },
            { icon: '→', title: t('Fast Shipping'), desc: t('Delivered in 3-5 business days') },
            { icon: '↩', title: t('Easy Returns'), desc: t('30-day return guarantee') }
          ].map((item, idx) => (
            <div key={idx} className={styles.highlightItem}>
              <div className={styles.highlightIcon}>{item.icon}</div>
              <h3 className={styles.highlightTitle}>{item.title}</h3>
              <p className={styles.highlightDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section> */}
      {/* NEWSLETTER */}
      {/* <section className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterTitle}>{t('Stay In The Loop')}</h2>
          <p className={styles.newsletterDesc}>{t('Get early access to new collections and exclusive offers')}</p>
          
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder={t('Enter your email')}
              className={styles.newsletterInput}
              required
            />
            <button
              type="submit"
              className={styles.newsletterButton}
            >
              {t('Subscribe')}
            </button>
          </form>
        </div>
      </section> */}
      {/* CTA SECTION */}
      {/* <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>{t('Ready to Transform?')}</h2>
          <p className={styles.ctaDescription}>
            {t('Browse our complete catalog and find pieces that resonate with your style')}
          </p>
          <Link
            href="/category"
            className={styles.ctaButton}
          >
            {t('Start Shopping')}
          </Link>
        </div>
      </section> */}
    </div>
  );
}

