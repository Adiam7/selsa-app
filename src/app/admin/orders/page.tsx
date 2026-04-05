"use client";

import dynamic from 'next/dynamic';
const AdminOrdersPanel = dynamic(
  () => import("@/components/admin/AdminOrdersPanel").then(mod => ({ default: mod.AdminOrdersPanel })),
  { ssr: false }
);
import { useTranslation } from "react-i18next";

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  return (
    <AdminOrdersPanel
      title={t("Fulfillment Queue")}
      description={t("Process paid orders, add tracking, and mark shipments.")}
      initialStatusFilter="FULFILLMENT_PENDING"
      statusOptions={["ALL", "FULFILLMENT_PENDING", "SHIPPED", "DELIVERED"]}
      enableRowShip
      rowShipEligibleStatuses={["FULFILLMENT_PENDING"]}
      enableRowResendShippingEmail
      rowResendShippingEligibleStatuses={["SHIPPED", "DELIVERED"]}
    />
  );
}
