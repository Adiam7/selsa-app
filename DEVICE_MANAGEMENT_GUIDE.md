# Device Management Features Documentation

## Overview

The Device Management system enables users to:

- See all their devices
- Mark devices as trusted
- View active sessions
- Logout from other devices
- Detect suspicious login attempts
- View device activity timeline

**Access device management:**

```
http://localhost:3000/account/devices
```

## Key Features

### 1. Device Fingerprinting

Each device gets a unique fingerprint based on:

- Browser type and version
- Operating system
- Screen resolution
- Timezone
- Language
- User agent
- Hardware capabilities (CPU cores, memory)

This fingerprint identifies the device even if the user logs out.

### 2. Device Tracking

For each device, the system tracks:

- Device name (customizable)
- Registration date
- Last activity time
- Trust status (trusted/untrusted)
- Session history

### 3. Session Management

- Track login time for each session
- Record last activity time
- Track session duration
- Store IP address and location
- Monitor session status (active/ended)

### 4. Suspicious Activity Detection

Automatically detects:

- **IP Change**: Login from different IP than previous session
- **Geographic Anomalies**: Impossible travel (different country in < 1 minute)
- **Location Changes**: Significant geographic distance between sessions
- **Multiple Failures**: Multiple failed login attempts

### 5. Device Trust System

- Users can mark devices as "Trusted"
- Trusted devices skip additional verification
- Untrust devices to require re-authentication
- Remove devices to logout completely

## Usage Examples

### For Users

**Access Device Management Page:**

```typescript
// Link in navbar
<Link href="/account/devices">
  📱 Device Management
</Link>
```

**View All Devices:**

```typescript
import { DeviceList } from '@/components/device/DeviceManagementUI';

export function Settings() {
  return (
    <div>
      <h2>Your Devices</h2>
      <DeviceList />
    </div>
  );
}
```

**Check Active Sessions:**

```typescript
import { ActiveSessions } from '@/components/device/DeviceManagementUI';

export function SessionStatus() {
  return <ActiveSessions />;
}
```

### For Developers

**Initialize Device Tracking:**

```typescript
import { useDeviceTracking } from '@/lib/hooks/useDeviceManagement';

export function App() {
  useDeviceTracking(); // Call once on app initialization

  return <YourApp />;
}
```

**Get Current Device Info:**

```typescript
import { useCurrentDevice } from '@/lib/hooks/useDeviceManagement';

function DeviceInfo() {
  const { device, loading } = useCurrentDevice();

  return (
    <div>
      <p>Device: {device?.deviceName}</p>
      <p>Browser: {device?.browser}</p>
      <p>OS: {device?.os}</p>
    </div>
  );
}
```

**Manage All Devices:**

```typescript
import { useAllDevices } from '@/lib/hooks/useDeviceManagement';

function ManageDevices() {
  const {
    devices,
    loading,
    trustDevice,
    untrustDevice,
    removeDevice,
    refresh,
  } = useAllDevices();

  return (
    <div>
      {devices.map(device => (
        <div key={device.deviceId}>
          <p>{device.deviceName}</p>
          <button onClick={() => trustDevice(device.deviceId)}>
            Trust Device
          </button>
          <button onClick={() => removeDevice(device.deviceId)}>
            Remove Device
          </button>
        </div>
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

**Logout From Other Devices:**

```typescript
import { useSessions } from '@/lib/hooks/useDeviceManagement';

function LogoutOthers() {
  const { logoutFromOtherDevices } = useSessions();

  return (
    <button onClick={() => logoutFromOtherDevices()}>
      Logout From All Other Devices
    </button>
  );
}
```

**View Device Timeline:**

```typescript
import { useDeviceTimeline } from '@/lib/hooks/useDeviceManagement';

function DeviceHistory({ deviceId }: { deviceId: string }) {
  const { timeline, events, loading } = useDeviceTimeline(deviceId);

  return (
    <div>
      {events.map((event, idx) => (
        <div key={idx}>
          <p>{event.eventType}: {event.description}</p>
          <time>{new Date(event.timestamp).toLocaleString()}</time>
        </div>
      ))}
    </div>
  );
}
```

**Detect Suspicious Activity:**

```typescript
import { useSuspiciousActivityDetection } from '@/lib/hooks/useDeviceManagement';

