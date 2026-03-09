# Session Monitoring Dashboard Documentation

## Overview

The Session Monitoring Dashboard is a real-time visualization tool for monitoring application health, performance, and user sessions. Designed for developers and admins to quickly identify and diagnose issues.

**Access the dashboard:**

```
http://localhost:3000/admin/dashboard
```

## Features

### 1. Real-Time Metrics

- **Active Sessions**: Current number of active user sessions
- **Total Events**: All tracked events (page views, interactions, etc.)
- **Error Count**: Total errors occurring in the system
- **Average Response Time**: Mean API response time in milliseconds

### 2. Four Main Tabs

#### Overview Tab

- Session duration metrics
- Conversion rate
- Slowest API endpoints with response times
- Quick performance snapshot

#### Logs Tab

- Real-time log streaming
- Filter by log level (debug, info, warn, error)
- Show last 50 logs
- Timestamp and detailed context for each log
- Expandable data payloads

#### Errors Tab

- Total error count
- Errors grouped by type
- Recent errors with full details
- Stack traces for debugging
- Error patterns over time

#### Performance Tab

- Average API response time
- List of slow API calls
- Performance progress bars
- Visual indicators for bottlenecks
- Optimization tips

### 3. Dashboard Controls

| Button              | Function                                            |
| ------------------- | --------------------------------------------------- |
| **🔄 Auto-Refresh** | Toggle automatic metric updates (5-second interval) |
| **📥 Export Data**  | Download all dashboard data as JSON                 |
| **🗑 Clear Logs**   | Clear all stored logs (requires confirmation)       |

## Usage Examples

### Accessing the Dashboard

```typescript
// In your app, add link to dashboard
import Link from 'next/link';

export function AdminNav() {
  return (
    <nav>
      <Link href="/admin/dashboard">
        📊 Dashboard
      </Link>
    </nav>
  );
}
```

### Using Dashboard Hooks

```typescript
'use client';

import {
  useDashboardMetrics,
  useDashboardHealth,
  useApiPerformance,
  useUserJourney
} from '@/lib/hooks/useDashboard';

export function CustomMetricsComponent() {
  const { metrics, refresh } = useDashboardMetrics(5000); // Update every 5 seconds
  const health = useDashboardHealth();
  const apiStats = useApiPerformance();
  const journey = useUserJourney();

  return (
    <div>
      <h2>System Health: {health.status}</h2>
      {health.issues.map((issue, idx) => (
        <div key={idx} className="alert">{issue}</div>
      ))}

      <h3>API Performance</h3>
      {apiStats.map(api => (
        <div key={api.endpoint}>
          {api.endpoint}: {api.avgResponseTime.toFixed(0)}ms
        </div>
      ))}

      <button onClick={refresh}>Refresh Now</button>
    </div>
  );
}
```

### Export Data Programmatically

```typescript
'use client';

import { useDashboardExport } from '@/lib/hooks/useDashboard';

export function ExportButton() {
  const { exportData, downloadAsJson, downloadAsCsv } = useDashboardExport();

  const handleCustomExport = () => {
    const data = exportData();
    console.log('Dashboard data:', data);

    // Send to backend for analysis
    fetch('/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return (
    <div>
      <button onClick={downloadAsJson}>Download JSON</button>
      <button onClick={downloadAsCsv}>Download CSV</button>
      <button onClick={handleCustomExport}>Send to Backend</button>
    </div>
  );
}
```

## Understanding the Dashboard

### Health Status Colors

| Status          | Meaning               | Action                  |
| --------------- | --------------------- | ----------------------- |
| 🟢 **Healthy**  | All systems normal    | No action needed        |
| 🟡 **Warning**  | Minor issues detected | Monitor closely         |
| 🔴 **Critical** | Major issues          | Investigate immediately |

### What Triggers Each Status

**Healthy:**

- Error rate < 10%
- Average API response < 1000ms
- Less than 5 errors in last minute

**Warning:**

- Error rate 10-20%
- Average API response 1000-3000ms
- Some performance degradation

**Critical:**

- Error rate > 20%
- Average API response > 3000ms
- Multiple errors in short time
- API failures

### Log Levels

```
🔍 DEBUG    - Detailed development information
ℹ️  INFO     - Normal application events
⚠️  WARN     - Warning conditions (potential issues)
❌ ERROR    - Error conditions (failures)
```

### Categories

```
[AUTH]        - Authentication events (login, logout, token refresh)
[API]         - API requests and responses
[ANALYTICS]   - User behavior and journey tracking
[ERROR]       - Application errors
[PERFORMANCE] - Performance metrics and timing
[USER]        - Custom user event tracking
```

## Common Issues & Troubleshooting

