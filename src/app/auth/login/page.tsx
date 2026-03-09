// src/app/(auth)/login/page.tsx
import LoginForm from "@/components/forms/LoginForm";
import { Suspense } from "react";

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
