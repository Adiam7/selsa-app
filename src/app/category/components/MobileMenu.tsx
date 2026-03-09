/**
 * Mobile Menu Component
 * Slide-out navigation menu for mobile devices
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/page.module.css';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: Array<{ id: string; name: string; name_display?: string }>;
  onCategoryClick?: (categoryId: string) => void;
  onNavigate?: (path: string) => void;
}

/**
 * Mobile Slide-Out Menu
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  categories = [],
  onCategoryClick,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(
      expandedCategory === categoryId ? null : categoryId
    );
    onCategoryClick?.(categoryId);
  };

  const handleNavigate = (path: string) => {
    onNavigate?.(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.mobileMenuOverlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Menu */}
      <nav
        className={`${styles.mobileMenu} ${
          isOpen ? styles.mobileMenuOpen : ''
        }`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className={styles.mobileMenuHeader}>
          <h2 className={styles.mobileMenuTitle}>{t('Menu')}</h2>
          <button
            className={styles.mobileMenuClose}
            onClick={onClose}
            aria-label="Close menu"
          >{t('✕')}</button>
        </div>

        {/* Main Navigation */}
        <div className={styles.mobileMenuSection}>
          <div className={styles.mobileMenuSectionTitle}>{t('Shop')}</div>
          <ul className={styles.mobileMenuList}>
            <li>
              <button
                className={styles.mobileMenuItem}
                onClick={() => handleNavigate('/')}
              >{t('Home')}</button>
            </li>
            <li>
              <button
                className={styles.mobileMenuItem}
                onClick={() => handleNavigate('/category')}
              >{t('All Products')}</button>
            </li>
            <li>
              <button
                className={styles.mobileMenuItem}
                onClick={() => handleNavigate('/wishlist')}
              >{t('♡ Wishlist')}</button>
            </li>
            <li>
              <button
                className={styles.mobileMenuItem}
                onClick={() => handleNavigate('/cart')}
              >{t('🛒 Cart')}</button>
            </li>
          </ul>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className={styles.mobileMenuSection}>
            <div className={styles.mobileMenuSectionTitle}>{t('Categories')}</div>
            <ul className={styles.mobileMenuList}>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    className={`${styles.mobileMenuItem} ${
                      expandedCategory === category.id
                        ? styles.mobileMenuItemExpanded
                        : ''
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {category.name_display || category.name}
                    <span className={styles.mobileMenuItemArrow}>›</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Account & Settings */}
        <div className={styles.mobileMenuSection}>
          <div className={styles.mobileMenuSectionTitle}>{t('Account')}</div>
          <ul className={styles.mobileMenuList}>
            <li>
              <button
                className={styles.mobileMenuItem}
                onClick={() => handleNavigate('/account')}
              >{t('My Account')}</button>
            </li>
            <li>
              <button
                className={styles.mobileMenuItem}
                onClick={() => handleNavigate('/orders')}
              >{t('My Orders')}</button>
            </li>
            <li>
              <button
                className={styles.mobileMenuItem}
                onClick={() => handleNavigate('/settings')}
              >{t('Settings')}</button>
            </li>
            <li>
              <button
                className={styles.mobileMenuItem}
                onClick={() => handleNavigate('/logout')}
              >{t('Log Out')}</button>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className={styles.mobileMenuFooter}>
          <p className={styles.mobileMenuFooterText}>{t('Need help? Contact support')}</p>
          <a href="tel:+1234567890" className={styles.mobileMenuFooterLink}>{t('📞 +1 (234) 567-890')}</a>
        </div>
      </nav>
    </>
  );
};

export default MobileMenu;
