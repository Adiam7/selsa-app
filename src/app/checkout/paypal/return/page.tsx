import { Suspense } from "react";
import PayPalReturnClient from "./PayPalReturnClient";

export default function PayPalReturnPage() {
  return (
    <Suspense fallback={null}>
      <PayPalReturnClient />
    </Suspense>
  );
}
