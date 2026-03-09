/**
 * Unit Tests for React Hooks
 * Tests custom React hooks in isolation using React Testing Library
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCart } from '@/features/cart/hooks/useCart';

// Mock health check to avoid extra fetch calls
jest.mock('@/lib/api/health-check', () => ({
  logBackendStatus: jest.fn().mockResolvedValue(undefined),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useCart Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.cart).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refreshCart).toBe('function');
    });
  });

  describe('Guest Cart Creation', () => {
    it('should create new guest cart when localStorage is empty', async () => {
      // Mock localStorage empty
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // Mock cart creation response
      const mockCartData = { id: 'new_cart_123', items: [], total: 0 };
      const mockCreateResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCartData)
      };
      
      // Mock cart fetch response
      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCartData)
      };
      
      mockFetch
        .mockResolvedValueOnce(mockCreateResponse) // Cart creation
        .mockResolvedValueOnce(mockFetchResponse); // Cart fetch

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('guest_cart_id', 'new_cart_123');
      expect(result.current.cart).toEqual(mockCartData);
      expect(result.current.error).toBeNull();
    });

    it('should use existing valid guest cart ID', async () => {
      // Mock existing cart ID in localStorage
      const existingCartId = 'existing_cart_456';
      mockLocalStorage.getItem.mockReturnValue(existingCartId);
      
      // Mock validation response (cart exists and is valid)
      const mockValidationResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: existingCartId, items: [], total: 0 })
      };
      
      mockFetch.mockResolvedValue(mockValidationResponse);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/guest-cart/?cart_id=${existingCartId}`,
        expect.objectContaining({ credentials: 'include' })
      );
      expect(result.current.cart).toBeTruthy();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle cart creation failure', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // Mock failed cart creation
      const mockFailedResponse = {
        ok: false,
        text: jest.fn().mockResolvedValue('Server error')
      };
      
      mockFetch.mockResolvedValue(mockFailedResponse);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.cart).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('should handle network errors gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.cart).toBeNull();
      // Network errors in getOrCreateGuestCartId are caught internally; hook surfaces 'No guest cart id'
      expect(result.current.error).toBeTruthy();
    });

    it('should handle invalid cart ID in localStorage', async () => {
      const invalidCartId = 'invalid_cart_789';
      mockLocalStorage.getItem.mockReturnValue(invalidCartId);
      
      // Mock validation failure
      const mockValidationResponse = {
        ok: false,
        status: 404
      };
      
      // Mock new cart creation after invalid cart
      const newCartData = { id: 'new_cart_after_invalid', items: [], total: 0 };
      const mockCreateResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(newCartData)
      };
      
      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(newCartData)
      };
      
      mockFetch
        .mockResolvedValueOnce(mockValidationResponse) // Failed validation
        .mockResolvedValueOnce(mockCreateResponse) // Create new cart
        .mockResolvedValueOnce(mockFetchResponse); // Fetch new cart

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('guest_cart_id');
      expect(result.current.cart).toEqual(newCartData);
    });
  });

  describe('Cart Refresh', () => {
    it('should refresh cart when refreshCart is called', async () => {
      const cartData = { id: 'cart_123', items: [], total: 0 };
      mockLocalStorage.getItem.mockReturnValue('cart_123');
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(cartData)
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCart());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear previous calls
      mockFetch.mockClear();

      // Call refresh
      act(() => {
        result.current.refreshCart();
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('State Updates', () => {
    it('should update loading state correctly during fetch', async () => {
      mockLocalStorage.getItem.mockReturnValue('cart_123');
      
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValue(mockPromise);

      const { result } = renderHook(() => useCart());

      // Should be loading initially
      expect(result.current.loading).toBe(true);
      expect(result.current.cart).toBeNull();

      // Resolve the promise
      act(() => {
        resolvePromise({
          ok: true,
          json: () => Promise.resolve({ id: 'cart_123', items: [], total: 0 })
        });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.cart).toBeTruthy();
    });

    it('should clear error state on successful fetch', async () => {
      jest.useFakeTimers();
      mockLocalStorage.getItem.mockReturnValue(null); // empty localStorage → goes straight to create
      
      // 3 attempts (initial + 2 retries): each attempt calls getOrCreateGuestCartId (1 create fetch) 
      // then no validate since getItem returns null
      mockFetch
        .mockRejectedValue(new Error('Network error')); // all create attempts fail

      const { result } = renderHook(() => useCart());

      // Advance timers for retry delays (300ms + 600ms)
      await act(async () => { jest.runAllTimers(); });
      await act(async () => { jest.runAllTimers(); });
      await act(async () => { jest.runAllTimers(); });

      jest.useRealTimers();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();

      // Refresh: create succeeds, then fetch cart succeeds
      const cartData = { id: 'new_cart_123', items: [], total: 0 };
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(cartData) }) // create
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(cartData) }); // fetch cart

      await act(async () => {
        result.current.refreshCart();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Memory Leaks and Cleanup', () => {
    it('should not update state after component unmount', async () => {
      mockLocalStorage.getItem.mockReturnValue('cart_123');
      
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValue(mockPromise);

      const { result, unmount } = renderHook(() => useCart());

      // Unmount before promise resolves
      unmount();

      // Resolve promise after unmount
      act(() => {
        resolvePromise({
          ok: true,
          json: () => Promise.resolve({ id: 'cart_123', items: [], total: 0 })
        });
      });

      // This should not cause any issues or warnings
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });
});