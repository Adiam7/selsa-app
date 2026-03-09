/**
 * Admin Risk Monitoring Dashboard Page
 * 
 * Path: /admin/risk-monitoring
 * 
 * Requires admin authentication
 */

import { Metadata } from 'next';
import RiskMonitoringDashboard from '@/components/dashboard/RiskMonitoringDashboard';

export const metadata: Metadata = {
  title: 'Risk Monitoring Dashboard | Admin',
  description: 'Monitor authentication attacks and suspicious login patterns',
};

export default function RiskMonitoringPage() {
  return <RiskMonitoringDashboard />;
}
