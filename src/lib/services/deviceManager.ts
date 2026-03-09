/**
 * Device Management Service
 * Tracks devices, sessions, and enables multi-device session management
 * Features:
 * - Device fingerprinting
 * - Session tracking per device
 * - Logout from other devices
 * - Device timeline/history
 * - Suspicious activity detection
 */

import { logger } from './logger';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  browser: string;
  os: string;
  osVersion?: string;
  platform: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
  isTrusted: boolean;
  isCurrentDevice: boolean;
}

export interface DeviceSession {
  sessionId: string;
  deviceId: string;
  userId?: string;
  loginTime: string;
  lastActivityTime: string;
  ipAddress?: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  isActive: boolean;
  logoutTime?: string;
  logoutReason?: string;
}

export interface DeviceTimeline {
  deviceId: string;
  events: Array<{
    timestamp: string;
    eventType: 'login' | 'logout' | 'activity' | 'suspicious' | 'trust_toggled';
    description: string;
    metadata?: Record<string, any>;
  }>;
}

class DeviceManager {
  private devices: Map<string, DeviceInfo> = new Map();
  private sessions: Map<string, DeviceSession> = new Map();
  private timelines: Map<string, DeviceTimeline> = new Map();
  private currentDeviceId: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeDeviceTracking();
      this.loadPersistedDevices();
    }
  }

  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Browser Fingerprint', 2, 15);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency,
      (navigator as any).deviceMemory ?? '',
      navigator.maxTouchPoints,
    ].join('|');

    return this.hashString(fingerprint);
  }

  /**
   * Simple hash function for fingerprint
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `device_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Detect browser
   */
  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  /**
   * Detect operating system
   */
  private detectOS(): { os: string; version?: string } {
    const ua = navigator.userAgent;
    let os = 'Unknown';
    let version: string | undefined;

    if (ua.includes('Win')) {
      os = 'Windows';
      const match = ua.match(/Windows NT ([\d.]+)/);
      if (match) {
        const version_num = match[1];
        if (version_num === '10.0') version = '10/11';
        else if (version_num === '6.3') version = '8.1';
        else if (version_num === '6.2') version = '8';
      }
    } else if (ua.includes('Mac')) {
      os = 'macOS';
      const match = ua.match(/Mac OS X ([\d_]+)/);
      if (match) version = match[1].replace(/_/g, '.');
    } else if (ua.includes('Linux')) {
      os = 'Linux';
    } else if (ua.includes('iPhone')) {
      os = 'iOS';
      const match = ua.match(/OS ([\d_]+)/);
      if (match) version = match[1].replace(/_/g, '.');
    } else if (ua.includes('Android')) {
      os = 'Android';
      const match = ua.match(/Android ([\d.]+)/);
      if (match) version = match[1];
    }

    return { os, version };
  }

  /**
   * Get screen resolution
   */
  private getScreenResolution(): string {
    if (typeof window === 'undefined') return 'unknown';
    return `${window.screen.width}x${window.screen.height}`;
  }

  /**
   * Initialize device tracking
   */
  private initializeDeviceTracking(): void {
    // Generate or retrieve device ID
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = this.generateDeviceFingerprint();
      localStorage.setItem('device_id', deviceId);
    }
    this.currentDeviceId = deviceId;

    logger.debug('Device initialized', { deviceId });
  }

  /**
   * Load persisted devices from storage
   */
  private loadPersistedDevices(): void {
    try {
      const stored = localStorage.getItem('trusted_devices');
      if (stored) {
        const devices = JSON.parse(stored);
        Object.entries(devices).forEach(([id, device]) => {
          this.devices.set(id, device as DeviceInfo);
        });
      }
    } catch (error) {
      logger.error('Failed to load persisted devices', error);
    }
  }

  /**
   * Persist devices to storage
   */
  private persistDevices(): void {
    try {
      const devices: Record<string, DeviceInfo> = {};
      this.devices.forEach((device, id) => {
        devices[id] = device;
      });
      localStorage.setItem('trusted_devices', JSON.stringify(devices));
    } catch (error) {
      logger.error('Failed to persist devices', error);
    }
  }

  /**
   * Register or update device
   */
  registerDevice(userId?: string, deviceName?: string): DeviceInfo {
    const { os, version } = this.detectOS();
    const now = new Date().toISOString();

    const deviceInfo: DeviceInfo = {
      deviceId: this.currentDeviceId,
      deviceName: deviceName || `${this.detectBrowser()} on ${os}`,
      browser: this.detectBrowser(),
      os,
      osVersion: version,
      platform: navigator.platform,
      screenResolution: this.getScreenResolution(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      userAgent: navigator.userAgent,
      createdAt: now,
      lastActivity: now,
      isTrusted: false,
      isCurrentDevice: true,
    };

    this.devices.set(this.currentDeviceId, deviceInfo);
    this.persistDevices();

    // Add to timeline
    this.addTimelineEvent(this.currentDeviceId, 'login', `Device registered: ${deviceInfo.deviceName}`, {
      userId,
    });

    logger.auth('Device registered', {
      deviceId: this.currentDeviceId,
      deviceName: deviceInfo.deviceName,
      userId,
    });

    return deviceInfo;
  }

  /**
   * Create a device session
   */
  createSession(
    sessionId: string,
    ipAddress?: string,
    location?: DeviceSession['location']
  ): DeviceSession {
    const now = new Date().toISOString();

    const session: DeviceSession = {
      sessionId,
      deviceId: this.currentDeviceId,
      loginTime: now,
      lastActivityTime: now,
      ipAddress,
      location,
      isActive: true,
    };

    this.sessions.set(sessionId, session);

    this.addTimelineEvent(this.currentDeviceId, 'login', 'Session started', {
      sessionId,
      ipAddress,
      location,
    });

    logger.debug('Device session created', {
      sessionId,
      deviceId: this.currentDeviceId,
    });

    return session;
  }

  /**
   * Update last activity time
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivityTime = new Date().toISOString();
    }

    const device = this.devices.get(this.currentDeviceId);
    if (device) {
      device.lastActivity = new Date().toISOString();
      this.persistDevices();
    }
  }

  /**
   * End device session
   */
  endSession(sessionId: string, reason?: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.logoutTime = new Date().toISOString();
      session.logoutReason = reason;

      this.addTimelineEvent(
        session.deviceId,
        'logout',
        `Session ended: ${reason || 'User logout'}`,
        { sessionId }
      );

      logger.auth('Device session ended', {
        sessionId,
        reason,
      });
    }
  }

  /**
   * Trust a device
   */
  trustDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.isTrusted = true;
      this.persistDevices();

      this.addTimelineEvent(deviceId, 'trust_toggled', 'Device marked as trusted');

      logger.auth('Device trusted', { deviceId });
    }
  }

  /**
   * Untrust a device
   */
  untrustDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.isTrusted = false;
      this.persistDevices();

      this.addTimelineEvent(deviceId, 'trust_toggled', 'Device marked as untrusted');

      logger.auth('Device untrusted', { deviceId });
    }
  }

  /**
   * Add timeline event
   */
  private addTimelineEvent(
    deviceId: string,
    eventType: 'login' | 'logout' | 'activity' | 'suspicious' | 'trust_toggled',
    description: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.timelines.has(deviceId)) {
      this.timelines.set(deviceId, {
        deviceId,
        events: [],
      });
    }

    const timeline = this.timelines.get(deviceId)!;
    timeline.events.push({
      timestamp: new Date().toISOString(),
      eventType,
      description,
      metadata,
    });

    // Keep only last 100 events per device
    if (timeline.events.length > 100) {
      timeline.events = timeline.events.slice(-100);
    }
  }

  /**
   * Detect suspicious activity
   */
  detectSuspiciousActivity(
    sessionId: string,
    ipAddress?: string,
    location?: DeviceSession['location']
  ): { isSuspicious: boolean; reason?: string } {
    const session = this.sessions.get(sessionId);
    if (!session) return { isSuspicious: false };

    const reasons: string[] = [];

    // Check for IP change
    if (ipAddress && session.ipAddress && ipAddress !== session.ipAddress) {
      reasons.push('IP address changed from last session');
    }

    // Check for location change
    if (location && session.location && location.country !== session.location.country) {
      reasons.push('Geographic location changed');
    }

    // Check for impossible travel (location change in short time)
    const recentSessions = Array.from(this.sessions.values())
      .filter(s => !s.isActive && s.logoutTime)
      .slice(-1);

    if (recentSessions.length > 0) {
      const lastSession = recentSessions[0];
      const timeDiff =
        new Date(sessionId).getTime() - new Date(lastSession.logoutTime!).getTime();

      if (
        timeDiff < 60000 && // Less than 1 minute
        location &&
        lastSession.location &&
        this.calculateDistance(
          lastSession.location.latitude,
          lastSession.location.longitude,
          location.latitude,
          location.longitude
        ) > 1000 // More than 1000 km
      ) {
        reasons.push('Impossible travel detected (location change < 1 min)');
      }
    }

    const isSuspicious = reasons.length > 0;

    if (isSuspicious) {
      this.addTimelineEvent(session.deviceId, 'suspicious', reasons.join('; '));
      logger.warn('Suspicious activity detected', {
        sessionId,
        reasons,
      });
    }

    return {
      isSuspicious,
      reason: reasons.length > 0 ? reasons.join('; ') : undefined,
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1?: number,
    lon1?: number,
    lat2?: number,
    lon2?: number
  ): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Logout from all other devices
   */
  logoutFromOtherDevices(currentSessionId: string): string[] {
    const sessionsToLogout: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (sessionId !== currentSessionId && session.isActive) {
        this.endSession(sessionId, 'Logged out from another device');
        sessionsToLogout.push(sessionId);
      }
    });

    logger.auth('Logged out from all other devices', {
      sessionsTerminated: sessionsToLogout.length,
    });

    return sessionsToLogout;
  }

  /**
   * Get current device
   */
  getCurrentDevice(): DeviceInfo | undefined {
    return this.devices.get(this.currentDeviceId);
  }

  /**
   * Get all devices
   */
  getAllDevices(): DeviceInfo[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): DeviceInfo | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): DeviceSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive);
  }

  /**
   * Get sessions for device
   */
  getDeviceSessions(deviceId: string): DeviceSession[] {
    return Array.from(this.sessions.values()).filter(s => s.deviceId === deviceId);
  }

  /**
   * Get device timeline
   */
  getDeviceTimeline(deviceId: string): DeviceTimeline | undefined {
    return this.timelines.get(deviceId);
  }

  /**
   * Get all timelines
   */
  getAllTimelines(): DeviceTimeline[] {
    return Array.from(this.timelines.values());
  }

  /**
   * Remove device (after logout)
   */
  removeDevice(deviceId: string): void {
    this.devices.delete(deviceId);
    this.timelines.delete(deviceId);
    this.persistDevices();

    logger.auth('Device removed', { deviceId });
  }

  /**
   * Clear all device data (on logout)
   */
  clear(): void {
    this.sessions.clear();
    logger.debug('Device manager cleared');
  }

  /**
   * Export device data for debugging
   */
  exportData() {
    return {
      currentDeviceId: this.currentDeviceId,
      devices: Array.from(this.devices.values()),
      sessions: Array.from(this.sessions.values()),
      timelines: Array.from(this.timelines.values()),
    };
  }
}

// Export singleton instance
export const deviceManager = new DeviceManager();

export default deviceManager;
