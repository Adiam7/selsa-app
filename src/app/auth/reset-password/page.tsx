import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import { Suspense } from "react";

export const metadata = {
  title: "Reset Password - Selsa",
  description: "Create a new password for your Selsa account",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
