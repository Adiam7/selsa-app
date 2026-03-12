'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/features/cart/hooks/useCart';
import { usePlaceOrder } from '@/features/order/hooks/usePlaceOrder';
import { useCartCalculation } from '@/features/cart/hooks/useCartCalculation';
import { searchCountries, getProvinceCode, getCountryName, getCityForState } from '@/lib/locations';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Shield, Truck, Lock, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { ShippingDisplay } from '@/components/checkout';
import { getDisplayName } from '@/utils/i18nDisplay';
import { ShippingDisplayData } from '@/types/shipping';
import StripePaymentForm, { isStripeMethod, type SupportedStripeMethod } from '@/components/StripePaymentForm';
import { useCheckoutTracking } from '@/lib/hooks/useAnalytics';
import { postCheckoutSignal } from '@/lib/api/growth';
import { validateCartBeforeCheckout, handleOutOfStockItems, handlePriceChanges, handleSessionExpiry, withRetry, isNetworkError } from '@/lib/validation/inventory';
import { mapStripeError } from '@/lib/payment/errors';
import { LoadingState, NetworkStatus, ValidationMessage, ActionButton, useNetworkStatus } from '@/components/ui/enhanced-feedback';
import { detectGeoLocation, getAvailablePaymentMethods, isPaymentMethodAvailable } from '@/lib/payment/providers/geo-detection';
import { PaymentMethodType, PaymentRegion, GeoLocationData, PaymentMethodConfig } from '@/lib/payment/providers/types';
import { getPaymentMethodsForRegion } from '@/lib/payment/providers/config';
import styles from './page.module.css';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingCountry: string;
  shippingAddress: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  billingCountry: string;
  billingAddress: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  sameAsBilling: boolean;
  paymentMethod: PaymentMethodType;
}

interface FormErrors {
  [key: string]: string;
}

type PriceChangeTotals = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

type CheckoutProgress = {
  step: 'shipping' | 'billing' | 'payment' | 'review';
  formData: FormData;
  shippingMethod: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT';
  updatedAt: number;
};

type PaymentMethodValue = FormData['paymentMethod'];

type PaymentMethodOption = {
  id: string;
  value: PaymentMethodValue;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  disabledReason?: string;
  region?: PaymentRegion;
  processingTime?: string;
  requiresRedirect?: boolean;
};

const CheckoutPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, loading } = useCart();
  const { placeOrder, placingOrder } = usePlaceOrder();
  const { calculateCartTotal, calculation, loading: calculationLoading } = useCartCalculation();
  const {
    trackCheckoutStarted,
    trackAddressEntered,
    trackPaymentEntered,
    trackOrderCompleted,
    trackCheckoutAbandoned,
  } = useCheckoutTracking();

  const [step, setStep] = useState<'shipping' | 'billing' | 'payment' | 'review'>('shipping');
  const [formData, setFormData] = useState<FormData>({
    email: session?.user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    shippingCountry: '',
    shippingAddress: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    billingCountry: '',
    billingAddress: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    sameAsBilling: true,
    paymentMethod: 'card',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS' | 'OVERNIGHT'>('STANDARD');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [stripePaymentComplete, setStripePaymentComplete] = useState(false);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(null);
  const [shippingCountryOpen, setShippingCountryOpen] = useState(false);
  const [billingCountryOpen, setBillingCountryOpen] = useState(false);
  const [shippingCountrySearch, setShippingCountrySearch] = useState('');
  const [billingCountrySearch, setBillingCountrySearch] = useState('');
  const [shippingDisplayData, setShippingDisplayData] = useState<ShippingDisplayData | null>(null);
  const [priceChangeTotals, setPriceChangeTotals] = useState<PriceChangeTotals | null>(null);
  const [didHydrateProgress, setDidHydrateProgress] = useState(false);

  const [walletSupport, setWalletSupport] = useState<{
    checked: boolean;
    applePay: boolean;
    googlePay: boolean;
  }>({ checked: false, applePay: false, googlePay: false });

  const [bnplSupport, setBnplSupport] = useState<{
    checked: boolean;
    klarna: boolean;
    afterpay: boolean;
    affirm: boolean;
  }>({ checked: false, klarna: false, afterpay: false, affirm: false });

  // Enhanced state for validation and error handling
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [priceChangeWarning, setPriceChangeWarning] = useState<boolean>(false);
  const isOnline = useNetworkStatus();
  const [retryCount, setRetryCount] = useState(0);

  // Regional payment methods state
  const [geoData, setGeoData] = useState<GeoLocationData | null>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [geoDetectionComplete, setGeoDetectionComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Calculate costs
  const subtotal =
    cart?.items?.reduce((sum, item) => {
      const price = Number(item.variant_detail?.price ?? item.product_price ?? 0);
      const quantity = item.quantity ?? 1;
      return sum + price * quantity;
    }, 0) ?? 0;
  const shippingCost = calculation?.shipping ?? 0;
  const tax = calculation?.tax ?? 0;
  const grandTotal = subtotal + shippingCost + tax;
  const effectiveSubtotal = priceChangeTotals?.subtotal ?? subtotal;
  const effectiveShipping = priceChangeTotals?.shipping ?? shippingCost;
  const effectiveTax = priceChangeTotals?.tax ?? tax;
  const effectiveGrandTotal = priceChangeTotals?.total ?? grandTotal;

  const checkoutStartedRef = useRef(false);
  const addressTrackedRef = useRef(false);
  const paymentTrackedRef = useRef(false);
  const orderCompletedRef = useRef(false);

  const growthCheckoutStartedRef = useRef(false);
  const growthAddressTrackedRef = useRef(false);
  const growthPaymentTrackedRef = useRef(false);
  const growthAbandonedRef = useRef(false);

  // Ref that always points to the latest auto-place-order function so
  // the Stripe onSuccess callback never captures a stale closure.
  const autoPlaceOrderRef = useRef<(intentId: string) => Promise<void>>(async () => {});
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [processingTimedOut, setProcessingTimedOut] = useState(false);
  const [paymentSucceededOrderFailed, setPaymentSucceededOrderFailed] = useState(false);

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;

  const getProgressStorageKey = useCallback(() => {
    const cartKey = cart?.id ?? 'current';
    return `selsa_checkout_progress_${cartKey}`;
  }, [cart?.id]);

  // Restore checkout progress from localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = getProgressStorageKey();
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      setDidHydrateProgress(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as CheckoutProgress;
      const maxAgeMs = 24 * 60 * 60 * 1000;
      if (!parsed?.updatedAt || Date.now() - parsed.updatedAt > maxAgeMs) {
        window.localStorage.removeItem(key);
        setDidHydrateProgress(true);
        return;
      }

      const allowedSteps: CheckoutProgress['step'][] = ['shipping', 'billing', 'payment', 'review'];
      const safeStep = allowedSteps.includes(parsed.step) ? parsed.step : 'shipping';
      setStep(safeStep === 'review' ? 'payment' : safeStep);
      setFormData((prev) => ({
        ...prev,
        ...parsed.formData,
        email: parsed.formData?.email || prev.email,
      }));
      setShippingMethod(parsed.shippingMethod || 'STANDARD');
    } catch {
      window.localStorage.removeItem(key);
    } finally {
      setDidHydrateProgress(true);
    }
  }, [getProgressStorageKey]);

  // Persist checkout progress.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!didHydrateProgress) return;

    const key = getProgressStorageKey();
    const payload: CheckoutProgress = {
      step,
      formData,
      shippingMethod,
      updatedAt: Date.now(),
    };

    window.localStorage.setItem(key, JSON.stringify(payload));
  }, [didHydrateProgress, getProgressStorageKey, step, formData, shippingMethod]);

  // Reset Stripe completion when totals or method changes.
  useEffect(() => {
    setStripePaymentComplete(false);
    setStripePaymentIntentId(null);
    setPaymentError(null);
  }, [effectiveGrandTotal, formData.paymentMethod, cart?.id]);

  // Geo-detection and payment method initialization
  useEffect(() => {
    const initializePaymentMethods = async () => {
      try {
        const { geoData: detectedGeo, methods } = await getAvailablePaymentMethods();
        
        setGeoData(detectedGeo);
        setAvailablePaymentMethods(methods);
        
        // Auto-update country fields if they're empty
        if (!formData.shippingCountry && detectedGeo.countryCode) {
          setFormData(prev => ({
            ...prev,
            shippingCountry: detectedGeo.countryCode,
            billingCountry: prev.sameAsBilling ? detectedGeo.countryCode : prev.billingCountry
          }));
        }

        // Set default payment method based on region recommendation  
        const recommendedMethods = methods.filter(m => m.enabled);
        if (recommendedMethods.length > 0 && formData.paymentMethod === 'card') {
          const preferredMethod = recommendedMethods[0].id;
          if (preferredMethod !== 'card') {
            setFormData(prev => ({
              ...prev,
              paymentMethod: preferredMethod as PaymentMethodType
            }));
          }
        }

      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.warn('Geo-detection failed, using default methods:', error);
        // Fallback to global methods
        const fallbackMethods = getPaymentMethodsForRegion('global');
        setAvailablePaymentMethods(fallbackMethods);
        setGeoData({
          country: 'United States',
          countryCode: 'US',
          region: 'us',
          currency: 'USD'
        });
      } finally {
        setGeoDetectionComplete(true);
      }
    };

    if (!geoDetectionComplete) {
      initializePaymentMethods();
    }
  }, [geoDetectionComplete, formData.shippingCountry, formData.paymentMethod, formData.sameAsBilling]);

  // Track checkout lifecycle events.
  useEffect(() => {
    if (!cart || cartItemCount === 0 || checkoutStartedRef.current) return;

    trackCheckoutStarted(effectiveGrandTotal, cartItemCount);
    checkoutStartedRef.current = true;

    if (cart.id && !growthCheckoutStartedRef.current) {
      growthCheckoutStartedRef.current = true;
      postCheckoutSignal({
        cartId: cart.id,
        step: 'started',
        metadata: { cartValue: effectiveGrandTotal, itemCount: cartItemCount },
      }).catch(() => {
        // Best-effort only
      });
    }
  }, [cart, cartItemCount, effectiveGrandTotal, trackCheckoutStarted]);

  useEffect(() => {
    if (step === 'billing' && !addressTrackedRef.current) {
      trackAddressEntered(formData.shippingCountry || formData.billingCountry, formData.shippingState || formData.billingState);
      addressTrackedRef.current = true;

      if (cart?.id && !growthAddressTrackedRef.current) {
        growthAddressTrackedRef.current = true;
        postCheckoutSignal({
          cartId: cart.id,
          step: 'address_entered',
          metadata: {
            country: formData.shippingCountry || formData.billingCountry,
            state: formData.shippingState || formData.billingState,
          },
        }).catch(() => {
          // Best-effort only
        });
      }
    }

    if (step === 'payment' && !paymentTrackedRef.current) {
      trackPaymentEntered(formData.paymentMethod);
      paymentTrackedRef.current = true;

      if (cart?.id && !growthPaymentTrackedRef.current) {
        growthPaymentTrackedRef.current = true;
        postCheckoutSignal({
          cartId: cart.id,
          step: 'payment_entered',
          metadata: { paymentMethod: formData.paymentMethod },
        }).catch(() => {
          // Best-effort only
        });
      }
    }
  }, [step, formData.shippingCountry, formData.billingCountry, formData.shippingState, formData.billingState, formData.paymentMethod, trackAddressEntered, trackPaymentEntered]);

  useEffect(() => {
    return () => {
      if (checkoutStartedRef.current && !orderCompletedRef.current) {
        trackCheckoutAbandoned('left_checkout', effectiveGrandTotal);

        if (cart?.id && !growthAbandonedRef.current) {
          growthAbandonedRef.current = true;
          postCheckoutSignal({
            cartId: cart.id,
            step: 'abandoned',
            metadata: { reason: 'left_checkout', cartValue: effectiveGrandTotal },
          }).catch(() => {
            // Best-effort only
          });
        }
      }
    };
  }, [cart?.id, effectiveGrandTotal, trackCheckoutAbandoned]);

  // Load server recalculated totals after a price-change response.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('selsa_price_change_totals');
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as Record<string, string>;
      const parsedTotals: PriceChangeTotals = {
        subtotal: Number(parsed.subtotal),
        shipping: Number(parsed.shipping),
        tax: Number(parsed.tax),
        total: Number(parsed.total),
      };

      if (
        Number.isFinite(parsedTotals.subtotal) &&
        Number.isFinite(parsedTotals.shipping) &&
        Number.isFinite(parsedTotals.tax) &&
        Number.isFinite(parsedTotals.total)
      ) {
        setPriceChangeTotals(parsedTotals);
      }
    } catch {
      // ignore parse errors
    } finally {
      window.localStorage.removeItem('selsa_price_change_totals');
    }
  }, []);

  // Detect Apple Pay / Google Pay support on the current device/browser.
  useEffect(() => {
    if (step !== 'payment') return;

    let cancelled = false;

    const run = async () => {
      try {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          if (!cancelled) setWalletSupport({ checked: true, applePay: false, googlePay: false });
          return;
        }

        const stripe = await loadStripe(publishableKey);
        if (!stripe) {
          if (!cancelled) setWalletSupport({ checked: true, applePay: false, googlePay: false });
          return;
        }

        const amount = Math.round(effectiveGrandTotal * 100);
        const currency = 'usd';
        const cc = (formData.shippingCountry || formData.billingCountry || 'US').toUpperCase();
        const country = /^[A-Z]{2}$/.test(cc) ? cc : 'US';

        const pr = stripe.paymentRequest({
          country,
          currency,
          total: { label: 'Total', amount },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        const result = (await pr.canMakePayment()) as { applePay?: boolean; googlePay?: boolean } | null;
        const applePay = Boolean(result?.applePay);
        const googlePay = Boolean(result?.googlePay);

        if (!cancelled) setWalletSupport({ checked: true, applePay, googlePay });
      } catch {
        if (!cancelled) setWalletSupport({ checked: true, applePay: false, googlePay: false });
      }
    };

    // Reset while checking.
    setWalletSupport((prev) => ({ ...prev, checked: false }));
    run();

    return () => {
      cancelled = true;
    };
  }, [step, effectiveGrandTotal, formData.shippingCountry, formData.billingCountry]);

  // If user selects an unsupported wallet, fall back to card.
  useEffect(() => {
    if (step !== 'payment') return;
    if (!walletSupport.checked) return;

    if ((formData.paymentMethod === 'apple-pay') && !walletSupport.applePay) {
      const msg = t('Apple Pay is not available on this device/browser. Use the payment form below or choose another method.');
      setPaymentError(msg);
      toast.error(msg);
      setFormData((prev) => ({ ...prev, paymentMethod: 'card' as const }));
    }

    if ((formData.paymentMethod === 'google-pay') && !walletSupport.googlePay) {
      const msg = t('Google Pay is not available on this device/browser. Use the payment form below or choose another method.');
      setPaymentError(msg);
      toast.error(msg);
      setFormData((prev) => ({ ...prev, paymentMethod: 'card' as const }));
    }
  }, [step, walletSupport, formData.paymentMethod, t]);

  // Detect Klarna / Afterpay / Affirm support (Stripe account + currency + country).
  // We do this server-side via a preflight PaymentIntent that is immediately cancelled.
  useEffect(() => {
    if (step !== 'payment') return;

    let cancelled = false;
    const controller = new AbortController();

    const checkMethod = async (preferredPaymentMethod: 'klarna' | 'afterpay' | 'affirm') => {
      const response = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
          body: JSON.stringify({
          amount: Math.round(effectiveGrandTotal * 100),
            amountInCents: true,
          currency: 'usd',
          preferredPaymentMethod,
          preflight: true,
          metadata: {
            checkoutPreflight: 'true',
          },
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { success?: boolean };
      return Boolean(response.ok && data?.success);
    };

    const run = async () => {
      try {
        setBnplSupport((prev) => ({ ...prev, checked: false }));

        // If Stripe isn't configured client-side, don't attempt preflight.
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          if (!cancelled) setBnplSupport({ checked: true, klarna: false, afterpay: false, affirm: false });
          return;
        }

        const [klarna, afterpay, affirm] = await Promise.all([
          checkMethod('klarna'),
          checkMethod('afterpay'),
          checkMethod('affirm'),
        ]);

        if (!cancelled) setBnplSupport({ checked: true, klarna, afterpay, affirm });
      } catch {
        if (!cancelled) setBnplSupport({ checked: true, klarna: false, afterpay: false, affirm: false });
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [step, effectiveGrandTotal]);

  // If user selects an unsupported BNPL method, fall back to card.
  useEffect(() => {
    if (step !== 'payment') return;
    if (!bnplSupport.checked) return;

    if (formData.paymentMethod === 'klarna' && !bnplSupport.klarna) {
      const msg = t('Klarna is not available right now. Please choose a different payment method.');
      setPaymentError(msg);
      toast.error(msg);
      setFormData((prev) => ({ ...prev, paymentMethod: 'card' as const }));
    }

    if (formData.paymentMethod === 'afterpay' && !bnplSupport.afterpay) {
      const msg = t('Afterpay is not available right now. Please choose a different payment method.');
      setPaymentError(msg);
      toast.error(msg);
      setFormData((prev) => ({ ...prev, paymentMethod: 'card' as const }));
    }

    if (formData.paymentMethod === 'affirm' && !bnplSupport.affirm) {
      const msg = t('Affirm is not available right now. Please choose a different payment method.');
      setPaymentError(msg);
      toast.error(msg);
      setFormData((prev) => ({ ...prev, paymentMethod: 'card' as const }));
    }
  }, [step, bnplSupport, formData.paymentMethod, t]);

  // ✅ Update shipping display data when calculation changes
  useEffect(() => {
    if (calculation?.shipping_breakdown) {
      setShippingDisplayData({
        total: shippingCost,
        breakdown: calculation.shipping_breakdown,
        currency: 'USD',
        region: calculation.shipping_breakdown.region,
        isLoading: calculationLoading,
        error: null,
      });
    }
  }, [calculation, shippingCost, calculationLoading]);

  // ✅ Guest checkout supported — pre-fill email from session if available
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: session.user?.email || '' }));
    }
  }, [status, session?.user?.email, formData.email]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && (!cart || cart.items.length === 0)) {
      if (typeof window !== 'undefined') {
        const cartKey = cart?.id ?? 'current';
        window.localStorage.removeItem(`selsa_checkout_progress_${cartKey}`);
      }
      toast.info('Your cart is empty.');
      router.push('/cart');
    }
  }, [cart, loading, router]);

  // Call Printful API when shipping state/country changes or shipping method changes
  useEffect(() => {
    // Country is the only required field — zip and state improve precision but are optional
    if (!cart?.items || cart.items.length === 0 || !formData.shippingCountry) return;

    const calculatePricing = async () => {
      const items = cart.items.map(item => ({
        variant_id: item.variant_detail?.id || item.id,
        quantity: item.quantity,
        value: String(Number(item.variant_detail?.price ?? item.product_price ?? 0)),
      }));

      const provinceCode = getProvinceCode(formData.shippingCountry, formData.shippingState);
      
      const recipient = {
        country_code: formData.shippingCountry,
        state_code: provinceCode,
        zip: formData.shippingZip || '',
      };

      await calculateCartTotal(items, recipient, shippingMethod);
    };

    calculatePricing();
  }, [status, cart?.items, formData.shippingCountry, formData.shippingZip, formData.shippingState, shippingMethod, calculateCartTotal]);

  // Auto-fill city when state changes
  useEffect(() => {
    if (formData.shippingState) {
      const stateCode = getProvinceCode(formData.shippingCountry, formData.shippingState);
      const city = getCityForState(formData.shippingCountry, stateCode);
      if (city && formData.shippingCity !== city) {
        setFormData((prev) => ({ ...prev, shippingCity: city }));
      }
    }
  }, [formData.shippingState, formData.shippingCountry, formData.shippingCity]);

  // Auto-fill billing city when billing state changes (if different from shipping)
  useEffect(() => {
    if (!formData.sameAsBilling && formData.billingState) {
      const stateCode = getProvinceCode(formData.billingCountry, formData.billingState);
      const city = getCityForState(formData.billingCountry, stateCode);
      if (city && formData.billingCity !== city) {
        setFormData((prev) => ({ ...prev, billingCity: city }));
      }
    }
  }, [formData.billingState, formData.billingCountry, formData.sameAsBilling, formData.billingCity]);

  // Sync billing address with shipping when sameAsBilling is true
  useEffect(() => {
    if (formData.sameAsBilling) {
      setFormData((prev) => ({
        ...prev,
        billingCountry: prev.shippingCountry,
        billingAddress: prev.shippingAddress,
        billingAddress2: prev.shippingAddress2,
        billingCity: prev.shippingCity,
        billingState: prev.shippingState,
        billingZip: prev.shippingZip,
      }));
    }
  }, [formData.sameAsBilling, formData.shippingCountry, formData.shippingAddress, formData.shippingAddress2, formData.shippingCity, formData.shippingState, formData.shippingZip]);

  // Recalculate on dependency change
  useEffect(() => {
    // Calculation values updated
  }, [calculation, shippingCost, tax, grandTotal]);

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = useCallback((currentStep: string): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 'shipping') {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';

      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      if (!formData.shippingCountry.trim()) newErrors.shippingCountry = 'Country is required';
      if (!formData.shippingAddress.trim()) newErrors.shippingAddress = 'Address is required';
      if (!formData.shippingCity.trim()) newErrors.shippingCity = 'City is required';
      if (!formData.shippingState.trim()) newErrors.shippingState = 'State is required';
      if (!formData.shippingZip.trim()) newErrors.shippingZip = 'ZIP code is required';
    }

    if (currentStep === 'billing' && !formData.sameAsBilling) {
      if (!formData.billingCountry.trim()) newErrors.billingCountry = 'Country is required';
      if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
      if (!formData.billingCity.trim()) newErrors.billingCity = 'City is required';
      if (!formData.billingState.trim()) newErrors.billingState = 'State is required';
      if (!formData.billingZip.trim()) newErrors.billingZip = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const buildVerificationPayload = useCallback(() => {
    const countryCode = formData.shippingCountry || formData.billingCountry;
    const zip = formData.shippingZip || formData.billingZip;
    if (!countryCode || !zip) return null;

    const stateRaw = formData.shippingState || formData.billingState || '';
    const stateCode = getProvinceCode(countryCode, stateRaw);
    const isPaypal = formData.paymentMethod === 'paypal';
    const paymentProvider = isPaypal ? 'paypal' : 'stripe';
    const paymentReference = !isPaypal ? stripePaymentIntentId ?? undefined : undefined;
    const paymentStatus = stripePaymentComplete ? 'captured' : 'pending';

    const shippingAddress = {
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      address_line_1: formData.shippingAddress,
      address_line_2: formData.shippingAddress2 || '',
      city: formData.shippingCity,
      state: formData.shippingState,
      postal_code: formData.shippingZip,
      country: formData.shippingCountry,
    };

    const billingAddress = formData.sameAsBilling
      ? { ...shippingAddress, country: formData.billingCountry || formData.shippingCountry }
      : {
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          address_line_1: formData.billingAddress,
          address_line_2: formData.billingAddress2 || '',
          city: formData.billingCity,
          state: formData.billingState,
          postal_code: formData.billingZip,
          country: formData.billingCountry,
        };

    return {
      recipient: {
        country_code: countryCode,
        state_code: stateCode || undefined,
        zip,
      },
      shipping_method: shippingMethod,
      expected_totals: {
        subtotal: effectiveSubtotal,
        shipping: effectiveShipping,
        tax: effectiveTax,
        total: effectiveGrandTotal,
      },
      currency: 'USD',
      payment_provider: paymentProvider,
      payment_reference: paymentReference,
      payment_status: paymentStatus,
      customer_email: formData.email,
      customer_phone: formData.phone,
      shipping_address: shippingAddress,
      billing_address: billingAddress,

    };
  }, [
    formData.shippingCountry,
    formData.billingCountry,
    formData.shippingZip,
    formData.billingZip,
    formData.shippingState,
    formData.billingState,
    formData.paymentMethod,
    formData.firstName,
    formData.lastName,
    formData.phone,
    formData.shippingAddress,
    formData.shippingCity,
    formData.billingAddress,
    formData.billingCity,
    formData.sameAsBilling,
    formData.email,
    shippingMethod,
    effectiveSubtotal,
    effectiveShipping,
    effectiveTax,
    effectiveGrandTotal,
    stripePaymentIntentId,
    stripePaymentComplete,
  ]);

  const getOrCreateIdempotencyKey = useCallback((cartId: number) => {
    if (typeof window === 'undefined') return undefined;
    const storageKey = `selsa_checkout_idempotency_${cartId}`;
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;

    const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `idem_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(storageKey, generated);
    return generated;
  }, []);

  // Update payment method handler to set selectedPaymentMethod
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Set selected payment method for form display
    if (name === 'paymentMethod') {
      setSelectedPaymentMethod(value);
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePaymentMethodSelection = (value: PaymentMethodType) => {
    setFormData((prev) => {
      if (prev.paymentMethod === value) return prev;
      return { ...prev, paymentMethod: value };
    });
    setSelectedPaymentMethod(value);

    if (errors.paymentMethod) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.paymentMethod;
        return newErrors;
      });
    }
  };

  const revalidateInventory = useCallback(async () => {
    if (!cart?.id) return true;

    try {
      await apiClient.post(`/cart/${cart.id}/revalidate/`);
      return true;
    } catch (err: any) {
      // If the endpoint doesn't exist (404/405) or auth fails (401/403),
      // skip blocking — inventory will be verified server-side at order placement.
      const httpStatus = err?.response?.status;
      if (httpStatus === 401 || httpStatus === 403 || httpStatus === 404 || httpStatus === 405) {
        return true;
      }
      const message = err?.response?.data?.error || t('Some items are no longer available.');
      setPaymentError(message);
      toast.error(message);
      return false;
    }
  }, [cart?.id, t]);

  const handleNextStep = async () => {
    // Require Stripe payment completion before proceeding to review.
    if (step === 'payment' && !stripePaymentComplete) {
      toast.error(t('Please complete your payment to continue.'));
      return;
    }

    if (!validateStep(step)) {
      toast.error('Please fix the errors below');
      return;
    }

    if (step === 'billing') {
      const ok = await revalidateInventory();
      if (!ok) return;
    }

    const steps: Array<'shipping' | 'billing' | 'payment' | 'review'> = ['shipping', 'billing', 'payment', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    const steps: Array<'shipping' | 'billing' | 'payment' | 'review'> = ['shipping', 'billing', 'payment', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePayPalPayment = async () => {
    setProcessingPayment(true);
    try {
      const inventoryOk = await revalidateInventory();
      if (!inventoryOk) {
        setProcessingPayment(false);
        return;
      }

      const verification = buildVerificationPayload();
      if (verification && typeof window !== 'undefined') {
        window.localStorage.setItem('selsa_checkout_payload', JSON.stringify(verification));
      }

      if (cart?.id) {
        getOrCreateIdempotencyKey(cart.id);
      }

      if (cart?.id) {
        window.localStorage.setItem('selsa_paypal_cart_id', String(cart.id));
      }

      // Redirect to PayPal for payment
      const response = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          amount: effectiveGrandTotal.toFixed(2),
          currency: 'USD',
          cartId: cart?.id,
          customerEmail: formData.email,
          returnUrl: `${window.location.origin}/checkout/paypal/return`,
          cancelUrl: `${window.location.origin}/checkout/paypal/cancel`,
        }),
      });

      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setPaymentError(data.error || 'Failed to initiate PayPal payment');
        toast.error(data.error || 'Failed to initiate PayPal payment');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Enhanced order placement with comprehensive validation
  const handlePlaceOrderWithValidation = async () => {
    if (!cart?.id) return;
    
    try {
      setValidationInProgress(true);
      setValidationErrors([]);
      
      // Step 1: Validate payment completion
      if (!stripePaymentComplete) {
        toast.error(t('Please complete your payment to continue.'));
        return;
      }

      // Step 2: Check network connectivity  
      if (!isOnline) {
        toast.error(t('No internet connection. Please check your connection and try again.'));
        return;
      }

      // Step 3: Comprehensive cart validation
      const cartItems = cart.items?.map(item => ({
        id: item.id,
        variant_id: item.variant_detail?.id || 0,
        quantity: item.quantity || 1,
        product_price: item.variant_detail?.price || item.product_price || 0,
        product_name: item.product_name || 'Unknown Item'
      })) || [];

      const validation = await withRetry(
        () => validateCartBeforeCheckout(cartItems),
        {
          maxRetries: 2,
          shouldRetry: isNetworkError,
          onRetry: (attempt) => {
            toast.info(t('Validating order, attempt {{attempt}}...', { attempt }));
          }
        }
      );

      // Step 4: Handle validation results
      if (!validation.canProceed) {
        setValidationErrors(validation.issues);
        
        if (validation.hasStockIssues) {
          const outOfStockItems = cartItems.filter(item => 
            validation.issues.some(issue => issue.includes(item.product_name))
          );
          const canContinue = await handleOutOfStockItems(outOfStockItems);
          if (!canContinue) return;
        }
        
        if (validation.hasPriceChanges) {
          const priceChanges = validation.issues
            .filter(issue => issue.includes('Price'))
            .map(issue => ({ 
              itemName: 'Item', 
              oldPrice: 0, 
              newPrice: 0, 
              percentageChange: 5 
            }));
          const canContinue = handlePriceChanges(priceChanges);
          if (!canContinue) return;
          setPriceChangeWarning(true);
        }
      }

      // Step 5: Place order with retry logic
      const verification = buildVerificationPayload();
      if (verification && typeof window !== 'undefined') {
        window.localStorage.setItem('selsa_checkout_payload', JSON.stringify(verification));
      }
      
      const idempotencyKey = getOrCreateIdempotencyKey(cart.id);
      
      const order = await placeOrder(cart.id, verification || undefined, idempotencyKey);
      
      if (order) {
        orderCompletedRef.current = true;
        trackOrderCompleted(String(order.id), Number(order.total_amount ?? effectiveGrandTotal), cartItemCount);
        
        // Redirect to confirmation page — guests use standalone route (no AccountLayout)
        const confirmPath = status === 'authenticated'
          ? `/account/orders/confirmation/${order.id}`
          : `/orders/confirmation/${order.id}`;
        router.push(confirmPath);
      }
      
    } catch (error: any) {
      console.error('Order placement error:', error);
      
      if (isNetworkError(error)) {
        toast.error(t('Connection lost. Please check your internet and try again.'));
      } else {
        const paymentError = mapStripeError(error);
        setPaymentError(paymentError.userMessage);
        toast.error(paymentError.userMessage);
        
        if (paymentError.recoverable) {
          // Show retry option
          setRetryCount(prev => prev + 1);
        }
      }
    } finally {
      setValidationInProgress(false);
    }
  };



  // Auto-place order right after Stripe payment succeeds.
  // Called from onSuccess via a ref so it always sees the latest state.
  const handleAutoPlaceOrder = useCallback(async (intentId: string) => {
    console.log('[handleAutoPlaceOrder] START intentId=', intentId, 'cart.id=', cart?.id);
    if (!cart?.id) { console.error('[handleAutoPlaceOrder] ABORT: no cart.id'); return; }

    // Reset transient states
    setProcessingTimedOut(false);
    setPaymentSucceededOrderFailed(false);

    // Start a 30-second timeout that shows an escape hatch
    processingTimerRef.current = setTimeout(() => {
      setProcessingTimedOut(true);
    }, 30_000);

    try {
      setValidationInProgress(true);
      setStep('review'); // show "processing" state
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const verification = buildVerificationPayload();
      console.log('[handleAutoPlaceOrder] verification=', verification ? 'built' : 'NULL', 'payment_status=', verification?.payment_status);
      if (verification && typeof window !== 'undefined') {
        // Ensure the verification reflects the just-completed payment
        verification.payment_reference = intentId;
        verification.payment_status = 'captured';
        window.localStorage.setItem('selsa_checkout_payload', JSON.stringify(verification));
      }

      const idempotencyKey = getOrCreateIdempotencyKey(cart.id);
      console.log('[handleAutoPlaceOrder] calling placeOrder cart.id=', cart.id, 'idempotencyKey=', idempotencyKey);

      const order = await placeOrder(cart.id, verification || undefined, idempotencyKey);

      console.log('[handleAutoPlaceOrder] placeOrder returned:', order ? `order #${order.id}` : 'NULL');
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);

      if (order) {
        orderCompletedRef.current = true;
        trackOrderCompleted(String(order.id), Number(order.total_amount ?? effectiveGrandTotal), cartItemCount);
        // Guests use standalone confirmation (no AccountLayout auth guard)
        const confirmPath = status === 'authenticated'
          ? `/account/orders/confirmation/${order.id}`
          : `/orders/confirmation/${order.id}`;
        router.push(confirmPath);
      } else {
        // placeOrder returned null — the hook already showed a toast with the
        // specific error message, but we need to update the UI so the user
        // isn't stuck staring at a green checkmark forever.
        setPaymentSucceededOrderFailed(true);
        setPaymentError(t('Your payment was received but we had trouble creating your order. Please check your Orders page in a few minutes, or contact support if the order does not appear.'));
      }
    } catch (error: any) {
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      console.error('Auto order placement error:', error);

      // Payment was already captured by Stripe — order placement failed
      setPaymentSucceededOrderFailed(true);

      if (isNetworkError(error)) {
        setPaymentError(t('Connection lost after payment. Your payment was received — your order will appear on your Orders page shortly. If not, please contact support.'));
        toast.error(t('Connection lost. Your payment is safe.'));
      } else {
        const paymentErr = mapStripeError(error);
        setPaymentError(t('Your payment was received but we had trouble creating your order. Please check your Orders page in a few minutes, or contact support if the order does not appear.'));
        toast.error(paymentErr.userMessage);
      }
    } finally {
      setValidationInProgress(false);
    }
  }, [cart?.id, buildVerificationPayload, getOrCreateIdempotencyKey, placeOrder, trackOrderCompleted, effectiveGrandTotal, cartItemCount, router, t]);

  // Keep the ref in sync with the latest version of the function
  useEffect(() => {
    autoPlaceOrderRef.current = handleAutoPlaceOrder;
  }, [handleAutoPlaceOrder]);

  // Generate payment method options from Stripe presets via geo-detection
  const getPaymentMethodOptions = (): PaymentMethodOption[] => {
    if (!geoDetectionComplete || availablePaymentMethods.length === 0) {
      return [];
    }

    return availablePaymentMethods
      .filter(config => config.enabled)
      .map(config => ({
        id: config.id,
        value: config.id as PaymentMethodType,
        label: t(getLocalizedMethodName(config.id, config.name)),
        icon: getPaymentMethodIcon(config.id),
        region: geoData?.region,
        processingTime: config.processingTime,
        requiresRedirect: config.requiresRedirect,
        disabled: false,
      }));
  };

  // Get localized payment method name
  const getLocalizedMethodName = (methodId: string, defaultName: string): string => {
    const localizedNames: Record<string, string> = {
      'card': 'Credit/Debit Card',
      'paypal': 'PayPal',
      'apple-pay': 'Apple Pay',
      'google-pay': 'Google Pay',
      'ideal': 'iDEAL',
      'bancontact': 'Bancontact',
      'sofort': 'SOFORT Banking',
      'giropay': 'Giropay',
      'eps': 'EPS',
      'sepa-debit': 'SEPA Direct Debit',
      'klarna': 'Klarna Pay Later',
      'klarna-uk': 'Klarna',
      'affirm': 'Affirm',
      'afterpay': 'Afterpay',
      'amazon-pay': 'Amazon Pay',
      'bacs': 'BACS Direct Debit',
      'faster-payments': 'UK Faster Payments'
    };
    
    return localizedNames[methodId] || defaultName;
  };

  // Get payment method icon
  const getPaymentMethodIcon = (methodId: string): ReactNode => {
    const iconStyle = { width: 'auto', height: '40px', maxHeight: '40px' };
    const iconMap: Record<string, ReactNode> = {
      'card': (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" style={iconStyle}>
            <rect width="60" height="40" rx="5" fill="#1a1f71"/>
            <text x="30" y="25" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">VISA</text>
          </svg>
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" style={iconStyle}>
            <rect width="60" height="40" rx="5" fill="#000"/>
            <circle cx="22" cy="20" r="9" fill="#eb001b"/>
            <circle cx="38" cy="20" r="9" fill="#f79e1b"/>
            <path d="M30 14c1.3 1.3 2.1 3.5 2.1 6s-0.8 4.7-2.1 6c-1.3-1.3-2.1-3.5-2.1-6s0.8-4.7 2.1-6z" fill="#ff5f00"/>
          </svg>
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" style={iconStyle}>
            <rect width="60" height="40" rx="5" fill="#006fcf"/>
            <rect x="8" y="15" width="44" height="10" fill="white" />
            <text x="30" y="24" textAnchor="middle" fill="#006fcf" fontSize="9" fontWeight="bold">AMEX</text>
          </svg>
        </div>
      ),
      'paypal': (
        // <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={iconStyle}>
        //   <rect width="80" height="40" rx="5" fill="#f7f8fa"/>
        //   <path d="M32.2 15.4h11.4c2.4 0 4.4 2 4.4 4.4s-2 4.4-4.4 4.4H32.2l2.2-8.8z" fill="#003087"/>
        //   <path d="M34.4 20h10.2c1.2 0 2.2 1 2.2 2.2s-1 2.2-2.2 2.2H34.4l1.1-4.4z" fill="#009cde"/>
        //   <text x="40" y="32" textAnchor="middle" fill="#003087" fontSize="10" fontWeight="bold">PayPal</text>
        // </svg>
        
        <svg width="80px" height="40px" viewBox="0 -9 58 58" style={iconStyle}>
          <rect x="0.5" y="0.5" width="57" height="39" rx="3.5" fill="white" stroke="#F3F3F3"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M26.4388 20.2562L26.6913 18.6477L26.1288 18.6346H23.4429L25.3095 6.76505C25.3153 6.72911 25.3341 6.69575 25.3616 6.67201C25.3892 6.64827 25.4243 6.63525 25.4611 6.63525H29.9901C31.4937 6.63525 32.5313 6.94897 33.073 7.56826C33.327 7.85879 33.4887 8.16246 33.567 8.49653C33.6491 8.84713 33.6505 9.26596 33.5704 9.77689L33.5646 9.81405V10.1415L33.8186 10.2858C34.0324 10.3996 34.2024 10.5298 34.3328 10.6788C34.55 10.9273 34.6905 11.2431 34.7499 11.6173C34.8113 12.0022 34.791 12.4604 34.6905 12.979C34.5746 13.5755 34.3873 14.0951 34.1343 14.5202C33.9016 14.9119 33.6052 15.2369 33.2531 15.4886C32.9171 15.7279 32.5178 15.9095 32.0664 16.0257C31.6288 16.1399 31.1301 16.1975 30.583 16.1975H30.2305C29.9786 16.1975 29.7338 16.2886 29.5416 16.4517C29.3489 16.6183 29.2215 16.8459 29.1824 17.0947L29.1558 17.2396L28.7096 20.0747L28.6894 20.1787C28.684 20.2117 28.6748 20.2281 28.6613 20.2392C28.6493 20.2494 28.632 20.2562 28.615 20.2562H26.4388" fill="#28356A"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M34.0589 9.85181C34.0455 9.93848 34.03 10.027 34.0126 10.1181C33.4154 13.1934 31.372 14.2558 28.7623 14.2558H27.4335C27.1143 14.2558 26.8453 14.4881 26.7957 14.8038L25.9227 20.3573C25.8904 20.5647 26.0497 20.7514 26.2582 20.7514H28.615C28.894 20.7514 29.1311 20.5481 29.1751 20.2721L29.1982 20.1521L29.6419 17.3281L29.6705 17.1732C29.7139 16.8962 29.9515 16.6928 30.2305 16.6928H30.583C32.8663 16.6928 34.6538 15.7632 35.1763 13.0728C35.3944 11.9489 35.2815 11.0105 34.704 10.3505C34.5293 10.1516 34.3125 9.98635 34.0589 9.85181" fill="#298FC2"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M33.4342 9.60206C33.3429 9.57534 33.2488 9.5512 33.1522 9.52936C33.0551 9.50807 32.9557 9.48922 32.8533 9.47267C32.4951 9.41462 32.1025 9.38708 31.682 9.38708H28.1322C28.0447 9.38708 27.9617 9.40689 27.8874 9.44269C27.7236 9.52163 27.602 9.67707 27.5726 9.86736L26.8174 14.6641L26.7957 14.8039C26.8454 14.4882 27.1144 14.2558 27.4335 14.2558H28.7623C31.372 14.2558 33.4154 13.1929 34.0127 10.1181C34.0305 10.0271 34.0455 9.93856 34.0589 9.85189C33.9078 9.77146 33.7442 9.7027 33.568 9.64411C33.5244 9.62959 33.4795 9.61562 33.4342 9.60206" fill="#22284F"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M27.5726 9.86737C27.6021 9.67708 27.7236 9.52165 27.8874 9.44325C27.9622 9.40731 28.0447 9.38751 28.1322 9.38751H31.682C32.1025 9.38751 32.4951 9.41518 32.8534 9.47323C32.9557 9.48964 33.0551 9.50863 33.1522 9.52992C33.2488 9.55162 33.3429 9.5759 33.4342 9.60248C33.4795 9.61605 33.5244 9.63015 33.5684 9.64412C33.7446 9.70272 33.9084 9.77202 34.0595 9.85191C34.2372 8.71545 34.058 7.94168 33.4453 7.241C32.7698 6.46953 31.5507 6.1394 29.9906 6.1394H25.4615C25.1429 6.1394 24.8711 6.37174 24.8218 6.68803L22.9354 18.6796C22.8982 18.9168 23.0807 19.1309 23.3193 19.1309H26.1153L27.5726 9.86737" fill="#28356A"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.0946 23.5209H9.79248C9.56648 23.5209 9.3743 23.6855 9.339 23.9093L8.00345 32.4009C7.97695 32.5686 8.10638 32.7195 8.27584 32.7195H9.85225C10.0782 32.7195 10.2704 32.555 10.3057 32.3308L10.6659 30.0404C10.7006 29.8162 10.8932 29.6516 11.1188 29.6516H12.1641C14.3393 29.6516 15.5946 28.5959 15.9226 26.5042C16.0703 25.589 15.9288 24.87 15.5014 24.3664C15.0321 23.8134 14.1997 23.5209 13.0946 23.5209ZM13.4755 26.6224C13.2949 27.8106 12.3896 27.8106 11.5143 27.8106H11.0159L11.3655 25.5914C11.3863 25.4573 11.5021 25.3585 11.6374 25.3585H11.8658C12.4621 25.3585 13.0246 25.3585 13.3152 25.6994C13.4886 25.9027 13.5416 26.2049 13.4755 26.6224Z" fill="#28356A"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M23.0496 26.5199H21.4683C21.3336 26.5199 21.2171 26.6187 21.1964 26.7528L21.1264 27.1963L21.0159 27.0356C20.6736 26.5373 19.9101 26.3707 19.1483 26.3707C17.4008 26.3707 15.9084 27.698 15.6177 29.5598C15.4666 30.4885 15.6814 31.3766 16.2068 31.9959C16.6887 32.5653 17.3782 32.8026 18.1985 32.8026C19.6065 32.8026 20.3871 31.8947 20.3871 31.8947L20.3167 32.3354C20.2902 32.5038 20.4196 32.6549 20.5881 32.6549H22.0124C22.2389 32.6549 22.4301 32.4903 22.4659 32.2661L23.3205 26.8385C23.3475 26.6714 23.2185 26.5199 23.0496 26.5199ZM20.8453 29.6064C20.6928 30.5122 19.9759 31.1204 19.0613 31.1204C18.6022 31.1204 18.2353 30.9727 17.9995 30.6929C17.7658 30.415 17.6771 30.0194 17.7513 29.5787C17.8939 28.6805 18.6229 28.0524 19.5235 28.0524C19.9725 28.0524 20.3375 28.2022 20.578 28.4843C20.8188 28.7695 20.9145 29.1676 20.8453 29.6064Z" fill="#28356A"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M31.3495 26.6556H29.7604C29.6088 26.6556 29.4664 26.7312 29.3805 26.8576L27.1888 30.095L26.2598 26.9839C26.2014 26.7892 26.0223 26.6556 25.8195 26.6556H24.2581C24.0682 26.6556 23.9365 26.8416 23.9968 27.0208L25.7471 32.1718L24.1016 34.5014C23.9722 34.6849 24.1025 34.9372 24.3261 34.9372H25.9132C26.0639 34.9372 26.2048 34.8635 26.2903 34.7397L31.5754 27.089C31.702 26.906 31.572 26.6556 31.3495 26.6556" fill="#28356A"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M36.6469 23.5209H33.3444C33.1189 23.5209 32.9267 23.6855 32.8914 23.9093L31.5559 32.4009C31.5294 32.5686 31.6588 32.7195 31.8273 32.7195H33.5221C33.6794 32.7195 33.8141 32.6044 33.8387 32.4475L34.2178 30.0404C34.2525 29.8162 34.4453 29.6516 34.6707 29.6516H35.7156C37.8912 29.6516 39.1461 28.5959 39.4745 26.5042C39.6227 25.589 39.4803 24.87 39.0529 24.3664C38.584 23.8134 37.7521 23.5209 36.6469 23.5209ZM37.0279 26.6224C36.8478 27.8106 35.9424 27.8106 35.0666 27.8106H34.5689L34.9189 25.5914C34.9396 25.4573 35.0545 25.3585 35.1902 25.3585H35.4186C36.0144 25.3585 36.5774 25.3585 36.868 25.6994C37.0414 25.9027 37.094 26.2049 37.0279 26.6224Z" fill="#298FC2"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M46.5999 26.5199H45.0195C44.8839 26.5199 44.7685 26.6187 44.7482 26.7528L44.6782 27.1963L44.5671 27.0356C44.2248 26.5373 43.4619 26.3707 42.6999 26.3707C40.9526 26.3707 39.4607 27.698 39.1701 29.5598C39.0194 30.4885 39.2332 31.3766 39.7585 31.9959C40.2415 32.5653 40.9299 32.8026 41.7503 32.8026C43.1582 32.8026 43.9389 31.8947 43.9389 31.8947L43.8685 32.3354C43.842 32.5038 43.9713 32.6549 44.1408 32.6549H45.5647C45.7902 32.6549 45.9823 32.4903 46.0176 32.2661L46.8727 26.8385C46.8988 26.6714 46.7693 26.5199 46.5999 26.5199ZM44.3958 29.6064C44.2442 30.5122 43.5262 31.1204 42.6116 31.1204C42.1534 31.1204 41.7856 30.9727 41.5498 30.6929C41.3163 30.415 41.2283 30.0194 41.3016 29.5787C41.4451 28.6805 42.1732 28.0524 43.0738 28.0524C43.5228 28.0524 43.8878 28.2022 44.1283 28.4843C44.3701 28.7695 44.4657 29.1676 44.3958 29.6064Z" fill="#298FC2"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M48.3324 23.7543L46.9771 32.4013C46.9506 32.569 47.0799 32.7199 47.2484 32.7199H48.611C48.8375 32.7199 49.0296 32.5554 49.0643 32.3312L50.4008 23.84C50.4275 23.6724 50.298 23.5209 50.1295 23.5209H48.6038C48.4691 23.5213 48.3532 23.6202 48.3324 23.7543" fill="#298FC2"/>
        </svg>
      ),
      'apple-pay': (
        // <svg width="100" height="40" viewBox="0 0 100 40" fill="none" style={iconStyle}>
        //   <g transform="translate(30, 8) scale(0.8)">
        //     <path d="M23.8,31.2C21.1,31.2,18,30.3,16,28.4c-2.2-2.1-3.3-5-3.3-8.1c0-4.2,1.6-7.6,4.7-9.8c2.5-1.8,5.4-2.2,8.1-2.2c0.3,0,0.5,0,0.8,0c2.6,0.1,5.5,0.9,7.8,2.5c-0.1-0.1-3.1-1.9-6.3,1.8c-3.4,4-1.4,9.3,2.2,12.1c2.8,2.1,6.1,2.1,8.3,0c0.2-0.2,0.5-0.4,0.6-0.5c-2.5,3.2-5.6,4.9-9.3,4.9C24.3,31.2,24.1,31.2,23.8,31.2z" fill="black"/>
        //     <path d="M25.4,8.4c1.9-2.4,3.1-5.1,3.1-8c-0.2,0-0.5,0-0.7,0c-3.2,0.1-6.2,1.4-8.2,3.5c-2,2-3.3,4.6-3.3,7.5c0,0.3,0,0.5,0,0.8c2.9-0.1,5.8-1.3,7.8-3.2C24.5,8.9,24.9,8.7,25.4,8.4z" fill="black"/>
        //   </g>
        //   <text x="65" y="28" textAnchor="middle" fill="black" fontSize="16" fontWeight="bold">Pay</text>
        // </svg>
        <svg  width="80px" height="40px" viewBox="0 0 32 32" style={iconStyle}>
          <path d="M5.849 11.047c-0.376 0.448-0.975 0.803-1.573 0.751-0.079-0.604 0.219-1.251 0.563-1.652 0.375-0.457 1.031-0.785 1.563-0.812 0.063 0.631-0.183 1.251-0.552 1.713zM6.396 11.917c-0.869-0.053-1.615 0.499-2.027 0.499-0.421 0-1.052-0.473-1.739-0.457-0.891 0.011-1.724 0.52-2.177 1.339-0.943 1.629-0.245 4.041 0.661 5.369 0.443 0.656 0.973 1.375 1.672 1.355 0.661-0.027 0.927-0.437 1.724-0.437 0.807 0 1.036 0.437 1.74 0.421 0.723-0.011 1.181-0.656 1.624-1.312 0.505-0.745 0.713-1.475 0.724-1.511-0.011-0.016-1.401-0.552-1.411-2.167-0.011-1.355 1.093-2 1.14-2.037-0.62-0.937-1.599-1.036-1.932-1.061zM11.412 10.083v9.855h1.515v-3.369h2.095c1.911 0 3.255-1.328 3.255-3.245 0-1.921-1.317-3.24-3.203-3.24zM12.927 11.375h1.745c1.312 0 2.063 0.708 2.063 1.953s-0.751 1.959-2.073 1.959h-1.735zM21.036 20.011c0.953 0 1.833-0.484 2.235-1.256h0.032v1.183h1.4v-4.907c0-1.416-1.124-2.337-2.859-2.337-1.604 0-2.792 0.932-2.833 2.208h1.359c0.115-0.609 0.667-1.005 1.433-1.005 0.927 0 1.443 0.437 1.443 1.24v0.541l-1.885 0.115c-1.761 0.109-2.709 0.833-2.709 2.099 0 1.276 0.98 2.12 2.385 2.12zM21.448 18.844c-0.808 0-1.323-0.391-1.323-0.989 0-0.62 0.495-0.985 1.437-1.043l1.683-0.104v0.557c0 0.923-0.776 1.579-1.803 1.579zM26.573 22.62c1.473 0 2.167-0.573 2.771-2.297l2.656-7.531h-1.536l-1.781 5.817h-0.032l-1.781-5.817h-1.583l2.563 7.172-0.136 0.437c-0.235 0.735-0.609 1.020-1.276 1.020-0.12 0-0.349-0.015-0.443-0.025v1.183c0.088 0.025 0.464 0.036 0.573 0.036z"/>
        </svg>
      ),
      'google-pay': (
        // <svg width="100" height="40" viewBox="0 0 100 40" fill="none" style={iconStyle}>
        //   <g transform="translate(25, 12) scale(1.4)">
        //     <path d="M9.74,4.62v2.58h4.9c-0.2,1.6-1.7,3.4-4.9,3.4c-3,0-5.4-2.5-5.4-5.5s2.4-5.5,5.4-5.5c1.7,0,2.7,0.7,3.4,1.4l2-2C12.9,0.8,11.3,0,9.7,0C5.9,0,2.8,3.1,2.8,6.9s3.1,6.9,6.9,6.9c4.1,0,6.7-2.8,6.7-6.8c0-0.4,0-0.8-0.1-1.2H9.74z" fill="#5f6368"/>
        //   </g>
        //   <text x="65" y="28" textAnchor="middle" fill="black" fontSize="16" fontWeight="bold">Pay</text>
        // </svg>
        <svg width="100px" height="40px" viewBox="0 0 32 32" style={iconStyle}>
          <path d="M32 13.333l-4.177 9.333h-1.292l1.552-3.266-2.75-6.068h1.359l1.99 4.651h0.026l1.927-4.651zM14.646 16.219v3.781h-1.313v-9.333h3.474c0.828-0.021 1.63 0.266 2.25 0.807 0.615 0.505 0.953 1.219 0.943 1.974 0.010 0.766-0.339 1.5-0.943 1.979-0.604 0.531-1.354 0.792-2.25 0.792zM14.641 11.818v3.255h2.198c0.484 0.016 0.958-0.161 1.297-0.479 0.339-0.302 0.526-0.714 0.526-1.141 0-0.432-0.188-0.844-0.526-1.141-0.349-0.333-0.818-0.51-1.297-0.495zM22.63 13.333c0.833 0 1.495 0.234 1.979 0.698s0.724 1.099 0.724 1.906v3.859h-1.083v-0.87h-0.047c-0.469 0.714-1.089 1.073-1.865 1.073-0.667 0-1.219-0.203-1.667-0.615-0.438-0.385-0.682-0.948-0.672-1.531 0-0.646 0.234-1.161 0.708-1.547 0.469-0.38 1.099-0.573 1.885-0.573 0.672 0 1.224 0.13 1.656 0.385v-0.271c0.005-0.396-0.167-0.776-0.464-1.042-0.297-0.276-0.688-0.432-1.094-0.427-0.63 0-1.13 0.276-1.5 0.828l-0.995-0.646c0.547-0.818 1.359-1.229 2.432-1.229zM21.167 17.88c-0.005 0.302 0.135 0.583 0.375 0.766 0.25 0.203 0.563 0.313 0.88 0.307 0.474 0 0.932-0.198 1.271-0.547 0.359-0.333 0.563-0.802 0.563-1.292-0.354-0.292-0.844-0.438-1.474-0.438-0.464 0-0.844 0.115-1.151 0.344-0.307 0.234-0.464 0.516-0.464 0.859zM5.443 10.667c1.344-0.016 2.646 0.479 3.641 1.391l-1.552 1.521c-0.568-0.526-1.318-0.813-2.089-0.797-1.385 0.005-2.609 0.891-3.057 2.198-0.229 0.661-0.229 1.38 0 2.042 0.448 1.307 1.672 2.193 3.057 2.198 0.734 0 1.365-0.182 1.854-0.505 0.568-0.375 0.964-0.958 1.083-1.625h-2.938v-2.052h5.13c0.063 0.359 0.094 0.719 0.094 1.083 0 1.625-0.594 3-1.62 3.927-0.901 0.813-2.135 1.286-3.604 1.286-2.047 0.010-3.922-1.125-4.865-2.938-0.771-1.505-0.771-3.286 0-4.792 0.943-1.813 2.818-2.948 4.859-2.938z"/>
        </svg>
      ),
      'amazon-pay': (
        // <svg width="100" height="40" viewBox="0 0 100 40" fill="none" style={iconStyle}>
        //   <g transform="translate(10, 12) scale(0.8)">
        //     <path d="M29.8,12.2C29.8,12.2,29.8,12.2,29.8,12.2c-0.5-0.1-1-0.2-1.5-0.2c-1.9,0-3.6,0.6-5,1.8c-1.4,1.2-2.3,2.8-2.3,4.7c0,3.2,2.4,5.8,5.6,5.8c2,0,3.7-0.8,4.9-2.2l-1.5-1.2c-0.8,0.9-1.9,1.5-3.3,1.5c-1.9,0-3.6-1.4-3.6-3.8c0-2.4,1.6-3.8,3.6-3.8c1.3,0,2.4,0.5,3.1,1.3l1.6-1.2C32.9,13.4,31.5,12.2,29.8,12.2z" fill="#232f3e"/>
        //     <path d="M40.2,12.2c-3.2,0-5.8,2.6-5.8,5.8s2.6,5.8,5.8,5.8s5.8-2.6,5.8-5.8S43.4,12.2,40.2,12.2z M40.2,21.8c-2.1,0-3.8-1.7-3.8-3.8s1.7-3.8,3.8-3.8s3.8,1.7,3.8,3.8S42.3,21.8,40.2,21.8z" fill="#232f3e"/>
        //     <path d="M18.3,0.2L18.3,0.2c-0.1,0-0.2,0-0.3,0.1c-0.1,0-0.1,0.1-0.1,0.2l-2,6.1H12l-2-6.1C9.9,0.4,9.9,0.3,9.8,0.2C9.7,0.1,9.6,0.1,9.5,0.1h0c-0.1,0-0.3,0.1-0.3,0.3l2.8,8.4l-2.9,8.7c-0.1,0.2,0,0.4,0.2,0.4c0,0,0.1,0,0.1,0h0.1c0.1,0,0.2-0.1,0.3-0.2l2.5-7.6h3.4l2.5,7.6c0.1,0.2,0.2,0.2,0.3,0.2h0.1c0,0,0.1,0,0.1,0c0.2,0,0.3-0.2,0.2-0.4L15.7,9l2.8-8.4C18.6,0.3,18.5,0.2,18.3,0.2z" fill="#ff9900"/>
        //   </g>
        //   <text x="75" y="28" textAnchor="middle" fill="#232f3e" fontSize="16" fontWeight="bold">Pay</text>
        // </svg>
        <svg width="100px" height="40px" viewBox="0 0 32 32" style={iconStyle}>
          <path d="M 8.8710938 8 L 8.6621094 8.0351562 C 8.0081094 8.1171563 7.3775156 8.3618125 6.8535156 8.7578125 C 6.7365156 8.8278125 6.631625 8.921625 6.515625 9.015625 C 6.503625 8.992625 6.4921875 8.9683125 6.4921875 8.9453125 C 6.4681875 8.8163125 6.4565937 8.6778281 6.4335938 8.5488281 C 6.3985937 8.3388281 6.2822656 8.2324219 6.0722656 8.2324219 L 5.5234375 8.2324219 C 5.1854375 8.2324219 5.1269531 8.3038594 5.1269531 8.6308594 L 5.1269531 18.755859 C 5.1389531 18.907859 5.231375 18.988 5.359375 19 L 6.375 19 C 6.515 19 6.5964219 18.907859 6.6074219 18.755859 C 6.6194219 18.708859 6.6191406 18.662234 6.6191406 18.615234 L 6.6191406 15.097656 C 6.6661406 15.144656 6.7016094 15.168406 6.7246094 15.191406 C 7.5766094 15.903406 8.5568594 16.135781 9.6308594 15.925781 C 10.610859 15.727781 11.28675 15.132812 11.71875 14.257812 C 12.05675 13.592813 12.195031 12.916641 12.207031 12.181641 C 12.230031 11.376641 12.160266 10.60175 11.822266 9.84375 C 11.425266 8.91075 10.749375 8.2920312 9.734375 8.0820312 C 9.582375 8.0470312 9.4195781 8.0347187 9.2675781 8.0117188 C 9.1275781 7.9997187 8.9990938 8 8.8710938 8 z M 16.642578 8 C 16.595578 8.012 16.550906 8.0234375 16.503906 8.0234375 C 16.036906 8.0464375 15.580953 8.1047031 15.126953 8.2207031 C 14.834953 8.2907031 14.555391 8.3952813 14.275391 8.4882812 C 14.100391 8.5462812 14.017578 8.6753281 14.017578 8.8613281 C 14.029578 9.0133281 14.017578 9.176125 14.017578 9.328125 C 14.029578 9.561125 14.123703 9.6215 14.345703 9.5625 C 14.718703 9.4695 15.091844 9.3649219 15.464844 9.2949219 C 16.047844 9.1899219 16.643281 9.1426094 17.238281 9.2246094 C 17.553281 9.2826094 17.844969 9.3648125 18.042969 9.6328125 C 18.217969 9.8548125 18.288781 10.134063 18.300781 10.414062 C 18.312781 10.811063 18.3125 11.125484 18.3125 11.521484 C 18.3125 11.544484 18.312781 11.567125 18.300781 11.578125 L 18.242188 11.578125 C 17.740188 11.450125 17.227844 11.380703 16.714844 11.345703 C 16.177844 11.322703 15.641906 11.346203 15.128906 11.533203 C 14.510906 11.743203 14.007797 12.115656 13.716797 12.722656 C 13.494797 13.189656 13.459297 13.680641 13.529297 14.181641 C 13.634297 14.858641 13.961641 15.371266 14.556641 15.697266 C 15.128641 16.012266 15.735234 16.046125 16.365234 15.953125 C 17.088234 15.848125 17.729063 15.545125 18.289062 15.078125 C 18.312062 15.055125 18.336375 15.044484 18.359375 15.021484 C 18.394375 15.208484 18.418125 15.383875 18.453125 15.546875 C 18.476125 15.698875 18.570938 15.790734 18.710938 15.802734 L 19.492188 15.802734 C 19.609188 15.802734 19.714844 15.698312 19.714844 15.570312 C 19.726844 15.535312 19.726562 15.487406 19.726562 15.441406 L 19.726562 10.462891 C 19.723562 10.263891 19.710781 10.053469 19.675781 9.8554688 C 19.582781 9.2374687 19.325625 8.7234844 18.765625 8.3964844 C 18.450625 8.2094844 18.101516 8.1165938 17.728516 8.0585938 C 17.553516 8.0345937 17.389844 8.023 17.214844 8 L 16.642578 8 z M 20.6875 8.0019531 C 20.5705 8.0019531 20.512156 8.1056562 20.535156 8.2226562 C 20.558156 8.3166563 20.593906 8.422625 20.628906 8.515625 C 21.561906 10.825625 22.506172 13.134078 23.451172 15.455078 C 23.533172 15.653078 23.544172 15.817625 23.451172 16.015625 C 23.300172 16.364625 23.170813 16.726172 23.007812 17.076172 C 22.867813 17.391172 22.635156 17.62575 22.285156 17.71875 C 22.052156 17.77775 21.795781 17.800625 21.550781 17.765625 C 21.433781 17.753625 21.316219 17.73075 21.199219 17.71875 C 21.035219 17.70675 20.955359 17.776172 20.943359 17.951172 L 20.943359 18.419922 C 20.955359 18.688922 21.036687 18.804562 21.304688 18.851562 C 21.561687 18.897562 21.829375 18.931359 22.109375 18.943359 C 22.925375 18.954359 23.568281 18.629969 23.988281 17.917969 C 24.163281 17.637969 24.303641 17.345969 24.431641 17.042969 C 25.562641 14.184969 26.682734 11.33875 27.802734 8.46875 C 27.837734 8.38675 27.859094 8.3039375 27.871094 8.2109375 C 27.894094 8.0709375 27.824266 8.0019062 27.697266 8.0039062 L 26.753906 8.0039062 C 26.590906 7.9919063 26.438859 8.0960469 26.380859 8.2480469 C 26.357859 8.3180469 26.333547 8.3753125 26.310547 8.4453125 L 24.642578 13.216797 C 24.525578 13.554797 24.396297 13.904344 24.279297 14.277344 C 24.255297 14.218344 24.244422 14.195156 24.232422 14.160156 C 23.614422 12.457156 23.008625 10.755734 22.390625 9.0527344 C 22.297625 8.7727344 22.192891 8.502375 22.087891 8.234375 C 22.041891 8.105375 21.935203 8.0136719 21.783203 8.0136719 C 21.421203 8.0016719 21.0605 8.0019531 20.6875 8.0019531 z M 8.859375 9.2128906 C 9.571375 9.2708906 10.154031 9.6212187 10.457031 10.449219 C 10.644031 10.962219 10.691406 11.457141 10.691406 11.994141 C 10.691406 12.496141 10.656859 12.939969 10.505859 13.417969 C 10.178859 14.432969 9.4316094 14.829203 8.4746094 14.783203 C 7.7976094 14.748203 7.2264531 14.490187 6.6894531 14.117188 C 6.6314531 14.082187 6.5964219 14.025797 6.6074219 13.966797 L 6.6074219 10.005859 C 6.5964219 9.9358594 6.6314531 9.87875 6.6894531 9.84375 C 7.3424531 9.38875 8.065375 9.1548906 8.859375 9.2128906 z M 16.427734 12.363281 C 16.627484 12.345781 16.828844 12.349547 17.027344 12.373047 C 17.424344 12.408047 17.82175 12.477156 18.21875 12.535156 C 18.30075 12.547156 18.322266 12.582344 18.322266 12.652344 C 18.310266 12.886344 18.322266 13.107797 18.322266 13.341797 C 18.322266 13.574797 18.310547 13.785531 18.310547 14.019531 C 18.322547 14.077531 18.287234 14.123203 18.240234 14.158203 C 17.703234 14.543203 17.120078 14.801094 16.455078 14.871094 C 16.187078 14.894094 15.918109 14.894062 15.662109 14.789062 C 15.370109 14.684062 15.150359 14.438484 15.068359 14.146484 C 14.975359 13.843484 14.975641 13.528609 15.056641 13.224609 C 15.184641 12.827609 15.463891 12.607516 15.837891 12.478516 C 16.030391 12.420016 16.227984 12.380781 16.427734 12.363281 z M 29.041016 20.001953 C 28.107641 20.014953 27.005922 20.224047 26.169922 20.810547 C 25.911922 20.989547 25.957141 21.238078 26.244141 21.205078 C 27.184141 21.092078 29.276391 20.838406 29.650391 21.316406 C 30.025391 21.794406 29.235719 23.766437 28.886719 24.648438 C 28.778719 24.911437 29.007047 25.020312 29.248047 24.820312 C 30.812047 23.510312 31.218438 20.764141 30.898438 20.369141 C 30.737937 20.171641 29.974391 19.988953 29.041016 20.001953 z M 1.2167969 21.001953 C 0.99873437 21.031953 0.9048125 21.308344 1.1328125 21.527344 C 5.0498125 25.201344 10.225656 27 15.972656 27 C 20.071656 27 24.830234 25.662578 28.115234 23.142578 C 28.658234 22.723578 28.195672 22.09575 27.638672 22.34375 C 23.955672 23.96875 19.955453 24.751953 16.314453 24.751953 C 10.918453 24.751953 5.69475 23.625406 1.46875 21.066406 C 1.37625 21.010406 1.2894844 20.991953 1.2167969 21.001953 z"/>
        </svg>
      ),
      'klarna': (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={iconStyle}>
          <rect width="80" height="40" rx="5" fill="#ffb3c7"/>
          <text x="40" y="26" textAnchor="middle" fill="black" fontSize="14" fontWeight="bold">Klarna.</text>
        </svg>
      ),
      'afterpay': (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={iconStyle}>
          <rect width="80" height="40" rx="5" fill="#b2fce4"/>
          <text x="40" y="26" textAnchor="middle" fill="black" fontSize="14" fontWeight="bold">afterpay</text>
        </svg>
      ),
      'affirm': (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={iconStyle}>
          <rect width="80" height="40" rx="5" fill="#00a0f0"/>
          <text x="40" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">affirm</text>
        </svg>
      ),
      'ideal': (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={iconStyle}>
          <rect width="80" height="40" rx="5" fill="#cc0066"/>
          <text x="40" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">iDEAL</text>
        </svg>
      ),
      'bancontact': (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={iconStyle}>
          <rect width="80" height="40" rx="5" fill="#005aa0"/>
          <text x="40" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Bancontact</text>
          <text x="40" y="32" textAnchor="middle" fill="white" fontSize="8">Payconiq</text>
        </svg>
      ),
      'sofort': (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={iconStyle}>
          <rect width="80" height="40" rx="5" fill="#ef4444"/>
          <text x="40" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">SOFORT</text>
        </svg>
      ),
      'giropay': (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={iconStyle}>
          <rect width="80" height="40" rx="5" fill="#003399"/>
          <text x="40" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">giropay</text>
        </svg>
      ),
      'eps': <div className={styles.paymentIconLetter} style={{height: '40px', width: '80px', fontSize: '18px'}}>EPS</div>,
      'sepa-debit': <div className={styles.paymentIconLetter} style={{height: '40px', width: '80px', fontSize: '18px'}}>SEPA</div>,
      'bacs': <div className={styles.paymentIconLetter} style={{height: '40px', width: '80px', fontSize: '18px'}}>BACS</div>,
      'faster-payments': <div className={styles.paymentIconLetter} style={{height: '40px', width: '80px', fontSize: '18px'}}>FP</div>
    };

    return iconMap[methodId] || <div className={styles.paymentIconLetter} style={{height: '40px', width: '80px', fontSize: '18px'}}>{methodId[0].toUpperCase()}</div>;
  };

  const steps_list = [
    { id: 'shipping', label: t('Shipping') },
    { id: 'billing', label: t('Billing') },
    { id: 'payment', label: t('Payment') },
    { id: 'review', label: t('Review') },
  ];

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutMaxWidth}>
        {/* Header */}
        <div className={styles.checkoutHeader}>
          <h1 className={styles.checkoutTitle}>{t('Secure Checkout')}</h1>
          <p className={styles.checkoutSubtitle}>{t('Complete your purchase securely')}</p>
        </div>

        {/* Progress Steps */}
        <div className={styles.progressSteps} role="list" aria-label={t('Checkout steps')}>
          {steps_list.map((s, idx) => (
            <div key={s.id} className={styles.progressItem} role="listitem">
              <div
                className={`${styles.progressCircle} ${step === s.id || steps_list.findIndex(x => x.id === step) > idx ? styles.progressActive : ''}`}
                aria-current={step === s.id ? 'step' : undefined}
              >
                {steps_list.findIndex(x => x.id === step) > idx ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className={styles.progressLabel}>{s.label}</span>
              {idx < steps_list.length - 1 && <div className={styles.progressLine}></div>}
            </div>
          ))}
        </div>

        <div className={styles.checkoutGrid}>
          {/* Main Form */}
          <div className={styles.checkoutForm}>
            {/* Shipping Information */}
            {step === 'shipping' && (
              <section className={styles.formSection} aria-labelledby="shipping-heading">
                <h2 className={styles.sectionTitle} id="shipping-heading">{t('Shipping Information')}</h2>
                
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="email">{t('Email Address')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder={t('you@example.com')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-required="true"
                  />
                  {errors.email && <span className={styles.errorText} id="email-error" role="alert">{errors.email}</span>}
                </div>

                <div className={styles.twoColumn}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="firstName">{t('First Name')}</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                      placeholder={t('John')}
                      aria-invalid={Boolean(errors.firstName)}
                      aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                      aria-required="true"
                    />
                    {errors.firstName && <span className={styles.errorText} id="firstName-error" role="alert">{errors.firstName}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="lastName">{t('Last Name')}</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                      placeholder={t('Doe')}
                      aria-invalid={Boolean(errors.lastName)}
                      aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                      aria-required="true"
                    />
                    {errors.lastName && <span className={styles.errorText} id="lastName-error" role="alert">{errors.lastName}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="phone">{t('Phone Number')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    placeholder={t('+1 (555) 000-0000')}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    aria-required="true"
                  />
                  {errors.phone && <span className={styles.errorText} id="phone-error" role="alert">{errors.phone}</span>}
                </div>

                <div className={styles.twoColumn}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="shippingCountry">{t('Country')}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="shippingCountry"
                        value={shippingCountrySearch || getCountryName(formData.shippingCountry)}
                        onChange={(e) => {
                          setShippingCountrySearch(e.target.value);
                          setShippingCountryOpen(true);
                        }}
                        onFocus={() => setShippingCountryOpen(true)}
                        onBlur={() => setTimeout(() => setShippingCountryOpen(false), 200)}
                        className={`${styles.input} ${errors.shippingCountry ? styles.inputError : ''}`}
                        placeholder={t('Search country...')}
                        autoComplete="off"
                        aria-invalid={Boolean(errors.shippingCountry)}
                        aria-describedby={errors.shippingCountry ? 'shippingCountry-error' : undefined}
                        aria-required="true"
                        aria-expanded={shippingCountryOpen}
                        aria-controls="shipping-country-list"
                        aria-autocomplete="list"
                      />
                      {shippingCountryOpen && searchCountries(shippingCountrySearch).length > 0 && (
                        <div
                          id="shipping-country-list"
                          role="listbox"
                          aria-label={t('Shipping country options')}
                          style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #ddd',
                          borderTop: 'none',
                          borderRadius: '0 0 4px 4px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 10
                        }}>
                          {searchCountries(shippingCountrySearch).map((country) => (
                            <div
                              key={country.code}
                              role="option"
                              aria-selected={formData.shippingCountry === country.code}
                              tabIndex={0}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  shippingCountry: country.code,
                                  shippingState: '',
                                  shippingZip: '',
                                  shippingCity: '',
                                }));
                                setShippingCountrySearch('');
                                setShippingCountryOpen(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setFormData((prev) => ({
                                    ...prev,
                                    shippingCountry: country.code,
                                    shippingState: '',
                                    shippingZip: '',
                                    shippingCity: '',
                                  }));
                                  setShippingCountrySearch('');
                                  setShippingCountryOpen(false);
                                }
                              }}
                              style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                backgroundColor: formData.shippingCountry === country.code ? '#f0f0f0' : 'white',
                                borderBottom: '1px solid #eee',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = formData.shippingCountry === country.code ? '#f0f0f0' : 'white'}
                            >
                              <span style={{ fontSize: '14px' }}>{country.name}</span>
                              <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>({country.code})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.shippingCountry && <span className={styles.errorText} id="shippingCountry-error" role="alert">{errors.shippingCountry}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="shippingState">{t('State')}</label>
                    <input
                      type="text"
                      id="shippingState"
                      name="shippingState"
                      value={formData.shippingState}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.shippingState ? styles.inputError : ''}`}
                      placeholder={t('NY')}
                      aria-invalid={Boolean(errors.shippingState)}
                      aria-describedby={errors.shippingState ? 'shippingState-error' : undefined}
                      aria-required="true"
                    />
                    {errors.shippingState && <span className={styles.errorText} id="shippingState-error" role="alert">{errors.shippingState}</span>}
                  </div>
                </div>

                <div className={styles.twoColumn}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="shippingCity">{t('City')}</label>
                    <input
                      type="text"
                      id="shippingCity"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.shippingCity ? styles.inputError : ''}`}
                      placeholder={t('New York')}
                      aria-invalid={Boolean(errors.shippingCity)}
                      aria-describedby={errors.shippingCity ? 'shippingCity-error' : undefined}
                      aria-required="true"
                    />
                    {errors.shippingCity && <span className={styles.errorText} id="shippingCity-error" role="alert">{errors.shippingCity}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="shippingZip">{t('ZIP Code')}</label>
                    <input
                      type="text"
                      id="shippingZip"
                      name="shippingZip"
                      value={formData.shippingZip}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.shippingZip ? styles.inputError : ''}`}
                      placeholder={t('10001')}
                      aria-invalid={Boolean(errors.shippingZip)}
                      aria-describedby={errors.shippingZip ? 'shippingZip-error' : undefined}
                      aria-required="true"
                    />
                    {errors.shippingZip && <span className={styles.errorText} id="shippingZip-error" role="alert">{errors.shippingZip}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="shippingAddress">{t('Street Address')}</label>
                  <input
                    type="text"
                    id="shippingAddress"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.shippingAddress ? styles.inputError : ''}`}
                    placeholder={t('123 Main St')}
                    aria-invalid={Boolean(errors.shippingAddress)}
                    aria-describedby={errors.shippingAddress ? 'shippingAddress-error' : undefined}
                    aria-required="true"
                  />
                  {errors.shippingAddress && <span className={styles.errorText} id="shippingAddress-error" role="alert">{errors.shippingAddress}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="shippingAddress2">{t('Apt, Suite, Unit (Optional)')}</label>
                  <input
                    type="text"
                    id="shippingAddress2"
                    name="shippingAddress2"
                    value={formData.shippingAddress2}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder={t('Apt 4B, Suite 200, etc.')}
                  />
                </div>

                {/* Shipping Method */}
                <fieldset className={styles.shippingMethods}>
                  <legend className={styles.methodsTitle}>{t('Shipping Method')}</legend>
                  {calculationLoading && (
                    <p className={styles.loadingText}>{t('Loading shipping options...')}</p>
                  )}
                  <div className={styles.methodOptions}>
                    {[
                      { id: 'STANDARD', label: t('Standard (5-7 days)') },
                      { id: 'EXPRESS', label: t('Express (2-3 days)') },
                      { id: 'OVERNIGHT', label: t('Overnight') },
                    ].map((method) => (
                      <label key={method.id} className={styles.methodOption}>
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={(e) => setShippingMethod(e.target.value as 'STANDARD' | 'EXPRESS' | 'OVERNIGHT')}
                        />
                        <div className={styles.methodContent}>
                          <span className={styles.methodLabel}>{method.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </section>
            )}

            {/* Billing Information */}
            {step === 'billing' && (
              <section className={styles.formSection} aria-labelledby="billing-heading">
                <h2 className={styles.sectionTitle} id="billing-heading">{t('Billing Address')}</h2>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="sameAsBilling"
                    checked={formData.sameAsBilling}
                    onChange={handleInputChange}
                  />
                  <span>{t('Same as shipping address')}</span>
                </label>

                {!formData.sameAsBilling && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="billingCountry">{t('Country')}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          id="billingCountry"
                          value={billingCountrySearch || getCountryName(formData.billingCountry)}
                          onChange={(e) => {
                            setBillingCountrySearch(e.target.value);
                            setBillingCountryOpen(true);
                          }}
                          onFocus={() => setBillingCountryOpen(true)}
                          onBlur={() => setTimeout(() => setBillingCountryOpen(false), 200)}
                          className={`${styles.input} ${errors.billingCountry ? styles.inputError : ''}`}
                          placeholder={t('Search country...')}
                          autoComplete="off"
                          aria-invalid={Boolean(errors.billingCountry)}
                          aria-describedby={errors.billingCountry ? 'billingCountry-error' : undefined}
                          aria-required={!formData.sameAsBilling}
                          aria-expanded={billingCountryOpen}
                          aria-controls="billing-country-list"
                          aria-autocomplete="list"
                        />
                        {billingCountryOpen && searchCountries(billingCountrySearch).length > 0 && (
                          <div
                            id="billing-country-list"
                            role="listbox"
                            aria-label={t('Billing country options')}
                            style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderTop: 'none',
                            borderRadius: '0 0 4px 4px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 10
                          }}>
                            {searchCountries(billingCountrySearch).map((country) => (
                              <div
                                key={country.code}
                                role="option"
                                aria-selected={formData.billingCountry === country.code}
                                tabIndex={0}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    billingCountry: country.code,
                                  }));
                                  setBillingCountrySearch('');
                                  setBillingCountryOpen(false);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setFormData((prev) => ({
                                      ...prev,
                                      billingCountry: country.code,
                                    }));
                                    setBillingCountrySearch('');
                                    setBillingCountryOpen(false);
                                  }
                                }}
                                style={{
                                  padding: '10px 12px',
                                  cursor: 'pointer',
                                  backgroundColor: formData.billingCountry === country.code ? '#f0f0f0' : 'white',
                                  borderBottom: '1px solid #eee',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = formData.billingCountry === country.code ? '#f0f0f0' : 'white'}
                              >
                                <span style={{ fontSize: '14px' }}>{country.name}</span>
                                <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>({country.code})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.billingCountry && <span className={styles.errorText} id="billingCountry-error" role="alert">{errors.billingCountry}</span>}
                    </div>

                    <div className={styles.twoColumn}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="billingState">{t('State')}</label>
                        <input
                          type="text"
                          id="billingState"
                          name="billingState"
                          value={formData.billingState}
                          onChange={handleInputChange}
                          className={`${styles.input} ${errors.billingState ? styles.inputError : ''}`}
                          placeholder={t('NY')}
                          aria-invalid={Boolean(errors.billingState)}
                          aria-describedby={errors.billingState ? 'billingState-error' : undefined}
                          aria-required={!formData.sameAsBilling}
                        />
                        {errors.billingState && <span className={styles.errorText} id="billingState-error" role="alert">{errors.billingState}</span>}
                      </div>
                    </div>

                    <div className={styles.twoColumn}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="billingCity">{t('City')}</label>
                        <input
                          type="text"
                          id="billingCity"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleInputChange}
                          className={`${styles.input} ${errors.billingCity ? styles.inputError : ''}`}
                          placeholder={t('New York')}
                          aria-invalid={Boolean(errors.billingCity)}
                          aria-describedby={errors.billingCity ? 'billingCity-error' : undefined}
                          aria-required={!formData.sameAsBilling}
                        />
                        {errors.billingCity && <span className={styles.errorText} id="billingCity-error" role="alert">{errors.billingCity}</span>}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="billingZip">{t('ZIP Code')}</label>
                        <input
                          type="text"
                          id="billingZip"
                          name="billingZip"
                          value={formData.billingZip}
                          onChange={handleInputChange}
                          className={`${styles.input} ${errors.billingZip ? styles.inputError : ''}`}
                          placeholder={t('10001')}
                          aria-invalid={Boolean(errors.billingZip)}
                          aria-describedby={errors.billingZip ? 'billingZip-error' : undefined}
                          aria-required={!formData.sameAsBilling}
                        />
                        {errors.billingZip && <span className={styles.errorText} id="billingZip-error" role="alert">{errors.billingZip}</span>}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="billingAddress">{t('Street Address')}</label>
                      <input
                        type="text"
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.billingAddress ? styles.inputError : ''}`}
                        placeholder={t('123 Main St')}
                        aria-invalid={Boolean(errors.billingAddress)}
                        aria-describedby={errors.billingAddress ? 'billingAddress-error' : undefined}
                        aria-required={!formData.sameAsBilling}
                      />
                      {errors.billingAddress && <span className={styles.errorText} id="billingAddress-error" role="alert">{errors.billingAddress}</span>}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="billingAddress2">{t('Address Line 2')}</label>
                      <input
                        type="text"
                        id="billingAddress2"
                        name="billingAddress2"
                        value={formData.billingAddress2}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder={t('Apt, suite, unit, etc. (optional)')}
                      />
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Payment Information — Stripe PaymentElement with built-in accordion */}
            {step === 'payment' && (
              <section className={styles.formSection} aria-labelledby="payment-heading">
                <h2 className={styles.sectionTitle} id="payment-heading">{t('Payment Method')}</h2>

                <div className={styles.paymentDetailsSection}>
                  <StripePaymentForm
                      amount={effectiveGrandTotal}
                      useAccordionLayout
                      currency={geoData?.currency?.toLowerCase() || 'usd'}
                      countryCode={formData.billingCountry || formData.shippingCountry || geoData?.countryCode || 'US'}
                      customerEmail={formData.email}
                      customerName={`${formData.firstName} ${formData.lastName}`}
                      billingDetails={{
                          name: `${formData.firstName} ${formData.lastName}`,
                          email: formData.email,
                          phone: formData.phone,
                          address: {
                              line1: formData.billingAddress,
                              line2: formData.billingAddress2,
                              city: formData.billingCity,
                              state: formData.billingState,
                              postal_code: formData.billingZip,
                              country: formData.billingCountry,
                          },
                      }}
                      onSuccess={(intentId) => {
                          setStripePaymentComplete(true);
                          setStripePaymentIntentId(intentId);
                          setPaymentError(null);
                          toast.success(t('Payment successful! Placing your order...'));
                          // Auto-place the order via ref to avoid stale closures
                          autoPlaceOrderRef.current(intentId);
                      }}
                      onError={(error) => {
                          setStripePaymentComplete(false);
                          setPaymentError(error);
                      }}
                  />
              </div>
              </section>
            )}

            {/* Placing Order — shown briefly while auto-placing after payment */}
            {step === 'review' && (
              <section className={styles.formSection} aria-labelledby="review-heading">
                <h2 className={styles.sectionTitle} id="review-heading">{t('Placing Your Order')}</h2>

                {validationInProgress || placingOrder ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <span className="inline-block animate-spin text-3xl">⏳</span>
                    <p className="text-gray-600 text-lg">{t('Please wait while we place your order...')}</p>
                    {processingTimedOut && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center max-w-md">
                        <p className="text-yellow-800 text-sm font-medium mb-2">
                          {t('This is taking longer than usual. Your payment is safe.')}
                        </p>
                        <p className="text-yellow-700 text-xs mb-3">
                          {t('You can wait, or check your orders page — your order may already be there.')}
                        </p>
                        <a
                          href="/orders"
                          className="inline-block px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                        >
                          {t('View My Orders')}
                        </a>
                      </div>
                    )}
                  </div>
                ) : paymentError ? (
                  <div className={styles.reviewSection}>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-medium">{paymentError}</p>

                      {paymentSucceededOrderFailed ? (
                        <div className="mt-4 space-y-3">
                          <p className="text-gray-600 text-sm">
                            {t('Your payment was processed successfully. If your order doesn\'t appear within a few minutes, please contact our support team with your payment reference.')}
                          </p>
                          <div className="flex gap-3 flex-wrap">
                            <a
                              href="/orders"
                              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              {t('View My Orders')}
                            </a>
                            <a
                              href="/support"
                              className="inline-block px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                            >
                              {t('Contact Support')}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <ActionButton
                          onClick={handlePlaceOrderWithValidation}
                          variant="success"
                          size="lg"
                          className={`${styles.primaryButton} mt-4`}
                        >
                          {t('Retry Placing Order')}
                        </ActionButton>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Check size={48} className="text-green-600" />
                    <p className="text-gray-600 text-lg">{t('Redirecting to your order confirmation...')}</p>
                  </div>
                )}

                <div className={styles.trustBadgesCheckout}>
                  <div className={styles.badgeItemCheckout}>
                    <Lock size={18} />
                    <span>{t('256-bit SSL Encryption')}</span>
                  </div>
                  <div className={styles.badgeItemCheckout}>
                    <Shield size={18} />
                    <span>{t('Fraud Protection')}</span>
                  </div>
                  <div className={styles.badgeItemCheckout}>
                    <Truck size={18} />
                    <span>{t('Track Your Order')}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Navigation Buttons */}
            <div className={styles.formButtons}>
              {step !== 'shipping' && (
                <button onClick={handlePrevStep} className={styles.secondaryButton} aria-label={t('Go to previous step')}>{t('Back')}</button>
              )}
              {step !== 'review' && step !== 'payment' && (
                <button onClick={handleNextStep} className={styles.primaryButton} aria-label={t('Go to next step')}>
                  {t('Next')}<ChevronRight size={16} aria-hidden="true" />
                </button>
              )}
              {/* On the payment step, submit the Stripe form via the form attribute */}
              {step === 'payment' && (
                <button
                  type="submit"
                  form="stripe-payment-form"
                  className={styles.primaryButton}
                  aria-label={t('Pay and continue')}
                >
                  {t('Pay')} ${effectiveGrandTotal.toFixed(2)}<ChevronRight size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <aside className={styles.checkoutSidebar}>
            <div className={styles.orderSummary}>
              <h2 className={styles.summaryTitle}>{t('Order Summary')}</h2>

              {/* Items */}
              <div className={styles.summaryItems}>
                {cart && Array.isArray(cart.items) && cart.items.map((item) => {
                  const itemName =
                    getDisplayName({ name: item.product_name }) ||
                    getDisplayName(item.variant_detail?.product) ||
                    'Product';

                  return (
                  <div key={item.id ?? `${item.product_name}-${item.id}`} className={styles.summaryItem}>
                    <div className={styles.summaryItemDetails}>
                      <p className={styles.summaryItemName}>{itemName}</p>
                      <p className={styles.summaryItemQty}>{t('Qty:')}{item.quantity}</p>
                    </div>
                    <p className={styles.summaryItemPrice}>{t('$')}{((item.variant_detail?.price ?? item.product_price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                    </p>
                  </div>
                );
                })}
              </div>

              {/* Shipping breakdown removed — totals shown in price summary below */}

              {/* Promo/coupon code is handled on the cart page */}

              {/* Breakdown */}
                {priceChangeTotals && (
                  <div className={styles.paymentErrorBox} style={{ marginBottom: '16px' }} role="status" aria-live="polite">
                    <AlertCircle size={18} />
                    <span>{t('We updated your totals based on the latest pricing. Please review before paying.')}</span>
                  </div>
                )}

                <div className={styles.summaryBreakdown}>
                <div className={styles.breakdownRow}>
                  <span>{t('Subtotal')}</span>
                    <span>${effectiveSubtotal.toFixed(2)}</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>{t('Shipping')}</span>
                    <span>{calculationLoading ? t('Calculating...') : `$${effectiveShipping.toFixed(2)}`}</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>{t('Tax')}</span>
                    <span>{calculationLoading ? t('Calculating...') : `$${effectiveTax.toFixed(2)}`}</span>
                </div>

                <div className={styles.breakdownTotal}>
                  <span>{t('Total')}</span>
                    <span>{calculationLoading ? t('Calculating...') : `$${effectiveGrandTotal.toFixed(2)}`}</span>
                </div>
              </div>

              {calculation?.shipping_info && (
                <div className={styles.shippingInfo}>
                  <p className={styles.shippingInfoText}>
                    {t('📦')}
                    {calculation.shipping_info.method === 'STANDARD' ? t('Standard Shipping') : 
                     calculation.shipping_info.method === 'EXPRESS' ? t('Express Shipping') :
                     calculation.shipping_info.method === 'OVERNIGHT' ? t('Overnight Shipping') :
                     calculation.shipping_info.method}
                    {calculation.shipping_info.days_min != null && calculation.shipping_info.days_max != null && (
                      <> - {calculation.shipping_info.days_min}-{calculation.shipping_info.days_max} {t('business days')}</>
                    )}
                  </p>
                </div>
              )}

              {/* Security Badges */}
              <div className={styles.securityBadges}>
                <div className={styles.securityBadgesContent}>
                  <Lock size={14} />
                  <span>{t('Secure & Encrypted')}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

