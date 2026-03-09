/\*\*

- PHASE 4B - INTEGRATION GUIDE
-
- How to integrate ShippingDisplay component into your checkout page.
-
- This file provides example implementations for different checkout scenarios.
  \*/

// ============================================
// EXAMPLE 1: Basic Integration
// ============================================
// File: src/app/checkout/page.tsx

import React, { useEffect, useState } from 'react';
import { ShippingDisplay } from '@/components/checkout';
import { ShippingDisplayData } from '@/types/shipping';
import { useCart } from '@/hooks/useCart'; // or your cart hook

export default function CheckoutPage() {
const { cart } = useCart();
const [shippingData, setShippingData] = useState<ShippingDisplayData | null>(null);

useEffect(() => {
// Extract shipping data from cart response
if (cart?.shipping_breakdown) {
setShippingData({
total: cart.shipping || 0,
breakdown: cart.shipping_breakdown,
currency: 'USD',
region: cart.shipping_breakdown.region,
isLoading: false,
error: null,
});
}
}, [cart]);

if (!shippingData) return null;

return (
<div className="checkout-page">
{/_ Other checkout content _/}

      <div className="shipping-section">
        <ShippingDisplay data={shippingData} className="mb-6" />
      </div>

      {/* Rest of checkout */}
    </div>

);
}

// ============================================
// EXAMPLE 2: With Loading & Error Handling
// ============================================

import { ShippingDisplay } from '@/components/checkout';
import { useShippingBreakdown } from '@/hooks/useShippingBreakdown';

export function CheckoutWithErrorHandling() {
const { displayData, setBreakdown, setError, setIsLoading } = useShippingBreakdown();
const { cart } = useCart();

useEffect(() => {
if (!cart) {
setIsLoading(true);
return;
}

    try {
      if (cart.shipping_breakdown) {
        setBreakdown(cart.shipping_breakdown);
        setIsLoading(false);
        setError(null);
      } else {
        setError('Shipping information unavailable');
      }
    } catch (err) {
      setError('Failed to load shipping information');
      setIsLoading(false);
    }

}, [cart, setBreakdown, setError, setIsLoading]);

return (
<div className="checkout-shipping">
<ShippingDisplay data={displayData} />
</div>
);
}

// ============================================
// EXAMPLE 3: With Custom Styling
// ============================================

export function CheckoutWithCustomClass() {
const { displayData } = useShippingBreakdown();

return (
<section className="order-summary">
<h2>Order Summary</h2>

      <div className="shipping-container custom-styling">
        <ShippingDisplay
          data={displayData}
          className="bg-white border-2 border-blue-300 rounded-xl"
        />
      </div>
    </section>

);
}

// ============================================
// EXAMPLE 4: Inside Order Form Component
// ============================================

interface OrderFormProps {
onSubmit: (orderData: any) => void;
}

export function OrderForm({ onSubmit }: OrderFormProps) {
const { cart } = useCart();
const { totalItems, categoryBreakdown, formatCost } = useShippingBreakdown({
currency: 'USD',
});

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

    const orderData = {
      items: cart.items,
      shipping: cart.shipping,
      shipping_breakdown: cart.shipping_breakdown,
      tax: cart.tax,
      total: cart.total,
    };

    onSubmit(orderData);

};

return (
<form onSubmit={handleSubmit} className="order-form">
<div className="form-section">
<label>Shipping Information</label>

        {cart.shipping_breakdown && (
          <ShippingDisplay
            data={{
              total: cart.shipping,
              breakdown: cart.shipping_breakdown,
              currency: 'USD',
              region: cart.shipping_breakdown.region,
            }}
          />
        )}
      </div>

      <button type="submit" className="btn btn-primary">
        Continue to Payment
      </button>
    </form>

);
}

// ============================================
// EXAMPLE 5: Mini Version (Summary Page)
// ============================================

import { ShippingBreakdown } from '@/components/checkout';

export function OrderSummary() {
const { cart } = useCart();

return (
<div className="order-summary-card">
<h3>Order Total</h3>

      <div className="summary-items">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${cart.subtotal?.toFixed(2)}</span>
        </div>

        {/* Use just the breakdown component without the full display */}
        {cart.shipping_breakdown && (
          <div className="summary-shipping">
            <ShippingBreakdown
              breakdown={cart.shipping_breakdown}
              currency="USD"
              showFormula={false} // Hide formula in summary
            />
          </div>
        )}

        <div className="summary-row total">
          <span>Total:</span>
          <span>${cart.total?.toFixed(2)}</span>
        </div>
      </div>
    </div>

);
}

// ============================================
// EXPECTED API RESPONSE FORMAT
// ============================================

/\*
The backend API should return:

{
"id": 1,
"items": [
{
"id": 1,
"product_variant": { ... },
"quantity": 2,
...
}
],
"subtotal": 29.98,
"tax": 2.40,
"shipping": 12.49,
"total": 44.87,
"shipping_breakdown": {
"total": 12.49,
"items": [
{
"category": "T-Shirt",
"quantity": 2,
"cost": 12.49,
"formula": "8.99 + 3.50×(1)"
}
],
"formula": "single + additional×(n-1)",
"region": "EU"
}
}

Note: The shipping_breakdown field is NEW - the backend calculates this
in TaxShippingService.get_cart_summary()
\*/

// ============================================
// INTEGRATION CHECKLIST
// ============================================

/_
□ Import ShippingDisplay component
□ Add shipping type to your Cart/Order types if needed
□ Extract shipping breakdown from cart/order response
□ Pass data to ShippingDisplay component
□ Test with different regions (US, EU, INTL)
□ Test with multiple items in same category
□ Test with items from different categories
□ Test loading and error states
□ Verify responsive design on mobile
□ Test tooltip functionality
□ Verify accessibility (tab navigation, screen readers)
□ Test on different browsers
□ Verify formula calculations with manual math
□ Collect user feedback on clarity
_/

export default {};
