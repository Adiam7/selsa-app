"use client";

import { useTranslation } from "react-i18next";
import { SessionMonitoringDashboard } from "@/components/dashboard/SessionMonitoringDashboard";
import { AdminOrdersPanel } from "@/components/admin/AdminOrdersPanel";

export default function DashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <SessionMonitoringDashboard />
      <AdminOrdersPanel showHeader={true} title={t("Orders Overview")} description={t("Review recent orders and run bulk actions.")} />
    </div>
  );
}
