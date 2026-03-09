/**
 * Cart API Service tests
 * Tests: updateCartItem, removeCartItem, addToCart
 */

// ── Mock axios (used by addToCart) ────────────────────────────────────────────
const mockAxiosPost = jest.fn();
const mockAxiosGet = jest.fn();
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: (...args: any[]) => mockAxiosPost(...args),
    get: (...args: any[]) => mockAxiosGet(...args),
    create: jest.fn().mockReturnThis(),
  },
  create: jest.fn().mockReturnThis(),
  post: (...args: any[]) => mockAxiosPost(...args),
  get: (...args: any[]) => mockAxiosGet(...args),
}));

// ── Mock apiClient (cart.ts now imports from @/lib/api/client) ───────────────
jest.mock('@/lib/api/client', () => ({
  __esModule: true,
  apiClient: {
    post: (...args: any[]) => mockAxiosPost(...args),
    get: (...args: any[]) => mockAxiosGet(...args),
  },
  API_BASE_URL: 'http://localhost:8000/api',
}));

// ── Mock logger (used by addToCart) ──────────────────────────────────────────
jest.mock('@/lib/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// ── Imports ───────────────────────────────────────────────────────────────────
import { updateCartItem } from '@/lib/api/cart/updateCartItem';
import { removeCartItem } from '@/lib/api/cart/removeCartItem';
import { addToCart } from '@/lib/api/cart';

// ── Helpers ───────────────────────────────────────────────────────────────────
function mockFetchOk(body: unknown) {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(''),
  };
}

function mockFetchFail(status: number, text = 'Bad Request') {
  return {
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(text),
  };
}

const sampleCart = {
  id: 'cart-abc',
  status: 'open',
  items: [{ id: 1, product_name: 'Tee', quantity: 2, product_price: 25 }],
};

// ── updateCartItem tests ──────────────────────────────────────────────────────
describe('updateCartItem', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(jest.fn());
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('returns Cart on successful PATCH', async () => {
    fetchSpy.mockResolvedValue(mockFetchOk(sampleCart));

    const result = await updateCartItem({ cartId: 'cart-abc', itemId: 1, quantity: 3 });
    expect(result).toEqual(sampleCart);
  });

  it('sends PATCH request to the correct endpoint', async () => {
    fetchSpy.mockResolvedValue(mockFetchOk(sampleCart));

    await updateCartItem({ cartId: 'cart-abc', itemId: 1, quantity: 3 });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toContain('/guest-cart-update-item/');
    expect(options.method).toBe('PATCH');
  });

  it('sends cart_id, item_id, and quantity in request body', async () => {
    fetchSpy.mockResolvedValue(mockFetchOk(sampleCart));

    await updateCartItem({ cartId: 'cart-abc', itemId: 7, quantity: 5 });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.cart_id).toBe('cart-abc');
    expect(body.item_id).toBe(7);
    expect(body.quantity).toBe(5);
  });

  it('throws Error when response is not ok', async () => {
    fetchSpy.mockResolvedValue(mockFetchFail(400, 'Invalid quantity'));

    await expect(
      updateCartItem({ cartId: 'cart-abc', itemId: 1, quantity: 0 })
    ).rejects.toThrow(/Update cart item failed: 400/);
  });

  it('includes credentials in the request', async () => {
    fetchSpy.mockResolvedValue(mockFetchOk(sampleCart));

    await updateCartItem({ cartId: 'cart-abc', itemId: 1, quantity: 2 });

    const [, options] = fetchSpy.mock.calls[0];
    expect(options.credentials).toBe('include');
  });
});

