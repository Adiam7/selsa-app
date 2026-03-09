// src/app/cart/loading.tsx

"use client";
import { useTranslation } from 'react-i18next';

export default function Loading() {
  const { t } = useTranslation();
  return (
    <div className="p-6 animate-pulse text-gray-500">
      <p>{t('Loading Cart page...')}</p>
    </div>
  );
}