### Dashboard Shows No Data

1. Check if auto-refresh is enabled (green button)
2. Use an app feature to generate logs
3. Click "Refresh" button manually
4. Clear cache and reload page

### High Error Rate

1. Check the Errors tab for error types
2. Look at error stack traces
3. Review Recent Errors for patterns
4. Export data and share with team

### Slow API Responses

1. Check Performance tab for slowest endpoints
2. Identify which API is slow
3. Check if caching could help
4. Consider pagination for large data sets

### Memory Usage High

1. Clear logs with 🗑 button
2. Check if memory leak in browser DevTools
3. Reload the page
4. Close other browser tabs

## Integration with Other Tools

### Send Data to Backend

```typescript
// In useDashboard.ts or custom hook
const dashboardData = exportData();

await fetch('/api/admin/dashboard/metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(dashboardData),
});
```

### Connect to Sentry

```env
NEXT_PUBLIC_ENABLE_SENTRY=true
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project
```

Dashboard errors will automatically appear in Sentry.

### Export to Analytics Platform

```typescript
// Setup in analytics.ts
async function sendEventsToBackend(events) {
  await fetch('/api/analytics/events', {
    method: 'POST',
    body: JSON.stringify(events),
  });
}
```

## Performance Tips

### Reduce Refresh Rate

```typescript
// Slower updates = less CPU usage
useDashboardMetrics(10000); // 10 seconds instead of 5
```

### Filter Log Output

```typescript
// Only show errors
const errorLogs = logs.filter((l) => l.level === 'error');
```

### Periodic Data Cleanup

```typescript
// Clear old logs monthly
if (logs.length > 1000) {
  logger.clearLogs();
}
```

## What Gets Displayed

✅ **Displayed:**

- API endpoints and response times
- Error messages and stack traces
- User journey events
- Session duration
- Performance metrics
- Log timestamps

❌ **Not Displayed** (privacy):

- Passwords or tokens
- Credit card numbers
- Personal identification
- Request/response body (too large)

## Dashboard Capabilities by Role

### Developer

- View all logs with full details
- Access performance metrics
- Export data for analysis
- Monitor real-time events
- Debug specific errors

### Admin

- Monitor system health status
- View error trends
- Check API performance
- Track user journey
- Export reports

### Support

- Look up recent logs for user
- Identify error patterns
- Export data for investigation
- Check session metrics

## Keyboard Shortcuts

```
Ctrl+Shift+D     (or Cmd+Shift+D on Mac)
→ Open/Focus Dashboard

Ctrl+Shift+L
→ Toggle Auto-Refresh

Ctrl+Shift+E
→ Export Dashboard Data
```

(Add these in a future update)

## Advanced Usage

### Custom Metrics

```typescript
import { logger } from '@/lib/services/logger';
import { analytics } from '@/lib/services/analytics';

// Log business metrics
logger.user('Conversion Event', {
  cartValue: 99.99,
  itemCount: 5,
  userId: '123',
});

// Track custom journey
analytics.trackEvent('premium_feature_used', 'conversion', {
  featureName: 'export_pdf',
});
```

### Set Up Alerts

```typescript
// Monitor health status
const health = useDashboardHealth();

useEffect(() => {
  if (health.status === 'critical') {
    // Send notification
    sendSlackNotification(`Alert: ${health.issues.join(', ')}`);
  }
}, [health]);
```

### Automated Reports

```typescript
// Daily export of dashboard data
useEffect(() => {
  const schedule = setInterval(
    () => {
      const data = exportData();

      // Send email report
      fetch('/api/reports/daily', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    24 * 60 * 60 * 1000
  ); // Every 24 hours
}, []);
```

## Next Steps

The dashboard is ready for integration with:

1. **Device Management** (Todo #3)

   - Track sessions per device
   - Session timeline
   - Multi-device login tracking

2. **Risk-Based Authentication** (Todo #4)

   - Monitor suspicious patterns
   - Anomaly detection
   - Location-based alerts

3. **Backend Integration**
   - Store metrics in database
   - Create long-term trends
   - Generate PDF reports

## Support & Debugging

**Having issues with the dashboard?**

1. Check browser console for errors: `logger.getLogs()`
2. Verify logs are being stored: `localStorage.getItem('app_logs')`
3. Test logging: `logger.info('test message')`
4. Export data for review: Click "📥 Export Data" button
5. Share exported JSON with development team

**Dashboard Features Checklist:**

- [ ] Dashboard loads without errors
- [ ] Metrics update automatically
- [ ] All 4 tabs display content
- [ ] Logs filter by level
- [ ] Export buttons work
- [ ] Health status shown correctly
- [ ] API performance displayed
- [ ] Error tracking working
