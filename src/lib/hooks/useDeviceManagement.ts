/**
 * useDeviceManagement Hook
 * Manage devices, sessions, and trusted devices
 */

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { deviceManager } from '@/lib/services/deviceManager';
import type { DeviceInfo, DeviceSession, DeviceTimeline } from '@/lib/services/deviceManager';

/**
 * Hook to initialize device tracking on app start
 */
export function useDeviceTracking() {
  const { data: session } = useSession();
  const userId = session?.user
    ? (((session.user as any).id as string | undefined) ?? session.user.email ?? null)
    : null;

  useEffect(() => {
    if (userId) {
      // Register current device
      const device = deviceManager.registerDevice(
        userId,
        `${navigator.userAgent.substring(0, 50)}...`
      );

      // Create session for this device
      const sessionId = `session_${Date.now()}`;
      deviceManager.createSession(sessionId);

      // Store session ID in session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('device_session_id', sessionId);
      }
    }
  }, [userId]);

  // Track activity
  useEffect(() => {
    const handleActivity = () => {
      const sessionId = sessionStorage.getItem('device_session_id');
      if (sessionId) {
        deviceManager.updateActivity(sessionId);
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);
}

/**
 * Hook to manage current device
 */
export function useCurrentDevice() {
  const [device, setDevice] = useState<DeviceInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = deviceManager.getCurrentDevice();
    setDevice(current);
    setLoading(false);
  }, []);

  return { device, loading };
}

/**
 * Hook to manage all devices
 */
export function useAllDevices(autoRefresh: boolean = true) {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setDevices(deviceManager.getAllDevices());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    if (autoRefresh) {
      const interval = setInterval(refresh, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refresh]);

  const trustDevice = useCallback((deviceId: string) => {
    deviceManager.trustDevice(deviceId);
    refresh();
  }, [refresh]);

  const untrustDevice = useCallback((deviceId: string) => {
    deviceManager.untrustDevice(deviceId);
    refresh();
  }, [refresh]);

  const removeDevice = useCallback((deviceId: string) => {
    if (confirm('Remove this device? You will need to login again.')) {
      deviceManager.removeDevice(deviceId);
      refresh();
    }
  }, [refresh]);

  return {
    devices,
    loading,
    refresh,
    trustDevice,
    untrustDevice,
    removeDevice,
  };
}

/**
 * Hook to manage active sessions
 */
export function useSessions() {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setSessions(deviceManager.getActiveSessions());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [refresh]);

  const logoutFromOtherDevices = useCallback(() => {
    const sessionId = sessionStorage.getItem('device_session_id');
    if (sessionId) {
      const terminated = deviceManager.logoutFromOtherDevices(sessionId);
      refresh();
      return terminated;
    }
    return [];
  }, [refresh]);

  return {
    sessions,
    loading,
    refresh,
    logoutFromOtherDevices,
    count: sessions.length,
  };
}

/**
 * Hook to view device timeline
 */
export function useDeviceTimeline(deviceId: string) {
  const [timeline, setTimeline] = useState<DeviceTimeline | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tl = deviceManager.getDeviceTimeline(deviceId);
    setTimeline(tl);
    setLoading(false);
  }, [deviceId]);

  return { timeline, loading, events: timeline?.events || [] };
}

/**
 * Hook to get device sessions
 */
export function useDeviceSessions(deviceId: string) {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deviceSessions = deviceManager.getDeviceSessions(deviceId);
    setSessions(deviceSessions);
    setLoading(false);
  }, [deviceId]);

  return { sessions, loading };
}

/**
 * Hook for suspicious activity detection
 */
export function useSuspiciousActivityDetection() {
  const [suspiciousActivities, setSuspiciousActivities] = useState<
    Array<{
      sessionId: string;
      reason: string;
      timestamp: string;
    }>
  >([]);

  const checkActivity = useCallback(
    (sessionId: string, ipAddress?: string, location?: { country?: string; city?: string }) => {
      const result = deviceManager.detectSuspiciousActivity(sessionId, ipAddress, location);

      if (result.isSuspicious && result.reason) {
        setSuspiciousActivities(prev => [
          ...prev,
          {
            sessionId,
            reason: result.reason!,
            timestamp: new Date().toISOString(),
          },
        ]);
      }

      return result;
    },
    []
  );

  return {
    suspiciousActivities,
    checkActivity,
    hasSuspiciousActivity: suspiciousActivities.length > 0,
  };
}

/**
 * Hook to get device info and manage it
 */
export function useDeviceInfo(deviceId: string) {
  const [device, setDevice] = useState<DeviceInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [timeline, setTimeline] = useState<DeviceTimeline | undefined>(undefined);

  useEffect(() => {
    const dev = deviceManager.getDevice(deviceId);
    const devSessions = deviceManager.getDeviceSessions(deviceId);
    const devTimeline = deviceManager.getDeviceTimeline(deviceId);

    setDevice(dev);
    setSessions(devSessions);
    setTimeline(devTimeline);
    setLoading(false);
  }, [deviceId]);

  const trustDevice = useCallback(() => {
    deviceManager.trustDevice(deviceId);
    setDevice(prev => (prev ? { ...prev, isTrusted: true } : undefined));
  }, [deviceId]);

  const untrustDevice = useCallback(() => {
    deviceManager.untrustDevice(deviceId);
    setDevice(prev => (prev ? { ...prev, isTrusted: false } : undefined));
  }, [deviceId]);

  return {
    device,
    sessions,
    timeline,
    loading,
    trustDevice,
    untrustDevice,
  };
}

/**
 * Hook to export device data
 */
export function useDeviceDataExport() {
  const exportData = useCallback(() => {
    return deviceManager.exportData();
  }, []);

  const downloadAsJson = useCallback(() => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData]);

  return { exportData, downloadAsJson };
}

export default {
  useDeviceTracking,
  useCurrentDevice,
  useAllDevices,
  useSessions,
  useDeviceTimeline,
  useDeviceSessions,
  useSuspiciousActivityDetection,
  useDeviceInfo,
  useDeviceDataExport,
};
