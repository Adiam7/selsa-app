'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDeviceTracking } from '@/lib/hooks/useDeviceManagement';
import { useTranslation } from 'react-i18next';
import {
  DeviceSecurityOverview,
  DeviceList,
  ActiveSessions,
} from '@/components/device/DeviceManagementUI';

export default function DeviceManagementPage() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  useDeviceTracking();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account/devices');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">{t('Loading...')}</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Device Management')}</h1>
          <p className="text-gray-600">{t(
            'Manage your devices and active sessions. Keep your account secure by removing\n            unrecognized devices.'
          )}</p>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Security Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('Security Overview')}</h2>
          <DeviceSecurityOverview />
        </section>

        {/* Active Sessions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('🔒 Active Sessions')}</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ActiveSessions />
          </div>
        </section>

        {/* Your Devices */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('📱 Your Devices')}</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <DeviceList />
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <p className="font-semibold mb-2">{t('💡 Tips:')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Mark frequently used devices as "Trusted" for easier identification</li>
              <li>{t('Remove devices you no longer use to keep your account secure')}</li>
              <li>{t('Use "Logout Others" to sign out from all other devices at once')}</li>
              <li>{t('Suspicious activity will be detected automatically')}</li>
            </ul>
          </div>
        </section>

        {/* Account Info */}
        <section className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Account Information')}</h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-semibold text-gray-900">{t('Logged in as:')}</span> {session?.user?.email}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
