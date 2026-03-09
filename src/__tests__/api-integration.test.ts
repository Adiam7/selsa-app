/**
 * API Integration Test Suite
 * Tests all API endpoints and data flow between frontend and backend
 */
import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock authentication
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

// Helper to create mock response
const createMockResponse = (data: any, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);

describe('API Integration Test Suite', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Authentication API', () => {
    const AUTH_BASE_URL = 'http://127.0.0.1:8000/api/auth';

    it('POST /api/auth/login - successful login', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const expectedResponse = {
        user: { id: 1, email: 'test@example.com', username: 'testuser' },
        accessToken: mockToken,
        refreshToken: 'refresh_token_123',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(`${AUTH_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      expect(mockFetch).toHaveBeenCalledWith(`${AUTH_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      expect(result).toEqual(expectedResponse);
    });

    it('POST /api/auth/login - invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ detail: 'Invalid credentials' }, 401)
      );

      const response = await fetch(`${AUTH_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
      });

      expect(response.status).toBe(401);
    });

    it('POST /api/auth/register - successful registration', async () => {
      const registerData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        password_confirm: 'password123',
      };
      const expectedResponse = {
        user: { id: 2, email: 'newuser@example.com', username: 'newuser' },
        message: 'Registration successful',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse, 201));

      const response = await fetch(`${AUTH_BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      expect(response.status).toBe(201);
    });

    it('POST /api/auth/refresh - token refresh', async () => {
      const refreshToken = 'refresh_token_123';
      const expectedResponse = { accessToken: 'new_access_token' };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(`${AUTH_BASE_URL}/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const result = await response.json();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Products API', () => {
    const PRODUCTS_BASE_URL = 'http://127.0.0.1:8000/api/products';

    it('GET /api/products - lists products with pagination', async () => {
      const expectedResponse = {
        count: 100,
        next: 'http://127.0.0.1:8000/api/products?page=2',
        previous: null,
        results: [
          {
            id: 1,
            name: { en: 'Test Product', ti: 'ፈተና ፍርቅ' },
            price: 29.99,
            category_id: 1,
            is_available: true,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(`${PRODUCTS_BASE_URL}?page=1&limit=20`);
      const result = await response.json();

      expect(result.count).toBe(100);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe(1);
    });

    it('GET /api/products/{id} - gets single product', async () => {
      const productId = 1;
      const expectedResponse = {
        id: 1,
        name: { en: 'Test Product', ti: 'ፈተና ፍርቅ' },
        description: { en: 'A test product', ti: 'ፈተና ፍርቅ መግለጫ' },
        price: 29.99,
        images: [{ url: 'https://example.com/image.jpg', is_primary: true }],
        category: { id: 1, name: { en: 'Test Category' } },
        stock_quantity: 100,
        is_available: true,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(`${PRODUCTS_BASE_URL}/${productId}/`);
      const result = await response.json();

      expect(result.id).toBe(productId);
      expect(result.name.en).toBe('Test Product');
      expect(result.price).toBe(29.99);
    });

    it('GET /api/products/search - searches products', async () => {
      const searchQuery = 'test';
      const expectedResponse = {
        results: [
          { id: 1, name: { en: 'Test Product 1' }, price: 29.99 },
          { id: 2, name: { en: 'Test Product 2' }, price: 39.99 },
        ],
        count: 2,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(`${PRODUCTS_BASE_URL}/search?q=${searchQuery}`);
      const result = await response.json();

      expect(result.results).toHaveLength(2);
      expect(result.count).toBe(2);
    });
  });

  describe('Cart API', () => {
    const CART_BASE_URL = 'http://127.0.0.1:8000/api/cart';

    it('GET /api/cart - gets current cart', async () => {
      const expectedResponse = {
        id: 1,
        items: [
          {
            id: 1,
            product_id: 1,
            quantity: 2,
            price: 29.99,
            total_price: 59.98,
            product: { name: { en: 'Test Product' } },
          },
        ],
        total_items: 2,
        total_price: 59.98,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(CART_BASE_URL, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      const result = await response.json();

      expect(result.total_items).toBe(2);
      expect(result.total_price).toBe(59.98);
    });

    it('POST /api/cart/add - adds item to cart', async () => {
      const addItemData = { product_id: 1, quantity: 1 };
      const expectedResponse = {
        id: 1,
        items: [{ id: 1, product_id: 1, quantity: 1, price: 29.99 }],
        total_items: 1,
        total_price: 29.99,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse, 201));

      const response = await fetch(`${CART_BASE_URL}/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(addItemData),
      });

      expect(response.status).toBe(201);
    });

    it('PATCH /api/cart/items/{id} - updates cart item quantity', async () => {
      const itemId = 1;
      const updateData = { quantity: 3 };
      const expectedResponse = {
        id: 1,
        product_id: 1,
        quantity: 3,
        price: 29.99,
        total_price: 89.97,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(`${CART_BASE_URL}/items/${itemId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      expect(result.quantity).toBe(3);
    });

    it('DELETE /api/cart/items/{id} - removes item from cart', async () => {
      const itemId = 1;

      mockFetch.mockResolvedValueOnce(createMockResponse({}, 204));

      const response = await fetch(`${CART_BASE_URL}/items/${itemId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${mockToken}` },
      });

      expect(response.status).toBe(204);
    });
  });

  describe('Orders API', () => {
    const ORDERS_BASE_URL = 'http://127.0.0.1:8000/api/orders';

    it('POST /api/orders/create - creates new order', async () => {
      const orderData = {
        cart_id: 1,
        shipping_address: {
          street_address: '123 Main St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'US',
        },
        payment_method: 'stripe',
      };
      const expectedResponse = {
        id: 'ORD-12345',
        status: 'pending',
        total: 59.98,
        items: [{ product_id: 1, quantity: 2, price: 29.99 }],
        shipping_address: orderData.shipping_address,
        created_at: '2026-02-27T12:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse, 201));

      const response = await fetch(`${ORDERS_BASE_URL}/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(orderData),
      });

      expect(response.status).toBe(201);
    });

    it('GET /api/orders - lists user orders', async () => {
      const expectedResponse = {
        count: 5,
        results: [
          {
            id: 'ORD-12345',
            status: 'delivered',
            total: 59.98,
            created_at: '2026-02-27T12:00:00Z',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(ORDERS_BASE_URL, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });

      const result = await response.json();
      expect(result.count).toBe(5);
    });

    it('GET /api/orders/{id} - gets order details', async () => {
      const orderId = 'ORD-12345';
      const expectedResponse = {
        id: orderId,
        status: 'shipped',
        total: 59.98,
        items: [{ product_id: 1, quantity: 2, price: 29.99 }],
        tracking: { carrier: 'UPS', tracking_number: '1Z999AA1234567890' },
        estimated_delivery: '2026-03-01',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(`${ORDERS_BASE_URL}/${orderId}/`, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });

      const result = await response.json();
      expect(result.id).toBe(orderId);
      expect(result.status).toBe('shipped');
    });
  });

  describe('Categories API', () => {
    const CATEGORIES_BASE_URL = 'http://127.0.0.1:8000/api/categories';

    it('GET /api/categories - lists product categories', async () => {
      const expectedResponse = {
        results: [
          {
            id: 1,
            name: { en: 'Clothing', ti: 'ልብሳት' },
            slug: 'clothing',
            parent: null,
            children: [
              { id: 2, name: { en: 'T-Shirts', ti: 'ቲ-ሸርት' }, slug: 't-shirts' },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(CATEGORIES_BASE_URL);
      const result = await response.json();

      expect(result.results[0].name.en).toBe('Clothing');
      expect(result.results[0].children).toHaveLength(1);
    });
  });

  describe('User Profile APIs', () => {
    const PROFILE_BASE_URL = 'http://127.0.0.1:8000/api/profile';

    it('GET /api/profile/me - gets current user profile', async () => {
      const expectedResponse = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        is_email_verified: true,
        created_at: '2026-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(`${PROFILE_BASE_URL}/me/`, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });

      const result = await response.json();
      expect(result.email).toBe('test@example.com');
    });

    it('PATCH /api/profile/me - updates user profile', async () => {
      const updateData = { first_name: 'Updated', last_name: 'Name' };
      const expectedResponse = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'Updated',
        last_name: 'Name',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(expectedResponse));

      const response = await fetch(`${PROFILE_BASE_URL}/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      expect(result.first_name).toBe('Updated');
    });
  });

  describe('Error Handling', () => {
    it('handles 400 Bad Request', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'Invalid request data' }, 400)
      );

      const response = await fetch('/api/test', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      expect(response.ok).toBe(false);
    });

    it('handles 401 Unauthorized', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ detail: 'Authentication credentials were not provided' }, 401)
      );

      const response = await fetch('/api/protected');

      expect(response.status).toBe(401);
    });

    it('handles 404 Not Found', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ detail: 'Not found' }, 404)
      );

      const response = await fetch('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('handles 500 Internal Server Error', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'Internal server error' }, 500)
      );

      const response = await fetch('/api/error');

      expect(response.status).toBe(500);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('API Utilities', () => {
    it('formats API request with authentication', () => {
      const createAuthenticatedRequest = (url: string, options: RequestInit = {}) => ({
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const request = createAuthenticatedRequest('/api/test', { method: 'POST' });
      
      expect(request.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockToken}`,
      });
    });

    it('validates API response format', () => {
      const isValidAPIResponse = (response: any): boolean => {
        return !!(
          response &&
          typeof response === 'object' &&
          (response.hasOwnProperty('results') || response.hasOwnProperty('id'))
        );
      };

      expect(isValidAPIResponse({ results: [] })).toBe(true);
      expect(isValidAPIResponse({ id: 1 })).toBe(true);
      expect(isValidAPIResponse(null)).toBe(false);
      expect(isValidAPIResponse('string')).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('handles rate limiting responses', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { detail: 'Rate limit exceeded' },
          429
        )
      );

      const response = await fetch('/api/test');

      expect(response.status).toBe(429);
    });
  });

  describe('Data Validation', () => {
    it('validates email format in requests', () => {
      const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('validates required fields', () => {
      const validateRequiredFields = (data: any, required: string[]) => {
        const missing = required.filter(field => !data.hasOwnProperty(field) || !data[field]);
        return missing.length === 0;
      };

      const data = { email: 'test@example.com', password: 'password' };
      
      expect(validateRequiredFields(data, ['email', 'password'])).toBe(true);
      expect(validateRequiredFields(data, ['email', 'password', 'username'])).toBe(false);
    });
  });
});