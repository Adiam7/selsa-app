/**
 * Senior-level API Service Factory
 * src/lib/api/services/index.ts
 */

import apiClient from '@/lib/api/client';
import { logger } from '@/lib/logger/logger';
import { AppError, parseError } from '@/lib/errors/AppError';

/**
 * Generic API Service Base Class
 */
export abstract class BaseApiService {
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Execute API request with timing and logging
   */
  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    options?: { skipLog?: boolean }
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = performance.now();

    try {
      const config: any = { method };
      if (data) config.data = data;

      const response = await apiClient.request<T>({ url, ...config });
      const duration = performance.now() - startTime;

      if (!options?.skipLog) {
        logger.logApiCall(method, endpoint, response.status, duration);
      }

      return response.data;
    } catch (error) {
      const duration = performance.now() - startTime;
      const appError = parseError(error);

      logger.error(
        `API ${method} ${endpoint} failed`,
        'ApiService',
        { duration, status: (error as any)?.response?.status }
      );

      throw appError;
    }
  }

  protected async get<T>(endpoint: string, options?: any): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  protected async post<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  protected async put<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  protected async patch<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  protected async delete<T>(endpoint: string, options?: any): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
}

/**
 * User Service
 */
export class UserService extends BaseApiService {
  constructor() {
    super('/users');
  }

  async getCurrentUser() {
    return this.get('/me');
  }

  async updateProfile(data: any) {
    return this.patch('/me', data);
  }

  async changePassword(data: { oldPassword: string; newPassword: string }) {
    return this.post('/change-password', data);
  }
}

/**
 * Product Service
 */
export class ProductService extends BaseApiService {
  constructor() {
    super('/products');
  }

  async getAll(params?: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`?${queryString}`);
  }

  async getById(id: string) {
    return this.get(`/${id}`);
  }

  async create(data: any) {
    return this.post('', data);
  }

  async update(id: string, data: any) {
    return this.put(`/${id}`, data);
  }

  async deleteById<T = unknown>(id: string, options?: any): Promise<T> {
    return this.delete<T>(`/${id}`, options);
  }
}

/**
 * Cart Service
 */
export class CartService extends BaseApiService {
  constructor() {
    super('/cart');
  }

  async getCart() {
    return this.get('/my');
  }

  async addItem(data: any) {
    return this.post('/items', data);
  }

  async removeItem(itemId: string) {
    return this.delete(`/items/${itemId}`);
  }

  async updateItem(itemId: string, data: any) {
    return this.patch(`/items/${itemId}`, data);
  }

  async clear() {
    return this.post('/clear');
  }
}

/**
 * Order Service
 */
export class OrderService extends BaseApiService {
  constructor() {
    super('/orders');
  }

  async getOrders() {
    return this.get('');
  }

  async getOrder(id: string) {
    return this.get(`/${id}`);
  }

  async createOrder(data: any) {
    return this.post('', data);
  }

  async updateOrder(id: string, data: any) {
    return this.patch(`/${id}`, data);
  }
}

/**
 * Factory function to create service instances
 */
export function createApiServices() {
  return {
    user: new UserService(),
    product: new ProductService(),
    cart: new CartService(),
    order: new OrderService(),
  };
}

// Export singleton instance
export const apiServices = createApiServices();
