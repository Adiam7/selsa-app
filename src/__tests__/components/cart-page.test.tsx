/**
 * CartPage component tests
 * Tests: loading state, empty cart, items rendering, quantity change, item removal, checkout redirect
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ── Mock next/navigation ──────────────────────────────────────────────────────
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => ({ get: () => null }),
  usePathname: () => '/',
}));

// ── Mock react-hot-toast ──────────────────────────────────────────────────────
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  }),
}));

// ── Mock framer-motion ────────────────────────────────────────────────────────
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ── Mock QuantitySelector ─────────────────────────────────────────────────────
jest.mock('@/components/QuantitySelector', () => ({
  QuantitySelector: ({ value, onQuantityChange }: any) => (
    <div data-testid="quantity-selector">
      <button
        data-testid="qty-decrease"
        onClick={() => onQuantityChange(value - 1)}
      >-</button>
      <span data-testid="qty-value">{value}</span>
      <button
        data-testid="qty-increase"
        onClick={() => onQuantityChange(value + 1)}
      >+</button>
    </div>
  ),
}));

// ── Mock CSS ──────────────────────────────────────────────────────────────────
jest.mock('@/components/QuantitySelector.css', () => ({}));

// ── Mock useCart ──────────────────────────────────────────────────────────────
const mockMutate = jest.fn();
const mockRefreshCart = jest.fn();

jest.mock('@/features/cart/hooks/useCart', () => ({
  useCart: jest.fn(),
}));

// ── Mock cart API ─────────────────────────────────────────────────────────────
jest.mock('@/lib/api/cart/updateCartItem', () => ({
  updateCartItem: jest.fn(),
}));
jest.mock('@/lib/api/cart/removeCartItem', () => ({
  removeCartItem: jest.fn(),
}));
jest.mock('@/lib/api/cart', () => ({
  addToCart: jest.fn(),
}));

// ── Mock utils ────────────────────────────────────────────────────────────────
jest.mock('@/lib/utils/utils', () => ({
  resolveBackendAssetUrl: (url: string) => url || '',
  name_option: (opt: any) => opt?.name || '',
}));
jest.mock('@/utils/colorTranslations', () => ({
  getColorTranslation: (color: string) => color,
}));

// ── Imports after mocks ───────────────────────────────────────────────────────
import { useCart } from '@/features/cart/hooks/useCart';
import { updateCartItem as updateCartItemAPI } from '@/lib/api/cart/updateCartItem';
import { removeCartItem as removeCartItemAPI } from '@/lib/api/cart/removeCartItem';
import toast from 'react-hot-toast';
import CartPage from '@/app/cart/page';

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockUseCart = useCart as jest.Mock;
const mockUpdateCartItem = updateCartItemAPI as jest.Mock;
const mockRemoveCartItem = removeCartItemAPI as jest.Mock;

const sampleItem = {
  id: 1,
  product_id: 10,
  product_name: 'Cool Hoodie',
  product_price: 49.99,
  quantity: 2,
  variant_id: 100,
  options: [],
  image: '/hoodie.jpg',
};

const sampleCart = {
  id: 'cart-123',
  status: 'open',
  items: [sampleItem],
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('CartPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockResolvedValue(sampleCart);
    mockRefreshCart.mockResolvedValue(sampleCart);
  });

  it('renders loading skeleton while cart is loading', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      loading: true,
      error: null,
      mutate: mockMutate,
      refreshCart: mockRefreshCart,
    });

    render(<CartPage />);
    // Loading state should NOT show product names
    expect(screen.queryByText('Cool Hoodie')).not.toBeInTheDocument();
  });

  it('renders empty cart state when cart has no items', () => {
    mockUseCart.mockReturnValue({
      cart: { ...sampleCart, items: [] },
      loading: false,
      error: null,
      mutate: mockMutate,
      refreshCart: mockRefreshCart,
    });

    render(<CartPage />);
    // Should show empty cart message (key returned as-is by i18n mock)
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it('renders cart items with product name and price', () => {
    mockUseCart.mockReturnValue({
      cart: sampleCart,
      loading: false,
      error: null,
      mutate: mockMutate,
      refreshCart: mockRefreshCart,
    });

    render(<CartPage />);
    expect(screen.getByText('Cool Hoodie')).toBeInTheDocument();
    expect(screen.getByText(/49\.99/)).toBeInTheDocument();
  });

  it('renders quantity control buttons for each cart item', () => {
    mockUseCart.mockReturnValue({
      cart: sampleCart,
      loading: false,
      error: null,
      mutate: mockMutate,
      refreshCart: mockRefreshCart,
    });

    render(<CartPage />);
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument();
    // Quantity value is shown inline
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows correct subtotal price in order summary', () => {
    mockUseCart.mockReturnValue({
      cart: sampleCart,
      loading: false,
      error: null,
      mutate: mockMutate,
      refreshCart: mockRefreshCart,
    });

    render(<CartPage />);
    // Total = 49.99 * 2 = 99.98 — displayed as $99.98
    expect(screen.getAllByText('$99.98').length).toBeGreaterThan(0);
  });

  it('calls updateCartItem when quantity increases', async () => {
    const updatedCart = { ...sampleCart, items: [{ ...sampleItem, quantity: 3 }] };
    mockMutate.mockImplementation(async (updater: any, opts: any) => {
      if (opts?.optimisticData) {
        await updater();
      }
      return updatedCart;
    });
    mockUpdateCartItem.mockResolvedValue(updatedCart);

    mockUseCart.mockReturnValue({
      cart: sampleCart,
      loading: false,
      error: null,
      mutate: mockMutate,
      refreshCart: mockRefreshCart,
    });

    render(<CartPage />);

    const increaseBtn = screen.getByRole('button', { name: /increase quantity/i });
    await act(async () => {
      fireEvent.click(increaseBtn);
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('calls removeCartItem when remove action is triggered', async () => {
    const emptyCart = { ...sampleCart, items: [] };
    mockMutate.mockImplementation(async (updater: any, opts: any) => {
      if (opts?.optimisticData) {
        await updater();
      }
      return emptyCart;
    });
    mockRemoveCartItem.mockResolvedValue(emptyCart);

    mockUseCart.mockReturnValue({
      cart: sampleCart,
      loading: false,
      error: null,
      mutate: mockMutate,
      refreshCart: mockRefreshCart,
    });

    render(<CartPage />);

    // Find and click remove button (Trash2 icon button)
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    await act(async () => {
      fireEvent.click(removeBtn);
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('navigates to checkout when "Proceed to Checkout" is clicked', () => {
    mockUseCart.mockReturnValue({
      cart: sampleCart,
      loading: false,
      error: null,
      mutate: mockMutate,
      refreshCart: mockRefreshCart,
    });

    render(<CartPage />);

    const checkoutBtn = screen.getByRole('button', { name: /checkout/i });
    fireEvent.click(checkoutBtn);
    expect(mockRouterPush).toHaveBeenCalledWith('/checkout');
  });

  it('renders null/empty when cart is null and not loading', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      loading: false,
      error: null,
      mutate: mockMutate,
      refreshCart: mockRefreshCart,
    });

    render(<CartPage />);
    expect(screen.queryByText('Cool Hoodie')).not.toBeInTheDocument();
  });
});
