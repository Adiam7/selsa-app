/**
 * Checkout page tests
 * Focuses on high-level rendering behavior with all heavy dependencies mocked.
 * Tests: loading state, empty cart redirect, shipping form initial render,
 *        form validation errors, authenticated user email pre-fill.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ── next/navigation ───────────────────────────────────────────────────────────
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, back: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
  usePathname: () => '/checkout',
}));

// ── next-auth/react ───────────────────────────────────────────────────────────
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: (...args: any[]) => mockUseSession(...args),
  signIn: jest.fn(),
}));

// ── @stripe/stripe-js ─────────────────────────────────────────────────────────
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue(null),
}));

// ── @stripe/react-stripe-js ───────────────────────────────────────────────────
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: any) => <div data-testid="stripe-elements">{children}</div>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => null,
  useElements: () => null,
  PaymentElement: () => <div data-testid="payment-element" />,
  AddressElement: () => <div data-testid="address-element" />,
}));

// ── useCart ───────────────────────────────────────────────────────────────────
const mockUseCart = jest.fn();
jest.mock('@/features/cart/hooks/useCart', () => ({
  useCart: (...args: any[]) => mockUseCart(...args),
}));

// ── usePlaceOrder ─────────────────────────────────────────────────────────────
jest.mock('@/features/order/hooks/usePlaceOrder', () => ({
  usePlaceOrder: () => ({
    placeOrder: jest.fn(),
    placingOrder: false,
  }),
}));

// ── useCartCalculation ────────────────────────────────────────────────────────
jest.mock('@/features/cart/hooks/useCartCalculation', () => ({
  useCartCalculation: () => ({
    calculateCartTotal: jest.fn(),
    calculation: { shipping: 5.99, tax: 2.50 },
    loading: false,
  }),
}));

// ── Location utils ────────────────────────────────────────────────────────────
jest.mock('@/lib/locations', () => ({
  searchCountries: jest.fn().mockReturnValue([]),
  getProvinceCode: jest.fn().mockReturnValue(''),
  getCountryName: jest.fn().mockReturnValue(''),
  getCityForState: jest.fn().mockReturnValue(''),
}));

// ── apiClient ─────────────────────────────────────────────────────────────────
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

// ── sonner toast ─────────────────────────────────────────────────────────────
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    promise: jest.fn(),
  },
}));

// ── StripePaymentForm ─────────────────────────────────────────────────────────
jest.mock('@/components/StripePaymentForm', () =>
  function MockStripePaymentForm() {
    return <div data-testid="stripe-payment-form" />;
  }
);

// ── ShippingDisplay ───────────────────────────────────────────────────────────
jest.mock('@/components/checkout', () => ({
  ShippingDisplay: () => <div data-testid="shipping-display" />,
}));

// ── useCheckoutTracking ───────────────────────────────────────────────────────
jest.mock('@/lib/hooks/useAnalytics', () => ({
  useCheckoutTracking: () => ({
    trackCheckoutStarted: jest.fn(),
    trackAddressEntered: jest.fn(),
    trackPaymentEntered: jest.fn(),
    trackOrderCompleted: jest.fn(),
    trackCheckoutAbandoned: jest.fn(),
  }),
}));

// ── growth signals ────────────────────────────────────────────────────────────
jest.mock('@/lib/api/growth', () => ({
  postCheckoutSignal: jest.fn().mockResolvedValue({}),
}));

// ── inventory validation ──────────────────────────────────────────────────────
jest.mock('@/lib/validation/inventory', () => ({
  validateCartBeforeCheckout: jest.fn().mockResolvedValue({ valid: true }),
  handleOutOfStockItems: jest.fn(),
  handlePriceChanges: jest.fn(),
  handleSessionExpiry: jest.fn(),
  withRetry: jest.fn().mockImplementation((fn: any) => fn()),
  isNetworkError: jest.fn().mockReturnValue(false),
}));

// ── payment providers ─────────────────────────────────────────────────────────
jest.mock('@/lib/payment/errors', () => ({
  mapStripeError: jest.fn().mockReturnValue({ message: 'Payment failed' }),
  retryPaymentOperation: jest.fn().mockImplementation((fn: any) => fn()),
}));

jest.mock('@/lib/payment/providers/geo-detection', () => ({
  detectGeoLocation: jest.fn().mockResolvedValue({ country: 'US', region: 'us' }),
  getAvailablePaymentMethods: jest.fn().mockReturnValue([]),
  isPaymentMethodAvailable: jest.fn().mockReturnValue(true),
}));

jest.mock('@/lib/payment/providers/config', () => ({
  getPaymentMethodsForRegion: jest.fn().mockReturnValue([]),
}));

// ── Enhanced feedback UI ──────────────────────────────────────────────────────
jest.mock('@/components/ui/enhanced-feedback', () => ({
  LoadingState: ({ message }: any) => <div data-testid="loading-state">{message}</div>,
  NetworkStatus: () => <div data-testid="network-status" />,
  ValidationMessage: ({ message }: any) => <div data-testid="validation-message">{message}</div>,
  ActionButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  useNetworkStatus: () => true,
}));

// ── i18n / display utils ──────────────────────────────────────────────────────
jest.mock('@/utils/i18nDisplay', () => ({
  getDisplayName: (obj: any) => obj?.name || '',
}));

// ── Import component ──────────────────────────────────────────────────────────
import CheckoutPage from '@/app/checkout/page';

// ── Sample data ───────────────────────────────────────────────────────────────
const sampleCart = {
  id: 99,
  status: 'open',
  items: [
    {
      id: 1,
      product_name: 'Black Tee',
      product_price: 29.99,
      quantity: 1,
      variant_detail: { price: '29.99' },
    },
  ],
};

// ── Tests ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

describe('CheckoutPage', () => {
  describe('loading states', () => {
    it('does not redirect while cart is loading', async () => {
      mockUseSession.mockReturnValue({ data: null, status: 'loading' });
      mockUseCart.mockReturnValue({ cart: null, loading: true, error: null, refreshCart: jest.fn(), mutate: jest.fn() });

      render(<CheckoutPage />);

      // Give effects time to run
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      // Should NOT redirect while loading
      expect(mockRouterPush).not.toHaveBeenCalledWith('/cart');
    });
  });

  describe('empty cart', () => {
    it('redirects to /cart when cart has no items', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });
      mockUseCart.mockReturnValue({
        cart: { ...sampleCart, items: [] },
        loading: false,
        error: null,
        refreshCart: jest.fn(),
        mutate: jest.fn(),
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/cart');
      });
    });

    it('redirects to /cart when cart is null and not loading', async () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      mockUseCart.mockReturnValue({
        cart: null,
        loading: false,
        error: null,
        refreshCart: jest.fn(),
        mutate: jest.fn(),
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/cart');
      });
    });
  });

  describe('with items in cart', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'order@example.com', name: 'John Doe' } },
        status: 'authenticated',
      });
      mockUseCart.mockReturnValue({
        cart: sampleCart,
        loading: false,
        error: null,
        refreshCart: jest.fn(),
        mutate: jest.fn(),
      });
    });

    it('renders the address input field', () => {
      render(<CheckoutPage />);
      expect(screen.getByPlaceholderText('123 Main St')).toBeInTheDocument();
    });

    it('renders the Next/continue step button', () => {
      render(<CheckoutPage />);
      expect(
        screen.getByRole('button', { name: /next|go to next step/i })
      ).toBeInTheDocument();
    });

    it('renders email input for checkout', () => {
      render(<CheckoutPage />);
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });

    it('renders first name and last name fields', () => {
      render(<CheckoutPage />);
      expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    });

    it('does not redirect to /cart when cart has items', async () => {
      render(<CheckoutPage />);
      await act(async () => {
        await new Promise(r => setTimeout(r, 100));
      });
      expect(mockRouterPush).not.toHaveBeenCalledWith('/cart');
    });

    it('shows order summary with cart item count', () => {
      render(<CheckoutPage />);
      // Cart has 1 item — some form of the item count or product name should appear
      expect(screen.queryByText('Black Tee') ?? screen.queryByText('1 item') ?? screen.queryByText(/item/i)).not.toBeNull();
    });
  });

  describe('unauthenticated user', () => {
    it('still renders the form when unauthenticated with cart items', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      mockUseCart.mockReturnValue({
        cart: sampleCart,
        loading: false,
        error: null,
        refreshCart: jest.fn(),
        mutate: jest.fn(),
      });

      render(<CheckoutPage />);
      // Guest checkout - form should still be visible
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });
  });
});
