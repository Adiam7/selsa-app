"use client";

import StoreMembers from "@/components/auth/StoreMembers";
import { useTranslation } from "react-i18next";

export default function StorePage({ params }: { params: { storeId: string }}) {
  const { t } = useTranslation();
  return (
    <div>
      <h1>
        {t("Store")} {params.storeId}
      </h1>
      <StoreMembers storeId={params.storeId} />
    </div>
  );
}
