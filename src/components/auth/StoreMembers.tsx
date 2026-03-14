// src/components/StoreMembers.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface Member {
  id: number;
  user: { email: string };
  role: { name: string; name_display?: string };
}

interface Props {
  storeId: string;
}

export default function StoreMembers({ storeId }: Props) {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await apiClient.get(`/accounts/stores/${storeId}/members/`);
        setMembers(res.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("You must log in to view members.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view members.");
        } else {
          setError(err.response?.data?.detail || err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    if (storeId) fetchMembers();
  }, [storeId]);

  if (loading) return <p>{t('Loading members...')}</p>;
  if (error)
    return (
      <p>
        {error}{" "}
        {error.includes("log in") && (
          <Link href="/auth/login" className="underline text-blue-600">{t('Login')}</Link>
        )}
      </p>
    );

  if (!members.length) return <p>{t('No members found.')}</p>;

  return (
    <ul>
      {members.map((m) => (
        <li key={m.id}>
          {m.user.email}{t('—')}{m.role.name_display || m.role.name}
        </li>
      ))}
    </ul>
  );
}
