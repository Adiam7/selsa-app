# Integration Guide - Risk-Based Authentication System

## Quick Start

### Step 1: Use Enhanced Login Form

Replace your current login form with the enhanced version:

```typescript
// src/app/auth/login/page.tsx
'use client';

import EnhancedLoginForm from '@/components/forms/EnhancedLoginForm';

export default function LoginPage() {
  return <EnhancedLoginForm />;
}
```

### Step 2: Add Device Tracking to App

Initialize device tracking in your main layout or app component:

```typescript
'use client';

import { useDeviceTracking } from '@/lib/hooks/useDeviceManagement';

export default function RootLayout({ children }) {
  // Initialize device tracking on app start
  useDeviceTracking();

  return <>{children}</>;
}
```

### Step 3: Add Session Monitoring

Add session monitoring to your main layout:

```typescript
'use client';

import { useSessionSecurityMonitoring } from '@/lib/hooks/useRiskBasedAuth';
import { useSession } from 'next-auth/react';

export default function RootLayout({ children }) {
  const { data: session } = useSession();

  // Monitor session security
  useSessionSecurityMonitoring(session?.sessionId);

  return <>{children}</>;
}
```

### Step 4: Add Timeout Warning

Add session timeout warning component to your layout:

```typescript
'use client';

import { useDynamicTimeout } from '@/lib/hooks/useRiskBasedAuth';
import { SessionTimeoutWarning } from '@/components/auth/RiskBasedAuthUI';
import { useSession } from 'next-auth/react';

export default function RootLayout({ children }) {
  const { data: session } = useSession();
  const { timeRemaining, showWarning, extendSession } = useDynamicTimeout(session?.sessionId);

  return (
    <>
      {showWarning && (
        <SessionTimeoutWarning
          timeRemaining={timeRemaining}
          onExtend={() => extendSession()}
          onLogout={() => signOut()}
        />
      )}
      {children}
    </>
  );
}
```

### Step 5: Add Admin Dashboard Link

Add a link to the admin risk monitoring dashboard:

```tsx
// In your admin navbar
<Link href="/admin/risk-monitoring">
  <ShieldAlert size={18} />
  Risk Monitoring
</Link>
```

---

## Component Integration Examples

### Example 1: Show Risk Assessment in Login Error

```typescript
function LoginComponent() {
  const { riskAssessmentData, loginError } = useRiskBasedLogin();

  return (
    <>
      {loginError && <ErrorAlert message={loginError} />}
      {riskAssessmentData && (
        <RiskAssessmentCard assessment={riskAssessmentData} />
      )}
      <LoginForm />
    </>
  );
}
```

### Example 2: Show User's Devices

```typescript
function AccountSettings() {
  const { devices } = useAllDevices();

  return (
    <div>
      <h2>Your Devices</h2>
      <DeviceList devices={devices} />
    </div>
  );
}
```

### Example 3: Monitor Active Sessions

```typescript
function SecurityCenter() {
  const { sessions, logoutFromOtherDevices } = useSessions();

  return (
    <div>
      <h2>Active Sessions</h2>
      <ActiveSessions sessions={sessions} />
      <button onClick={logoutFromOtherDevices}>
        Logout From All Other Devices
      </button>
    </div>
  );
}
```

### Example 4: Show Risk Status

```typescript
function DashboardHeader() {
  const { risk } = useRiskAssessment();

  if (!risk) return null;

  return (
    <div>
      <RiskBadge riskLevel={risk.riskLevel} score={risk.totalScore} />
    </div>
  );
}
```

---

## API Integration (Backend)

### Endpoints to Create

