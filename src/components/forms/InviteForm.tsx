"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function extractInviteToken(raw: string): string | null {
  const value = (raw || "").trim();
  if (!value) return null;

  // Accept either a UUID token, or a full link containing it.
  const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = value.match(uuidRegex);
  return match ? match[0] : null;
}

export default function InviteForm() {
  const router = useRouter();
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => extractInviteToken(input), [input]);

  const submit = () => {
    if (!token) {
      setError(t("Paste a valid invite link or token."));
      return;
    }

    setError(null);
    router.push(`/auth/invite/${token}`);
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      {error && <p className="text-red-600">{error}</p>}

      <Input
        type="text"
        placeholder={t("Invite link or token")}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label={t("Invite link or token")}
        title={t("Invite link or token")}
      />

      <div className="flex items-center gap-2">
        <Button onClick={submit} disabled={!input.trim()} variant="outline">
          {t("Continue")}
        </Button>
        {token && <span className="text-xs text-gray-500">{t("Token detected")}</span>}
      </div>

      <p className="text-xs text-gray-500">
        {t("Already accepted your invite?")} {" "}
        <Link href="/auth/login" className="underline">
          {t("Log in")}
        </Link>
      </p>
    </div>
  );
}
