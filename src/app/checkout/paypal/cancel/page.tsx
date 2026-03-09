'use client';

import { useRouter } from 'next/navigation';

export default function PayPalCancelPage() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">PayPal</h1>
      <p className="text-gray-700 mb-4">Payment was cancelled. You can try again or choose another method.</p>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={() => router.push('/checkout')}>
        Back to Checkout
      </button>
    </div>
  );
}
