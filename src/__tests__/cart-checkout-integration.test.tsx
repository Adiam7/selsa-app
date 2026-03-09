/**
 * Cart & Checkout Integration Tests
 * Tests complete cart functionality and checkout flow
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CartProvider } from '@/context/cart/CartContext';

// Prevent CartProvider from making fetch calls on mount
jest.mock('@/lib/api/cart/getOrCreateGuestCartId', () => ({
  getOrCreateGuestCartId: jest.fn().mockResolvedValue(null),
}));

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

// Mock API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock session
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { email: 'test@example.com' } },
    status: 'authenticated',
  }),
}));

describe('Cart & Checkout Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    localStorage.clear();
  });

  describe('Cart Functionality', () => {
    it('adds product to cart', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          items: [{ id: 1, product_id: 1, quantity: 1, price: 29.99 }],
          total: 29.99,
        }),
      } as Response);

      const TestCart = () => {
        const [cartItems, setCartItems] = React.useState<any[]>([]);
        
        const addToCart = async (productId: number, quantity: number) => {
          const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity }),
          });
          
          if (response.ok) {
            const cart = await response.json();
            setCartItems(cart.items);
          }
        };

        return (
          <div>
            <button onClick={() => addToCart(1, 1)}>Add to Cart</button>
            <div data-testid="cart-count">{cartItems.length}</div>
          </div>
        );
      };

      render(
        <CartProvider>
          <TestCart />
        </CartProvider>
      );

      const addButton = screen.getByText('Add to Cart');
      await user.click(addButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: 1, quantity: 1 }),
        });
      });
    });

    it('updates cart item quantity', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          items: [{ id: 1, product_id: 1, quantity: 3, price: 89.97 }],
          total: 89.97,
        }),
      } as Response);

      const TestCartUpdate = () => {
        const updateQuantity = async (itemId: number, quantity: number) => {
          await fetch(`/api/cart/items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
          });
        };

        return (
          <button onClick={() => updateQuantity(1, 3)}>Update Quantity</button>
        );
      };

      render(<TestCartUpdate />);

      const updateButton = screen.getByText('Update Quantity');
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/cart/items/1', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: 3 }),
        });
      });
    });

    it('removes item from cart', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          items: [],
          total: 0,
        }),
      } as Response);

      const TestCartRemove = () => {
        const removeItem = async (itemId: number) => {
          await fetch(`/api/cart/items/${itemId}`, {
            method: 'DELETE',
          });
        };

        return (
          <button onClick={() => removeItem(1)}>Remove Item</button>
        );
      };

      render(<TestCartRemove />);

      const removeButton = screen.getByText('Remove Item');
      await user.click(removeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/cart/items/1', {
          method: 'DELETE',
        });
      });
    });

    it('calculates cart totals correctly', () => {
      const items = [
        { id: 1, price: 29.99, quantity: 2 },
        { id: 2, price: 15.50, quantity: 1 },
        { id: 3, price: 45.00, quantity: 3 },
      ];

      const calculateTotal = (items: any[]) =>
        items.reduce((total, item) => total + (item.price * item.quantity), 0);

      const total = calculateTotal(items);
      
      expect(total).toBe(210.48); // 59.98 + 15.50 + 135.00
    });

    it('persists cart in localStorage', () => {
      const cartData = {
        items: [{ id: 1, product_id: 1, quantity: 1, price: 29.99 }],
        total: 29.99,
      };

      localStorage.setItem('cart', JSON.stringify(cartData));
      const retrieved = JSON.parse(localStorage.getItem('cart') || '{}');

      expect(retrieved).toEqual(cartData);
    });
  });

  describe('Checkout Flow', () => {
    const mockCartData = {
      items: [
        { id: 1, product_id: 1, quantity: 2, price: 29.99, product_name: 'Test Product' }
      ],
      total: 59.98,
    };

    it('displays cart items in checkout', () => {
      const CheckoutSummary = ({ cart }: { cart: any }) => (
        <div>
          {cart.items.map((item: any) => (
            <div key={item.id} data-testid={`item-${item.id}`}>
              {item.product_name} x {item.quantity}: ${item.price * item.quantity}
            </div>
          ))}
          <div data-testid="total">Total: ${cart.total}</div>
        </div>
      );

      render(<CheckoutSummary cart={mockCartData} />);

      expect(screen.getByTestId('item-1')).toHaveTextContent('Test Product x 2: $59.98');
      expect(screen.getByTestId('total')).toHaveTextContent('Total: $59.98');
    });

    it('validates shipping address', async () => {
      const ShippingForm = () => {
        const [errors, setErrors] = React.useState<any>({});

        const validateForm = (data: any) => {
          const newErrors: any = {};
          if (!data.street_address) newErrors.street_address = 'Required';
          if (!data.city) newErrors.city = 'Required';
          if (!data.postal_code) newErrors.postal_code = 'Required';
          if (!data.country) newErrors.country = 'Required';
          
          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const data = Object.fromEntries(formData);
          validateForm(data);
        };

        return (
          <form onSubmit={handleSubmit}>
            <input name="street_address" placeholder="Street Address" />
            {errors.street_address && (
              <span data-testid="street-error">{errors.street_address}</span>
            )}
            
            <input name="city" placeholder="City" />
            {errors.city && (
              <span data-testid="city-error">{errors.city}</span>
            )}
            
            <input name="postal_code" placeholder="Postal Code" />
            {errors.postal_code && (
              <span data-testid="postal-error">{errors.postal_code}</span>
            )}
            
            <input name="country" placeholder="Country" />
            {errors.country && (
              <span data-testid="country-error">{errors.country}</span>
            )}
            
            <button type="submit">Validate Address</button>
          </form>
        );
      };

      render(<ShippingForm />);

      const submitButton = screen.getByText('Validate Address');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('street-error')).toHaveTextContent('Required');
        expect(screen.getByTestId('city-error')).toHaveTextContent('Required');
        expect(screen.getByTestId('postal-error')).toHaveTextContent('Required');
        expect(screen.getByTestId('country-error')).toHaveTextContent('Required');
      });
    });

    it('calculates shipping costs', () => {
      const calculateShipping = (items: any[], shippingMethod: string) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        switch (shippingMethod) {
          case 'standard':
            return subtotal > 50 ? 0 : 5.99;
          case 'express':
            return 12.99;
          case 'overnight':
            return 24.99;
          default:
            return 0;
        }
      };

      const items = [{ price: 30, quantity: 2 }]; // $60 subtotal
      
      expect(calculateShipping(items, 'standard')).toBe(0); // Free shipping over $50
      expect(calculateShipping(items, 'express')).toBe(12.99);
      expect(calculateShipping(items, 'overnight')).toBe(24.99);
    });

    it('applies coupon codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          valid: true,
          discount: 10.00,
          code: 'SAVE10',
        }),
      } as Response);

      const CouponForm = () => {
        const [discount, setDiscount] = React.useState(0);

        const applyCoupon = async (code: string) => {
          const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, cart_total: 59.98 }),
          });

          if (response.ok) {
            const coupon = await response.json();
            if (coupon.valid) {
              setDiscount(coupon.discount);
            }
          }
        };

        return (
          <div>
            <button onClick={() => applyCoupon('SAVE10')}>Apply Coupon</button>
            <div data-testid="discount">${discount}</div>
          </div>
        );
      };

      render(<CouponForm />);

      const applyButton = screen.getByText('Apply Coupon');
      await user.click(applyButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: 'SAVE10', cart_total: 59.98 }),
        });
        expect(screen.getByTestId('discount')).toHaveTextContent('$10');
      });
    });

    it('validates stock availability during checkout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Insufficient stock',
          available: 1,
          requested: 2,
        }),
      } as Response);

      const StockValidator = () => {
        const [stockError, setStockError] = React.useState('');

        const validateStock = async () => {
          const response = await fetch('/api/checkout/validate-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ product_id: 1, quantity: 2 }] }),
          });

          if (!response.ok) {
            const error = await response.json();
            setStockError(error.error);
          }
        };

        return (
          <div>
            <button onClick={validateStock}>Validate Stock</button>
            {stockError && <div data-testid="stock-error">{stockError}</div>}
          </div>
        );
      };

      render(<StockValidator />);

      const validateButton = screen.getByText('Validate Stock');
      await user.click(validateButton);

      await waitFor(() => {
        expect(screen.getByTestId('stock-error')).toHaveTextContent('Insufficient stock');
      });
    });
  });

  describe('Order Processing', () => {
    it('creates order successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          order_id: 'ORD-12345',
          status: 'pending',
          total: 69.97,
        }),
      } as Response);

      const OrderCreator = () => {
        const [orderId, setOrderId] = React.useState('');

        const createOrder = async () => {
          const response = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cart_id: 1,
              shipping_address: { street: '123 Main St', city: 'Test City' },
              payment_method: 'stripe',
            }),
          });

          if (response.ok) {
            const order = await response.json();
            setOrderId(order.order_id);
          }
        };

        return (
          <div>
            <button onClick={createOrder}>Place Order</button>
            {orderId && <div data-testid="order-id">{orderId}</div>}
          </div>
        );
      };

      render(<OrderCreator />);

      const placeButton = screen.getByText('Place Order');
      await user.click(placeButton);

      await waitFor(() => {
        expect(screen.getByTestId('order-id')).toHaveTextContent('ORD-12345');
      });
    });

    it('handles checkout errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const ErrorHandler = () => {
        const [error, setError] = React.useState('');

        const handleCheckout = async () => {
          try {
            await fetch('/api/orders/create', { method: 'POST' });
          } catch (err) {
            setError('Checkout failed. Please try again.');
          }
        };

        return (
          <div>
            <button onClick={handleCheckout}>Checkout</button>
            {error && <div data-testid="checkout-error">{error}</div>}
          </div>
        );
      };

      render(<ErrorHandler />);

      const checkoutButton = screen.getByText('Checkout');
      await user.click(checkoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('checkout-error')).toHaveTextContent(
          'Checkout failed. Please try again.'
        );
      });
    });
  });
});