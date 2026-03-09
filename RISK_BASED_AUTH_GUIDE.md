# Risk-Based Authentication System Documentation

## Overview

Risk-Based Authentication (RBA) is an advanced security system that adapts authentication requirements based on the assessed risk of each login attempt. This prevents unauthorized access while maintaining user experience for legitimate users.

**Key Features:**

- 🎯 Risk scoring system (0-100 scale)
- 🔍 Brute force detection and prevention
- ⏱️ Dynamic session timeouts
- 🔐 Layered authentication challenges
- 📊 Real-time monitoring and alerts

---

## 1. Risk Assessment System

### How Risk is Calculated

Risk scores are calculated from multiple factors:

```
Total Risk = (Device Trust × 15%) + (Location × 25%) +
             (Login Attempts × 20%) + (Behavior × 20%) +
             (Network × 20%)
```

### Risk Levels and Thresholds

| Level        | Score  | Action             | Timeout    |
| ------------ | ------ | ------------------ | ---------- |
| **Low**      | 0-39   | Allow              | 24 hours   |
| **Medium**   | 40-59  | Optional challenge | 8 hours    |
| **High**     | 60-79  | Challenge required | 2 hours    |
| **Critical** | 80-100 | Reauth + challenge | 15 minutes |

### Risk Factors

#### Device Trust (15% weight)

```typescript
-10  points: Device marked as trusted
  0  points: Unknown device
+25  points: New device
+35  points: Untrusted device
```

#### Location (25% weight)

```typescript
-5   points: Long-term device (6+ months)
  0  points: Location unchanged
+20  points: Geographic change (<100km)
+40  points: Large geographic change (>500km)
+90  points: Impossible travel detection
+30  points: Unusual country for user
```

#### Login Attempts (20% weight)

```typescript
+15  points: 1 failed attempt
+40  points: 2-3 failed attempts
+80  points: 4+ failed attempts
        Lock: 5+ attempts → Account locked
```

#### Behavior (20% weight)

```typescript
+20  points: Unusual time of day
+15  points: Extended absence (>30 days)
  0  points: Normal login pattern
```

#### Network (20% weight)

```typescript
+15  points: IP address changed
+20  points: Proxy detected
+25  points: VPN detected
+45  points: Tor network detected
```

### Usage Example

```typescript
import { useRiskAssessment } from '@/lib/hooks/useRiskBasedAuth';

function LoginForm() {
  const { assessRisk } = useRiskAssessment();

  const handleLogin = async (email: string, password: string) => {
    // Assess risk
    const assessment = assessRisk({
      deviceId: 'dev_abc123',
      isTrusted: false,
      isNewDevice: true,
      currentIpAddress: '203.0.113.45',
      previousIpAddress: '203.0.113.10',
      currentLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
        country: 'US',
      },
      previousLocation: {
        latitude: 40.7128,
        longitude: -74.006,
        country: 'US',
      },
    });

    console.log(`Risk: ${assessment.riskLevel} (${assessment.totalScore})`);
    console.log(`Factors:`, assessment.factors);

    if (assessment.requiresChallenge) {
      // Show additional verification
    }
  };
}
```

---

## 2. Brute Force Detection

### How It Works

- Tracks failed attempts per email and IP address
- Implements progressive lockout (lockout duration doubles each time)
- Detects distributed attacks across multiple IPs
- Auto-expires old attempts (>24 hours)

### Thresholds

```typescript
const config = {
  MAX_ATTEMPTS_PER_HOUR: 5, // Max failures per hour per email
  MAX_ATTEMPTS_PER_DAY: 20, // Max failures per day per email
  LOCKOUT_DURATION: 15, // Initial lockout: 15 minutes
  PROGRESSIVE_MULTIPLIER: 2, // Each lock doubles duration
  IP_BLACKLIST_DURATION: 24, // IP blacklist: 24 hours
};
```

### Lockout Progression

```
1st lockout:  15 minutes
2nd lockout:  30 minutes (15 × 2)
3rd lockout:  60 minutes (30 × 2)
4th lockout: 120 minutes (60 × 2)
```

### Usage Example

```typescript
import { useBruteForceDetection } from '@/lib/hooks/useRiskBasedAuth';

function LoginForm() {
  const { recordAttempt, canAttemptLogin } = useBruteForceDetection();

  const handleLogin = async (
    email: string,
    password: string,
    ipAddress: string
  ) => {
    // Check if login is allowed
    const canLogin = canAttemptLogin(email, ipAddress);
    if (canLogin.shouldLockAccount) {
      throw new Error(canLogin.message);
    }

    // Attempt login
    const success = await authenticateUser(email, password);

    // Record attempt
    recordAttempt(email, ipAddress, success, navigator.userAgent);
  };
}
```

---

## 3. Dynamic Session Timeouts

