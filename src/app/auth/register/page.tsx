// src/app/(auth)/register/page.tsx

'use client';

import RegisterForm from "@/components/forms/RegisterForm"; 

export default function Register() {

  return (
    <div className="max-w-md mx-auto p-6">
      <RegisterForm />
    </div>
  );
}