function LoginHandler() {
  const { checkActivity, suspiciousActivities } = useSuspiciousActivityDetection();

  const handleLogin = async (sessionId: string, ipAddress: string) => {
    const result = checkActivity(sessionId, ipAddress);

    if (result.isSuspicious) {
      // Show warning to user
      console.warn('Suspicious activity:', result.reason);
      // Require additional verification
    }
  };

  return (
    <div>
      {suspiciousActivities.map(activity => (
        <div key={activity.sessionId} className="alert alert-warning">
          Suspicious activity detected: {activity.reason}
        </div>
      ))}
    </div>
  );
}
```

## Device Info Structure

```typescript
interface DeviceInfo {
  deviceId: string; // Unique fingerprint
  deviceName: string; // User-friendly name
  browser: string; // Chrome, Firefox, Safari, etc.
  os: string; // Windows, macOS, Linux, iOS, Android
  osVersion?: string; // e.g., "13.5.1" for iOS
  platform: string; // Navigator platform
  screenResolution?: string; // "1920x1080"
  timezone?: string; // "America/New_York"
  language?: string; // "en-US"
  userAgent: string; // Full user agent string
  createdAt: string; // When device was first registered
  lastActivity: string; // Last time device was active
  isTrusted: boolean; // User marked as trusted
  isCurrentDevice: boolean; // Is this the current device
}
```

## Session Structure

```typescript
interface DeviceSession {
  sessionId: string; // Unique session ID
  deviceId: string; // Which device this session is on
  userId?: string; // Which user owns this session
  loginTime: string; // When logged in
  lastActivityTime: string; // Last action time
  ipAddress?: string; // Login IP address
  location?: {
    // Geographic location
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  isActive: boolean; // Currently logged in
  logoutTime?: string; // When logged out
  logoutReason?: string; // Why logged out
}
```

## Timeline Events

Each device has a timeline tracking events:

```typescript
{
  eventType: 'login' | 'logout' | 'activity' | 'suspicious' | 'trust_toggled',
  timestamp: string;             // When event occurred
  description: string;           // Human-readable description
  metadata?: Record<string, any> // Additional context
}
```

**Example events:**

```
- "Device registered: Chrome on Windows"
- "Session started"
- "Session ended: User logout"
- "IP address changed from last session"
- "Impossible travel detected (location change < 1 min)"
- "Device marked as trusted"
```

## Data Storage

**Browser Storage:**

- Device ID: `localStorage['device_id']`
- Trusted devices: `localStorage['trusted_devices']`
- Current session ID: `sessionStorage['device_session_id']`

**In-Memory:**

- Device manager tracks all devices and sessions
- Data persists within the browser session
- Clears on logout via `deviceManager.clear()`

**Security:**

- No sensitive data stored in localStorage
- No passwords or tokens
- Fingerprint is deterministic (same device = same fingerprint)
- Device data is user-specific

## Suspicious Activity Detection

### What Triggers Alerts

**IP Change:**

```typescript
// User logged in from 192.168.1.1
// Then logged in from 192.168.1.50
// → IP address changed
```

**Geographic Anomaly:**

```typescript
// Session 1: New York (40.7128°N, 74.0060°W)
// Session 2: Tokyo (35.6762°N, 139.6503°E)
// Time between: 5 minutes
// Distance: 10,836 km in 5 minutes
// → IMPOSSIBLE TRAVEL DETECTED
```

**Location Change:**

```typescript
// Session 1: USA
// Session 2: United Kingdom
// → Geographic location changed
```

### Response Options

When suspicious activity is detected:

1. **Notify User** - Alert user of unusual login
2. **Require Re-auth** - Ask for password/2FA
3. **Temporary Block** - Prevent access for 24 hours
4. **Log Event** - Record in timeline
5. **Alert Admin** - For high-risk scenarios

## Integration Points

### With Authentication (`src/lib/auth.ts`)

```typescript
import { deviceManager } from '@/lib/services/deviceManager';

// After successful login
const device = deviceManager.registerDevice(userId);
const session = deviceManager.createSession(sessionId);

// Before logout
deviceManager.endSession(sessionId, 'user_logout');
```

### With Analytics

```typescript
analytics.trackAuthEvent('login_completed', {
  deviceId: device.deviceId,
  isTrusted: device.isTrusted,
  isNewDevice: isNewDevice,
});
```

### With Dashboard

View device stats in admin dashboard:

- Device count by type
- Trust rate
- Session duration distribution
- Suspicious activity trends

## Security Best Practices

### For Users

1. **Regularly Review Devices**

   - Check device list monthly
   - Remove unknown devices immediately
   - Mark frequently used devices as trusted

2. **Use Device Logout**

   - Use "Logout from all other devices" after traveling
   - Logout on public computers
   - Revoke access if device is lost

3. **Monitor Activity**
   - Check "Active Sessions" regularly
   - Look for unfamiliar devices or IP addresses
   - Alert support if suspicious activity detected

### For Developers

1. **Always Initialize Tracking**

   - Call `useDeviceTracking()` on app start
   - Don't skip device registration
   - Handle errors gracefully

2. **Implement Suspicious Activity Response**

   - Check `useSuspiciousActivityDetection()`
   - Require additional verification
   - Log suspicious attempts
   - Notify user and admin

3. **Respect User Privacy**

   - Don't store unnecessary data
   - Clear device data on logout
   - Implement data retention policy
   - Allow data export

4. **Test Multiple Scenarios**
   - Same device, multiple browsers
   - Multiple devices, same user
   - Device fingerprint consistency
   - Session expiry handling

## Testing Checklist

- [ ] Device registered on first login
- [ ] Device ID persists across page refreshes
- [ ] Device name displays correctly
- [ ] Last activity updates on user interaction
- [ ] Trust/untrust functionality works
- [ ] Remove device removes it from list
- [ ] Active sessions show all logged-in devices
- [ ] "Logout others" logs out all except current
- [ ] Timeline events recorded correctly
- [ ] Suspicious activity detected
- [ ] IP change detected
- [ ] Location change detected
- [ ] Export device data as JSON

## Future Enhancements

1. **Biometric Verification**

   - Fingerprint/Face ID for trusted devices
   - Automatic re-verification

2. **Device Naming**

   - Smart naming (location, time)
   - User-defined custom names

3. **Device Icons**

   - iPhone, Android, Windows, Mac icons
   - Visual device type identification

4. **Risk Scoring**

   - Automatic risk level calculation
   - Require verification for high-risk logins
   - Adjust timeout based on risk

5. **Geofencing**

   - Define trusted locations
   - Alert if login from unexpected location
   - Automatic device timeout outside trusted zone

6. **Browser Notification**

   - Notify user of new device login
   - Approve/deny new devices
   - One-click device removal

7. **2FA Integration**
   - Require 2FA for new devices
   - Skip 2FA for trusted devices
   - Re-verify periodically

## Support & Debugging

**Check device data:**

```javascript
// In browser console:
import { deviceManager } from '@/lib/services/deviceManager';
deviceManager.exportData();
```

**Clear device data:**

```javascript
localStorage.removeItem('device_id');
localStorage.removeItem('trusted_devices');
sessionStorage.removeItem('device_session_id');
```

**Test suspicious activity:**

```javascript
const result = deviceManager.detectSuspiciousActivity(
  'session_123',
  '192.168.1.50',
  { country: 'UK', city: 'London' }
);
console.log(result);
```

## Questions?

Check the component files:

- `src/components/device/DeviceManagementUI.tsx` - UI components
- `src/lib/services/deviceManager.ts` - Core logic
- `src/lib/hooks/useDeviceManagement.ts` - React hooks
- `src/app/account/devices/page.tsx` - Page component
