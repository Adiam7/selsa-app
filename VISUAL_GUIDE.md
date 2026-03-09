# 🎨 Visual Architecture & Quick Reference Guide

---

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
├─────────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────────────────────────────────────────────────┐
│  │              ENHANCED LOGIN FORM                         │
│  │  ┌────────────────────────────────────────────────────┐  │
│  │  │  1. User enters email/password                    │  │
│  │  │  2. Risk assessment triggered                     │  │
│  │  │  3. Risk score calculated (0-100)                │  │
│  │  │  4. If risk high → Challenge modal shown         │  │
│  │  │  5. User completes challenge                     │  │
│  │  │  6. Session created                              │  │
│  │  └────────────────────────────────────────────────────┘  │
│  └──────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────┐
│  │           SERVICES (Client-Side)                         │
│  ├──────────────────────────────────────────────────────────┤
│  │                                                          │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  │ Risk Assessment │    │ Brute Force Detection       │ │
│  │  ├─────────────────┤    ├─────────────────────────────┤ │
│  │  │ • 5 factors     │    │ • Track attempts per email  │ │
│  │  │ • 0-100 score   │    │ • Track attempts per IP     │ │
│  │  │ • 4 risk levels │    │ • Progressive lockout       │ │
│  │  │ • Explanation   │    │ • IP blacklisting           │ │
│  │  └─────────────────┘    └─────────────────────────────┘ │
│  │                                                          │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  │ Dynamic Timeout │    │ Auth Challenge              │ │
│  │  ├─────────────────┤    ├─────────────────────────────┤ │
│  │  │ • Risk-adjusted │    │ • 6 challenge types         │ │
│  │  │ • 24h → 15m     │    │ • 10 min expiry             │ │
│  │  │ • Timer mgmt    │    │ • 3 attempt limit           │ │
│  │  │ • Extension     │    │ • Resend capability         │ │
│  │  └─────────────────┘    └─────────────────────────────┘ │
│  │                                                          │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  │ Device Manager  │    │ Logger & Analytics          │ │
│  │  ├─────────────────┤    ├─────────────────────────────┤ │
│  │  │ • Fingerprinting│    │ • 4 log levels              │ │
│  │  │ • Trust system  │    │ • 6 categories              │ │
│  │  │ • Anomalies     │    │ • Event tracking            │ │
│  │  │ • Timeline      │    │ • Metrics collection        │ │
│  │  └─────────────────┘    └─────────────────────────────┘ │
│  │                                                          │
│  └──────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────┐
│  │           UI COMPONENTS                                 │
│  ├──────────────────────────────────────────────────────────┤
│  │ • Risk Badge (color-coded)                              │
│  │ • Risk Assessment Card (expandable)                     │
│  │ • Session Timeout Warning                              │
│  │ • Auth Challenge Modal                                 │
│  │ • Risk Warning Banner                                  │
│  │ • Brute Force Alert                                    │
│  │ • Session Health Indicator                             │
│  └──────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────┐
│  │          DASHBOARDS (User & Admin)                      │
│  ├──────────────────────────────────────────────────────────┤
│  │ • Session Monitoring Dashboard (/dashboard)            │
│  │ • Device Management Page (/account/devices)            │
│  │ • Risk Monitoring Dashboard (/admin/risk-monitoring)   │
│  └──────────────────────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Login Flow Diagram

```
START: User Clicks Login
  │
  ├─→ [Form Validation]
  │    Email & password valid?
  │    ├─ NO  → Show error, stay on form
  │    └─ YES ↓
  │
  ├─→ [Gather Context]
  │    • Get user IP
  │    • Get device fingerprint
  │    • Get user agent
  │    ├─→ ↓
  │
  ├─→ [Risk Assessment]
  │    • Check device trust (15%)
  │    • Check location (25%)
  │    • Check login attempts (20%)
  │    • Check behavior (20%)
  │    • Check network (20%)
  │    • Calculate 0-100 score
  │    │
  │    ├─ Risk < 40 (LOW)      → Continue
  │    ├─ Risk 40-59 (MEDIUM)  → May need challenge
  │    ├─ Risk 60-79 (HIGH)    → Need challenge
  │    └─ Risk 80+ (CRITICAL)  → Require challenge
  │        ↓
  │
  ├─→ [Brute Force Check]
  │    • Check failed attempts
  │    • Account locked?
  │    │
  │    ├─ YES → Show lockout message, stay on form
  │    └─ NO  → Continue
  │        ↓
  │
  ├─→ [Challenge Flow] (if risk > 40 or locked)
  │    1. Generate challenge (email/OTP/TOTP/etc)
  │    2. Show challenge modal
  │    3. User solves challenge
  │    4. Verify answer (10 min expiry, 3 attempt limit)
  │    │
  │    ├─ SUCCESS → Continue to session creation
  │    └─ FAILURE → Lock account, show error
  │        ↓
  │
  ├─→ [Create Session]
  │    • Calculate timeout based on risk
  │    • Create JWT token
  │    • Set cookies/localStorage
  │    • Record login event
  │    ├─→ ↓
  │
  ├─→ [Device Registration]
  │    • Generate device fingerprint
  │    • Store device info
  │    • Create timeline entry
  │    ├─→ ↓
  │
  ├─→ [Logging & Analytics]
  │    • Log successful login
  │    • Record metrics
  │    • Track user journey
  │    ├─→ ↓
  │
  └─→ END: Redirect to Dashboard ✅
```