### Timeout Calculation

Session timeout is adjusted based on risk level:

```typescript
baseTimeout = 1440 minutes (24 hours)

timeout = baseTimeout × multiplier × adjustments

where:
  multiplier = {
    low: 1.0,       // 24 hours
    medium: 0.33,   // 8 hours
    high: 0.08,     // 2 hours
    critical: 0.01, // 15 minutes
  }
```

### Additional Adjustments

```typescript
Trusted device:       × 1.2 (+20%)
New device:          × 0.7 (-30%)
Long-term (6+ mo):   × 1.15 (+15%)
Unusual location:    × 0.5 (-50%)
VPN detected:        × 0.8 (-20%)
```

### Example Timeouts

```
Low risk, trusted device:     24 hours
Medium risk, new device:      5.3 hours
High risk, unusual location:  1 hour
Critical risk:                15 minutes
```

### Usage Example

```typescript
import { useDynamicTimeout } from '@/lib/hooks/useRiskBasedAuth';

function SessionManager({ sessionId }: { sessionId: string }) {
  const {
    timeout,
    timeRemaining,
    showWarning,
    calculateTimeout,
    extendSession
  } = useDynamicTimeout(sessionId);

  // Calculate timeout based on risk
  const handleRiskAssessment = (risk) => {
    calculateTimeout(risk.riskLevel, {
      isTrustedDevice: risk.isTrusted,
      isUnusualLocation: risk.isUnusualLocation,
    });
  };

  // Show warning when time is running out
  if (showWarning) {
    return <SessionTimeoutWarning
      timeRemaining={timeRemaining}
      onExtend={extendSession}
      onLogout={() => logout()}
    />;
  }
}
```

---

## 4. Authentication Challenges

### Challenge Types

| Type                   | Delivery          | When               | Strength  |
| ---------------------- | ----------------- | ------------------ | --------- |
| **Email**              | Email             | High/Critical risk | Medium    |
| **OTP**                | SMS               | High risk          | High      |
| **TOTP**               | Authenticator app | Critical risk      | Very High |
| **CAPTCHA**            | Display widget    | Suspicious pattern | Low       |
| **Security Questions** | Display           | Medium risk        | Low       |
| **Re-auth**            | Password form     | Critical risk      | High      |

### Challenge Rules

```typescript
Low risk:      No challenge
Medium risk:   Email challenge (if not trusted)
High risk:     Email challenge required
Critical risk: Email + OTP challenge
```

### Challenge Configuration

```typescript
const config = {
  CHALLENGE_EXPIRY: 10, // 10 minutes
  MAX_ATTEMPTS: 3, // 3 verification attempts
  EMAIL_COOLDOWN: 60, // 60 seconds between resends
};
```

### Usage Example

```typescript
import { useAuthChallenge } from '@/lib/hooks/useRiskBasedAuth';

function LoginFlow() {
  const { createChallenge, verifyChallenge, needsChallenge } =
    useAuthChallenge();

  const handleLogin = async (email: string, password: string) => {
    // ... validate credentials

    // Check if challenge needed
    const requiredChallenges = needsChallenge('high', false);
    if (requiredChallenges.length > 0) {
      // Create email challenge
      const challenge = createChallenge(sessionId, 'email', email);

      // User enters code from email
      const result = await verifyChallenge(challenge.id, userCode);

      if (!result.verified) {
        throw new Error(result.message);
      }
    }
  };
}
```

---

## 5. Complete Login Flow

### Implementation Pattern

```typescript
import { useRiskBasedLogin } from '@/lib/hooks/useRiskBasedAuth';

function LoginPage() {
  const {
    isLoading,
    loginError,
    requiresChallenge,
    riskAssessmentData,
    attemptLogin
  } = useRiskBasedLogin();

  const handleSubmit = async (email: string, password: string) => {
    const result = await attemptLogin(email, password, {
      deviceId: getDeviceId(),
      isTrusted: isDeviceTrusted(),
      currentIpAddress: getUserIp(),
      currentLocation: getUserLocation(),
    });

    if (result.success) {
      // Login successful
      redirectToDashboard();
    } else if (result.requiresChallenge) {
      // Show challenge UI
      showChallengeModal();
    } else {
      // Show error
      showError(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {loginError && <ErrorAlert message={loginError} />}
      {riskAssessmentData && !result.success && (
        <RiskAssessmentCard assessment={riskAssessmentData} />
      )}
      {/* Form fields */}
    </form>
  );
}
```

### Step-by-Step Flow

```
1. User enters email/password
   ↓
2. Check brute force limits
   ├─ If locked → Show lockout message
   └─ Continue
   ↓
3. Validate password
   ├─ If invalid → Record failed attempt → Show error
   └─ Continue
   ↓
4. Assess risk level
   ↓
5. Determine challenges needed
   ├─ If yes → Create challenges → Show challenge UI
   │   ├─ User verifies
   │   └─ Create new session token
   └─ Continue
   ↓
6. Calculate session timeout
   ↓
7. Create session
   ↓
8. Record successful attempt
   ↓
9. Redirect to dashboard
```

