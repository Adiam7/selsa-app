import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrderTracking } from '../hooks/useOrderTracking';
import styles from './OrderTracking.module.css';
import {
  ShoppingCart,
  Check,
  Package,
  Truck,
  MapPin,
  Navigation,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Loader,
} from 'lucide-react';

interface OrderTrackingProps {
  orderId: string;
  showTimeline?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  ShoppingCart: <ShoppingCart size={24} />,
  Check: <Check size={24} />,
  Package: <Package size={24} />,
  Truck: <Truck size={24} />,
  MapPin: <MapPin size={24} />,
  Navigation: <Navigation size={24} />,
  CheckCircle: <CheckCircle size={24} />,
};

const OrderTracking: React.FC<OrderTrackingProps> = ({
  orderId,
  showTimeline = true,
}) => {
  const { t } = useTranslation();
  const {
    loading,
    error,
    trackingInfo,
    getTrackingInfo,
    getDeliveryStatusSteps,
    formatEstimatedDelivery,
    isDelivered,
    canTrackCarrier,
  } = useOrderTracking();

  useEffect(() => {
    getTrackingInfo(orderId);
  }, [orderId, getTrackingInfo]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader className={styles.spinner} size={40} />
          <p>{t('Loading tracking information...')}</p>
        </div>
      </div>
    );
  }

  if (error || !trackingInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <AlertCircle size={40} />
          <p>{error || 'Unable to load tracking information'}</p>
        </div>
      </div>
    );
  }

  const steps = getDeliveryStatusSteps();
  const estimatedDelivery = formatEstimatedDelivery();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>{t('Order Tracking')}</h2>
        <p className={styles.orderId}>{t('Order #')}{trackingInfo.order_id}</p>
      </div>
      {/* Current Status */}
      <div className={styles.currentStatus}>
        <div className={styles.statusBadge}>
          <span className={styles.statusIcon}>
            {trackingInfo.current_status === 'delivered' ? (
              <CheckCircle size={32} />
            ) : (
              <Package size={32} />
            )}
          </span>
          <div className={styles.statusText}>
            <h3>{trackingInfo.status_display}</h3>
            <p>{trackingInfo.current_location}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${trackingInfo.status_percentage}%` }}
          />
        </div>
        <p className={styles.progressText}>
          {trackingInfo.status_percentage}{t('% Complete')}</p>
      </div>
      {/* Tracking Details */}
      <div className={styles.detailsGrid}>
        {trackingInfo.tracking_number && (
          <div className={styles.detailCard}>
            <label>{t('Tracking Number')}</label>
            <div className={styles.trackingNumber}>
              <code>{trackingInfo.tracking_number}</code>
              {canTrackCarrier() && (
                <a
                  href={trackingInfo.carrier_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.carrierLink}
                  title={`Track with ${trackingInfo.carrier}`}
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        )}

        {trackingInfo.carrier && (
          <div className={styles.detailCard}>
            <label>{t('Carrier')}</label>
            <p className={styles.detailValue}>{trackingInfo.carrier}</p>
          </div>
        )}

        {trackingInfo.estimated_delivery && !isDelivered() && (
          <div className={styles.detailCard}>
            <label>{t('Estimated Delivery')}</label>
            <p className={styles.detailValue}>{estimatedDelivery}</p>
          </div>
        )}

        {isDelivered() && trackingInfo.actual_delivery && (
          <div className={styles.detailCard}>
            <label>{t('Delivered On')}</label>
            <p className={styles.detailValue}>
              {new Date(trackingInfo.actual_delivery).toLocaleDateString(
                'en-US',
                {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}
            </p>
          </div>
        )}
      </div>
      {/* Timeline */}
      {showTimeline && (
        <div className={styles.timeline}>
          <h3>{t('Delivery Timeline')}</h3>
          <div className={styles.stepsContainer}>
            {steps.map((step, index) => (
              <div key={step.key} className={styles.stepWrapper}>
                <div
                  className={`${styles.step} ${
                    step.completed ? styles.completed : ''
                  } ${step.active ? styles.active : ''}`}
                >
                  <div className={styles.stepIcon}>
                    {iconMap[step.icon]}
                  </div>
                  <p className={styles.stepLabel}>{step.label}</p>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`${styles.connector} ${
                      step.completed ? styles.completed : ''
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Status History */}
      {trackingInfo.history.length > 0 && (
        <div className={styles.historySection}>
          <h3>{t('Status Updates')}</h3>
          <div className={styles.historyList}>
            {trackingInfo.history.map((event, index) => (
              <div key={index} className={styles.historyItem}>
                <div className={styles.historyDot} />
                <div className={styles.historyContent}>
                  <div className={styles.historyHeader}>
                    <span className={styles.historyStatus}>
                      {event.status_display}
                    </span>
                    <span className={styles.historyTime}>
                      {new Date(event.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {event.location && (
                    <p className={styles.historyLocation}>{event.location}</p>
                  )}
                  {event.message && (
                    <p className={styles.historyMessage}>{event.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