---

## 📊 Risk Scoring Factors (Visual)

```
DEVICE TRUST (15% weight)
├─ Registered device?
│  ├─ YES, trusted    → +0 points (baseline)
│  ├─ YES, untrusted  → +5 points
│  └─ NO, new device  → +15 points
└─ Browser/OS match? → ±5 points

LOCATION (25% weight)
├─ Same location as last login?
│  ├─ YES, within 50km     → +0 points
│  ├─ Nearby, 50-200km     → +5 points
│  ├─ Far, 200km-1000km    → +15 points
│  └─ Impossible travel    → +25 points (>1000km in <1min)
└─ Country match? → ±5 points

LOGIN ATTEMPTS (20% weight)
├─ Failed attempts in last hour?
│  ├─ 0 failures      → +0 points
│  ├─ 1-2 failures    → +3 points
│  ├─ 3-4 failures    → +8 points
│  └─ 5+ failures     → +20 points (LOCKED)
└─ Unique IP count? → ±5 points

BEHAVIOR (20% weight)
├─ Time since last login?
│  ├─ < 1 day         → +0 points
│  ├─ 1-7 days        → +3 points
│  ├─ 7-30 days       → +8 points
│  └─ 30+ days        → +15 points
└─ User pattern match? → ±5 points

NETWORK (20% weight)
├─ IP reputation?
│  ├─ Residential     → +0 points
│  ├─ Business        → +3 points
│  ├─ VPN/Proxy       → +8 points
│  └─ Blacklisted     → +20 points (BLOCKED)
└─ ISP match? → ±5 points

═════════════════════════════════════════════════════════════════════

TOTAL SCORE: 0-100 points

0-40:   LOW RISK ✅
        • 24-hour session
        • No challenge required

40-59:  MEDIUM RISK ⚠️
        • 8-hour session
        • May require challenge

60-79:  HIGH RISK ⚠️⚠️
        • 2-hour session
        • Require challenge

80+:    CRITICAL RISK 🚨
        • 15-minute session
        • Require strong challenge
        • May block entirely
```

---

## 🔐 Brute Force Protection Timeline

```
First Login Attempt: FAILED
├─ Record: Failed attempt 1/5 per hour
├─ Action: Show error "Invalid credentials"
└─ Status: Allow retry

Attempts 2-4: FAILED
├─ Record: Failed attempts 2-4/5
├─ Action: Show warning "X more attempts before lockout"
└─ Status: Allow retry

Attempt 5: FAILED (within 1 hour)
├─ Status: ACCOUNT LOCKED
├─ Duration: 15 minutes
├─ Action: Show "Account locked for 15 min"
└─ User must wait or verify via email

Attempt 6-10 (after 1st unlock): FAILED (within 24 hours)
├─ Status: ACCOUNT LOCKED again
├─ Duration: 30 minutes (doubled)
├─ Action: Show "Account locked for 30 min"
└─ Previous lock increment preserved

Attempt 11-15 (after 2nd unlock): FAILED
├─ Status: ACCOUNT LOCKED again
├─ Duration: 60 minutes (doubled)
├─ Action: Show "Account locked for 60 min"
└─ Admin notification may be sent

Attempt 16+ (after 3rd unlock): FAILED
├─ Status: ACCOUNT LOCKED again
├─ Duration: 120 minutes (doubled)
├─ Action: Admin review required
└─ Possible permanent block pending review

═════════════════════════════════════════════════════════════════════

TIMELINE VISUALIZATION:
Hour 1: 5 failures → Lock 15 min
Hour 2: 1st attempt succeeds, reset counter
Hour 3: 5 more failures → Lock 30 min (doubled)
Hour 4: 1st attempt succeeds, reset counter
Hour 5: 5 more failures → Lock 60 min (doubled)
Hour 6: 1st attempt succeeds, reset counter
Hour 7: 5 more failures → Lock 120 min (doubled)
... and so on with exponential backoff

ADMIN CONTROLS:
├─ View locked accounts in dashboard
├─ See all failed attempts
├─ Click "Unlock Account" button
└─ Account immediately unlocked (counter may reset)
```

