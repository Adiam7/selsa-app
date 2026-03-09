import { useState, useCallback } from 'react';
import axios from 'axios';

export interface TrackingHistory {
  status: string;
  status_display: string;
  location: string;
  message: string;
  timestamp: string;
}

export interface TrackingInfo {
  order_id: string;
  current_status: string;
  status_display: string;
  tracking_number: string | null;
  carrier: string | null;
  carrier_url: string | null;
  current_location: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  created_at: string;
  updated_at: string;
  status_percentage: number;
  history: TrackingHistory[];
}

export const useOrderTracking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);

  const getTrackingInfo = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `/api/orders/${orderId}/tracking/`
      );

      setTrackingInfo(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch tracking info';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatusHistory = useCallback(
    async (orderId: string): Promise<TrackingHistory[] | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `/api/orders/${orderId}/status-history/`
        );

        return response.data.history;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to fetch status history';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getDeliveryStatusSteps = useCallback(() => {
    if (!trackingInfo) return [];

    // Exception statuses that break the normal delivery timeline
    const exceptionStatuses = ['backordered', 'lost', 'returned_to_sender'];
    const isException = exceptionStatuses.includes(trackingInfo.current_status);

    const steps = [
      { key: 'pending', label: 'Order Placed', icon: 'ShoppingCart' },
      { key: 'confirmed', label: 'Confirmed', icon: 'Check' },
      { key: 'processing', label: 'Processing', icon: 'Package' },
      { key: 'shipped', label: 'Shipped', icon: 'Truck' },
      { key: 'in_transit', label: 'In Transit', icon: 'MapPin' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'Navigation' },
      { key: 'delivered', label: 'Delivered', icon: 'CheckCircle' },
    ];

    // Append exception step if current status is an exception
    if (isException) {
      const exceptionLabels: Record<string, string> = {
        backordered: 'Backordered',
        lost: 'Lost in Transit',
        returned_to_sender: 'Returned to Sender',
      };
      steps.push({
        key: trackingInfo.current_status,
        label: exceptionLabels[trackingInfo.current_status] || trackingInfo.current_status,
        icon: 'AlertTriangle',
      });
    }

    const statusPercentages: Record<string, number> = {
      pending: 0,
      confirmed: 16.67,
      processing: 33.33,
      shipped: 50,
      in_transit: 66.67,
      out_for_delivery: 83.33,
      delivered: 100,
      backordered: 33.33,
      lost: 66.67,
      returned_to_sender: 66.67,
    };

    return steps.map((step) => ({
      ...step,
      completed: trackingInfo.status_percentage >= (statusPercentages[step.key] ?? 0),
      active: step.key === trackingInfo.current_status,
      isException: isException && step.key === trackingInfo.current_status,
    }));
  }, [trackingInfo]);

  const formatEstimatedDelivery = useCallback(() => {
    if (!trackingInfo?.estimated_delivery) return 'Not available';

    const date = new Date(trackingInfo.estimated_delivery);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [trackingInfo]);

  const isDelivered = useCallback(() => {
    return trackingInfo?.current_status === 'delivered';
  }, [trackingInfo]);

  const canTrackCarrier = useCallback(() => {
    return (
      trackingInfo?.tracking_number &&
      trackingInfo?.carrier_url &&
      trackingInfo?.current_status !== 'pending' &&
      trackingInfo?.current_status !== 'confirmed' &&
      trackingInfo?.current_status !== 'processing'
    );
  }, [trackingInfo]);

  return {
    loading,
    error,
    trackingInfo,
    getTrackingInfo,
    getStatusHistory,
    getDeliveryStatusSteps,
    formatEstimatedDelivery,
    isDelivered,
    canTrackCarrier,
  };
};
