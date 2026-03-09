# Advanced Logging & Analytics Documentation

## Overview

The Selsa frontend now has a comprehensive logging and analytics system that tracks:

1. **Detailed API Operations** - All requests, responses, errors with timing
2. **User Journey** - Complete user flow: login → browse → cart → checkout → logout
3. **Error Tracking** - Uncaught errors, React errors, promise rejections, API failures
4. **Performance Monitoring** - Slow operations, memory usage, API response times
5. **User Behavior** - Page views, product interactions, search queries, filter actions

## Architecture

### Three Main Services

```
Logger Service
├─ API logging
├─ Error tracking
├─ Performance metrics
└─ Session tracking

Analytics Service
├─ Page view tracking
├─ Product interactions
├─ Checkout events
├─ Search & filters
└─ User journey

Error Tracking
├─ Uncaught errors
├─ Promise rejections
├─ React errors
└─ Async operation errors
```

## 1. Logger Service (`src/lib/services/logger.ts`)

### What It Does

Tracks all application operations with detailed context and timestamps.

### Usage in Code

```typescript
import { logger } from '@/lib/services/logger';

// Log authentication events
logger.auth('User login attempted', { email: 'user@example.com' });

// Log API operations
logger.api('Fetching products', { endpoint: '/api/products/' });

// Log errors
logger.error('Failed to fetch products', error, { endpoint: '/api/products/' });

// Log performance
const timer = logger.createTimer('product_load');
// ... do work ...
timer.end(); // Automatically logs with duration

// Get logs for debugging
const logs = logger.getLogs();
const recentLogs = logger.getRecentLogs(5); // Last 5 minutes
const errors = logger.getLogsByLevel('error');
const authLogs = logger.getLogsByCategory('auth');

// Export logs for support/debugging
const json = logger.exportLogs();
```

### Console Output Format

```
ℹ️ [API] [2026-01-29T10:30:00.123Z] → POST /api/products/
ℹ️ [API] [2026-01-29T10:30:01.456Z] ← 200 /api/products/
❌ [AUTH] [2026-01-29T10:31:00.789Z] Invalid credentials
⚠️ [ERROR] [2026-01-29T10:32:00.000Z] Token expired
🔍 [DEBUG] [2026-01-29T10:33:00.000Z] Sending refresh request
```

### Log Levels

| Level   | When Used            | Console Color |
| ------- | -------------------- | ------------- |
| `debug` | Development only     | Gray          |
| `info`  | Normal operations    | Blue          |
| `warn`  | Potential issues     | Orange        |
| `error` | Failures, exceptions | Red           |

### Accessing Logs Programmatically

```typescript
// In browser console:
localStorage.getItem('app_logs'); // All stored logs as JSON

// In code:
import { logger } from '@/lib/services/logger';
logger.getLogs(); // All logs
logger.getRecentLogs(10); // Last 10 minutes
logger.getLogsByLevel('error');
logger.getLogsByCategory('api');
logger.exportLogs(); // Export as formatted JSON
```

## 2. Analytics Service (`src/lib/services/analytics.ts`)

### What It Tracks

**User Journey Events:**

- Page views
- Product interactions (view, add to cart, favorite)
- Search queries
- Filter/sort actions
- Checkout progress
- Authentication events

**Session Data:**

- Session ID and duration
- Event count by category
- Device information
- User flow (conversion funnel)

### Usage in Code

```typescript
import { analytics } from '@/lib/services/analytics';

// Track page views (automatic with usePageTracking hook)
analytics.trackPageView('product_details', { productId: '123' });

// Track product interactions
analytics.trackProductInteraction('added_to_cart', 'product_123', {
  productName: 'Blue T-Shirt',
  price: 29.99,
  quantity: 2,
});

// Track checkout progress
analytics.trackCheckoutEvent('started', { cartValue: 99.99 });
analytics.trackCheckoutEvent('completed', {
  orderId: 'order_456',
  orderValue: 99.99,
});

// Track search
analytics.trackSearch('blue shirt', 45); // 45 results

// Track filters
analytics.trackFilterAction('price', '20-50', { categoryName: 'clothing' });

// Track auth events
analytics.trackAuthEvent('login_completed', { provider: 'credentials' });

// Get analytics data
const metrics = analytics.getSessionMetrics();
const journey = analytics.getUserJourney();
const funnel = analytics.getConversionFunnel();
const exported = analytics.exportSessionData();
```

