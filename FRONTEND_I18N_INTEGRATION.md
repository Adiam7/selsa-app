# Frontend i18n Integration Guide

## Overview

The backend now returns language-aware display fields based on the `Accept-Language` header. The frontend has been updated to automatically send this header and use the display fields.

## What Was Updated

### 1. Axios Instances - Automatic Accept-Language Header

**File: `src/lib/axios.ts`**

- Added request interceptor to include `Accept-Language` header
- Uses current i18n language from react-i18next
- All axios requests now automatically include the language header

**File: `src/lib/api/auth.ts`**

- Added `Accept-Language` header to auth API client
- Ensures authenticated requests get language-aware responses

### 2. Fetch Wrapper for Direct Fetch Calls

**File: `src/utils/fetchWithLanguage.ts`**

- Created `fetchWithLanguage()` helper function
- Automatically includes `Accept-Language` header
- Use this instead of `fetch()` for API calls

**Example:**

```typescript
import { fetchWithLanguage } from '@/utils/fetchWithLanguage';

// Instead of:
const res = await fetch('/api/products/');

// Use:
const res = await fetchWithLanguage('/api/products/');
```

### 3. Display Field Helpers

**File: `src/utils/i18nDisplay.ts`**

- Utility functions to safely access display fields
- Falls back to raw JSON if display field not available

**Available helpers:**

```typescript
import {
  getDisplayName, // product.name_display || product.name
  getDisplayDescription, // product.description_display || product.description
  getProductName, // variant.product_name_display || variant.name_display
  getValueDisplay, // option.value_display || option.value
  getAddressDisplay, // address.{field}_display || address.{field}
  getFullAddress, // address.full_address
  getRoleNameDisplay, // role.role_name_display || role.name_display
  getLocationDisplay, // tracking.location_display
  getMessageDisplay, // tracking.message_display
} from '@/utils/i18nDisplay';
```

### 4. Updated Components

**Updated Components:**

- `src/features/product/components/ProductCard.tsx`
- `src/app/category/components/ProductCardWithWishlist.tsx`
- `src/components/ProductList.tsx`
- `src/features/cart/services/cartService.ts`

**Migration Pattern:**

```typescript
// Before:
<h3>{product.name}</h3>

// After:
import { getDisplayName } from '@/utils/i18nDisplay';
<h3>{getDisplayName(product)}</h3>
```

## Backend Response Structure

### Products (Catalog, Printful, Local)

```json
{
  "id": 1,
  "name": {"en": "T-Shirt", "ti": "ቲሸርት"},
  "name_display": "T-Shirt",  // ← Based on Accept-Language header
  "description": {"en": "Comfortable cotton t-shirt", "ti": "ምቹ መጠውራት ቲሸርት"},
  "description_display": "Comfortable cotton t-shirt",
  "price": "19.99",
  "variants": [...]
}
```

### Product Variants

```json
{
  "id": 1,
  "product_name": "T-Shirt",
  "product_name_display": "T-Shirt",
  "price": "19.99",
  "option_values": [
    {
      "id": 1,
      "value": { "en": "Red", "ti": "ቀይሕ" },
      "value_display": "Red"
    }
  ]
}
```

### Categories

```json
{
  "id": 1,
  "name": { "en": "Clothing", "ti": "ክዳን" },
  "name_display": "Clothing",
  "description": { "en": "All clothing items", "ti": "ኩሉ ክዳን ፍርያት" },
  "description_display": "All clothing items"
}
```

### Addresses

```json
{
  "id": 1,
  "full_name": { "en": "John Doe", "ti": "ዮሃንስ ዶ" },
  "full_name_display": "John Doe",
  "city": { "en": "Boston", "ti": "ቦስተን" },
  "city_display": "Boston",
  "full_address": "John Doe, 123 Main St, Boston, MA 02101, USA"
}
```

## How It Works

1. **User changes language** in the UI (English ↔ Tigrinya)
2. **i18n updates** the current language (`en` or `ti`)
3. **Axios interceptor** automatically adds `Accept-Language: en` or `Accept-Language: ti` header
4. **Backend detects** the header and returns appropriate `*_display` fields
5. **Components use** display fields via helper functions
6. **UI updates** with content in the selected language

## Migration Checklist

For any component that displays API data:

- [ ] Import the appropriate display helper from `@/utils/i18nDisplay`
- [ ] Replace `product.name` → `getDisplayName(product)`
- [ ] Replace `product.description` → `getDisplayDescription(product)`
- [ ] Replace `variant.name` → `getProductName(variant)`
- [ ] For fetch calls, use `fetchWithLanguage()` instead of `fetch()`
- [ ] For axios calls, no changes needed (already configured)

## Testing

### Test Language Switching:

1. Start the development server: `npm run dev`
2. Open browser console
3. Check Network tab for API requests
4. Verify `Accept-Language` header is present
5. Switch language in the UI
6. Verify new API requests have updated header
7. Verify displayed content changes language

### Test Different Entities:

- [ ] Product listings (name, description)
- [ ] Product details (variants, options)
- [ ] Categories (name, description)
- [ ] Cart items (product names, variant options)
- [ ] Addresses (if applicable)
- [ ] User roles/stores (if applicable)

## Common Patterns

### Product Display

```typescript
import { getDisplayName, getDisplayDescription } from '@/utils/i18nDisplay';

function ProductCard({ product }) {
  return (
    <div>
      <h3>{getDisplayName(product)}</h3>
      <p>{getDisplayDescription(product)}</p>
      <span>${product.price}</span>
    </div>
  );
}
```

### Variant Display

```typescript
import { getProductName, getValueDisplay } from '@/utils/i18nDisplay';

function VariantSelector({ variant }) {
  return (
    <div>
      <h4>{getProductName(variant)}</h4>
      {variant.option_values?.map(option => (
        <span key={option.id}>{getValueDisplay(option)}</span>
      ))}
    </div>
  );
}
```

### Category Display

```typescript
import { getDisplayName, getDisplayDescription } from '@/utils/i18nDisplay';

function CategoryCard({ category }) {
  return (
    <div>
      <h3>{getDisplayName(category)}</h3>
      <p>{getDisplayDescription(category)}</p>
    </div>
  );
}
```

## Notes

- All helpers gracefully fall back if display fields are missing
- Existing code will still work (just won't show translations)
- Display fields are computed server-side (no client-side JSON parsing)
- Language changes trigger new API requests with updated headers
- TypeScript interfaces should be updated to include `*_display` fields as optional

## Next Steps

1. Update remaining components to use display helpers
2. Add TypeScript types for display fields
3. Test with sample bilingual data
4. Create sample products with Tigrinya translations
5. Verify all user-facing text updates on language switch
