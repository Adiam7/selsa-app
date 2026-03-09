# Frontend i18n Fix: Object Rendering Error

## Problem

The frontend was trying to render JSON objects `{en: "...", ti: "..."}` directly in React, causing the error:

```
Objects are not valid as a React child (found: object with keys {en, ti})
```

This happened because components were using raw fields like `product.name` instead of the language-aware `product.name_display` fields from the API.

## Solution

Updated all components to use `*_display` fields from the API responses, which automatically return the correct language based on the `Accept-Language` header.

## Files Fixed

### 1. **CategoryList.tsx**

```tsx
// Before
{
  category.name;
}

// After
{
  category.name_display || category.name;
}
```

### 2. **catalog/page.tsx**

```tsx
// Before
alt={product.name}
<h3>{product.name}</h3>

// After
alt={product.name_display || product.name}
<h3>{product.name_display || product.name}</h3>
```

### 3. **favourites/page.tsx**

```tsx
// Before
name: catalogProduct.name,

// After
name: catalogProduct.name_display || catalogProduct.name,
```

### 4. **favourites/page-new.tsx**

```tsx
// Before
name: p.name,

// After
name: p.name_display || p.name,
```

### 5. **shop/[id]/product-view.tsx**

```tsx
// Before
alt={product.name}
<h1>{product.name}</h1>
<p>{product.description}</p>
productName={product.name}

// After
alt={product.name_display || product.name}
<h1>{product.name_display || product.name}</h1>
<p>{product.description_display || product.description}</p>
productName={product.name_display || product.name}
```

### 6. **ProductCard.tsx**

```tsx
// Before
alt={product.name}

// After
alt={getDisplayName(product)}  // Uses helper function
```

## Pattern Used

### Fallback Pattern

```tsx
{
  product.name_display || product.name;
}
```

This ensures:

1. Try to use `name_display` (language-aware field from API)
2. Fall back to raw `name` if `name_display` is missing (backward compatibility)

### Helper Function Pattern

```tsx
import { getDisplayName } from '@/utils/i18nDisplay';

{
  getDisplayName(product);
}
```

The helper safely accesses display fields with fallbacks.

## API Response Structure

The backend now returns both raw and display fields:

```json
{
  "name": {
    "en": "Cotton T-Shirt",
    "ti": "መጠዊራት ቲሸርት"
  },
  "name_display": "Cotton T-Shirt", // ← Based on Accept-Language header
  "description": {
    "en": "Comfortable cotton t-shirt",
    "ti": "ምቹእ መጠዊራት ቲሸርት"
  },
  "description_display": "Comfortable cotton t-shirt" // ← Based on Accept-Language header
}
```

## How It Works

1. **Frontend Request**: Next.js axios automatically includes `Accept-Language` header from i18n
2. **Backend Processing**: DRF serializers detect language and populate `*_display` fields
3. **Frontend Rendering**: Components use `*_display` fields (which are strings, not objects)
4. **Result**: No more "Objects are not valid as a React child" errors

## Testing

To verify the fix:

1. Start the development server: `npm run dev`
2. Navigate to `/catalog` or `/favourites`
3. Check that product names render correctly
4. Switch language in the UI
5. Verify names update to the new language

## Related Files

Display helpers already created in Phase 1:

- `src/utils/i18nDisplay.ts` - Helper functions for safe field access
- `src/lib/axios.ts` - Automatic Accept-Language header
- `src/utils/fetchWithLanguage.ts` - Fetch wrapper with language support

## Prevention

To prevent this error in the future:

### ✅ DO:

```tsx
// Use display fields
{
  product.name_display;
}

// Use helper functions
{
  getDisplayName(product);
}

// Use fallback pattern
{
  product.name_display || product.name;
}
```

### ❌ DON'T:

```tsx
// Never render raw JSON fields directly
{
  product.name;
} // This is {en: "...", ti: "..."}

// Never render description objects
{
  product.description;
} // This is {en: "...", ti: "..."}
```

## Benefits

1. **No Runtime Errors**: No more object rendering errors
2. **Automatic i18n**: Language changes automatically with user preference
3. **Server-Side Rendering**: Display fields work with SSR/SSG
4. **Type Safety**: Display fields are strings, not objects
5. **Backward Compatibility**: Fallback pattern handles missing display fields
