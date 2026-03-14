"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { usePlaceOrder } from "@/features/order/hooks/usePlaceOrder";
import { useCheckoutTracking } from "@/lib/hooks/useAnalytics";
import { useCart } from "@/features/cart/hooks/useCart";

export default function PayPalReturnClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { placeOrder, placingOrder } = usePlaceOrder();
  const { trackOrderCompleted } = useCheckoutTracking();
  const { refreshCart } = useCart();
  const trackedRef = useRef(false);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState<string>("Processing PayPal payment...");

  useEffect(() => {
    const run = async () => {
      const orderId = searchParams?.get("token");
      if (!orderId) {
        setStatus("error");
        setMessage("Missing PayPal token.");
        return;
      }

      try {
        const captureRes = await fetch("/api/payments/paypal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "capture", orderId }),
        });

        const captureData = await captureRes.json();
        if (!captureRes.ok || !captureData?.success) {
          throw new Error(captureData?.error || "Failed to capture PayPal payment");
        }

        toast.success("PayPal payment completed");

        const cartIdRaw =
          typeof window !== "undefined" ? window.localStorage.getItem("selsa_paypal_cart_id") : null;
        const payloadRaw =
          typeof window !== "undefined" ? window.localStorage.getItem("selsa_checkout_payload") : null;
        const cartId = cartIdRaw ? Number(cartIdRaw) : Number.NaN;

        if (!Number.isFinite(cartId) || cartId <= 0) {
          setStatus("success");
          setMessage("Payment completed. Returning to checkout...");
          router.push("/checkout");
          return;
        }

        // Clear before placing to avoid duplicate orders if user refreshes.
        window.localStorage.removeItem("selsa_paypal_cart_id");

        let verification;
        if (payloadRaw) {
          try {
            verification = JSON.parse(payloadRaw);
          } catch {
            verification = undefined;
          }
        }

        if (verification) {
          verification.payment_provider = "paypal";
          verification.payment_reference = orderId;
          verification.payment_status = "captured";
        }

        const idempotencyKey =
          typeof window !== "undefined"
            ? window.localStorage.getItem(`selsa_checkout_idempotency_${cartId}`) || undefined
            : undefined;

        const order = await placeOrder(cartId, verification, idempotencyKey);
        if (order && !trackedRef.current) {
          trackedRef.current = true;
          trackOrderCompleted(String(order.id), Number(order.total_amount ?? 0));
        }
        
        // Clear cart state so the header badge resets to 0
        await refreshCart();
        
        setStatus("success");
        setMessage("Order placed successfully. Redirecting...");

        if (order) {
          // Guests use standalone confirmation (no AccountLayout auth guard)
          const confirmPath = authStatus === 'authenticated'
            ? `/account/orders/confirmation/${order.id}`
            : `/orders/confirmation/${order.id}`;
          router.push(confirmPath);
        }
      } catch (err: any) {
        const msg = err?.message || "Something went wrong";
        setStatus("error");
        setMessage(msg);
        toast.error(msg);
      }
    };

    run();
  }, [searchParams, placeOrder, router, trackOrderCompleted]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">PayPal</h1>
      <p className="text-gray-700 mb-4">{message}</p>

      {status === "error" && (
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={() => router.push("/checkout")}
          disabled={placingOrder}
        >
          Back to Checkout
        </button>
      )}

      {status === "processing" && (
        <div className="text-sm text-gray-500">Please don’t close this tab.</div>
      )}
    </div>
  );
}