```typescript
// 1. POST /api/auth/assess-risk
// Input: { context: RiskContext }
// Output: { assessment: RiskAssessment }

// 2. POST /api/auth/verify-challenge
// Input: { challengeId: string, code: string }
// Output: { verified: boolean, sessionToken: string }

// 3. POST /api/auth/record-attempt
// Input: { email: string, ipAddress: string, success: boolean }
// Output: { recorded: boolean }

// 4. GET /api/auth/risk-status
// Input: { sessionId: string }
// Output: { riskLevel: RiskLevel, timeout: number }

// 5. GET /api/admin/risk-metrics
// Input: { dateRange: string }
// Output: { statistics: Statistics, patterns: Pattern[] }

// 6. POST /api/admin/unlock-account
// Input: { email: string }
// Output: { unlocked: boolean }

// 7. POST /api/admin/remove-ip-blacklist
// Input: { ipAddress: string }
// Output: { removed: boolean }
```

### Backend Implementation Pattern

```typescript
// pages/api/auth/assess-risk.ts
import { riskAssessment } from '@/lib/services/riskAssessment';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const assessment = riskAssessment.assess(req.body.context);

  // Log to database
  await db.riskAssessments.create({
    userId: req.body.userId,
    assessment,
    timestamp: new Date(),
  });

  res.status(200).json({ assessment });
}
```

---

## Data Persistence

### LocalStorage Keys

The system uses these localStorage keys:

```typescript
localStorage.getItem('device_id'); // Current device fingerprint
localStorage.getItem('trusted_devices'); // List of trusted device IDs
sessionStorage.getItem('device_session_id'); // Current session ID
localStorage.getItem('logs'); // Application logs
localStorage.getItem('analytics_sessions'); // User journey data
```

### Moving to Database

To persist data to database, modify services:

```typescript
// Example: Modify deviceManager to save to database
class DeviceManager {
  registerDevice(userId: string) {
    const device = {
      deviceId: this.generateFingerprint(),
      // ... other properties
    };

    // Save to database
    await db.devices.create({ userId, ...device });

    return device;
  }
}
```

---

## Configuration for Different Scenarios

### Scenario 1: Strict Security (E-commerce)

```typescript
// Increase risk scores
UNTRUSTED_DEVICE_SCORE: 50; // Higher penalty
NEW_DEVICE_SCORE: 35; // Stricter for new devices

// Reduce timeouts
LOW_RISK_TIMEOUT: 480; // 8 hours instead of 24
CRITICAL_RISK_TIMEOUT: 5; // 5 minutes instead of 15

// Stricter brute force
MAX_ATTEMPTS_PER_HOUR: 3; // 3 instead of 5
LOCKOUT_DURATION: 30; // 30 minutes instead of 15
```

### Scenario 2: User-Friendly (Internal Tools)

```typescript
// Reduce risk scores
UNTRUSTED_DEVICE_SCORE: 20; // Lower penalty
NEW_DEVICE_SCORE: 10; // Lenient for new devices

// Increase timeouts
LOW_RISK_TIMEOUT: 2880; // 48 hours instead of 24
MEDIUM_RISK_TIMEOUT: 1440; // 24 hours instead of 8

// Lenient brute force
MAX_ATTEMPTS_PER_HOUR: 10; // 10 instead of 5
LOCKOUT_DURATION: 5; // 5 minutes instead of 15
```

### Scenario 3: Balanced (SaaS)

```typescript
// Default settings are already balanced for most SaaS
// Just enable the system as-is
```

---

## Testing the System

### Manual Testing Checklist

```
Login Flow:
[ ] Login with correct credentials - no challenge
[ ] Login with incorrect password - shows error
[ ] 5 failed attempts - account locks
[ ] Try login while locked - shows lockout message
[ ] Wait for unlock time - can login again

Risk Assessment:
[ ] New device login - medium risk, email challenge
[ ] Unusual location login - high risk, email+OTP
[ ] Same device login - low risk, no challenge
[ ] Impossible travel - critical risk, forced re-auth

Device Management:
[ ] View devices list - shows current and past devices
[ ] Trust device - reduces risk score
[ ] Untrust device - increases risk score
[ ] Remove device - device disappears from list
[ ] Logout others - other sessions end

Admin Dashboard:
[ ] View metrics - shows login attempt stats
[ ] View patterns - shows suspicious login patterns
[ ] Export data - downloads JSON file
[ ] Auto-refresh - dashboard updates in real-time
[ ] Filter alerts - can filter by severity
```

