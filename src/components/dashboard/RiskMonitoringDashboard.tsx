/**
 * Admin Risk Monitoring Dashboard
 * 
 * Comprehensive dashboard for monitoring:
 * - Risk assessments
 * - Brute force attempts
 * - Failed logins
 * - Locked accounts
 * - Suspicious activity patterns
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Lock,
  Activity,
  Filter,
  Download,
  RefreshCw,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { bruteForceDetection } from '@/lib/services/bruteForceDetection';
import type { RiskLevel } from '@/lib/services/riskAssessment';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';

// ============================================================================
// Dashboard Components
// ============================================================================

interface RiskMetricsProps {
  statistics?: ReturnType<typeof bruteForceDetection.getStatistics>;
  patterns?: any[];
}

function RiskMetrics({ statistics = bruteForceDetection.getStatistics() }: RiskMetricsProps) {
  const { t } = useTranslation();
  const failureRate =
    statistics.totalAttempts > 0
      ? ((statistics.failedAttempts / statistics.totalAttempts) * 100).toFixed(1)
      : '0';

  const successRate =
    statistics.totalAttempts > 0
      ? ((statistics.successfulAttempts / statistics.totalAttempts) * 100).toFixed(1)
      : '0';

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">{t('Total Attempts')}</p>
            <Activity className="text-muted-foreground" size={18} aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{statistics.totalAttempts}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t('Login attempts in last 24h')}</p>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">{t('Failed Attempts')}</p>
            <AlertTriangle className="text-muted-foreground" size={18} aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{statistics.failedAttempts}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('Failure rate:')} {failureRate}%
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">{t('Locked Accounts')}</p>
            <Lock className="text-muted-foreground" size={18} aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{statistics.lockedAccountsCount}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t('Currently locked')}</p>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">{t('Blacklisted IPs')}</p>
            <ShieldAlert className="text-muted-foreground" size={18} aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{statistics.blacklistedIpsCount}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t('IPs under restriction')}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Attack Pattern Table
// ============================================================================

interface AttackPatternTableProps {
  patterns: any[];
}

function AttackPatternTable({ patterns = [] }: AttackPatternTableProps) {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<'failed' | 'date'>('failed');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const sorted = [...patterns].sort((a, b) => {
    if (sortBy === 'failed') {
      return b.failedCount - a.failedCount;
    } else {
      return new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime();
    }
  });

  if (patterns.length === 0) {
    return (
      <Card className="shadow-none">
        <CardContent className="p-8 text-center">
          <Shield className="mx-auto mb-3 text-muted-foreground" size={40} aria-hidden="true" />
          <p className="font-medium text-foreground">{t('No suspicious patterns detected')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('All login attempts appear normal')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-none">
      <CardHeader className="border-b py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">{t('Suspicious Login Patterns')}</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={sortBy === 'failed' ? 'default' : 'outline'}
              onClick={() => setSortBy('failed')}
            >
              {t('Failed Count')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={sortBy === 'date' ? 'default' : 'outline'}
              onClick={() => setSortBy('date')}
            >
              {t('Recent')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('Email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('IP Address')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('Failed/Success')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('Status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('Last Attempt')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((pattern, idx) => (
              <React.Fragment key={idx}>
                <tr
                  className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {pattern.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{pattern.ipAddress}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{pattern.failedCount}</span>
                    <span className="mx-1">{t('/')}</span>
                    <span className="font-medium text-foreground">{pattern.successCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    {pattern.isLocked ? (
                      <Badge variant="outline">{t('🔒 Locked')}</Badge>
                    ) : pattern.failedCount >= 3 ? (
                      <Badge variant="secondary">{t('⚠️ Warning')}</Badge>
                    ) : (
                      <Badge variant="outline">{t('Normal')}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(pattern.lastAttempt).toLocaleString()}
                  </td>
                </tr>

                {/* Expanded Details */}
                {expandedIndex === idx && (
                  <tr className="bg-muted/20 border-b">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">{t('Failed Attempts:')}</p>
                            <p className="text-lg font-semibold text-foreground">
                              {pattern.failedCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">{t('Successful Logins:')}</p>
                            <p className="text-lg font-semibold text-foreground">
                              {pattern.successCount}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">{t('Locations:')}</p>
                            <div className="space-y-1">
                              {pattern.locations.map((loc: string, i: number) => (
                                <p key={i} className="text-sm text-foreground">{t('📍')}{loc}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">{t('Actions:')}</p>
                            <div className="flex gap-2">
                              <Button type="button" size="sm" variant="outline">{t('Review')}</Button>
                              <Button type="button" size="sm">{t('Block IP')}</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Risk Distribution Chart
// ============================================================================

interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

const PERCENT_WIDTH_CLASSES = [
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

function getPercentWidthClass(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0 || value <= 0) {
    return PERCENT_WIDTH_CLASSES[0];
  }
  const clamped = Math.min(Math.max(value / total, 0), 1);
  const index = Math.max(0, Math.min(PERCENT_WIDTH_CLASSES.length - 1, Math.round(clamped * 20)));
  return PERCENT_WIDTH_CLASSES[index];
}

function RiskDistributionChart() {
  const { t } = useTranslation();
  const [distribution, setDistribution] = useState<RiskDistribution>({
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  });

  useEffect(() => {
    // In production, this would fetch actual data
    setDistribution({
      low: 45,
      medium: 30,
      high: 18,
      critical: 7,
    });
  }, []);

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  const risks: Array<{ level: RiskLevel; count: number; barClass: string }> = [
    { level: 'critical', count: distribution.critical, barClass: 'bg-foreground/90' },
    { level: 'high', count: distribution.high, barClass: 'bg-foreground/70' },
    { level: 'medium', count: distribution.medium, barClass: 'bg-foreground/50' },
    { level: 'low', count: distribution.low, barClass: 'bg-foreground/30' },
  ];

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('Risk Level Distribution')}</CardTitle>
        <CardDescription>{t('Breakdown of assessed login risk levels')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.map((risk) => (
          <div key={risk.level}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground capitalize">{risk.level}</span>
              <span className="text-sm font-semibold tabular-nums">
                {risk.count}{' '}
                <span className="text-muted-foreground">
                  ({total > 0 ? ((risk.count / total) * 100).toFixed(0) : '0'}{t('%')})
                </span>
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${risk.barClass} transition-all ${getPercentWidthClass(risk.count, total)}`}
              />
            </div>
          </div>
        ))}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {t('Total logins assessed:')} <span className="font-semibold text-foreground">{total}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Dashboard
// ============================================================================

export default function RiskMonitoringDashboard() {
  const { t } = useTranslation();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [statistics, setStatistics] = useState(bruteForceDetection.getStatistics());
  const [patterns, setPatterns] = useState(bruteForceDetection.getAttemptPatterns());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minFailed: 2,
    riskLevel: 'all' as string,
    dateRange: '24h' as string,
  });

  const failureRate =
    statistics.totalAttempts > 0
      ? (statistics.failedAttempts / statistics.totalAttempts) * 100
      : 0;

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setStatistics(bruteForceDetection.getStatistics());
      setPatterns(bruteForceDetection.getAttemptPatterns());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      statistics,
      patterns,
      filters,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-report-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter patterns
  const filteredPatterns = patterns.filter((p) => {
    if (filters.minFailed > 0 && p.failedCount < filters.minFailed) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert size={18} aria-hidden="true" />
                {t('Risk Monitoring')}
              </CardTitle>
              <CardDescription>{t('Monitor authentication attacks and suspicious patterns')}</CardDescription>
            </div>

            <CardAction>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStatistics(bruteForceDetection.getStatistics());
                    setPatterns(bruteForceDetection.getAttemptPatterns());
                  }}
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  {t('Refresh')}
                </Button>

                <Button type="button" onClick={handleExport}>
                  <Download size={16} aria-hidden="true" />
                  {t('Export')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters((v) => !v)}
                  aria-expanded={showFilters}
                >
                  <Filter size={16} aria-hidden="true" />
                  {t('Filters')}
                </Button>
              </div>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Toggle
              pressed={autoRefresh}
              onPressedChange={setAutoRefresh}
              variant="outline"
              aria-label={t('Auto-refresh')}
              title={t('Auto-refresh')}
            >
              {autoRefresh ? t('Auto-refresh: On') : t('Auto-refresh: Off')}
            </Toggle>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('Every')}</span>
              <Select
                value={String(refreshInterval)}
                onValueChange={(value) => setRefreshInterval(Number(value))}
                disabled={!autoRefresh}
              >
                <SelectTrigger className="w-42.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">{t('10 seconds')}</SelectItem>
                  <SelectItem value="30">{t('30 seconds')}</SelectItem>
                  <SelectItem value="60">{t('1 minute')}</SelectItem>
                  <SelectItem value="300">{t('5 minutes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <Card className="shadow-none">
              <CardContent className="p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="risk-min-failed">
                      {t('Min failed attempts')}
                    </Label>
                    <Input
                      id="risk-min-failed"
                      type="number"
                      min={0}
                      value={filters.minFailed}
                      onChange={(e) => setFilters((p) => ({ ...p, minFailed: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('Risk level')}</Label>
                    <Select
                      value={filters.riskLevel}
                      onValueChange={(value) => setFilters((p) => ({ ...p, riskLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('All')}</SelectItem>
                        <SelectItem value="low">{t('Low')}</SelectItem>
                        <SelectItem value="medium">{t('Medium')}</SelectItem>
                        <SelectItem value="high">{t('High')}</SelectItem>
                        <SelectItem value="critical">{t('Critical')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('Date range')}</Label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) => setFilters((p) => ({ ...p, dateRange: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">{t('Last 24h')}</SelectItem>
                        <SelectItem value="7d">{t('Last 7d')}</SelectItem>
                        <SelectItem value="30d">{t('Last 30d')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <RiskMetrics statistics={statistics} patterns={filteredPatterns} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttackPatternTable patterns={filteredPatterns} />
        </div>
        <div>
          <RiskDistributionChart />
        </div>
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle size={18} aria-hidden="true" />
            {t('Active Alerts')}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

        {statistics.lockedAccountsCount > 0 && (
          <div className="rounded-xl border bg-card p-4 flex justify-between items-center gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{t('Account Lockouts Active')}</p>
              <p className="text-sm text-muted-foreground">
                {statistics.lockedAccountsCount} {t('account(s) currently locked due to failed attempts')}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline">
              {t('Manage')}
            </Button>
          </div>
        )}

        {statistics.blacklistedIpsCount > 0 && (
          <div className="rounded-xl border bg-card p-4 flex justify-between items-center gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{t('IP Addresses Blacklisted')}</p>
              <p className="text-sm text-muted-foreground">
                {statistics.blacklistedIpsCount} {t('IP address(es) blocked due to suspicious activity')}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline">
              {t('Review')}
            </Button>
          </div>
        )}

        {failureRate >= 20 && (
          <div className="rounded-xl border bg-card p-4 flex justify-between items-center gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{t('High Failure Rate')}</p>
              <p className="text-sm text-muted-foreground">
                {failureRate.toFixed(1)} {t('% of login attempts are failing')}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline">
              {t('Investigate')}
            </Button>
          </div>
        )}

        {statistics.lockedAccountsCount === 0 && statistics.blacklistedIpsCount === 0 && failureRate < 20 && (
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <Shield className="text-muted-foreground" size={20} aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{t('System Secure')}</p>
              <p className="text-sm text-muted-foreground">{t('No active security alerts detected')}</p>
            </div>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
