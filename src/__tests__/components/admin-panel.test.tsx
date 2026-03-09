/**
 * Admin panel page component tests
 * Tests: DashboardPage and AdminOrdersPage render their child components with correct props
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// ── Mock next/navigation ──────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
  usePathname: () => '/admin',
}));

// ── Mock next-auth/react ──────────────────────────────────────────────────────
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { email: 'admin@example.com', role: 'admin' } },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// ── Mock heavy child components ───────────────────────────────────────────────
jest.mock('@/components/admin/AdminOrdersPanel', () => ({
  AdminOrdersPanel: (props: any) => (
    <div
      data-testid="admin-orders-panel"
      data-title={props.title}
      data-description={props.description}
      data-initial-status={props.initialStatusFilter}
      data-show-header={String(props.showHeader ?? false)}
      data-enable-row-ship={String(props.enableRowShip ?? false)}
      data-enable-resend={String(props.enableRowResendShippingEmail ?? false)}
    >
      AdminOrdersPanel Mock
    </div>
  ),
}));

jest.mock('@/components/dashboard/SessionMonitoringDashboard', () => ({
  SessionMonitoringDashboard: () => (
    <div data-testid="session-monitoring-dashboard">
      SessionMonitoringDashboard Mock
    </div>
  ),
}));

// ── Import pages ──────────────────────────────────────────────────────────────
import DashboardPage from '@/app/admin/dashboard/page';
import AdminOrdersPage from '@/app/admin/orders/page';

// ── DashboardPage tests ───────────────────────────────────────────────────────
describe('DashboardPage', () => {
  it('renders SessionMonitoringDashboard', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('session-monitoring-dashboard')).toBeInTheDocument();
  });

  it('renders AdminOrdersPanel', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('admin-orders-panel')).toBeInTheDocument();
  });

  it('passes showHeader=true to AdminOrdersPanel', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('admin-orders-panel')).toHaveAttribute('data-show-header', 'true');
  });

  it('passes title "Orders Overview" to AdminOrdersPanel', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('admin-orders-panel')).toHaveAttribute('data-title', 'Orders Overview');
  });

  it('passes description to AdminOrdersPanel', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('admin-orders-panel')).toHaveAttribute(
      'data-description',
      'Review recent orders and run bulk actions.'
    );
  });
});

// ── AdminOrdersPage tests ─────────────────────────────────────────────────────
describe('AdminOrdersPage', () => {
  it('renders AdminOrdersPanel', () => {
    render(<AdminOrdersPage />);
    expect(screen.getByTestId('admin-orders-panel')).toBeInTheDocument();
  });

  it('passes initialStatusFilter="FULFILLMENT_PENDING"', () => {
    render(<AdminOrdersPage />);
    expect(screen.getByTestId('admin-orders-panel')).toHaveAttribute(
      'data-initial-status',
      'FULFILLMENT_PENDING'
    );
  });

  it('passes title "Fulfillment Queue" (via i18n key)', () => {
    render(<AdminOrdersPage />);
    // react-i18next mock returns the key as-is
    expect(screen.getByTestId('admin-orders-panel')).toHaveAttribute(
      'data-title',
      'Fulfillment Queue'
    );
  });

  it('passes enableRowShip prop', () => {
    render(<AdminOrdersPage />);
    expect(screen.getByTestId('admin-orders-panel')).toHaveAttribute(
      'data-enable-row-ship',
      'true'
    );
  });

  it('passes enableRowResendShippingEmail prop', () => {
    render(<AdminOrdersPage />);
    expect(screen.getByTestId('admin-orders-panel')).toHaveAttribute(
      'data-enable-resend',
      'true'
    );
  });

  it('does not render SessionMonitoringDashboard', () => {
    render(<AdminOrdersPage />);
    expect(screen.queryByTestId('session-monitoring-dashboard')).not.toBeInTheDocument();
  });
});