### Automated Testing

```typescript
// Example test
describe('Risk Assessment', () => {
  it('should calculate risk for new device', () => {
    const assessment = riskAssessment.assess({
      isNewDevice: true,
      isTrusted: false,
      currentIpAddress: '203.0.113.45',
    });

    expect(assessment.riskLevel).toBe('medium');
    expect(assessment.totalScore).toBeGreaterThan(40);
  });
});
```

---

## Monitoring in Production

### Key Metrics to Track

```typescript
// Metrics to monitor in production
1. Login Success Rate
   - Healthy: > 85%
   - Warning: 70-85%
   - Critical: < 70%

2. Brute Force Attempts
   - Normal: < 10 per hour
   - Warning: 10-50 per hour
   - Critical: > 50 per hour

3. High-Risk Logins
   - Normal: < 5% of logins
   - Warning: 5-20% of logins
   - Critical: > 20% of logins

4. Account Lockouts
   - Normal: < 1 per day per 1000 users
   - Warning: 1-5 per day per 1000 users
   - Critical: > 5 per day per 1000 users

5. Session Timeout Rate
   - Normal: < 30% of sessions
   - Warning: 30-50% of sessions
   - Critical: > 50% of sessions
```

### Alerts to Set Up

```
High Priority:
[ ] Impossible travel detected
[ ] 100+ failed attempts per hour
[ ] Multiple accounts locked
[ ] IP blacklist growing

Medium Priority:
[ ] High-risk login rate > 20%
[ ] Unusual geographic pattern
[ ] Device fingerprint spoofing detected
[ ] Challenge failure rate > 30%

Low Priority:
[ ] Session timeout warnings
[ ] New device registrations
[ ] Device trust changes
[ ] Challenge attempts
```

---

## Troubleshooting Integration

### Issue: Challenges Not Sending

```typescript
// Check email service is configured
// In authChallenge.ts:
private sendEmailChallenge(challenge: Challenge) {
  // Ensure email service is called here
  await emailService.send({
    to: challenge.email,
    subject: 'Verification Code',
    body: `Your code: ${verificationCode}`,
  });
}
```

### Issue: Risk Scores Always High

```typescript
// Check context is complete
// Ensure you're passing:
{
  deviceId: getCurrentDeviceId(),
  currentIpAddress: getUserIp(),
  isNewDevice: checkIfNewDevice(),
  // All fields should be provided
}
```

### Issue: Device Not Fingerprinting

```typescript
// Canvas API might be blocked
// Add fallback:
try {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // Generate fingerprint
} catch (e) {
  // Use user agent fallback
  const hash = hashUserAgent(navigator.userAgent);
}
```

### Issue: Session Timeout Too Aggressive

```typescript
// Increase base timeout
private readonly LOW_RISK_TIMEOUT = 2880;  // 48 hours
private readonly MEDIUM_RISK_TIMEOUT = 1440; // 24 hours
private readonly HIGH_RISK_TIMEOUT = 480;   // 8 hours
private readonly CRITICAL_RISK_TIMEOUT = 60; // 1 hour
```

---

## Performance Optimization

### Optimize Risk Assessment

```typescript
// Cache risk assessments for repeated users
const riskCache = new Map<string, RiskAssessment>();

function assessRiskCached(context: RiskContext) {
  const cacheKey = `${context.email}:${context.ipAddress}`;
  const cached = riskCache.get(cacheKey);

  if (cached && isCacheValid(cached)) {
    return cached;
  }

  const assessment = riskAssessment.assess(context);
  riskCache.set(cacheKey, assessment);
  return assessment;
}
```

