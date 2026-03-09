/**
 * useDashboard Hook
 * Provides dashboard data and utilities
 */

import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/services/logger';
import { analytics } from '@/lib/services/analytics';
import type { LogEntry } from '@/lib/services/logger';

export interface DashboardState {
  totalLogs: number;
  errorCount: number;
  apiCallCount: number;
  avgResponseTime: number;
  sessionDuration: number;
  isConverted: boolean;
  memoryUsage: number;
  lastUpdated: Date;
}

/**
 * Hook to get real-time dashboard metrics
 */
export function useDashboardMetrics(refreshInterval: number = 5000) {
  const [metrics, setMetrics] = useState<DashboardState>({
    totalLogs: 0,
    errorCount: 0,
    apiCallCount: 0,
    avgResponseTime: 0,
    sessionDuration: 0,
    isConverted: false,
    memoryUsage: 0,
    lastUpdated: new Date(),
  });

  const updateMetrics = useCallback(() => {
    const logs = logger.getLogs();
    const sessionMetrics = analytics.getSessionMetrics();

    const errorLogs = logs.filter(l => l.level === 'error');
    const apiLogs = logs.filter(l => l.category === 'api' && l.duration);

    const avgResponseTime = apiLogs.length > 0
      ? apiLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / apiLogs.length
      : 0;

    let memoryUsage = 0;
    if (typeof window !== 'undefined' && (performance as any).memory) {
      memoryUsage = (performance as any).memory.usedJSHeapSize / 1048576; // MB
    }

    setMetrics({
      totalLogs: logs.length,
      errorCount: errorLogs.length,
      apiCallCount: apiLogs.length,
      avgResponseTime,
      sessionDuration: sessionMetrics?.duration || 0,
      isConverted: sessionMetrics?.isConverted || false,
      memoryUsage,
      lastUpdated: new Date(),
    });
  }, []);

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, updateMetrics]);

  return { metrics, refresh: updateMetrics };
}

/**
 * Hook to get error trends over time
 */
