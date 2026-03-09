'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShippingBreakdown as ShippingBreakdownType } from '@/types/shipping';
import { getDisplayName } from '@/utils/i18nDisplay';

export interface ShippingBreakdownProps {
  breakdown: ShippingBreakdownType;
  currency?: string;
  showFormula?: boolean;
}

/**
 * ShippingBreakdown Component
 * 
 * Displays an itemized breakdown of shipping costs by product category.
 * Shows:
 * - Each product category and quantity
 * - Individual shipping costs
 * - Calculation formula for each item
 * - Total shipping cost
 * - General tiered pricing formula explanation
 */
export function ShippingBreakdown({
  breakdown,
  currency = 'USD',
  showFormula = true,
}: ShippingBreakdownProps) {
  const { t } = useTranslation();
  if (!breakdown || !breakdown.items || breakdown.items.length === 0) {
    return null;
  }

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="shipping-breakdown">
      <div className="shipping-breakdown-header">
        <h3 className="shipping-breakdown-title">{t('📦 Shipping Cost Breakdown')}</h3>
        <p className="shipping-breakdown-description">{t('Transparent tiered shipping based on your products')}</p>
      </div>
      {/* Items breakdown */}
      <div className="shipping-breakdown-items">
        <div className="breakdown-items-header">
          <span className="col-category">{t('Product Category')}</span>
          <span className="col-qty">{t('Qty')}</span>
          <span className="col-cost">{t('Cost')}</span>
          <span className="col-formula">{t('Calculation')}</span>
        </div>

        {breakdown.items.map((item, index) => (
          <div key={`${item.category}-${index}`} className="breakdown-item">
            <span className="col-category">
              <span className="category-badge">
                {getDisplayName({ name: item.category }) || String(item.category)}
              </span>
            </span>
            <span className="col-qty">×{item.quantity}</span>
            <span className="col-cost">
              <strong>{currencySymbol}{item.cost.toFixed(2)}</strong>
            </span>
            <span className="col-formula">
              <code className="formula-code">{item.formula}</code>
            </span>
          </div>
        ))}
      </div>
      {/* Total */}
      <div className="shipping-breakdown-total">
        <div className="total-label">{t('Total Shipping:')}</div>
        <div className="total-amount">
          <strong>{currencySymbol}{breakdown.total.toFixed(2)}</strong>
        </div>
      </div>
      {/* Formula explanation */}
      {showFormula && (
        <div className="shipping-breakdown-formula">
          <p className="formula-label">{t('💡 How it works:')}</p>
          <code className="formula-display">{breakdown.formula}</code>
          <p className="formula-explanation">{t('First item at full rate, additional items at reduced rate')}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Get currency symbol from code
 */
function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
  };
  return symbols[currencyCode] || currencyCode;
}

export default ShippingBreakdown;
