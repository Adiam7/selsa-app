'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShoppingCart, TrendingUp, Users, DollarSign, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/Dashboard.module.css';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

interface DashboardStat {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

interface OrderData {
  id: number;
  date: string;
  customer: string;
  status: string;
  amount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    stats: apiStats,
    orders: apiOrders,
    charts,
    isLoading: dataLoading,
  } = useDashboardData({ dateRange: 'month' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t('Loading dashboard...')}</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const fmt = (n: number) => n.toLocaleString();
  const fmtChange = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

  const stats: DashboardStat[] = apiStats
    ? [
        {
          label: t('Total Revenue'),
          value: `$${Number(apiStats.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: fmtChange(apiStats.revenue_change),
          isPositive: apiStats.revenue_change >= 0,
          icon: <DollarSign className="w-6 h-6" />,
        },
        {
          label: t('Total Orders'),
          value: fmt(apiStats.total_orders),
          change: fmtChange(apiStats.orders_change),
          isPositive: apiStats.orders_change >= 0,
          icon: <ShoppingCart className="w-6 h-6" />,
        },
        {
          label: t('Active Customers'),
          value: fmt(apiStats.active_customers),
          change: fmtChange(apiStats.customers_change),
          isPositive: apiStats.customers_change >= 0,
          icon: <Users className="w-6 h-6" />,
        },
        {
          label: t('Avg Order Value'),
          value: `$${Number(apiStats.avg_order_value).toFixed(2)}`,
          change: fmtChange(apiStats.aov_change),
          isPositive: apiStats.aov_change >= 0,
          icon: <TrendingUp className="w-6 h-6" />,
        },
      ]
    : [];

  const recentOrders: OrderData[] = apiOrders.slice(0, 5).map((order) => ({
    id: order.id,
    date: new Date(order.created_at).toLocaleDateString(),
    customer: order.customer_email || 'Guest',
    status: order.status,
    amount: Number(order.total_amount || 0),
  }));

  const ordersLoading = dataLoading;

  // Chart data from API, fallback to empty arrays
  const revenueBarHeights: number[] = charts?.revenue_trend?.length
    ? (() => {
        const vals = charts.revenue_trend.map((p) => p.value);
        const max = Math.max(...vals, 1);
        return vals.slice(-7).map((v) => Math.round((v / max) * 85) + 5);
      })()
    : [];

  const orderStatusBars: { label: string; value: number }[] = charts?.order_status_distribution?.length
    ? charts.order_status_distribution.slice(0, 3).map((d) => {
        const total = charts.order_status_distribution.reduce((s, x) => s + x.count, 0) || 1;
        return { label: d.status, value: Math.round((d.count / total) * 85) + 5 };
      })
    : [];

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'PAID':
      case 'DELIVERED':
        return styles.badgeSuccess;
      case 'PAYMENT_PENDING':
      case 'FULFILLMENT_PENDING':
      case 'BACKORDERED':
        return styles.badgeWarning;
      case 'LOST':
      case 'RETURNED_TO_SENDER':
      case 'PAYMENT_FAILED':
      case 'CANCELLED':
      case 'REFUNDED':
        return styles.badgeDanger;
      default:
        return styles.badgePending;
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('Dashboard')}</h1>
            <p className={styles.subtitle}>{t('Welcome back! Here\'s an overview of your store\'s performance.')}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statHeader}>
                <div>
                  <p className={styles.statLabel}>{stat.label}</p>
                  <p className={styles.statValue}>{stat.value}</p>
                </div>
                <div className={styles.statIcon}>{stat.icon}</div>
              </div>
              <div className={styles.statChange} data-positive={stat.isPositive}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Orders Section */}
        <div className={styles.chartsGrid}>
          {/* Revenue Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>{t('Revenue Trend')}</h3>
            <div className={styles.chartContent}>
              {dataLoading ? (
                <p className={styles.tableNotice}>{t('Loading...')}</p>
              ) : revenueBarHeights.length > 0 ? (
                revenueBarHeights.map((height, idx) => (
                  <div key={idx} className={styles.chartBar}>
                    <div className={styles.chartBarContainer}>
                      <div
                        className={styles.chartBarFill}
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <span className={styles.chartLabel}>
                      {charts?.revenue_trend?.[charts.revenue_trend.length - revenueBarHeights.length + idx]?.date?.slice(5) ?? String.fromCharCode(65 + idx)}
                    </span>
                  </div>
                ))
              ) : (
                <p className={styles.tableNotice}>{t('No data')}</p>
              )}
            </div>
          </div>

          {/* Orders Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>{t('Orders by Status')}</h3>
            <div className={styles.chartContent}>
              {dataLoading ? (
                <p className={styles.tableNotice}>{t('Loading...')}</p>
              ) : orderStatusBars.length > 0 ? (
                orderStatusBars.map((item, idx) => (
                  <div key={idx} className={styles.chartBar}>
                    <div className={styles.chartBarContainer}>
                      <div
                        className={`${styles.chartBarFill} ${
                          idx === 0
                            ? styles.chartBarSuccess
                            : idx === 1
                            ? styles.chartBarWarning
                            : styles.chartBarInfo
                        }`}
                        style={{ height: `${item.value}%` }}
                      ></div>
                    </div>
                    <span className={styles.chartLabel}>{item.label}</span>
                  </div>
                ))
              ) : (
                <p className={styles.tableNotice}>{t('No data')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className={styles.tableSection}>
          <h3 className={styles.sectionTitle}>{t('Recent Orders')}</h3>
          {ordersLoading && (
            <div className={styles.tableNotice}>{t('Loading orders...')}</div>
          )}
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeaderCell}>Order ID</th>
                <th className={styles.tableHeaderCell}>{t('Customer')}</th>
                <th className={styles.tableHeaderCell}>{t('Amount')}</th>
                <th className={styles.tableHeaderCell}>{t('Status')}</th>
                <th className={styles.tableHeaderCell}>{t('Date')}</th>
                <th className={styles.tableHeaderCell}>{t('Action')}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>#{order.id}</td>
                  <td className={styles.tableCell}>{order.customer}</td>
                  <td className={styles.tableCell}>${order.amount.toFixed(2)}</td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.tableCellBadge} ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className={styles.tableCell}>{order.date}</td>
                  <td className={styles.tableCell}>
                    <button className={styles.actionButton} title="View order">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
