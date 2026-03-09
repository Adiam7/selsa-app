'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ShippingTooltipProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * ShippingTooltip Component
 * 
 * Educational modal/drawer explaining:
 * - Tiered shipping formula
 * - How rates are calculated
 * - Product categories and their rates
 * - Regional breakdown
 * - Example calculations
 */
export function ShippingTooltip({ isOpen = false, onClose }: ShippingTooltipProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(isOpen);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="shipping-tooltip-overlay">
      <div className="shipping-tooltip-modal">
        <div className="tooltip-header">
          <h2>{t('How Shipping is Calculated')}</h2>
          <button
            className="close-button"
            onClick={handleClose}
            title="Close"
            aria-label="Close information"
          >{t('✕')}</button>
        </div>

        <div className="tooltip-content">
          {/* Formula Section */}
          <section className="tooltip-section">
            <h3>{t('💡 Tiered Pricing Formula')}</h3>
            <div className="formula-box">
              <code>{t('Total = First Item + (Additional Items × Rate)')}</code>
            </div>
            <p>{t(
              'The first item in each category ships at the full rate. Each additional item\n              ships at a reduced rate, making bulk orders more affordable.'
            )}</p>
          </section>

          {/* Regional Rates */}
          <section className="tooltip-section">
            <h3>{t('🌍 Regional Shipping Rates')}</h3>
            <div className="rates-grid">
              <div className="rate-card">
                <div className="rate-header">
                  <span className="rate-emoji">{t('🇺🇸')}</span>
                  <span className="rate-title">{t('United States')}</span>
                </div>
                <div className="rate-details">
                  <div className="rate-row">
                    <span>{t('First Item:')}</span>
                    <strong>{t('$5.99')}</strong>
                  </div>
                  <div className="rate-row">
                    <span>{t('Each Additional:')}</span>
                    <strong>{t('$1.99')}</strong>
                  </div>
                  <div className="rate-example">{t('Example: 3 T-shirts = 5.99 + (1.99 × 2) =')}<strong>{t('$9.97')}</strong>
                  </div>
                </div>
              </div>

              <div className="rate-card">
                <div className="rate-header">
                  <span className="rate-emoji">{t('🇪🇺')}</span>
                  <span className="rate-title">{t('European Union')}</span>
                </div>
                <div className="rate-details">
                  <div className="rate-row">
                    <span>{t('First Item:')}</span>
                    <strong>{t('€8.99')}</strong>
                  </div>
                  <div className="rate-row">
                    <span>{t('Each Additional:')}</span>
                    <strong>{t('€2.99')}</strong>
                  </div>
                  <div className="rate-example">{t('Example: 2 Hoodies = 8.99 + (2.99 × 1) =')}<strong>{t('€11.98')}</strong>
                  </div>
                </div>
              </div>

              <div className="rate-card">
                <div className="rate-header">
                  <span className="rate-emoji">{t('🌍')}</span>
                  <span className="rate-title">{t('International')}</span>
                </div>
                <div className="rate-details">
                  <div className="rate-row">
                    <span>{t('First Item:')}</span>
                    <strong>{t('$14.99')}</strong>
                  </div>
                  <div className="rate-row">
                    <span>{t('Each Additional:')}</span>
                    <strong>{t('$4.99')}</strong>
                  </div>
                  <div className="rate-example">{t('Example: 4 Items = 14.99 + (4.99 × 3) =')}<strong>{t('$29.96')}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Categories */}
          <section className="tooltip-section">
            <h3>{t('📦 Product Categories')}</h3>
            <p>{t('Each product has a category that determines its shipping rate:')}</p>
            <ul className="category-list">
              <li>
                <strong>{t('T-Shirts:')}</strong>{t('Lightweight apparel (standard rate)')}</li>
              <li>
                <strong>{t('Hoodies:')}</strong>{t('Heavier apparel (standard rate)')}</li>
              <li>
                <strong>{t('Mugs:')}</strong>{t('Ceramic drinkware (standard rate)')}</li>
              <li>
                <strong>{t('Posters:')}</strong>{t('Paper/flat items (reduced rate)')}</li>
              <li>
                <strong>{t('Backpacks:')}</strong>{t('Larger items (premium rate)')}</li>
            </ul>
          </section>

          {/* Why Tiered? */}
          <section className="tooltip-section">
            <h3>{t('❓ Why Tiered Shipping?')}</h3>
            <ul className="benefits-list">
              <li>
                <strong>{t('Fair Pricing:')}</strong>{t('You only pay for what you actually ship')}</li>
              <li>
                <strong>{t('Bulk Discounts:')}</strong>{t('Orders with multiple items save money')}</li>
              <li>
                <strong>{t('Transparent Costs:')}</strong> No hidden fees or surprises
              </li>
              <li>
                <strong>{t('Real Calculations:')}</strong>{t('Based on actual carrier rates')}</li>
            </ul>
          </section>

          {/* Example Calculation */}
          <section className="tooltip-section">
            <h3>{t('🧮 Complete Example')}</h3>
            <div className="example-box">
              <p className="example-title">{t('Order: 2 T-Shirts + 1 Hoodie to EU')}</p>
              <div className="example-calc">
                <div className="calc-line">
                  <span>{t('T-Shirt (1st item):')}</span>
                  <span>{t('€8.99')}</span>
                </div>
                <div className="calc-line">
                  <span>{t('T-Shirt (2nd item):')}</span>
                  <span>{t('€2.99')}</span>
                </div>
                <div className="calc-line">
                  <span>{t('Hoodie (1st item):')}</span>
                  <span>{t('€8.99')}</span>
                </div>
                <div className="calc-total">
                  <span>{t('Total Shipping:')}</span>
                  <strong>{t('€20.97')}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Estimated Delivery */}
          <section className="tooltip-section">
            <h3>{t('⏱️ Estimated Delivery Times')}</h3>
            <ul className="delivery-list">
              <li>{t('🇺🇸 United States: 5-7 business days')}</li>
              <li>{t('🇪🇺 European Union: 7-10 business days')}</li>
              <li>{t('🌍 International: 10-21 business days')}</li>
            </ul>
          </section>
        </div>

        <div className="tooltip-footer">
          <button className="close-btn" onClick={handleClose}>{t('Got it! Close')}</button>
        </div>
      </div>
    </div>
  );
}

export default ShippingTooltip;
