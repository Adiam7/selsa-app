"use client";

/**
 * Account Order Detail — renders the order detail page inside the account layout
 * with the sidebar (Profile, Orders, etc.) on the left.
 */

import OrderDetailPage from "@/app/orders/[id]/page";
import { AccountLayout } from "@/components/account/AccountLayout";

export default function AccountOrderDetail() {
  return (
    <AccountLayout>
      <OrderDetailPage />
    </AccountLayout>
  );
}
