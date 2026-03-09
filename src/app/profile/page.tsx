// app/profile/page.tsx
// This page is deprecated - use /account/profile instead
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new account page
    router.replace("/account/profile");
  }, [router]);

  return null;
}
