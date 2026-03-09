'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShippingBreakdown } from './ShippingBreakdown';
import { ShippingInfo } from './ShippingInfo';
import { ShippingTooltip } from './ShippingTooltip';
import { ShippingDisplayData } from '@/types/shipping';

export interface ShippingDisplayProps {
  data: ShippingDisplayData;
  className?: string;
}

/**
 * ShippingDisplay Component
 * 
 * Unified component that orchestrates the display of shipping information.
 * Combines:
 * - ShippingBreakdown: Itemized cost display
 * - ShippingInfo: Regional information
 * - ShippingTooltip: Educational modal
 * 
 * This is the main component to use in checkout flows.
 */
export function ShippingDisplay({ data, className }: ShippingDisplayProps) {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  if (data.isLoading) {
    return (
      <div className={`shipping-display loading ${className}`}>
        <div className="shipping-skeleton">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className={`shipping-display error ${className}`}>
        <div className="error-message">
          <span className="error-icon">{t('⚠️')}</span>
          <p>{t('Unable to calculate shipping. Using standard rate.')}</p>
        </div>
      </div>
    );
  }

  if (!data.breakdown) {
    return null;
  }

  return (
    <div className={`shipping-display ${className}`}>
      <ShippingInfo
        region={data.breakdown.region}
        onHelpClick={() => setShowTooltip(true)}
        showTooltip={true}
      />

      <ShippingBreakdown
        breakdown={data.breakdown}
        currency={data.currency}
        showFormula={true}
      />

      <ShippingTooltip
        isOpen={showTooltip}
        onClose={() => setShowTooltip(false)}
      />
    </div>
  );
}

export default ShippingDisplay;
