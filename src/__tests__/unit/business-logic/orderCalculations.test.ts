/**
 * Unit Tests for Order Business Logic Functions
 * Tests order calculation, validation, and transformation functions
 */

import { Order, OrderItem, OrderStatus } from '@/types/orders';
import { CartItem } from '@/types/cart';

// ───────────────────────────────────────────────
// Pure business logic helpers (extracted for testing)
// ───────────────────────────────────────────────

/** Calculate total from cart items */
function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const price = item.product_price || 0;
    return sum + price * item.quantity;
  }, 0);
}

/** Format price to display currency string */
function formatPrice(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/** Check if order status allows cancellation */
function canCancelOrder(status: OrderStatus): boolean {
  const cancellableStatuses: OrderStatus[] = ['pending'];
  return cancellableStatuses.includes(status);
}

/** Check if order is refundable */
function canRefundOrder(status: OrderStatus): boolean {
  const refundableStatuses: OrderStatus[] = ['completed'];
  return refundableStatuses.includes(status);
}

/** Get order status display label */
function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    completed: 'Completed',
    canceled: 'Canceled',
    refunded: 'Refunded',
  };
  return labels[status] || 'Unknown';
}

/** Compute order total from items */
function computeOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    return sum + (Number(item.price) * item.quantity);
  }, 0);
}

/** Find the open cart from a list of carts */
function findOpenCart(carts: any[]) {
  if (!Array.isArray(carts)) return null;
  return carts.find(c => c.status === 'open') || null;
}

// ───────────────────────────────────────────────
// Tests
// ───────────────────────────────────────────────