### Optimize Device Fingerprinting

```typescript
// Cache fingerprinting result
const fpCache = localStorage.getItem('device_fingerprint');
if (fpCache) {
  return fpCache;
}

const fingerprint = generateFingerprint();
localStorage.setItem('device_fingerprint', fingerprint);
return fingerprint;
```

### Optimize Dashboard Queries

```typescript
// Limit data in dashboard
function getDashboardData() {
  // Only get last 24 hours
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return bruteForceDetection
    .getAttemptPatterns()
    .filter((p) => new Date(p.lastAttempt).getTime() > cutoff);
}
```

---

## Security Checklist

Before deploying to production:

```
API Security:
[ ] All endpoints require authentication
[ ] Rate limiting enabled (e.g., 100 req/min)
[ ] HTTPS/TLS enforced
[ ] CORS configured properly
[ ] Input validation on all endpoints
[ ] SQL injection prevention

Data Security:
[ ] Passwords hashed (bcrypt/argon2)
[ ] Sensitive data encrypted
[ ] PII not logged
[ ] GDPR compliance checked
[ ] Data retention policy set
[ ] Backups encrypted

Session Security:
[ ] Session cookies HttpOnly flag set
[ ] Session cookies Secure flag set (HTTPS only)
[ ] Session cookies SameSite=Strict
[ ] Session tokens not in URLs
[ ] CSRF tokens on forms
[ ] Cross-origin request headers validated

Admin Access:
[ ] Admin endpoints require 2FA
[ ] Admin actions logged
[ ] Admin IP whitelist (optional)
[ ] Audit trails maintained
[ ] Regular access reviews

Monitoring:
[ ] Error logging enabled
[ ] Performance monitoring
[ ] Security alerts configured
[ ] Incident response plan
[ ] Regular security audits
```

---

## Going Live

### Rollout Plan

**Phase 1: Dev/Staging** (1 week)

- Deploy enhanced login
- Test all scenarios
- Fix any issues
- Load test

**Phase 2: Beta Users** (1 week)

- Roll out to 10% of users
- Monitor error rate
- Gather feedback
- Adjust settings

**Phase 3: Full Production** (gradual)

- Week 1: 25% of users
- Week 2: 50% of users
- Week 3: 75% of users
- Week 4: 100% of users

**Phase 4: Monitor & Optimize** (ongoing)

- Monitor metrics
- Adjust risk thresholds
- Optimize performance
- Regular security audits

---

## Support Resources

**Documentation:**

- RISK_BASED_AUTH_GUIDE.md - Complete feature guide
- DEVICE_MANAGEMENT_GUIDE.md - Device system guide
- DASHBOARD_GUIDE.md - Dashboard guide
- ADVANCED_LOGGING_GUIDE.md - Logging guide
- IMPLEMENTATION_SUMMARY.md - Overall summary

**Code Examples:**

- src/components/forms/EnhancedLoginForm.tsx - Full login integration
- src/components/auth/RiskBasedAuthUI.tsx - UI component examples
- src/components/dashboard/RiskMonitoringDashboard.tsx - Admin dashboard

**Services:**

- src/lib/services/riskAssessment.ts - Risk scoring
- src/lib/services/bruteForceDetection.ts - Brute force detection
- src/lib/services/authChallenge.ts - Challenge handling
- src/lib/services/dynamicTimeout.ts - Timeout management

---

## Next Steps

1. ✅ Review the integration guide (this file)
2. ✅ Replace login form with EnhancedLoginForm
3. ✅ Add device tracking initialization
4. ✅ Add session monitoring
5. ✅ Add admin dashboard link
6. ✅ Test all scenarios
7. ✅ Set up monitoring and alerts
8. ✅ Plan rollout
9. ✅ Deploy to production
10. ✅ Monitor and optimize

**You're ready to go live!**
