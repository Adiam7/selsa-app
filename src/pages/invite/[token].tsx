
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { apiClient } from "@/lib/api/client";

export default function AcceptInvite() {
  const router = useRouter();
  const { t } = useTranslation();
  const { token } = router.query;
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    async function accept() {
      try {
        await apiClient.post(`/accounts/invites/${token}/accept/`);
        setMessage(t('Invite accepted! You can now log in.'));
      } catch (err: any) {
        setMessage(err.response?.data?.detail ? t(err.response.data.detail) : t('Error accepting invite'));
      }
    }

    accept();
  }, [token, t]);

  return <div>{message}</div>;
}
