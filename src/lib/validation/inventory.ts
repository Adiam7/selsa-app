/**
 * Inventory and Price Validation for Checkout
 * Handles stock availability and price change detection
 */

import { toast } from 'sonner';

export interface CartItem {
  id: number;
  variant_id: number;
  quantity: number;
  product_price: number;
  product_name: string;
}

export interface StockValidationResult {
  valid: boolean;
  outOfStock: CartItem[];
  insufficientStock: Array<CartItem & { availableQuantity: number }>;
  priceChanges: Array<CartItem & { oldPrice: number; newPrice: number }>;
}

export interface PriceValidationResult {
  valid: boolean;
  changes: Array<{
    itemId: number;
    itemName: string;
    oldPrice: number;
    newPrice: number;
    difference: number;
    percentageChange: number;
  }>;
}

/**
 * Validates cart items against current inventory
 */
export async function validateCartInventory(cartItems: CartItem[]): Promise<StockValidationResult> {
  try {
    const response = await fetch('/api/cart/validate-inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems }),
    });

    if (!response.ok) {
      throw new Error('Inventory validation failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Inventory validation error:', error);
    // Return safe default
    return {
      valid: true,
      outOfStock: [],
      insufficientStock: [],
      priceChanges: [],
    };
  }
}

/**
 * Validates cart prices against current pricing
 */
export async function validateCartPricing(cartItems: CartItem[]): Promise<PriceValidationResult> {
  try {
    const response = await fetch('/api/cart/validate-pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems }),
    });

    if (!response.ok) {
      throw new Error('Price validation failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Price validation error:', error);
    // Return safe default
    return {
      valid: true,
      changes: [],
    };
  }
}

/**
 * Comprehensive cart validation before checkout
 */
export async function validateCartBeforeCheckout(cartItems: CartItem[]): Promise<{
  canProceed: boolean;
  issues: string[];
  hasStockIssues: boolean;
  hasPriceChanges: boolean;
}> {
  const issues: string[] = [];
  let hasStockIssues = false;
  let hasPriceChanges = false;

  if (!cartItems || cartItems.length === 0) {
    issues.push('Cart is empty');
    return { canProceed: false, issues, hasStockIssues, hasPriceChanges };
  }

  try {
    // Check inventory
    const stockValidation = await validateCartInventory(cartItems);
    
    if (stockValidation.outOfStock.length > 0) {
      hasStockIssues = true;
      stockValidation.outOfStock.forEach(item => {
        issues.push(`${item.product_name} is no longer available`);
      });
    }

    if (stockValidation.insufficientStock.length > 0) {
      hasStockIssues = true;
      stockValidation.insufficientStock.forEach(item => {
        issues.push(
          `Only ${item.availableQuantity} of ${item.product_name} available (you have ${item.quantity} in cart)`
        );
      });
    }

    if (stockValidation.priceChanges.length > 0) {
      hasPriceChanges = true;
      stockValidation.priceChanges.forEach(item => {
        const change = ((item.newPrice - item.oldPrice) / item.oldPrice * 100).toFixed(1);
        issues.push(
          `Price of ${item.product_name} changed by ${change}%`
        );
      });
    }

    // Check pricing separately for more detailed change tracking
    const priceValidation = await validateCartPricing(cartItems);
    
    if (!priceValidation.valid && priceValidation.changes.length > 0) {
      hasPriceChanges = true;
      priceValidation.changes.forEach(change => {
        if (Math.abs(change.percentageChange) > 5) { // Significant price change (>5%)
          issues.push(
            `${change.itemName}: Price changed from $${change.oldPrice.toFixed(2)} to $${change.newPrice.toFixed(2)} (${change.percentageChange > 0 ? '+' : ''}${change.percentageChange.toFixed(1)}%)`
          );
        }
      });
    }

    const canProceed = !hasStockIssues && (!hasPriceChanges || issues.length === 0);
    
    return {
      canProceed,
      issues,
      hasStockIssues,
      hasPriceChanges,
    };
  } catch (error) {
    console.error('Cart validation error:', error);
    issues.push('Unable to validate cart. Please try again.');
    return {
      canProceed: false,
      issues,
      hasStockIssues: false,
      hasPriceChanges: false,
    };
  }
}

/**
 * Network error detection and handling
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('network') ||
    error?.message?.includes('fetch') ||
    error instanceof TypeError ||
    error?.name === 'NetworkError'
  );
}

/**
 * Session expiry detection
 */
export function isSessionExpired(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.code === 'UNAUTHORIZED' ||
    error?.message?.includes('session expired') ||
    error?.message?.includes('authentication required')
  );
}

/**
 * Auto-retry mechanism for network operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    backoff?: 'linear' | 'exponential';
    shouldRetry?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    backoff = 'exponential',
    shouldRetry = isNetworkError,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt > maxRetries || !shouldRetry(error)) {
        throw error;
      }

      onRetry?.(attempt, error);

      // Calculate delay
      const delay = backoff === 'exponential' 
        ? baseDelay * Math.pow(2, attempt - 1)
        : baseDelay * attempt;
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const totalDelay = delay + jitter;

      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
}

/**
 * Handle out of stock items during checkout
 */
export async function handleOutOfStockItems(outOfStockItems: CartItem[]): Promise<boolean> {
  if (outOfStockItems.length === 0) return true;

  const itemNames = outOfStockItems.map(item => item.product_name).join(', ');
  
  toast.error(
    `The following items are no longer available: ${itemNames}. Please remove them from your cart.`,
    { duration: 8000 }
  );

  // Auto-remove out of stock items after user confirmation
  if (window.confirm(
    `Would you like us to automatically remove the out-of-stock items (${itemNames}) from your cart so you can continue with your order?`
  )) {
    try {
      await Promise.all(
        outOfStockItems.map(item =>
          fetch(`/api/cart/items/${item.id}`, { method: 'DELETE' })
        )
      );
      
      toast.success('Out-of-stock items removed from cart');
      // Trigger cart refresh
      window.location.reload();
      return false; // Don't proceed with current checkout
    } catch (error) {
      console.error('Failed to remove out-of-stock items:', error);
      toast.error('Please manually remove the out-of-stock items from your cart');
      return false;
    }
  }

  return false; // User declined auto-removal
}

/**
 * Handle price changes during checkout
 */
export function handlePriceChanges(
  priceChanges: Array<{ itemName: string; oldPrice: number; newPrice: number; percentageChange: number }>
): boolean {
  if (priceChanges.length === 0) return true;

  const totalIncrease = priceChanges.reduce((sum, change) => 
    sum + Math.max(0, change.newPrice - change.oldPrice), 0
  );

  const message = priceChanges.length === 1
    ? `The price of ${priceChanges[0].itemName} has changed from $${priceChanges[0].oldPrice.toFixed(2)} to $${priceChanges[0].newPrice.toFixed(2)}.`
    : `Some item prices have changed. Total increase: $${totalIncrease.toFixed(2)}.`;

  toast.warning(`${message} Please review your order before continuing.`, { duration: 8000 });

  return window.confirm(
    `${message}\n\nWould you like to continue with the updated prices?`
  );
}

/**
 * Session expiry handler
 */
export function handleSessionExpiry(): void {
  toast.error('Your session has expired. Please log in again to continue.', {
    duration: 8000,
  });

  // Save current checkout state
  const currentPath = window.location.pathname;
  sessionStorage.setItem('checkout_return_path', currentPath);

  // Redirect to login
  setTimeout(() => {
    window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(currentPath);
  }, 2000);
}