describe('Cart Total Calculation', () => {
  it('should calculate total for single item', () => {
    const items: CartItem[] = [
      {
        id: 1,
        product_price: 29.99,
        quantity: 2,
        product_variant: {} as any,
        total_price: 59.98,
      }
    ];

    const total = calculateCartTotal(items);

    expect(total).toBeCloseTo(59.98, 2);
  });

  it('should calculate total for multiple items', () => {
    const items: CartItem[] = [
      { id: 1, product_price: 10.00, quantity: 3, product_variant: {} as any, total_price: 30 },
      { id: 2, product_price: 25.50, quantity: 2, product_variant: {} as any, total_price: 51 },
      { id: 3, product_price: 5.99,  quantity: 1, product_variant: {} as any, total_price: 5.99 },
    ];

    const total = calculateCartTotal(items);

    expect(total).toBeCloseTo(86.99, 2);
  });

  it('should return 0 for empty cart', () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it('should handle items with zero price', () => {
    const items: CartItem[] = [
      { id: 1, product_price: 0, quantity: 5, product_variant: {} as any, total_price: 0 },
    ];

    expect(calculateCartTotal(items)).toBe(0);
  });

  it('should handle items with zero quantity', () => {
    const items: CartItem[] = [
      { id: 1, product_price: 29.99, quantity: 0, product_variant: {} as any, total_price: 0 },
    ];

    expect(calculateCartTotal(items)).toBe(0);
  });

  it('should handle null/undefined product_price', () => {
    const items: CartItem[] = [
      { id: 1, product_price: undefined as any, quantity: 2, product_variant: {} as any, total_price: 0 },
    ];

    expect(calculateCartTotal(items)).toBe(0);
  });

  it('should handle floating point precision', () => {
    const items: CartItem[] = [
      { id: 1, product_price: 0.1, quantity: 3, product_variant: {} as any, total_price: 0.3 },
    ];

    const total = calculateCartTotal(items);
    expect(total).toBeCloseTo(0.3, 10);
  });
});

describe('Price Formatting', () => {
  it('should format USD amount correctly', () => {
    expect(formatPrice(29.99)).toBe('$29.99');
    expect(formatPrice(100)).toBe('$100.00');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('should format large amounts correctly', () => {
    expect(formatPrice(1234.56)).toBe('$1,234.56');
    expect(formatPrice(1000000)).toBe('$1,000,000.00');
  });

  it('should handle zero correctly', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('should format EUR amounts correctly', () => {
    const result = formatPrice(29.99, 'EUR', 'de-DE');
    expect(result).toContain('29');
    expect(result).toContain('99');
  });

  it('should handle decimal precision', () => {
    expect(formatPrice(9.999)).toBe('$10.00'); // rounds up
    expect(formatPrice(9.994)).toBe('$9.99');  // rounds down
  });
});

describe('Order Status Logic', () => {
  describe('canCancelOrder', () => {
    it('should allow cancellation for pending orders', () => {
      expect(canCancelOrder('pending')).toBe(true);
    });

    it('should not allow cancellation for completed orders', () => {
      expect(canCancelOrder('completed')).toBe(false);
    });

    it('should not allow cancellation for already canceled orders', () => {
      expect(canCancelOrder('canceled')).toBe(false);
    });

    it('should not allow cancellation for refunded orders', () => {
      expect(canCancelOrder('refunded')).toBe(false);
    });
  });

  describe('canRefundOrder', () => {
    it('should allow refund for completed orders', () => {
      expect(canRefundOrder('completed')).toBe(true);
    });

    it('should not allow refund for pending orders', () => {
      expect(canRefundOrder('pending')).toBe(false);
    });

    it('should not allow refund for canceled orders', () => {
      expect(canRefundOrder('canceled')).toBe(false);
    });

    it('should not allow refund for already refunded orders', () => {
      expect(canRefundOrder('refunded')).toBe(false);
    });
  });

  describe('getOrderStatusLabel', () => {
    it('should return correct labels for all statuses', () => {
      expect(getOrderStatusLabel('pending')).toBe('Pending');
      expect(getOrderStatusLabel('completed')).toBe('Completed');
      expect(getOrderStatusLabel('canceled')).toBe('Canceled');
      expect(getOrderStatusLabel('refunded')).toBe('Refunded');
    });

    it('should handle unknown status gracefully', () => {
      const result = getOrderStatusLabel('unknown_status' as OrderStatus);
      expect(result).toBe('Unknown');
    });
  });
});

describe('Order Total Computation', () => {
  const mockOrderItems: OrderItem[] = [
    {
      id: 1,
      product_variant: { id: 1, product: { name: 'Product A' } } as any,
      quantity: 2,
      price: '15.99',
      total_price: '31.98',
    },
    {
      id: 2,
      product_variant: { id: 2, product: { name: 'Product B' } } as any,
      quantity: 1,
      price: '49.99',
      total_price: '49.99',
    }
  ];

  it('should compute total from order items', () => {
    const total = computeOrderTotal(mockOrderItems);
    expect(total).toBeCloseTo(81.97, 2); // 31.98 + 49.99
  });

  it('should return 0 for empty items array', () => {
    expect(computeOrderTotal([])).toBe(0);
  });

  it('should handle single item', () => {
    const total = computeOrderTotal([mockOrderItems[0]]);
    expect(total).toBeCloseTo(31.98, 2);
  });

  it('should handle items with zero quantity', () => {
    const zeroQtyItem: OrderItem = {
      ...mockOrderItems[0],
      quantity: 0,
      price: '15.99',
      total_price: '0'
    };

    expect(computeOrderTotal([zeroQtyItem])).toBe(0);
  });
});

describe('Cart Open Status Detection', () => {
  it('should find the open cart from a list', () => {
    const carts = [
      { id: 1, status: 'expired', items: [] },
      { id: 2, status: 'open',    items: [{ id: 'item1' }] },
      { id: 3, status: 'checked_out', items: [] },
    ];

    const openCart = findOpenCart(carts);

    expect(openCart).toBeDefined();
    expect(openCart?.id).toBe(2);
    expect(openCart?.status).toBe('open');
  });

  it('should return null when no open cart exists', () => {
    const carts = [
      { id: 1, status: 'expired', items: [] },
      { id: 2, status: 'checked_out', items: [] },
    ];

    expect(findOpenCart(carts)).toBeNull();
  });

  it('should return null for empty array', () => {
    expect(findOpenCart([])).toBeNull();
  });

  it('should return null for non-array input', () => {
    expect(findOpenCart(null as any)).toBeNull();
    expect(findOpenCart(undefined as any)).toBeNull();
    expect(findOpenCart({} as any)).toBeNull();
  });

  it('should work when input is a single cart object (not array)', () => {
    const singleCart = { id: 1, status: 'open', items: [] };
    // findOpenCart expects an array; non-array returns null
    expect(findOpenCart(singleCart as any)).toBeNull();
  });
});