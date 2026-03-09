'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ShippingInfoProps {
  region: string;
  onHelpClick?: () => void;
  showTooltip?: boolean;
}

/**
 * ShippingInfo Component
 * 
 * Displays:
 * - Current shipping region
 * - Region-specific information
 * - Help button to explain rates
 * - Optional region details and estimated delivery time
 */
export function ShippingInfo({
  region,
  onHelpClick,
  showTooltip = true,
}: ShippingInfoProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const regionInfo = getRegionInfo(region);
  const regionEmoji = getRegionEmoji(region);

  const handleHelpClick = () => {
    setShowDetails(!showDetails);
    onHelpClick?.();
  };

  return (
    <div className="shipping-info">
      <div className="shipping-info-main">
        <div className="shipping-info-header">
          <span className="region-indicator">
            <span className="region-emoji">{regionEmoji}</span>
            <span className="region-name">{regionInfo.name}</span>
          </span>
          {showTooltip && (
            <button
              className="help-button"
              onClick={handleHelpClick}
              title="Learn about shipping rates"
              aria-label="Help"
            >
              <span className="help-icon">?</span>
            </button>
          )}
        </div>

        <p className="region-description">{regionInfo.description}</p>

        {/* Details section */}
        {showDetails && (
          <div className="region-details">
            <div className="detail-item">
              <span className="detail-label">Region Code:</span>
              <span className="detail-value">{region}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('First Item Rate:')}</span>
              <span className="detail-value">${regionInfo.singleRate.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('Each Additional Item:')}</span>
              <span className="detail-value">${regionInfo.additionalRate.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('Estimated Delivery:')}</span>
              <span className="detail-value">{regionInfo.estimatedDays}{t('days')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface RegionInfoData {
  name: string;
  description: string;
  singleRate: number;
  additionalRate: number;
  estimatedDays: string;
}

/**
 * Get region information including rates and estimated delivery
 */
function getRegionInfo(regionCode: string): RegionInfoData {
  const regions: Record<string, RegionInfoData> = {
    US: {
      name: 'United States',
      description: 'Standard domestic shipping for continental US',
      singleRate: 5.99,
      additionalRate: 1.99,
      estimatedDays: '5-7 business days',
    },
    EU: {
      name: 'European Union',
      description: 'Optimized shipping for all EU countries',
      singleRate: 9.99,
      additionalRate: 2.99,
      estimatedDays: '7-10 business days',
    },
    INTL: {
      name: 'International',
      description: 'Worldwide shipping to 190+ countries',
      singleRate: 14.99,
      additionalRate: 4.99,
      estimatedDays: '10-21 business days',
    },
  };

  return regions[regionCode] || {
    name: 'Unknown Region',
    description: 'Standard international shipping',
    singleRate: 0,
    additionalRate: 0,
    estimatedDays: 'Variable',
  };
}

/**
 * Get emoji representation of region
 */
function getRegionEmoji(regionCode: string): string {
  const emojis: Record<string, string> = {
    US: '🇺🇸',
    EU: '🇪🇺',
    INTL: '🌍',
  };
  return emojis[regionCode] || '📍';
}

export default ShippingInfo;
