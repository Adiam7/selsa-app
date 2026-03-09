"use client";

import { useTranslation } from "react-i18next";

import InviteForm from "@/components/forms/InviteForm";

export default function RedeemInvitePage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white border rounded-lg p-6">
        <h1 className="text-2xl font-bold">{t("Redeem Staff Invite")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("Paste the invite link or token you received to continue.")}
        </p>

        <InviteForm />
      </div>
    </div>
  );
}
