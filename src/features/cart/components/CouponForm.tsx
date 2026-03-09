import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCoupon } from '../hooks/useCoupon';
import styles from './CouponForm.module.css';
import { AlertCircle, Check, X } from 'lucide-react';

interface CouponFormProps {
  subtotal: number;
  customerEmail: string;
  onCouponApplied: (discount: number, code: string) => void;
  onCouponRemoved: () => void;
}

const CouponForm: React.FC<CouponFormProps> = ({
  subtotal,
  customerEmail,
  onCouponApplied,
  onCouponRemoved,
}) => {
  const { t } = useTranslation();
  const [couponCode, setCouponCode] = useState('');
  const [showInput, setShowInput] = useState(false);
  const { loading, error, appliedCoupon, applyCoupon, removeCoupon } = useCoupon();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      return;
    }

    const result = await applyCoupon(
      couponCode.trim(),
      customerEmail,
      subtotal
    );

    if (result && result.success) {
      onCouponApplied(
        parseFloat(result.discount_amount),
        couponCode.toUpperCase()
      );
      setCouponCode('');
      setShowInput(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    onCouponRemoved();
    setCouponCode('');
    setShowInput(false);
  };

  if (appliedCoupon) {
    return (
      <div className={styles.appliedCoupon}>
        <div className={styles.appliedHeader}>
          <Check className={styles.successIcon} size={20} />
          <span className={styles.appliedText}>{t('Coupon Applied:')}{appliedCoupon.discount_type === 'percentage' 
              ? `${appliedCoupon.discount_value}% off` 
              : `$${appliedCoupon.discount_amount} off`}
          </span>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className={styles.removeButton}
            title="Remove coupon"
          >
            <X size={18} />
          </button>
        </div>
        <div className={styles.discountDetails}>
          <span>{t('Discount:')}</span>
          <span className={styles.discountAmount}>{t('-$')}{parseFloat(appliedCoupon.discount_amount).toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.couponContainer}>
      {!showInput ? (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className={styles.toggleButton}
        >
          Have a promo code?
        </button>
      ) : (
        <form onSubmit={handleApplyCoupon} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={loading}
              className={styles.input}
            />
            <button
              type="submit"
              disabled={loading || !couponCode.trim()}
              className={styles.applyButton}
            >
              {loading ? 'Checking...' : 'Apply'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInput(false);
                setCouponCode('');
              }}
              className={styles.cancelButton}
            >{t('Cancel')}</button>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{t(error)}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CouponForm;
