"use client";

import { useTranslation } from "react-i18next";

export function AdminAccessDenied() {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-foreground">
      {t("You do not have access to this area.")}
    </div>
  );
}
