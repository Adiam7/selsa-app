/**
 * Admin API Service tests
 * Tests: getAdminAuditLogs, getAdminOrders, getAdminOrder, adminUpdateOrderStatus,
 *        adminCancelOrder, adminRefundOrder, adminResendShippingEmail,
 *        adminBulkUpdateStatus, adminBulkCancel, adminBulkRefund
 */

// ── Mock apiClient ────────────────────────────────────────────────────────────
const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
  },
}));

// ── Imports ───────────────────────────────────────────────────────────────────
import {
  getAdminAuditLogs,
  getAdminOrders,
  getAdminOrder,
  adminUpdateOrderStatus,
  adminCancelOrder,
  adminRefundOrder,
  adminResendShippingEmail,
  adminBulkUpdateStatus,
  adminBulkCancel,
  adminBulkRefund,
} from '@/lib/api/adminOrders';

// ── Helpers ───────────────────────────────────────────────────────────────────
const sampleLog = {
  id: 1,
  order_id: 10,
  actor: 2,
  actor_email: 'admin@example.com',
  action: 'STATUS_CHANGED',
  status_from: 'PENDING',
  status_to: 'SHIPPED',
  metadata: null,
  created_at: '2024-01-01T12:00:00Z',
};

const sampleOrder = {
  id: 10,
  status: 'PAID',
  total_amount: '99.00',
  customer_email: 'customer@example.com',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ── getAdminAuditLogs ─────────────────────────────────────────────────────────
describe('getAdminAuditLogs', () => {
  it('returns formatted response from paginated data', async () => {
    mockGet.mockResolvedValue({
      data: { results: [sampleLog], count: 1, next: null, previous: null },
    });

    const result = await getAdminAuditLogs();
    expect(result.items).toEqual([sampleLog]);
    expect(result.count).toBe(1);
    expect(result.next).toBeNull();
  });

  it('handles array response (non-paginated)', async () => {
    mockGet.mockResolvedValue({ data: [sampleLog] });

    const result = await getAdminAuditLogs();
    expect(result.items).toEqual([sampleLog]);
    expect(result.count).toBe(1);
  });

  it('calls the correct endpoint', async () => {
    mockGet.mockResolvedValue({ data: { results: [], count: 0, next: null, previous: null } });

    await getAdminAuditLogs();
    expect(mockGet).toHaveBeenCalledWith(
      '/api/orders/admin-audit-logs/',
      expect.any(Object)
    );
  });

  it('maps orderId filter to order_id param', async () => {
    mockGet.mockResolvedValue({ data: [sampleLog] });

    await getAdminAuditLogs({ orderId: 42 });

    const params = mockGet.mock.calls[0][1].params;
    expect(params.order_id).toBe('42');
  });

  it('maps actorId filter to actor param', async () => {
    mockGet.mockResolvedValue({ data: [sampleLog] });

    await getAdminAuditLogs({ actorId: 7 });

    const params = mockGet.mock.calls[0][1].params;
    expect(params.actor).toBe('7');
  });

  it('maps actorEmail filter to actor_email param', async () => {
    mockGet.mockResolvedValue({ data: [sampleLog] });

    await getAdminAuditLogs({ actorEmail: 'admin@example.com' });

    const params = mockGet.mock.calls[0][1].params;
    expect(params.actor_email).toBe('admin@example.com');
  });

  it('passes page and pageSize as page and page_size', async () => {
    mockGet.mockResolvedValue({ data: [sampleLog] });

    await getAdminAuditLogs({ page: 2, pageSize: 20 });

    const params = mockGet.mock.calls[0][1].params;
    expect(params.page).toBe('2');
    expect(params.page_size).toBe('20');
  });

  it('passes action filter', async () => {
    mockGet.mockResolvedValue({ data: [sampleLog] });

    await getAdminAuditLogs({ action: 'STATUS_CHANGED' });

    const params = mockGet.mock.calls[0][1].params;
    expect(params.action).toBe('STATUS_CHANGED');
  });

  it('sends no params when no filters provided', async () => {
    mockGet.mockResolvedValue({ data: [] });

    await getAdminAuditLogs();

    const params = mockGet.mock.calls[0][1].params;
    expect(Object.keys(params)).toHaveLength(0);
  });
});

// ── getAdminOrders ────────────────────────────────────────────────────────────
describe('getAdminOrders', () => {
  it('returns formatted response', async () => {
    mockGet.mockResolvedValue({
      data: { results: [sampleOrder], count: 1, next: null, previous: null },
    });

    const result = await getAdminOrders();
    expect(result.items).toEqual([sampleOrder]);
    expect(result.count).toBe(1);
  });

  it('calls the correct endpoint', async () => {
    mockGet.mockResolvedValue({ data: { results: [], count: 0 } });

    await getAdminOrders();
    expect(mockGet).toHaveBeenCalledWith(
      '/api/orders/admin-orders/',
      expect.any(Object)
    );
  });

  it('passes status filter', async () => {
    mockGet.mockResolvedValue({ data: [sampleOrder] });

    await getAdminOrders({ status: 'FULFILLMENT_PENDING' });

    const params = mockGet.mock.calls[0][1].params;
    expect(params.status).toBe('FULFILLMENT_PENDING');
  });

  it('passes page and pageSize correctly', async () => {
    mockGet.mockResolvedValue({ data: [] });

    await getAdminOrders({ page: 3, pageSize: 10 });

    const params = mockGet.mock.calls[0][1].params;
    expect(params.page).toBe('3');
    expect(params.page_size).toBe('10');
  });

  it('passes ordering param', async () => {
    mockGet.mockResolvedValue({ data: [] });

    await getAdminOrders({ ordering: '-created_at' });

    const params = mockGet.mock.calls[0][1].params;
    expect(params.ordering).toBe('-created_at');
  });

  it('handles array response', async () => {
    mockGet.mockResolvedValue({ data: [sampleOrder] });

    const result = await getAdminOrders();
    expect(result.items).toEqual([sampleOrder]);
  });
});

// ── getAdminOrder ─────────────────────────────────────────────────────────────
describe('getAdminOrder', () => {
  it('returns a single order', async () => {
    mockGet.mockResolvedValue({ data: sampleOrder });

    const result = await getAdminOrder(10);
    expect(result).toEqual(sampleOrder);
  });

  it('calls correct endpoint with orderId', async () => {
    mockGet.mockResolvedValue({ data: sampleOrder });

    await getAdminOrder(42);
    expect(mockGet).toHaveBeenCalledWith('/api/orders/admin-orders/42/');
  });
});

// ── adminUpdateOrderStatus ────────────────────────────────────────────────────
describe('adminUpdateOrderStatus', () => {
  it('posts to the correct update-status endpoint', async () => {
    mockPost.mockResolvedValue({ data: { ...sampleOrder, status: 'SHIPPED' } });

    await adminUpdateOrderStatus(10, {
      status: 'SHIPPED',
      tracking_number: 'TRACK123',
      carrier: 'UPS',
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/api/orders/admin-orders/10/update-status/',
      expect.objectContaining({ status: 'SHIPPED', tracking_number: 'TRACK123' })
    );
  });

  it('returns the updated order', async () => {
    const updated = { ...sampleOrder, status: 'SHIPPED' };
    mockPost.mockResolvedValue({ data: updated });

    const result = await adminUpdateOrderStatus(10, { status: 'SHIPPED' });
    expect(result).toEqual(updated);
  });
});

// ── adminCancelOrder ──────────────────────────────────────────────────────────
describe('adminCancelOrder', () => {
  it('posts to the correct cancel endpoint', async () => {
    mockPost.mockResolvedValue({ data: { ...sampleOrder, status: 'CANCELLED' } });

    await adminCancelOrder(10, 'Out of stock');

    expect(mockPost).toHaveBeenCalledWith(
      '/api/orders/admin-orders/10/cancel/',
      { reason: 'Out of stock' }
    );
  });

  it('sends empty string reason when not provided', async () => {
    mockPost.mockResolvedValue({ data: sampleOrder });

    await adminCancelOrder(10);

    const payload = mockPost.mock.calls[0][1];
    expect(payload.reason).toBe('');
  });
});

// ── adminRefundOrder ──────────────────────────────────────────────────────────
describe('adminRefundOrder', () => {
  it('posts to the correct refund endpoint', async () => {
    mockPost.mockResolvedValue({ data: { ...sampleOrder, status: 'REFUNDED' } });

    await adminRefundOrder(10, 'Customer request');

    expect(mockPost).toHaveBeenCalledWith(
      '/api/orders/admin-orders/10/refund/',
      { reason: 'Customer request' }
    );
  });
});

// ── adminResendShippingEmail ──────────────────────────────────────────────────
describe('adminResendShippingEmail', () => {
  it('posts to the correct resend-shipping endpoint', async () => {
    mockPost.mockResolvedValue({ data: { success: true } });

    const result = await adminResendShippingEmail(10);

    expect(mockPost).toHaveBeenCalledWith(
      '/api/orders/admin-orders/10/resend-shipping/',
      {}
    );
    expect(result.success).toBe(true);
  });
});

// ── adminBulkUpdateStatus ─────────────────────────────────────────────────────
describe('adminBulkUpdateStatus', () => {
  it('posts to bulk-update-status endpoint with order_ids and status', async () => {
    mockPost.mockResolvedValue({
      data: { results: [{ order_id: 1, success: true }, { order_id: 2, success: true }] },
    });

    const result = await adminBulkUpdateStatus({ order_ids: [1, 2], status: 'SHIPPED' });

    expect(mockPost).toHaveBeenCalledWith(
      '/api/orders/admin-orders/bulk-update-status/',
      expect.objectContaining({ order_ids: [1, 2], status: 'SHIPPED' })
    );
    expect(result).toHaveLength(2);
  });
});

// ── adminBulkCancel ───────────────────────────────────────────────────────────
describe('adminBulkCancel', () => {
  it('posts to bulk-cancel endpoint', async () => {
    mockPost.mockResolvedValue({
      data: { results: [{ order_id: 3, success: true }] },
    });

    const result = await adminBulkCancel({ order_ids: [3], reason: 'Fraud' });

    expect(mockPost).toHaveBeenCalledWith(
      '/api/orders/admin-orders/bulk-cancel/',
      expect.objectContaining({ order_ids: [3], reason: 'Fraud' })
    );
    expect(result[0].order_id).toBe(3);
  });
});

// ── adminBulkRefund ───────────────────────────────────────────────────────────
describe('adminBulkRefund', () => {
  it('posts to bulk-refund endpoint', async () => {
    mockPost.mockResolvedValue({
      data: { results: [{ order_id: 4, success: true }] },
    });

    const result = await adminBulkRefund({ order_ids: [4] });

    expect(mockPost).toHaveBeenCalledWith(
      '/api/orders/admin-orders/bulk-refund/',
      expect.any(Object)
    );
    expect(result[0].success).toBe(true);
  });
});
