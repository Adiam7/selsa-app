# Session & Authentication Configuration

## Overview

This document describes the session timeout and token refresh strategy implemented for Selsa e-commerce platform.

## Configuration Summary

### Session Timeouts

- **Session Max Age**: 24 hours
- **Session Update Age**: 12 hours (refresh halfway through)
- **JWT Max Age**: 24 hours
- **Reasoning**: Standard for e-commerce platforms, balances user convenience with security

### Token Refresh Strategy

- **Automatic refresh**: Every 12 hours via NextAuth's `updateAge`
- **On-demand refresh**: When token is within 30 seconds of expiry (JWT callback)
- **Failed token handling**: Redirect to login if refresh fails
- **Fallback**: Redirect to login if refresh fails

## Implementation Details

### 1. Session Timeout Configuration (`src/lib/auth.ts`)

```typescript
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60,      // 24 hours
  updateAge: 12 * 60 * 60,   // Refresh every 12 hours
}

jwt: {
  maxAge: 24 * 60 * 60,      // Match session timeout
}
```

**Why 24 hours?**

- Users can shop all day without forced re-login
- Standard for Shopify, WooCommerce, BigCommerce
- Still maintains security with server-side token validation
- Reduces support tickets from unexpected logouts

### 2. Comprehensive Logging (`src/lib/auth.ts`)

Event handlers now track all authentication changes:

```
[AUTH] ✅ Sign in | User: user@example.com | Provider: credentials | Type: returning | Time: 2026-01-29T10:30:00Z
[AUTH] 👋 Sign out | User: user@example.com | Time: 2026-01-29T18:30:00Z
[AUTH] ❌ Error | Code: Invalid credentials | Time: 2026-01-29T10:31:00Z
```

**What's logged:**

- User email and authentication provider
- New vs returning user
- Exact timestamp (ISO 8601 format)
- Error messages with context

**Monitored in production:**

- Sentry for error tracking (TODO)
- Analytics service for user behavior (TODO)

### 3. API Client Auth (`src/lib/api/client.ts`)

Axios requests are authenticated via the active NextAuth session:

- Authorization header is derived from `getSession()` (cookie-backed NextAuth session/JWT)
- Refresh/rotation happens inside the NextAuth JWT callback + server-side refresh route
- **No access/refresh tokens are persisted in** `localStorage` **or** `sessionStorage`

### Logging Format

All API logs use consistent format: `[API] [TIMESTAMP] MESSAGE`

Examples:

```
[API] [2026-01-29T10:30:00Z] → POST /api/products/
[API] [2026-01-29T10:30:01Z] ← 200 /api/products/
[API] [2026-01-29T10:35:00Z] 🔄 Token expired (401), attempting refresh...
[API] [2026-01-29T10:35:00Z] 📤 Sending refresh request to backend
[API] [2026-01-29T10:35:01Z] ✅ Token refreshed successfully
[API] [2026-01-29T10:35:01Z] 🔁 Retrying original request with new token
```

## Testing Checklist

### Session Persistence

- [ ] Login → Browse for 1 hour → Verify still authenticated
- [ ] Login → Leave tab in background → Return to tab → Should not be logged out
- [ ] Login → Open DevTools → Confirm NO `access_token`/`refresh_token` in localStorage/sessionStorage
- [ ] Login → Open DevTools → Verify API requests include `Authorization: Bearer ...` (if the endpoint uses JWT auth)

### Automated Regression Check

- [ ] Run `pnpm audit:tokens` (or from repo root: `npm run audit:tokens`) to ensure no auth tokens are ever read/written/removed from browser storage in source.

### Token Refresh

- [ ] Monitor Network tab while logged in
- [ ] Around 12-hour mark, should see refresh request
- [ ] Verify new token is different from old token
- [ ] Original request should be retried with new token

### Error Handling

- [ ] Sign out (or clear site cookies) → Try API call → Should redirect to login
- [ ] Disable network → Make API call → Wait for timeout → Should show error
- [ ] Intentionally expire token → Make API call → Should refresh and retry
- [ ] Refresh token invalid → Should redirect to login with `?error=session_expired`

### Logging

- [ ] Open DevTools Console → Login → Check logs format
- [ ] Verify `[AUTH]` and `[API]` prefixes appear
- [ ] Check timestamps are ISO 8601 format
- [ ] Verify no sensitive data (passwords) are logged

## Monitoring & Alerts

### Key Metrics to Monitor

1. **401 Error Rate**: Should be low (< 0.1%)
2. **Token Refresh Success Rate**: Should be high (> 99%)
3. **Session Duration**: Average session should be 1-4 hours
4. **Failed Refresh Redirects**: Should be rare (< 0.01%)

### Production Setup (TODO)

- [ ] Send auth events to analytics platform
- [ ] Send errors to Sentry/error tracking
- [ ] Create dashboard for session metrics
- [ ] Set up alerts for unusual patterns

## Troubleshooting

### User keeps getting logged out

1. Check if `maxAge` matches backend token lifetime
2. Verify the NextAuth session cookie exists (DevTools → Application → Cookies)
3. Check browser console for `[API] ❌` errors
4. Verify backend `/api/accounts/auth/refresh/` endpoint returns a valid token when invoked via the app session

### Token refresh failing

1. Verify the user has an active NextAuth session (DevTools → Application → Cookies)
2. Check backend refresh endpoint: POST `/api/accounts/auth/refresh/`
3. Look for 401 or 5xx errors in Network tab
4. Check backend logs for refresh handler errors

### CORS errors with refresh

1. Ensure backend allows refresh endpoint from frontend origin
2. Verify `withCredentials: true` in axios config
3. Check CORS headers on backend refresh endpoint

## Comparison with Industry Standards

| Platform             | Session Timeout | Update Frequency  |
| -------------------- | --------------- | ----------------- |
| **Amazon**           | 24+ hours       | Auto-refresh      |
| **Shopify**          | 24 hours        | Every 12 hours    |
| **WooCommerce**      | 24-48 hours     | Variable          |
| **Stripe Dashboard** | 15-24 hours     | Per-request       |
| **PayPal**           | 30 minutes      | Per-request       |
| **Gmail**            | 30 days         | On-demand         |
| **Selsa (Now)**      | 24 hours ✅     | Every 12 hours ✅ |

## Future Improvements

1. **Session Monitoring Dashboard**
   - Real-time active sessions count
   - Session duration distribution
   - Token refresh success metrics

2. **Device Management**
   - "Remember This Device" option
   - Logout from other devices
   - Session activity timeline

3. **Risk-Based Authentication**
   - Shorter timeouts for suspicious activity
   - Require re-auth for sensitive operations
   - Location-based timeout adjustments

4. **Advanced Logging**
   - Detailed request/response bodies (sanitized)
   - Failed operation tracking
   - User journey analytics

## Related Files

- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/api/client.ts` - API client and request/response handling
- `src/app/auth/login/page.tsx` - Login UI
- Backend: Django DRF token settings

## Questions?

If you encounter issues with sessions or token refresh, check:

1. Browser DevTools Console for `[AUTH]` logs
2. Network tab for refresh requests
3. LocalStorage for token persistence
4. Backend logs for API errors
