/**
 * Session Monitoring Dashboard
 * Real-time visualization of sessions, errors, performance metrics
 * Admin/Developer tool for monitoring application health
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/services/logger';
import { analytics } from '@/lib/services/analytics';
import type { LogEntry } from '@/lib/services/logger';
import type { UserJourneySession } from '@/lib/services/analytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { Activity, BarChart3, TriangleAlert, Users } from 'lucide-react';

const PROGRESS_WIDTH_CLASSES = [
  'w-[0%]',
  'w-[5%]',
  'w-[10%]',
  'w-[15%]',
  'w-[20%]',
  'w-[25%]',
  'w-[30%]',
  'w-[35%]',
  'w-[40%]',
  'w-[45%]',
  'w-[50%]',
  'w-[55%]',
  'w-[60%]',
  'w-[65%]',
  'w-[70%]',
  'w-[75%]',
  'w-[80%]',
  'w-[85%]',
  'w-[90%]',
  'w-[95%]',
  'w-[100%]',
] as const;

function getProgressWidthClass(durationMs: number, maxMs = 5000) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return PROGRESS_WIDTH_CLASSES[0];
  }
  const clamped = Math.min(durationMs / maxMs, 1);
  const index = Math.max(0, Math.min(PROGRESS_WIDTH_CLASSES.length - 1, Math.round(clamped * 20)));
  return PROGRESS_WIDTH_CLASSES[index];
}

interface DashboardMetrics {
  totalSessions: number;
  activeSessions: number;
  totalEvents: number;
  errorCount: number;
  averageSessionDuration: number;
  conversionRate: number;
  lastUpdated: string;
}

interface ErrorSummary {
  count: number;
  byType: Record<string, number>;
  recent: LogEntry[];
}

interface PerformanceMetrics {
  avgApiResponseTime: number;
  slowestApis: Array<{ url: string; duration: number }>;
  memoryUsage?: number;
  cpuUsage?: number;
}

export function SessionMonitoringDashboard() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSessions: 0,
    activeSessions: 0,
    totalEvents: 0,
    errorCount: 0,
    averageSessionDuration: 0,
    conversionRate: 0,
    lastUpdated: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errors, setErrors] = useState<ErrorSummary>({
    count: 0,
    byType: {},
    recent: [],
  });

  const [performance, setPerformance] = useState<PerformanceMetrics>({
    avgApiResponseTime: 0,
    slowestApis: [],
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'errors' | 'performance'>('overview');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const allLogs = logger.getLogs();
      const currentSession = analytics.getCurrentSession();
      const sessionMetrics = analytics.getSessionMetrics();

      // Calculate dashboard metrics
      const errorLogs = allLogs.filter(l => l.level === 'error');
      const apiLogs = allLogs.filter(l => l.category === 'api');

      // Calculate average response time
      const responseTimes = apiLogs
        .filter(l => l.duration)
        .map(l => l.duration || 0);
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      // Get slowest APIs
      const slowestApis = apiLogs
        .filter(l => l.duration && l.duration > 500)
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 5)
        .map(l => ({
          url: l.url || 'unknown',
          duration: l.duration || 0,
        }));

      // Error summary
      const errorsByType: Record<string, number> = {};
      errorLogs.forEach(log => {
        const type = log.data?.errorCode || 'unknown';
        errorsByType[type] = (errorsByType[type] || 0) + 1;
      });

      setMetrics({
        totalSessions: 1,
        activeSessions: currentSession ? 1 : 0,
        totalEvents: allLogs.length,
        errorCount: errorLogs.length,
        averageSessionDuration: sessionMetrics?.duration || 0,
        conversionRate: sessionMetrics?.isConverted ? 100 : 0,
        lastUpdated: new Date().toISOString(),
      });

      setLogs(allLogs);
      setErrors({
        count: errorLogs.length,
        byType: errorsByType,
        recent: errorLogs.slice(-10),
      });

      setPerformance({
        avgApiResponseTime: avgResponseTime,
        slowestApis,
      });
    };

    updateMetrics();

    if (autoRefresh) {
      const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => {
    if (filterLevel === 'all') return true;
    return log.level === filterLevel;
  });

  const handleExport = () => {
    const data = {
      metrics,
      logs,
      errors,
      performance,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      logger.clearLogs();
      setLogs([]);
    }
  };

  return (
    <Card className="overflow-hidden shadow-none">
      <CardHeader className="border-b">
        <CardTitle className="text-3xl">{t('Session Monitoring Dashboard')}</CardTitle>
        <CardDescription>
          {t('Last updated:')} {mounted && metrics.lastUpdated ? new Date(metrics.lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
        </CardDescription>
        <CardAction>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Toggle
              pressed={autoRefresh}
              onPressedChange={setAutoRefresh}
              variant="outline"
              aria-label={t('Auto-refresh')}
              title={t('Auto-refresh')}
            >
              {autoRefresh ? t('Auto-refresh: On') : t('Auto-refresh: Off')}
            </Toggle>
            <Button onClick={handleExport}>
              {t('Export')}
            </Button>
            <Button onClick={handleClearLogs}>
              {t('Clear logs')}
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Sessions"
            value={metrics.activeSessions}
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
          />
          <MetricCard
            title="Total Events"
            value={metrics.totalEvents}
            icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />}
          />
          <MetricCard
            title="Error Count"
            value={metrics.errorCount}
            icon={<TriangleAlert className="h-5 w-5" aria-hidden="true" />}
          />
          <MetricCard
            title="Avg Response Time"
            value={`${performance.avgApiResponseTime.toFixed(0)}ms`}
            icon={<Activity className="h-5 w-5" aria-hidden="true" />}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="w-fit justify-start border border-input bg-transparent">
            <TabsTrigger value="overview">{t('Overview')}</TabsTrigger>
            <TabsTrigger value="logs">{t('Logs')}</TabsTrigger>
            <TabsTrigger value="errors">{t('Errors')}</TabsTrigger>
            <TabsTrigger value="performance">{t('Performance')}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-2">
            <OverviewTab metrics={metrics} performance={performance} />
          </TabsContent>
          <TabsContent value="logs" className="pt-2">
            <LogsTab
              logs={filteredLogs}
              filterLevel={filterLevel}
              setFilterLevel={setFilterLevel}
            />
          </TabsContent>
          <TabsContent value="errors" className="pt-2">
            <ErrorsTab errors={errors} />
          </TabsContent>
          <TabsContent value="performance" className="pt-2">
            <PerformanceTab performance={performance} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="gap-2 py-4 shadow-none">
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Overview Tab
 */