### React Hooks for Analytics

```typescript
import {
  usePageTracking,
  useProductTracking,
  useCheckoutTracking,
  useSearchTracking,
  useAuthTracking,
  useAnalyticsData,
} from '@/lib/hooks/useAnalytics';

// Auto-track page views
function MyPage() {
  usePageTracking(); // Automatically tracks page view on mount
  return <div>Content</div>;
}

// Track product interactions
function ProductCard({ productId }) {
  const { trackViewed, trackAddedToCart } = useProductTracking();

  useEffect(() => {
    trackViewed(productId, 'Product Name', 29.99);
  }, [productId]);

  const handleAddToCart = () => {
    trackAddedToCart(productId, 'Product Name', 29.99, 1);
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}

// Track checkout
function CheckoutForm() {
  const { trackCheckoutStarted, trackOrderCompleted } = useCheckoutTracking();

  const handleSubmit = async () => {
    trackCheckoutStarted(cartValue, itemCount);
    // ... submit ...
    trackOrderCompleted(orderId, cartValue, itemCount);
  };
}

// Get analytics data
function AnalyticsDashboard() {
  const { getSessionMetrics, getConversionFunnel, exportData } = useAnalyticsData();

  const metrics = getSessionMetrics();
  const funnel = getConversionFunnel();
  const json = exportData();
}
```

### Session Metrics

```typescript
{
  sessionId: "analytics_1706523000123_abc123",
  duration: 1200000,          // ms (20 minutes)
  eventCount: 45,
  eventCounts: {
    navigation: 12,
    interaction: 25,
    conversion: 2,
    error: 0,
  },
  pageViews: 12,
  interactions: 25,
  errors: 0,
  isConverted: true,
}
```

### Conversion Funnel Example

```typescript
{
  checkout_started: 5,
  checkout_address_entered: 4,
  checkout_payment_entered: 3,
  checkout_completed: 2,
}
```

## 3. Error Tracking

### Automatic Error Catching

```typescript
import { useErrorTracking, ErrorBoundary } from '@/lib/hooks/useErrorTracking';

// In your app root:
function App() {
  useErrorTracking(); // Catches uncaught errors and unhandled promise rejections

  return (
    <ErrorBoundary>
      <YourAppContent />
    </ErrorBoundary>
  );
}
```

### Manual Error Tracking

```typescript
import {
  useAsyncErrorTracking,
  useApiErrorTracking,
} from '@/lib/hooks/useErrorTracking';

function MyComponent() {
  const { trackAsyncError, withErrorTracking } = useAsyncErrorTracking();
  const { trackApiError } = useApiErrorTracking();

  // Manual tracking
  const handleClick = async () => {
    try {
      await fetchData();
    } catch (error) {
      trackAsyncError('fetch_data', error, { userId: '123' });
    }
  };

  // With helper
  const result = await withErrorTracking(
    'fetch_products',
    () => fetch('/api/products/'),
    { category: 'clothing' }
  );

  // API errors
  trackApiError('POST', '/api/orders', 400, 'Invalid order data', {
    orderId: '123',
  });
}
```

### Error Boundary Component

```typescript
import { ErrorBoundary } from '@/lib/hooks/useErrorTracking';

// Wrap any component
<ErrorBoundary
  fallback={<div>Something went wrong in this section</div>}
  onError={(error, errorInfo) => {
    // Custom error handling
    sendToCustomService(error, errorInfo);
  }}
>
  <ProblematicComponent />
</ErrorBoundary>
```

## 4. API Logging Integration

All API calls are automatically logged with the enhanced logger:

```
[API] [2026-01-29T10:30:00Z] → POST /api/products/
[API] [2026-01-29T10:30:01Z] ← 200 /api/products/
[API] [2026-01-29T10:31:00Z] ❌ Error | 401 /api/orders/ - Token expired
[API] [2026-01-29T10:31:01Z] ✅ Token refreshed successfully
[API] [2026-01-29T10:31:01Z] ← 200 /api/orders/ (retried)
```

## 5. Performance Monitoring

