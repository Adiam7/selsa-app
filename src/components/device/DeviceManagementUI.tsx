/**
 * Device Management UI Components
 * User-facing components for managing devices and sessions
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAllDevices, useSessions, useCurrentDevice } from '@/lib/hooks/useDeviceManagement';
import type { DeviceInfo, DeviceSession } from '@/lib/services/deviceManager';

/**
 * Device List Component
 * Shows all trusted and recent devices
 */
export function DeviceList() {
  const { t } = useTranslation();
  const { devices, loading, trustDevice, untrustDevice, removeDevice } = useAllDevices();
  const { device: currentDevice } = useCurrentDevice();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin">⏳</div>
        <span className="ml-2 text-gray-600">{t('Loading devices...')}</span>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t('No devices registered yet')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {devices.map(device => (
        <DeviceCard
          key={device.deviceId}
          device={device}
          isCurrent={device.deviceId === currentDevice?.deviceId}
          onTrust={() => trustDevice(device.deviceId)}
          onUntrust={() => untrustDevice(device.deviceId)}
          onRemove={() => removeDevice(device.deviceId)}
        />
      ))}
    </div>
  );
}

/**
 * Single Device Card Component
 */
interface DeviceCardProps {
  device: DeviceInfo;
  isCurrent: boolean;
  onTrust: () => void;
  onUntrust: () => void;
  onRemove: () => void;
}

function DeviceCard({ device, isCurrent, onTrust, onUntrust, onRemove }: DeviceCardProps) {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const lastActivityMinutesAgo = Math.floor(
    (Date.now() - new Date(device.lastActivity).getTime()) / 60000
  );

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      isCurrent
        ? 'bg-blue-50 border-blue-300'
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{device.deviceName}</h3>
            {isCurrent && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">{t('This Device')}</span>
            )}
            {device.isTrusted && (
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">{t('✓ Trusted')}</span>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {device.browser}{t('on')}{device.os}
            {device.osVersion && ` ${device.osVersion}`}
          </p>

          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <p>{t('Screen:')}{device.screenResolution}</p>
            <p>{t('Last activity:')}{lastActivityMinutesAgo === 0 ? 'Just now' : `${lastActivityMinutesAgo}m ago`}
            </p>
            <p>{t('Added:')}{new Date(device.createdAt).toLocaleDateString()}{t('at')}{' '}
              {new Date(device.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowActions(!showActions)}
          className="text-gray-400 hover:text-gray-600 p-2"
          title="More options"
        >{t('⋮')}</button>
      </div>
      {showActions && (
        <div className="border-t border-gray-200 mt-3 pt-3 space-y-2">
          {!device.isTrusted ? (
            <button
              onClick={onTrust}
              className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded transition-colors"
            >{t('✓ Mark as Trusted')}</button>
          ) : (
            <button
              onClick={onUntrust}
              className="w-full text-left px-3 py-2 text-sm text-orange-700 hover:bg-orange-50 rounded transition-colors"
            >{t('✗ Remove from Trusted')}</button>
          )}
          {!isCurrent && (
            <button
              onClick={onRemove}
              className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded transition-colors"
            >{t('🗑 Remove Device')}</button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Active Sessions Component
 * Shows all active sessions across devices
 */
export function ActiveSessions() {
  const { t } = useTranslation();
  const { sessions, loading, logoutFromOtherDevices } = useSessions();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin">⏳</div>
        <span className="ml-2 text-gray-600">{t('Loading sessions...')}</span>
      </div>
    );
  }

  const activeSessions = sessions.filter(s => s.isActive);

  if (activeSessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t('No active sessions')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          {activeSessions.length}{t('active session')}{activeSessions.length !== 1 ? 's' : ''}
        </p>
        {activeSessions.length > 1 && (
          <button
            onClick={() => {
              if (confirm('Logout from all other devices?')) {
                logoutFromOtherDevices();
              }
            }}
            className="text-sm px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
          >{t('Logout Others')}</button>
        )}
      </div>
      <div className="space-y-3">
        {activeSessions.map(session => (
          <SessionCard key={session.sessionId} session={session} />
        ))}
      </div>
    </div>
  );
}

/**
 * Single Session Card Component
 */
function SessionCard({ session }: { session: DeviceSession }) {
  const { t } = useTranslation();
  const loginTime = new Date(session.loginTime);
  const duration = Math.floor(
    (Date.now() - loginTime.getTime()) / 1000 / 60
  );

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="font-semibold text-gray-900">{t('Active Session')}</p>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>Session ID: {session.sessionId.substring(0, 20)}{t('...')}</p>
            <p>{t('Started:')}{loginTime.toLocaleString()}</p>
            <p>{t('Duration:')}{duration}{t('minutes')}</p>
            {session.ipAddress && <p>{t('IP:')}{session.ipAddress}</p>}
            {session.location && (
              <p>{t('Location:')}{session.location.city && `${session.location.city}, `}
                {session.location.country}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Device Security Overview
 * Summary of device security status
 */
export function DeviceSecurityOverview() {
  const { t } = useTranslation();
  const { devices, loading } = useAllDevices(false);
  const { sessions } = useSessions();

  const trustedDevices = devices.filter(d => d.isTrusted).length;
  const untrustedDevices = devices.filter(d => !d.isTrusted).length;
  const activeSessions = sessions.filter(s => s.isActive).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-3xl mb-2">{t('📱')}</div>
        <p className="text-sm text-gray-600">{t('Total Devices')}</p>
        <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-3xl mb-2">✓</div>
        <p className="text-sm text-green-700">{t('Trusted Devices')}</p>
        <p className="text-2xl font-bold text-green-900">{trustedDevices}</p>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="text-3xl mb-2">{t('⚠️')}</div>
        <p className="text-sm text-orange-700">{t('Untrusted Devices')}</p>
        <p className="text-2xl font-bold text-orange-900">{untrustedDevices}</p>
      </div>
      <div className="md:col-span-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <p className="font-semibold text-blue-900">{t('Active Sessions')}</p>
        </div>
        <p className="text-sm text-blue-700">{activeSessions}{t('session')}{activeSessions !== 1 ? 's' : ''}{t('across all devices')}</p>
      </div>
    </div>
  );
}

export default {
  DeviceList,
  DeviceCard,
  ActiveSessions,
  SessionCard,
  DeviceSecurityOverview,
};
