"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function AdminIndexPage() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return <div className="text-sm text-muted-foreground">{t("Redirecting…")}</div>;
}