export function useErrorTrends(timeWindow: number = 600000) {
  const [trends, setTrends] = useState<Array<{ time: string; count: number }>>([]);

  useEffect(() => {
    const calculateTrends = () => {
      const logs = logger.getRecentLogs(timeWindow / 60000);
      const errorLogs = logs.filter(l => l.level === 'error');

      const byMinute: Record<string, number> = {};
      errorLogs.forEach(log => {
        const time = new Date(log.timestamp);
        const minute = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        byMinute[minute] = (byMinute[minute] || 0) + 1;
      });

      setTrends(
        Object.entries(byMinute).map(([time, count]) => ({
          time,
          count,
        }))
      );
    };

    calculateTrends();
    const interval = setInterval(calculateTrends, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeWindow]);

  return trends;
}

/**
 * Hook to get API performance breakdown
 */
export function useApiPerformance() {
  const [apiStats, setApiStats] = useState<
    Array<{
      endpoint: string;
      method: string;
      callCount: number;
      avgResponseTime: number;
      maxResponseTime: number;
      errorCount: number;
    }>
  >([]);

  useEffect(() => {
    const calculateStats = () => {
      const logs = logger.getLogs().filter(l => l.category === 'api');

      const statsMap: Record<string, {
        method?: string;
        callCount: number;
        durations: number[];
        errors: number;
      }> = {};

      logs.forEach(log => {
        const endpoint = log.url || 'unknown';
        if (!statsMap[endpoint]) {
          statsMap[endpoint] = {
            method: log.method,
            callCount: 0,
            durations: [],
            errors: 0,
          };
        }

        if (log.duration) {
          statsMap[endpoint].durations.push(log.duration);
        }
        statsMap[endpoint].callCount++;

        if (log.statusCode && log.statusCode >= 400) {
          statsMap[endpoint].errors++;
        }
      });

      const stats = Object.entries(statsMap).map(([endpoint, data]) => ({
        endpoint,
        method: data.method || 'UNKNOWN',
        callCount: data.callCount,
        avgResponseTime: data.durations.length > 0
          ? data.durations.reduce((a, b) => a + b) / data.durations.length
          : 0,
        maxResponseTime: data.durations.length > 0 ? Math.max(...data.durations) : 0,
        errorCount: data.errors,
      }));

      setApiStats(stats.sort((a, b) => b.callCount - a.callCount));
    };

    calculateStats();
    const interval = setInterval(calculateStats, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return apiStats;
}

/**
 * Hook to track user journey in real-time
 */
export function useUserJourney() {
  const [journey, setJourney] = useState<Array<{
    eventName: string;
    timestamp: string;
    category: string;
  }>>([]);

  useEffect(() => {
    const updateJourney = () => {
      const events = analytics.getUserJourney();
      setJourney(
        events.map(e => ({
          eventName: e.eventName,
          timestamp: new Date(e.timestamp).toLocaleTimeString(),
          category: e.category,
        }))
      );
    };

    updateJourney();
    const interval = setInterval(updateJourney, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return journey;
}

/**
 * Hook to export dashboard data
 */
export function useDashboardExport() {
  const exportData = useCallback(() => {
    const logs = logger.getLogs();
    const sessionMetrics = analytics.getSessionMetrics();
    const journey = analytics.getUserJourney();
    const conversionFunnel = analytics.getConversionFunnel();

    return {
      exportedAt: new Date().toISOString(),
      logs,
      sessionMetrics,
      journey,
      conversionFunnel,
      totalEvents: logs.length,
      totalErrors: logs.filter(l => l.level === 'error').length,
    };
  }, []);

  const downloadAsJson = useCallback(() => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData]);

  const downloadAsCsv = useCallback(() => {
    const data = exportData();
    const logs = data.logs;

    // Create CSV header
    const headers = ['Timestamp', 'Level', 'Category', 'Message', 'URL', 'Status Code', 'Duration (ms)'];
    const rows = logs.map(log => [
      log.timestamp,
      log.level,
      log.category,
      log.message,
      log.url || '',
      log.statusCode || '',
      log.duration || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData]);

  return { exportData, downloadAsJson, downloadAsCsv };
}

/**
 * Hook to get health status
 */
export function useDashboardHealth() {
  const [health, setHealth] = useState({
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    issues: [] as string[],
    timestamp: new Date(),
  });

  useEffect(() => {
    const checkHealth = () => {
      const logs = logger.getLogs();
      const errorLogs = logs.filter(l => l.level === 'error');
      const recentErrors = logger.getRecentLogs(1).filter(l => l.level === 'error');

      const issues: string[] = [];
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';

      // Check error rate
      const errorRate = logs.length > 0 ? (errorLogs.length / logs.length) * 100 : 0;
      if (errorRate > 20) {
        issues.push(`High error rate: ${errorRate.toFixed(1)}%`);
        status = 'critical';
      } else if (errorRate > 10) {
        issues.push(`Elevated error rate: ${errorRate.toFixed(1)}%`);
        status = 'warning';
      }

      // Check for recent errors
      if (recentErrors.length > 5) {
        issues.push('Multiple errors in last minute');
        status = 'critical';
      }

      // Check API performance
      const apiLogs = logs.filter(l => l.category === 'api' && l.duration);
      if (apiLogs.length > 0) {
        const avgDuration = apiLogs.reduce((sum, l) => sum + (l.duration || 0), 0) / apiLogs.length;
        if (avgDuration > 3000) {
          issues.push(`Slow APIs: ${avgDuration.toFixed(0)}ms average`);
          status = status === 'critical' ? 'critical' : 'warning';
        }
      }

      setHealth({
        status,
        issues,
        timestamp: new Date(),
      });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return health;
}

export default {
  useDashboardMetrics,
  useErrorTrends,
  useApiPerformance,
  useUserJourney,
  useDashboardExport,
  useDashboardHealth,
};
