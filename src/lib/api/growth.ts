import apiClient from "@/lib/api/client";

export type MarketingPreferences = {
  email_marketing_opt_in: boolean;
  unsubscribed_at: string | null;
};

export async function getMarketingPreferences(): Promise<MarketingPreferences> {
  const res = await apiClient.get<MarketingPreferences>("/growth/preferences/");
  return res.data;
}

export async function setEmailMarketingOptIn(emailMarketingOptIn: boolean): Promise<MarketingPreferences> {
  const res = await apiClient.post<MarketingPreferences>("/growth/preferences/", {
    email_marketing_opt_in: emailMarketingOptIn,
  });
  return res.data;
}

export type CheckoutSignalStep = "started" | "address_entered" | "payment_entered" | "completed" | "abandoned";

export async function postCheckoutSignal(input: {
  cartId: number;
  step: CheckoutSignalStep;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await apiClient.post("/growth/checkout-signal/", {
    cart_id: input.cartId,
    step: input.step,
    metadata: input.metadata,
  });
}