```typescript
import { usePerformanceTracking } from '@/lib/hooks/useErrorTracking';

function MyComponent() {
  const { trackSlowOperation, trackMemoryUsage } = usePerformanceTracking();

  const handleLargeDataFetch = async () => {
    const start = performance.now();

    const data = await fetchLargeDataset();

    const duration = performance.now() - start;
    trackSlowOperation('fetch_dataset', duration, 2000); // Alert if > 2 seconds

    trackMemoryUsage(); // Check if memory usage is high
  };
}
```

## Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_ENABLE_SENTRY=false
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NODE_ENV=development
```

### Logger Configuration

```typescript
// Default configuration (already set in src/lib/services/logger.ts)
{
  enableConsole: true,           // Log to console
  enableStorage: true,           // Store logs in localStorage
  enableSentry: false,           // Disabled until Sentry DSN is set
  maxLogSize: 500,               // Keep 500 logs max
  logLevel: 'debug',             // In dev: debug, In prod: warn
  environment: 'development',
  sentryDsn: undefined,
}
```

## Data Privacy & Storage

### What Gets Logged

✅ API endpoints and methods
✅ HTTP status codes
✅ User email (for auth events)
✅ Product IDs
✅ Order IDs
✅ Search queries
✅ Error messages and stack traces

### What Doesn't Get Logged

❌ Passwords
❌ Credit card numbers
❌ Personal addresses (only country/state)
❌ Sensitive user data
❌ API keys or tokens

### Storage

- **Browser**: `localStorage['app_logs']` - Last 500 logs, ~2-5 MB
- **Memory**: Session logs in `logger.logs[]` array
- **Cleared**: When user logs out via `logger.clearLogs()`

## Debugging & Support

### Getting Logs for Support

```typescript
// In browser console:
copy(JSON.parse(localStorage.getItem('app_logs'))); // Copy logs to clipboard

// Or programmatically:
import { logger } from '@/lib/services/logger';
const logs = logger.exportLogs();
// Share this JSON with support
```

### Example: Debugging a Failed Order

1. Open DevTools Console
2. Run: `copy(logger.getRecentLogs(30))`
3. Paste into support ticket
4. Look for: checkout_started → checkout_completed or error events
5. Check API logs for failed requests

## Roadmap Integration

This logging system is ready for:

1. **Session Monitoring Dashboard** (#2 todo)

   - Real-time log visualization
   - Error rate tracking
   - Performance metrics

2. **Device Management** (#3 todo)

   - Track device info from logs
   - Session timeline per device
   - Suspicious activity alerts

3. **Risk-Based Authentication** (#4 todo)
   - Analyze error patterns
   - Detect brute force attempts
   - Location-based anomalies

## Testing the System

### Quick Test in Browser Console

```javascript
// Test logger
logger.auth('Test login', { email: 'test@example.com' });
logger.api('Test API call');
logger.error('Test error', new Error('test error'));

// View logs
logger.getLogs();
logger.getRecentLogs(5);

// Test analytics
analytics.trackPageView('test_page');
analytics.trackProductInteraction('viewed', 'test_product_123');
analytics.getSessionMetrics();

// Export
console.log(logger.exportLogs());
console.log(analytics.exportSessionData());
```

### Verification Checklist

- [ ] Console shows `[API]`, `[AUTH]`, `[ERROR]` prefixed logs
- [ ] Logs appear in `localStorage['app_logs']`
- [ ] Page view tracked on navigation
- [ ] Product interaction tracked on button click
- [ ] Errors appear in error logs
- [ ] Session metrics calculated correctly
- [ ] Logs clear on logout
- [ ] Export format is valid JSON

## Production Setup (Next Steps)

1. **Enable Sentry**

   ```env
   NEXT_PUBLIC_ENABLE_SENTRY=true
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   ```

2. **Send to Backend**

   - Implement `sendEventsToBackend()` in analytics service
   - Create API endpoint: `POST /api/analytics/events`

3. **Setup Dashboard** (Todo #2)
   - Create visualization for logs
   - Real-time metrics display
   - Error alerting

## Questions or Issues?

Check the console for `[DEBUG]` logs with detailed information about what's happening.
Export logs with `logger.exportLogs()` and `analytics.exportSessionData()` for troubleshooting.
