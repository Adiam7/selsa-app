import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CouponForm from '../cart/components/CouponForm';
import OrderTracking from '../order/components/OrderTracking';
import { useCoupon } from '../cart/hooks/useCoupon';
import { useOrderTracking } from '../order/hooks/useOrderTracking';

// Mock the hooks
jest.mock('../cart/hooks/useCoupon');
jest.mock('../order/hooks/useOrderTracking');

describe('CouponForm Component', () => {
  const mockOnCouponApplied = jest.fn();
  const mockOnCouponRemoved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders coupon form button', () => {
    (useCoupon as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      appliedCoupon: null,
      applyCoupon: jest.fn(),
      removeCoupon: jest.fn(),
    });

    render(
      <CouponForm
        subtotal={99.99}
        customerEmail="test@example.com"
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
      />
    );

    expect(screen.getByText('Have a promo code?')).toBeInTheDocument();
  });

  test('shows input field when button clicked', async () => {
    (useCoupon as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      appliedCoupon: null,
      applyCoupon: jest.fn(),
      removeCoupon: jest.fn(),
    });

    render(
      <CouponForm
        subtotal={99.99}
        customerEmail="test@example.com"
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
      />
    );

    const button = screen.getByText('Have a promo code?');
    fireEvent.click(button);

    expect(
      screen.getByPlaceholderText('Enter coupon code')
    ).toBeInTheDocument();
  });

  test('applies coupon on form submit', async () => {
    const mockApplyCoupon = jest.fn().mockResolvedValue({
      success: true,
      discount_amount: '9.99',
      discount_type: 'percentage',
      discount_value: '10',
    });

    (useCoupon as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      appliedCoupon: null,
      applyCoupon: mockApplyCoupon,
      removeCoupon: jest.fn(),
    });

    const { rerender } = render(
      <CouponForm
        subtotal={99.99}
        customerEmail="test@example.com"
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
      />
    );

    fireEvent.click(screen.getByText('Have a promo code?'));

    const input = screen.getByPlaceholderText('Enter coupon code');
    await userEvent.type(input, 'SUMMER20');

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockApplyCoupon).toHaveBeenCalledWith(
        'SUMMER20',
        'test@example.com',
        99.99
      );
    });
  });

  test('displays applied coupon', () => {
    (useCoupon as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      appliedCoupon: {
        success: true,
        discount_amount: '19.99',
        discount_type: 'percentage',
        discount_value: '20',
      },
      applyCoupon: jest.fn(),
      removeCoupon: jest.fn(),
    });

    render(
      <CouponForm
        subtotal={99.99}
        customerEmail="test@example.com"
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
      />
    );

    expect(screen.getByText(/20% off/)).toBeInTheDocument();
    expect(screen.getByText('-$19.99')).toBeInTheDocument();
  });

  test('removes applied coupon', async () => {
    const mockRemoveCoupon = jest.fn();

    (useCoupon as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      appliedCoupon: {
        success: true,
        discount_amount: '19.99',
        discount_type: 'percentage',
        discount_value: '20',
      },
      applyCoupon: jest.fn(),
      removeCoupon: mockRemoveCoupon,
    });

    render(
      <CouponForm
        subtotal={99.99}
        customerEmail="test@example.com"
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
      />
    );

    const removeButton = screen.getByTitle('Remove coupon');
    fireEvent.click(removeButton);

    expect(mockRemoveCoupon).toHaveBeenCalled();
  });

  test('displays error message', async () => {
    (useCoupon as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Invalid coupon code',
      appliedCoupon: null,
      applyCoupon: jest.fn(),
      removeCoupon: jest.fn(),
    });

    render(
      <CouponForm
        subtotal={99.99}
        customerEmail="test@example.com"
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
      />
    );

    // Simulate clicking to show the input (and error)
    fireEvent.click(screen.getByText('Have a promo code?'));
    expect(await screen.findByText('Invalid coupon code')).toBeInTheDocument();
  });
});

