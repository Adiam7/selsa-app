"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from 'react-i18next';
import { apiClient } from "@/lib/api/client";

interface UserRole {
  id: number;
  user: { email: string };
  role: { name: string };
}


export default function StoreMembers() {
  const router = useRouter();
  const { t } = useTranslation();
  const { storeId } = router.query;
  const [members, setMembers] = useState<UserRole[]>([]);

  useEffect(() => {
    if (!storeId) return;

    async function fetchMembers() {
      try {
        const res = await apiClient.get(`/api/accounts/stores/${storeId}/members/`);
        setMembers(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchMembers();
  }, [storeId]);

  return (
    <div>
      <h1>{t('Store Members')}</h1>
      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.user.email} - {t(m.role.name)}
          </li>
        ))}
      </ul>
    </div>
  );
}
