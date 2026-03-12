"use client";

/**
 * Account Order Confirmation — renders the confirmation UI inside the account layout
 * with the sidebar (Profile, Orders, etc.) on the left.
 */

import { OrderConfirmationContent } from "@/app/orders/confirmation/[id]/page";
import { AccountLayout } from "@/components/account/AccountLayout";

export default function AccountOrderConfirmation() {
  return (
    <AccountLayout>
      <OrderConfirmationContent embedded />
    </AccountLayout>
  );
}
