// src/app/store/[storeId]/page.tsx
"use client";

import StoreMembers from "@/components/auth/StoreMembers";
import InviteStaffForm from "@/components/auth/InviteStaffForm";
import { fetchStore } from "@/lib/api/public";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  params: { storeId: string };
}

export default function StoreDashboard({ params }: Props) {
  const { t } = useTranslation();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const data = await fetchStore(params.storeId);
        setStore(data);
      } catch (err) {
        console.error('Failed to load store:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStore();
  }, [params.storeId]);

  if (loading || isLoading) return <p>{t('Loading...')}</p>;
  if (!isAuthenticated) return <p>{t('Please log in to view this store.')}</p>;
  if (!store) return <p>{t('Store not found.')}</p>;

  return (
    <div>
      <h1>{store.name_display || store.name}{t('Dashboard')}</h1>
      <p>{t('Welcome,')}{user?.email}</p>
      <section>
        <h2>{t('Members')}</h2>
        <StoreMembers storeId={params.storeId} />
      </section>
      <section>
        <h2>{t('Invite Staff')}</h2>
        <InviteStaffForm storeId={params.storeId} />
      </section>
    </div>
  );
}