// ── removeCartItem tests ──────────────────────────────────────────────────────
describe('removeCartItem', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(jest.fn());
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('returns Cart on successful DELETE', async () => {
    const emptyCart = { ...sampleCart, items: [] };
    fetchSpy.mockResolvedValue(mockFetchOk(emptyCart));

    const result = await removeCartItem({ cartId: 'cart-abc', itemId: 1 });
    expect(result).toEqual(emptyCart);
  });

  it('sends DELETE request to the correct endpoint', async () => {
    fetchSpy.mockResolvedValue(mockFetchOk({ ...sampleCart, items: [] }));

    await removeCartItem({ cartId: 'cart-abc', itemId: 1 });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toContain('/guest-cart-remove-item/');
    expect(options.method).toBe('DELETE');
  });

  it('sends cart_id and item_id in request body', async () => {
    fetchSpy.mockResolvedValue(mockFetchOk({ ...sampleCart, items: [] }));

    await removeCartItem({ cartId: 42, itemId: 9 });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.cart_id).toBe(42);
    expect(body.item_id).toBe(9);
  });

  it('throws Error when response is not ok', async () => {
    fetchSpy.mockResolvedValue(mockFetchFail(404, 'Item not found'));

    await expect(
      removeCartItem({ cartId: 'cart-abc', itemId: 99 })
    ).rejects.toThrow(/Remove cart item failed: 404/);
  });
});

// ── addToCart tests ───────────────────────────────────────────────────────────
describe('addToCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns Cart data on success', async () => {
    mockAxiosPost.mockResolvedValue({ data: sampleCart });

    const result = await addToCart({
      cartId: 1,
      variant: { id: 42 },
      image: '/img.jpg',
      quantity: 1,
    });

    expect(result).toEqual(sampleCart);
  });

  it('calls apiClient.post with correct endpoint', async () => {
    mockAxiosPost.mockResolvedValue({ data: sampleCart });

    await addToCart({ cartId: 1, variant: { id: 42 }, image: '/img.jpg', quantity: 2 });

    expect(mockAxiosPost).toHaveBeenCalledWith(
      expect.stringContaining('/cart-items/'),
      expect.any(Object),
    );
  });

  it('sends variant.id as "variant" in payload', async () => {
    mockAxiosPost.mockResolvedValue({ data: sampleCart });

    await addToCart({ cartId: 5, variant: { id: 99 }, image: '/img.jpg', quantity: 1 });

    const payload = mockAxiosPost.mock.calls[0][1];
    expect(payload.variant).toBe(99);
    expect(payload.cart).toBe(5);
    expect(payload.quantity).toBe(1);
  });

  it('defaults optionValues to [] when not provided', async () => {
    mockAxiosPost.mockResolvedValue({ data: sampleCart });

    await addToCart({ cartId: 1, variant: { id: 1 }, image: '/img.jpg', quantity: 1 });

    const payload = mockAxiosPost.mock.calls[0][1];
    expect(payload.option_values).toEqual([]);
  });

  it('passes provided optionValues in payload', async () => {
    mockAxiosPost.mockResolvedValue({ data: sampleCart });

    await addToCart({
      cartId: 1,
      variant: { id: 1 },
      image: '/img.jpg',
      quantity: 1,
      optionValues: [10, 20],
    });

    const payload = mockAxiosPost.mock.calls[0][1];
    expect(payload.option_values).toEqual([10, 20]);
  });

  it('includes image_url in payload', async () => {
    mockAxiosPost.mockResolvedValue({ data: sampleCart });

    await addToCart({ cartId: 1, variant: { id: 1 }, image: '/test.jpg', quantity: 1 });

    const payload = mockAxiosPost.mock.calls[0][1];
    expect(payload.image_url).toBe('/test.jpg');
  });

  it('throws when axios.post fails', async () => {
    const mockError = Object.assign(new Error('Network Error'), {
      response: { status: 400, data: { detail: 'Bad variant' } },
    });
    mockAxiosPost.mockRejectedValue(mockError);

    await expect(
      addToCart({ cartId: 1, variant: { id: 1 }, image: '/img.jpg', quantity: 1 })
    ).rejects.toThrow('Network Error');
  });
});
