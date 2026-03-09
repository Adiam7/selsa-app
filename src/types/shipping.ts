/**
 * Shipping Breakdown Types
 * 
 * Types for displaying tiered shipping cost breakdowns to users.
 * These correspond to the backend PrintfulShippingCalculator API response.
 */

/**
 * A single product category shipping cost item
 */
export interface ShippingItem {
  category: string;           // Product category (T-Shirt, Hoodie, etc.)
  quantity: number;           // Number of items in this category
  cost: number;               // Total shipping cost for this category
  formula: string;            // Display formula (e.g., "8.99 + 3.50×(1)")
}

/**
 * Complete shipping breakdown from the backend
 */
export interface ShippingBreakdown {
  total: number;              // Total shipping cost
  items: ShippingItem[];       // Itemized breakdown by category
  formula: string;            // General formula explanation (single + additional×(n-1))
  region: string;             // Region code (US, EU, INTL)
}

/**
 * Extended shipping response from cart API
 */
export interface ShippingResponse {
  shipping: number;           // Total shipping cost
  breakdown?: ShippingBreakdown;  // Detailed breakdown (optional if API doesn't provide)
  tax?: number;               // Tax amount
  total?: number;             // Order total
}

/**
 * Region information for display
 */
export interface RegionInfo {
  code: string;
  name: string;
  description: string;
  singleRate: number;
  additionalRate: number;
}

/**
 * Comprehensive shipping data for display components
 */
export interface ShippingDisplayData {
  total: number;
  breakdown: ShippingBreakdown;
  currency: string;           // Currency code (USD, EUR, etc.)
  region: string;
  isLoading?: boolean;
  error?: string | null;
}