---

## 6. UI Components

### RiskBadge

Display risk level with visual indicator:

```tsx
<RiskBadge riskLevel="high" score={65} />
// Output: [⚠️ HIGH (65)]
```

### RiskAssessmentCard

Detailed card showing risk factors:

```tsx
<RiskAssessmentCard assessment={riskData} onDismiss={handleDismiss} />
```

Features:

- Risk score progress bar
- Detailed factor list
- Recommendations per factor
- Challenge requirement notice

### SessionTimeoutWarning

Alert user before session expires:

```tsx
<SessionTimeoutWarning
  timeRemaining={15}
  onExtend={handleExtend}
  onLogout={handleLogout}
/>
```

Appears 1 hour before timeout, then every minute.

### AuthChallengeModal

Modal for verification code entry:

```tsx
<AuthChallengeModal
  challenge={challenge}
  onVerify={handleVerify}
  onResend={handleResend}
  isVerifying={isVerifying}
  error={error}
/>
```

Supports:

- Email/OTP code entry
- Resend code functionality
- Attempt counter
- Error messages

### RiskWarningBanner

Inline warning banner:

```tsx
<RiskWarningBanner
  riskLevel="critical"
  message="This login appears suspicious. Additional verification required."
/>
```

### BruteForceAlert

Alert for brute force protection:

```tsx
<BruteForceAlert failedAttempts={4} maxAttempts={5} lockDuration={15} />
```

### SessionHealthIndicator

Monitor session security:

```tsx
<SessionHealthIndicator
  health="warning"
  alerts={['High ratio of failed attempts', 'Unusual login time detected']}
/>
```

---

## 7. API Integration

### Endpoints Needed

```typescript
// POST /api/auth/login
Request: { email, password }
Response: {
  success: boolean,
  requiresChallenge: boolean,
  challengeId?: string,
  sessionToken?: string,
  riskAssessment?: RiskAssessment
}

// POST /api/auth/verify-challenge
Request: { challengeId, code }
Response: { verified: boolean, sessionToken: string }

// GET /api/auth/risk-assessment
Request: { context: RiskContext }
Response: { assessment: RiskAssessment }

// POST /api/auth/record-attempt
Request: { email, ipAddress, success, reason }
Response: { recorded: boolean }
```

---

## 8. Configuration

### Risk Thresholds

Edit `src/lib/services/riskAssessment.ts`:

```typescript
private readonly MAX_ATTEMPTS_PER_HOUR = 5;     // Change to 3 for stricter
private readonly LOCKOUT_DURATION_MINUTES = 15; // Change to 30 for longer
```

### Session Timeouts

Edit `src/lib/services/dynamicTimeout.ts`:

```typescript
private readonly LOW_RISK_TIMEOUT = 1440;      // 24 hours
private readonly MEDIUM_RISK_TIMEOUT = 480;    // 8 hours
private readonly HIGH_RISK_TIMEOUT = 120;      // 2 hours
private readonly CRITICAL_RISK_TIMEOUT = 15;   // 15 minutes
```

### Challenge Settings

Edit `src/lib/services/authChallenge.ts`:

```typescript
private readonly CHALLENGE_EXPIRY_MINUTES = 10; // Challenge valid for 10 mins
private readonly MAX_ATTEMPTS = 3;              // 3 tries to enter code
```

---

## 9. Best Practices

### For Developers

1. **Always track IP addresses**

   ```typescript
   const userIp =
     request.headers['x-forwarded-for'] || request.socket.remoteAddress;
   ```

2. **Use device IDs consistently**

   ```typescript
   // Same device = same fingerprint
   const fingerprint = deviceManager.generateDeviceFingerprint();
   ```

3. **Log failed attempts**

   ```typescript
   bruteForceDetection.recordAttempt(email, ip, false, userAgent);
   ```

4. **Implement challenge verification server-side**

   ```typescript
   // Never trust client-side verification
   const verified = await verifyCodeOnServer(code);
   ```

5. **Send emails asynchronously**
   ```typescript
   // Don't block login flow on email send
   sendVerificationEmailAsync(email, code);
   ```

### For Users

1. **Keep devices trusted list updated**

   - Remove old/sold devices
   - Review list monthly

2. **Use strong passwords**

   - 12+ characters
   - Mix of uppercase, lowercase, numbers, special chars

3. **Enable 2FA for critical-risk scenarios**

   - Unusual locations
   - Multiple failed attempts

4. **Watch for session timeout warnings**

   - Extend before timeout
   - Don't ignore security alerts

