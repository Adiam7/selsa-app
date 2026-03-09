"use client";

import { SessionMonitoringDashboard } from "@/components/dashboard/SessionMonitoringDashboard";
import { AdminOrdersPanel } from "@/components/admin/AdminOrdersPanel";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <SessionMonitoringDashboard />
      <AdminOrdersPanel showHeader={true} title="Orders Overview" description="Review recent orders and run bulk actions." />
    </div>
  );
}