function OverviewTab({
  metrics,
  performance,
}: {
  metrics: DashboardMetrics;
  performance: PerformanceMetrics;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('Session Metrics')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="gap-2 py-4 shadow-none">
            <CardContent className="px-4">
              <p className="text-sm text-muted-foreground">{t('Session Duration')}</p>
              <p className="text-xl font-semibold tabular-nums mt-1">
                {(metrics.averageSessionDuration / 1000 / 60).toFixed(1)}{t('min')}
              </p>
            </CardContent>
          </Card>
          <Card className="gap-2 py-4 shadow-none">
            <CardContent className="px-4">
              <p className="text-sm text-muted-foreground">{t('Conversion Rate')}</p>
              <p className="text-xl font-semibold tabular-nums mt-1">
                {metrics.conversionRate.toFixed(0)}{t('%')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {performance.slowestApis.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('Slowest API Endpoints')}</h3>
          <div className="space-y-2">
            {performance.slowestApis.map((api, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
              >
                <span className="text-sm font-mono text-muted-foreground">{api.url}</span>
                <span className="text-sm font-semibold tabular-nums">{api.duration.toFixed(0)}{t('ms')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Logs Tab
 */
function LogsTab({
  logs,
  filterLevel,
  setFilterLevel,
}: {
  logs: LogEntry[];
  filterLevel: string;
  setFilterLevel: (level: string) => void;
}) {
  const { t } = useTranslation();

  const levelVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    debug: 'outline',
    info: 'secondary',
    warn: 'secondary',
    error: 'outline',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'debug', 'info', 'warn', 'error'].map(level => (
          <Button
            key={level}
            onClick={() => setFilterLevel(level)}
            size="sm"
            variant={filterLevel === level ? 'default' : 'outline'}
          >
            {level}
          </Button>
        ))}
      </div>
      <div className="overflow-y-auto max-h-96 rounded-lg border bg-background p-3">
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{t('No logs found')}</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(-50).reverse().map((log, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-3 font-mono text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Badge variant={levelVariant[log.level] || 'outline'} className="mr-2">
                      {log.level.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{log.category.toUpperCase()}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="mt-2 text-foreground">{log.message}</p>
                {log.data && (
                  <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-2 text-xs text-muted-foreground">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Errors Tab
 */
function ErrorsTab({ errors }: { errors: ErrorSummary }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Total Errors</h3>
          <Badge variant="outline">{errors.count}</Badge>
        </div>
        {Object.keys(errors.byType).length > 0 && (
          <div className="space-y-2">
            {Object.entries(errors.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                <span className="text-sm font-medium text-foreground">{type}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {errors.recent.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Errors</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {errors.recent.map((error, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">ERROR</Badge>
                    <span className="font-semibold text-foreground">{error.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(error.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                {error.stackTrace && (
                  <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-2 text-xs text-muted-foreground">
                    {error.stackTrace}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Performance Tab
 */
function PerformanceTab({ performance }: { performance: PerformanceMetrics }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="gap-2 py-4 shadow-none">
          <CardContent className="px-4">
            <p className="text-sm text-muted-foreground">{t('Average API Response Time')}</p>
            <p className="text-3xl font-semibold tabular-nums mt-2">
              {performance.avgApiResponseTime.toFixed(0)}{t('ms')}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4 shadow-none">
          <CardContent className="px-4">
            <p className="text-sm text-muted-foreground">{t('Slow API Calls')}</p>
            <p className="text-3xl font-semibold tabular-nums mt-2">{performance.slowestApis.length}</p>
          </CardContent>
        </Card>
      </div>
      {performance.slowestApis.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('Performance Issues')}</h3>
          <div className="space-y-2">
            {performance.slowestApis.map((api, idx) => (
              <div key={idx} className="relative rounded-lg border bg-card p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm text-muted-foreground">{api.url}</span>
                  <span className="text-sm font-semibold tabular-nums">{api.duration.toFixed(0)}{t('ms')}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`bg-foreground h-2 rounded-full transition-all ${getProgressWidthClass(api.duration)}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-lg border bg-background p-4">
        <p className="text-sm text-muted-foreground mb-2">{t('Tips')}</p>
        <ul className="list-disc pl-5 text-sm text-foreground space-y-1">
          <li>{t('API calls taking >1000ms should be optimized')}</li>
          <li>{t('Consider adding caching for frequently accessed endpoints')}</li>
          <li>{t('Use pagination for large data sets')}</li>
          <li>{t('Implement request debouncing for search/filter operations')}</li>
        </ul>
      </div>
    </div>
  );
}

export default SessionMonitoringDashboard;