5. **Logout on public computers**
   - Always use "Logout from all devices"
   - Check device list after travel

---

## 10. Monitoring & Debugging

### Check Risk Assessment

```javascript
// In browser console:
import { riskAssessment } from '@/lib/services/riskAssessment';

const assessment = riskAssessment.assess({
  deviceId: 'dev_123',
  isTrusted: false,
  currentIpAddress: '203.0.113.45',
});

console.log(assessment);
```

### Check Brute Force Status

```javascript
import { bruteForceDetection } from '@/lib/services/bruteForceDetection';

bruteForceDetection.getStatistics();
// {
//   totalAttempts: 15,
//   failedAttempts: 3,
//   successfulAttempts: 12,
//   successRate: 80,
//   lockedAccountsCount: 1,
//   blacklistedIpsCount: 0
// }
```

### Check Session Timeout

```javascript
import { dynamicTimeout } from '@/lib/services/dynamicTimeout';

dynamicTimeout.getTimeout('session_123');
// {
//   baseTimeout: 1440,
//   adjustedTimeout: 120,
//   tokenRefreshInterval: 60,
//   inactivityWarning: 30,
//   riskLevel: 'high'
// }
```

### View All Active Timeouts

```javascript
const timeouts = dynamicTimeout.exportData();
console.log(timeouts.activeTimeouts);
```

---

## 11. Troubleshooting

### Users locked out

```typescript
// Unlock manually:
bruteForceDetection.unlockAccount('user@example.com');
```

### False positive risk assessment

```typescript
// Mark device as trusted:
deviceManager.trustDevice(deviceId);

// Reduces risk score by 10 points
```

### Challenge not sending

```typescript
// Check in browser console:
authChallenge.exportData();
// Look for challenge metadata with code
```

### Session timeout too short

```typescript
// Increase for medium risk:
MEDIUM_RISK_TIMEOUT: 1200; // Changed from 480 (8h)

// Increase for high risk:
HIGH_RISK_TIMEOUT: 240; // Changed from 120 (2h)
```

---

## 12. Example Scenarios

### Scenario 1: Trusted User, Normal Login

```
Risk Assessment:
  - Device trusted ✓
  - Location unchanged ✓
  - No failed attempts ✓

Result:
  - Risk Level: LOW (15)
  - Session Timeout: 24 hours
  - Challenge: None
  - Action: Allow
```

### Scenario 2: New Device, Different Country

```
Risk Assessment:
  - New device ⚠
  - Different country ⚠
  - No failed attempts ✓

Result:
  - Risk Level: MEDIUM (45)
  - Session Timeout: 8 hours
  - Challenge: Email verification
  - Action: Allow after challenge
```

### Scenario 3: Brute Force Attack

```
Risk Assessment:
  - 5 failed attempts ⚠⚠
  - From same IP ⚠
  - Account locked ⚠⚠

Result:
  - Risk Level: CRITICAL (85)
  - Session Timeout: N/A (locked)
  - Challenge: N/A
  - Action: Block, lock account 15 min
```

### Scenario 4: Impossible Travel

```
Risk Assessment:
  - Previous login: Tokyo
  - Current login: New York (10,000km)
  - Time: 5 minutes
  - Impossible travel ⚠⚠

Result:
  - Risk Level: CRITICAL (90)
  - Session Timeout: 15 minutes
  - Challenge: Email + OTP
  - Action: Force re-authentication
```

---

## 13. Security Considerations

### What Risk-Based Auth Does NOT Protect Against

- **Database breaches** - Password hashing required
- **Phishing attacks** - User education required
- **Compromised devices** - Malware detection required
- **Stolen session tokens** - HTTPS + secure cookies required

### What Risk-Based Auth DOES Protect Against

- ✓ Brute force attacks
- ✓ Credential stuffing
- ✓ Unauthorized access from unusual locations
- ✓ Distributed attacks from multiple IPs
- ✓ Account takeover from different devices

### Defense in Depth

Risk-Based Auth is one layer of defense:

```
Layer 1: Password strength (12+ char, hashed)
         ↓
Layer 2: Risk-based authentication (this system)
         ↓
Layer 3: 2FA/MFA (separate authenticator)
         ↓
Layer 4: Session security (HTTPS, secure cookies)
         ↓
Layer 5: Audit logging (track all actions)
```

---

## Questions?

Review implementation files:

- `src/lib/services/riskAssessment.ts` - Risk scoring
- `src/lib/services/bruteForceDetection.ts` - Brute force detection
- `src/lib/services/dynamicTimeout.ts` - Session timeouts
- `src/lib/services/authChallenge.ts` - Challenge system
- `src/lib/hooks/useRiskBasedAuth.ts` - React hooks
- `src/components/auth/RiskBasedAuthUI.tsx` - UI components