---

## ⏱️ Session Timeout Reference

```
Risk Level          Timeout       Warning Time    Inactivity Check
────────────────────────────────────────────────────────────────────
LOW     (0-40)  →  24 hours      1 hour before   30 minutes
MEDIUM  (40-59) →  8 hours       30 min before   10 minutes
HIGH    (60-79) →  2 hours       15 min before   5 minutes
CRITICAL (80+)  →  15 minutes    5 min before    1 minute

Example Scenario:
┌──────────────────────────────────────────────────┐
│ User logs in with LOW risk (score 25)            │
├──────────────────────────────────────────────────┤
│ Login Time:  09:00 AM                            │
│ Timeout Set: 09:00 AM + 24 hours = 09:00 AM+1d  │
│ Warning At:  08:00 AM next day (1 hour before)  │
│ Expires At:  09:00 AM next day                  │
│                                                  │
│ If user inactive for 30+ minutes:               │
│ → Reset timeout to current time + 24 hours      │
│ → Warning time also resets                      │
└──────────────────────────────────────────────────┘

If Risk Level Changes During Session:
├─ NEW logout → Timeout recalculated
├─ If score drops (NEW trusted device):
│  └─ Timeout INCREASES (more time)
└─ If score increases (new location):
   └─ Timeout DECREASES (less time)
```

---

## 🎯 File Usage Quick Reference

```
WHEN YOU WANT TO...          FILE TO USE / EDIT
────────────────────────────────────────────────────────────────────

Integrate risk-based auth    → Copy EnhancedLoginForm.tsx
                            → Add useRiskBasedLogin hook

Create a login form          → Use EnhancedLoginForm.tsx
                            → Check INTEGRATION_GUIDE.md

Calculate risk score         → Use useRiskAssessment hook
                            → Or call riskAssessment service

Prevent brute force          → Use useBruteForceDetection hook
                            → Automatically in login form

Adjust session timeout       → Edit dynamicTimeout.ts
                            → Change multipliers

Show timeout warning         → Use SessionTimeoutWarning component
                            → Add to layout.tsx

Send challenges              → Use useAuthChallenge hook
                            → Edit authChallenge.ts for types

Track devices                → Use useDeviceManagement hook
                            → Initialize with useDeviceTracking

Log events                   → Use logger.ts service
                            → Or use useErrorTracking hook

Track user journey           → Use useAnalytics hook
                            → Or analytics.ts service

Monitor user sessions        → Navigate to /admin/dashboard
                            → Or /dashboard for users

Monitor attacks              → Navigate to /admin/risk-monitoring
                            → See RiskMonitoringDashboard

Manage devices               → Navigate to /account/devices
                            → See DeviceManagementUI

Configure security           → Edit individual service files
                            → See IMPLEMENTATION_SUMMARY.md

Test the system              → Follow INTEGRATION_GUIDE.md
                            → Run 15-item checklist

Deploy to production         → Follow INTEGRATION_GUIDE.md
                            → Use 4-phase rollout plan

Troubleshoot issues          → Check relevant guide
                            → Search for "Troubleshooting"
```

---

## 📋 Component Location Reference

```
REACT COMPONENTS (src/components/)
├── auth/RiskBasedAuthUI.tsx
│   ├─ RiskBadge
│   ├─ RiskAssessmentCard
│   ├─ SessionTimeoutWarning
│   ├─ AuthChallengeModal
│   ├─ RiskWarningBanner
│   ├─ BruteForceAlert
│   └─ SessionHealthIndicator
│
├── device/DeviceManagementUI.tsx
│   ├─ DeviceList
│   ├─ DeviceCard
│   ├─ ActiveSessions
│   ├─ SessionCard
│   └─ DeviceSecurityOverview
│
├── dashboard/
│   ├─ SessionMonitoringDashboard.tsx
│   └─ RiskMonitoringDashboard.tsx ← ADMIN DASHBOARD
│
└── forms/
    └─ EnhancedLoginForm.tsx ← MAIN INTEGRATION POINT

SERVICES (src/lib/services/)
├── riskAssessment.ts
├── bruteForceDetection.ts
├── dynamicTimeout.ts
├── authChallenge.ts
├── deviceManager.ts
├── logger.ts
└── analytics.ts

HOOKS (src/lib/hooks/)
├── useRiskBasedAuth.ts ← MAIN LOGIN HOOK
├── useDeviceManagement.ts
├── useDashboard.ts
├── useAnalytics.ts
└── useErrorTracking.ts

PAGES (src/app/)
├── auth/login/page.tsx → Update with EnhancedLoginForm
├── account/devices/page.tsx → Use DeviceManagementUI
├── dashboard/page.tsx → Use SessionMonitoringDashboard
└── admin/
    ├─ dashboard/page.tsx → Session monitoring
    └─ risk-monitoring/page.tsx → Risk dashboard ← NEW
```