describe('OrderTracking Component', () => {
  const mockTrackingInfo = {
    order_id: 'ORDER123',
    current_status: 'shipped',
    status_display: 'Shipped',
    tracking_number: '1Z999AA10123456784',
    carrier: 'UPS',
    carrier_url: 'https://tracking.ups.com/...',
    current_location: 'Memphis, TN',
    estimated_delivery: '2026-01-31T00:00:00Z',
    actual_delivery: null,
    created_at: '2026-01-29T10:00:00Z',
    updated_at: '2026-01-30T15:30:00Z',
    status_percentage: 50,
    history: [
      {
        status: 'shipped',
        status_display: 'Shipped',
        location: 'Memphis, TN',
        message: 'Order shipped',
        timestamp: '2026-01-30T15:30:00Z',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    (useOrderTracking as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      trackingInfo: null,
      getTrackingInfo: jest.fn(),
      getDeliveryStatusSteps: jest.fn(),
      formatEstimatedDelivery: jest.fn(),
      isDelivered: jest.fn(),
      canTrackCarrier: jest.fn(),
    });

    render(<OrderTracking orderId="ORDER123" />);

    expect(screen.getByText(/Loading tracking information/i)).toBeInTheDocument();
  });

  test('displays tracking information', () => {
    (useOrderTracking as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      trackingInfo: mockTrackingInfo,
      getTrackingInfo: jest.fn(),
      getDeliveryStatusSteps: jest.fn().mockReturnValue([]),
      formatEstimatedDelivery: jest.fn().mockReturnValue('Jan 31, 2026'),
      isDelivered: jest.fn().mockReturnValue(false),
      canTrackCarrier: jest.fn().mockReturnValue(true),
    });

    render(<OrderTracking orderId="ORDER123" />);

    expect(screen.getByText(/ORDER123/)).toBeInTheDocument();
    // Use getAllByText for repeated text and assert at least one match
    expect(screen.getAllByText('Shipped').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Memphis, TN').length).toBeGreaterThan(0);
  });

  test('displays error state', () => {
    (useOrderTracking as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to load tracking',
      trackingInfo: null,
      getTrackingInfo: jest.fn(),
      getDeliveryStatusSteps: jest.fn(),
      formatEstimatedDelivery: jest.fn(),
      isDelivered: jest.fn(),
      canTrackCarrier: jest.fn(),
    });

    render(<OrderTracking orderId="ORDER123" />);

    expect(screen.getByText('Failed to load tracking')).toBeInTheDocument();
  });

  test('displays tracking number', () => {
    (useOrderTracking as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      trackingInfo: mockTrackingInfo,
      getTrackingInfo: jest.fn(),
      getDeliveryStatusSteps: jest.fn().mockReturnValue([]),
      formatEstimatedDelivery: jest.fn(),
      isDelivered: jest.fn().mockReturnValue(false),
      canTrackCarrier: jest.fn().mockReturnValue(true),
    });

    render(<OrderTracking orderId="ORDER123" />);

    expect(screen.getByText('1Z999AA10123456784')).toBeInTheDocument();
  });

  test('displays progress bar', () => {
    (useOrderTracking as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      trackingInfo: mockTrackingInfo,
      getTrackingInfo: jest.fn(),
      getDeliveryStatusSteps: jest.fn().mockReturnValue([]),
      formatEstimatedDelivery: jest.fn(),
      isDelivered: jest.fn().mockReturnValue(false),
      canTrackCarrier: jest.fn().mockReturnValue(true),
    });

    render(<OrderTracking orderId="ORDER123" />);

    expect(screen.getByText('50% Complete')).toBeInTheDocument();
  });

  test('displays status history', () => {
    (useOrderTracking as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      trackingInfo: mockTrackingInfo,
      getTrackingInfo: jest.fn(),
      getDeliveryStatusSteps: jest.fn().mockReturnValue([]),
      formatEstimatedDelivery: jest.fn(),
      isDelivered: jest.fn().mockReturnValue(false),
      canTrackCarrier: jest.fn().mockReturnValue(true),
    });

    render(<OrderTracking orderId="ORDER123" />);

    expect(screen.getByText('Status Updates')).toBeInTheDocument();
    // Use getAllByText for repeated text and assert at least one match
    expect(screen.getAllByText('Shipped').length).toBeGreaterThan(0);
  });
});