---

## 🚀 Integration Quick Checklist

```
STEP 1: COPY FILES (30 min)
────────────────────────────────────────────────────────────────
☐ Copy all files from src/lib/services/ → your project
☐ Copy all files from src/lib/hooks/ → your project
☐ Copy all files from src/components/ → your project
☐ Copy page files → your project
└─→ Verify imports are correct

STEP 2: UPDATE LOGIN PAGE (15 min)
────────────────────────────────────────────────────────────────
☐ Find your current login page
☐ Replace with EnhancedLoginForm.tsx
☐ Update any custom styling
☐ Test form renders
└─→ Login page shows all new features

STEP 3: INITIALIZE DEVICE TRACKING (10 min)
────────────────────────────────────────────────────────────────
☐ Open src/app/layout.tsx
☐ Add device tracking initialization
☐ Test device fingerprinting works
└─→ Devices registered on login

STEP 4: ADD DASHBOARDS (30 min)
────────────────────────────────────────────────────────────────
☐ Create /admin/risk-monitoring route
☐ Add RiskMonitoringDashboard component
☐ Test admin dashboard loads
☐ Add link to admin navbar
└─→ Admin can monitor attacks

STEP 5: TEST & DEPLOY (2+ hours)
────────────────────────────────────────────────────────────────
☐ Run through 15-item test checklist
☐ Deploy to staging
☐ Verify all features work
☐ Deploy to production (phased approach)
☐ Monitor metrics daily
└─→ System live and secure!

TOTAL TIME: ~3-4 hours for basic integration
TOTAL TIME: ~1-2 weeks for full deployment
```

---

## 🎨 Color & Status Reference

```
RISK LEVEL COLORS
├─ LOW (0-40):       🟢 GREEN
│  └─ Meaning: Safe to proceed
│
├─ MEDIUM (40-59):   🟡 YELLOW
│  └─ Meaning: Be cautious
│
├─ HIGH (60-79):     🟠 ORANGE
│  └─ Meaning: Significant risk
│
└─ CRITICAL (80+):   🔴 RED
   └─ Meaning: Block or require strong challenge

STATUS INDICATORS
├─ ✅ GREEN:   All secure, no issues
├─ ⚠️ YELLOW:   Warning, review needed
├─ 🔴 RED:    Error, action required
└─ ⏳ GRAY:    Pending, loading

LOCKOUT STATUS
├─ 🔓 UNLOCKED:     Account accessible
├─ 🔒 LOCKED:       Temporary lockout (15-120 min)
├─ 🚫 BLOCKED:      Permanent block (admin review)
└─ ⏰ COOLDOWN:     Waiting for lockout to expire

DEVICE TRUST
├─ ✅ TRUSTED:      Device is trusted
├─ ❓ UNKNOWN:      Not yet classified
├─ ⚠️ SUSPICIOUS:   Anomaly detected
└─ 🚫 BLACKLISTED:  Blocked IP
```

---

## 📞 Quick Help Navigation

```
Question                          Go To
─────────────────────────────────────────────────────────────────
"How do I integrate?"            → INTEGRATION_GUIDE.md
"How do I customize?"            → IMPLEMENTATION_SUMMARY.md
"How does risk work?"            → RISK_BASED_AUTH_GUIDE.md
"How do devices work?"           → DEVICE_MANAGEMENT_GUIDE.md
"How do I use the dashboard?"    → DASHBOARD_GUIDE.md
"How do I log events?"           → ADVANCED_LOGGING_GUIDE.md
"What files exist?"              → FILE_MANIFEST.md
"What's been done?"              → IMPLEMENTATION_CHECKLIST.md
"How do I deploy?"               → INTEGRATION_GUIDE.md "Going Live"
"How do I troubleshoot?"         → Search "Troubleshooting" in guides
"Quick overview?"                → PROJECT_COMPLETE.md
"File navigation?"               → README_DOCUMENTATION.md
```

---

**Created:** January 29, 2026
**Status:** ✅ Complete
**Next Step:** Follow INTEGRATION_GUIDE.md
